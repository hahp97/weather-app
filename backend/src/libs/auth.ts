import jobs from "@/jobs";
import type { AppContext, PrismaInstance, TCreateToken, TRefreshTokens, TUser } from "@/types";
import { getConfigs } from "@/utils/configs";
import { decryptJwt, encryptJwt } from "@/utils/jwt";
import { generateOTP } from "@/utils/otp";
import { comparePassword, hashPassword } from "@/utils/password";
import jwt, { SignOptions, TokenExpiredError } from "jsonwebtoken";
import _ from "lodash";

type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  name?: string;
  merchantId?: string;
  merchantIds?: string[];
};

const { secret1, secret2 } = getConfigs();

export const createTokens: TCreateToken = async ({
  user,
  tokenSecret1,
  tokenSecret2,
  expiresInToken = "4d",
  expiresInRefreshToken = "7d",
}) => {
  if (!tokenSecret1 || !tokenSecret2) {
    throw new Error("tokenSecret is required");
  }
  const createToken = jwt.sign(
    {
      user: _.pick(user, ["id", "username"]),
    },
    Buffer.from(tokenSecret1),
    {
      expiresIn: expiresInToken,
    } as SignOptions
  );

  const createRefreshToken = jwt.sign(
    {
      user: _.pick(user, ["id", "username"]),
    },
    Buffer.from(tokenSecret2),
    {
      expiresIn: expiresInRefreshToken,
    } as SignOptions
  );

  return [createToken, createRefreshToken];
};

export const refreshTokens: TRefreshTokens = async (refreshToken, context) => {
  try {
    const { prisma } = context;

    const data = jwt.decode(refreshToken);

    if (!data) {
      return {
        token: "",
        refreshToken: "",
        user: null as unknown as TUser,
      };
    }
    const _user = (data as { user: { id: string } }).user;

    const user = await prisma.user.findFirst({
      where: {
        id: _user.id,
      },
    });
    if (!user) {
      return {
        token: "",
        refreshToken: "",
        user: null as unknown as TUser,
      };
    }

    const refreshSecret = secret2 || "";
    const [newToken, newRefreshToken] = await createTokens({
      user: user as unknown as TUser,
      tokenSecret1: secret1 || "",
      tokenSecret2: refreshSecret,
    });
    return {
      token: newToken,
      refreshToken: newRefreshToken,
      user: user as unknown as TUser,
    };
  } catch (err) {
    return {
      token: "",
      refreshToken: "",
      user: null as unknown as TUser,
    };
  }
};

export const tryLogin = async (args: { identifier: string; password: string }, context: AppContext) => {
  const { identifier, password } = args || {};
  const { prisma, networkInfo } = context;
  const parseIdentifier = identifier.toLowerCase().trim();

  const user =
    !!identifier &&
    (await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: {
              equals: parseIdentifier,
            },
          },
          {
            email: {
              equals: parseIdentifier,
            },
          },
        ],
        deletedAt: null,
      },
    }));

  if (!user) {
    return {
      success: false,
      message: "Wrong username or email",
    };
  }

  const valid = comparePassword(password, user.password);
  if (!valid) {
    // bad password
    return {
      success: false,
      message: "Wrong password",
    };
  }

  if (!user.active) {
    return {
      success: false,
      message: "User no longer active",
    };
  }

  //update lastSignedInAt
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastSignedInAt: new Date(),
    },
  });

  const refreshTokenSecret = secret2;

  const [token, refreshToken] = await createTokens({
    user,
    tokenSecret1: secret1 || "",
    tokenSecret2: refreshTokenSecret || "",
  });

  return {
    success: true,
    message: "Sign in successfully!",
    token: token,
    refreshToken: refreshToken,
  };
};

export const recreateCredential = async (user: User, callbackUrl: string, prisma: PrismaInstance): Promise<User> => {
  if (!secret1) {
    throw new Error("SECRET1 not found, please make sure you have proper .env file");
  }

  const newPassword = Date.now().toString();

  const publicPayload = {
    username: user.username,
  };

  const privatePayload = {
    password: newPassword,
  };

  const code = encryptJwt(publicPayload, privatePayload, secret1, { expiresIn: "7d" });

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashPassword(newPassword),
    },
  });

  if (newPassword && callbackUrl && code) {
    jobs.perform(
      { id: "email-job" },
      {
        email: "new-user-credential-email",
        subject: "Email updated",
        to: user.email,
        user: updatedUser,
        code,
        callbackUrl,
      }
    );
  }

  return updatedUser;
};

export const getUserByCredential = async (code: string, prisma: PrismaInstance) => {
  try {
    const { publicPayload, privatePayload } = decryptJwt(code, secret1 as string);
    const { username } = publicPayload;
    const { password } = privatePayload;

    const user = await prisma.user.findFirst({
      where: {
        username,
        deletedAt: null,
      },
    });

    if (!user)
      return {
        error: {
          code: "invalid",
          message: "Your request is invalid.",
        },
      };

    const valid = comparePassword(password, user.password);

    if (!valid) {
      return {
        error: {
          code: "invalid",
          message: "Your request is invalid.",
        },
      };
    }

    return { user };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return {
        error: {
          code: "token_expired",
          message: "Your request is expired.",
        },
      };
    }
    return {
      error: {
        code: "invalid",
        message: "Your request is invalid.",
      },
    };
  }
};

export const requestResetPassword = async (user: any, callbackUrl: string, prisma: PrismaInstance) => {
  if (!secret2) {
    throw new Error("SECRET2 not found, please make sure you have proper .env file");
  }
  const newPassword = Date.now() + secret2;

  const publicPayload = {
    username: user.username,
  };

  const privatePayload = {
    password: newPassword,
  };

  const code = encryptJwt(publicPayload, privatePayload, secret1 as string, {
    expiresIn: "7d",
  });

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashPassword(newPassword),
    },
  });

  // Send email reset password
  jobs.perform(
    { id: "email-job" },
    {
      email: "reset-password-email",
      subject: "Email reset password",
      to: user.email,
      user: updatedUser,
      code,
      callbackUrl,
    }
  );
};

export const requestEmailConfirmation = async (user: any, callbackUrl: string) => {
  if (!secret2) {
    throw new Error("SECRET2 not found, please make sure you have proper .env file");
  }
  const newPassword = Date.now() + secret2;

  const publicPayload = {
    username: user.username,
  };

  const privatePayload = {
    password: newPassword,
  };

  const code = encryptJwt(publicPayload, privatePayload, secret1 as string, {
    expiresIn: "7d",
  });

  // Send email reset password
  jobs.perform(
    { id: "email-job" },
    {
      email: "reset-password-email",
      subject: "Email confirmation",
      to: user.email,
      user: user,
      code,
      callbackUrl,
    }
  );
};

export const createTokenForGuest = (id: string) => {
  if (!secret1) {
    throw new Error("SECRET1 not found");
  }

  const createToken = jwt.sign(
    {
      customerId: id,
    },
    Buffer.from(secret1),
    {
      expiresIn: "7d",
    } as SignOptions
  );

  return createToken;
};

export const checkLinkResetExpired = async (code: string, prisma: PrismaInstance) => {
  try {
    const { publicPayload, privatePayload } = decryptJwt(code, secret1 as string);
    const { email } = publicPayload;

    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!user)
      return {
        success: false,
        error: {
          code: "invalid",
          message: "Not found user",
        },
      };

    return { user };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return {
        error: {
          code: "token_expired",
          message: "Your request is expired.",
        },
      };
    }
    return {
      error: {
        code: "invalid",
        message: "Your request is invalid.",
      },
    };
  }
};

export const sendEmailOTP = async ({
  email,
  context,
  emailName,
  prisma,
  havingTemplate = false,
}: {
  havingTemplate?: boolean;
  email: string;
  context: AppContext;
  emailName: string;
  prisma: PrismaInstance;
}) => {
  try {
    const { token, secret } = generateOTP(email as string, "user");
    console.log("TOKEN:", token); //LOG for testing verify api purposes

    let emailData: any = {
      to: email,
      otp: token,
    };

    emailData = {
      ...emailData,
      email: "otp-verification-email",
      subject: `OTP For Verification`,
    };

    jobs.perform({ id: "email-job" }, emailData);

    // Store the OTP in the database
    try {
      const foundOtp = await prisma.oTP.findFirst({
        where: { email },
      });

      if (foundOtp) {
        await prisma.oTP.update({
          where: { id: foundOtp.id },
          data: { hashedOTP: secret },
        });
      } else {
        await prisma.oTP.create({
          data: {
            hashedOTP: secret,
            email: email,
          },
        });
      }
    } catch (error) {
      console.error("OTP model may not exist in your prisma schema:", error);
    }

    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const generateHashedEmail = (email: string) => {
  if (!secret2) {
    throw new Error("SECRET2 not found, please make sure you have proper .env file");
  }

  const publicPayload = {};

  const privatePayload = {
    email: email,
  };
  const code = encryptJwt(publicPayload, privatePayload, secret1 as string, {
    expiresIn: "7d",
  });
  return code;
};

export const getEmailFromHashedEmail = (token: string): string | null => {
  try {
    const { privatePayload } = decryptJwt(token, secret1 as string);
    return privatePayload.email;
  } catch (error) {
    console.error("Error decrypting email token:", error);
    return null;
  }
};
