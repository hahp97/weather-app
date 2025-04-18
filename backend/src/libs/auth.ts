import jobs from "@/jobs";
import type {
  AppContext,
  PrismaInstance,
  TCreateToken,
  TCreateTokenCustomer,
  TCustomer,
  TRefreshCustomerTokens,
  TRefreshTokens,
  TUser,
} from "@/types";
import buildPrismaFilter from "@/utils/buildPrismaFilter";
import { getConfigs } from "@/utils/configs";
import { parseHTML } from "@/utils/email-helper";
import { decryptJwt, encryptJwt } from "@/utils/jwt";
import { generateOTP } from "@/utils/otp";
import { comparePassword, hashPassword } from "@/utils/password";
import { EmailType } from "@prisma/client";
import ejs from "ejs";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import _ from "lodash";

type User = {
  id: string;
  username: string;
  email: string;
  password: string;
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
    tokenSecret1,
    {
      expiresIn: expiresInToken,
    }
  );

  const createRefreshToken = jwt.sign(
    {
      user: _.pick(user, ["id", "username"]),
    },
    tokenSecret2,
    {
      expiresIn: expiresInRefreshToken,
    }
  );

  return [createToken, createRefreshToken];
};
export const createTokensForCustomer: TCreateTokenCustomer = async ({
  customer,
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
      customer: _.pick(customer, ["id", "email"]),
    },
    tokenSecret1,
    {
      expiresIn: expiresInToken,
    }
  );

  const createRefreshToken = jwt.sign(
    {
      customer: _.pick(customer, ["id", "email"]),
    },
    tokenSecret2,
    {
      expiresIn: expiresInRefreshToken,
    }
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

    const refreshSecret = secret2;
    const [newToken, newRefreshToken] = await createTokens({
      user,
      tokenSecret1: secret1,
      tokenSecret2: refreshSecret,
    });
    return {
      token: newToken,
      refreshToken: newRefreshToken,
      user,
    };
  } catch (err) {
    return {
      token: "",
      refreshToken: "",
      user: null as unknown as TUser,
    };
  }
};

export const refreshCustomerTokens: TRefreshCustomerTokens = async (refreshToken, context) => {
  try {
    const { prisma } = context;

    const data = jwt.decode(refreshToken);

    if (!data) {
      return {
        token: "",
        refreshToken: "",
        customer: null as unknown as TCustomer,
      };
    }
    const _customer = (data as { customer: { id: string } }).customer;

    const customer = await prisma.customer.findFirst({
      where: {
        id: _customer.id,
      },
    });

    if (!customer) {
      return {
        token: "",
        refreshToken: "",
        customer: null as unknown as TCustomer,
      };
    }

    const refreshSecret = secret2;
    const [newToken, newRefreshToken] = await createTokensForCustomer({
      customer,
      tokenSecret1: secret1,
      tokenSecret2: refreshSecret,
    });
    return {
      token: newToken,
      refreshToken: newRefreshToken,
      customer,
    };
  } catch (err) {
    return {
      token: "",
      refreshToken: "",
      customer: null as unknown as TCustomer,
    };
  }
};

export const tryLogin = async (args: { identifier: string; password: string }, context: AppContext) => {
  const { identifier, password } = args || {};
  const { prisma, networkInfo } = context;
  const parseIdentifier = identifier.toLowerCase().trim();

  const filters = {
    OR: [{ username_eq: parseIdentifier }, { email_eq: parseIdentifier }],
  };

  const user =
    !!identifier &&
    (await prisma.user.findFirst({
      where: buildPrismaFilter(filters),
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
  //create audit log for login
  const details = _.omit(user, "password");
  const isSuperAdmin = user.superAdmin;

  const merchantUser = await prisma.merchantUser.findFirst({
    where: buildPrismaFilter({
      userId: user.id,
    }),
  });

  await prisma.auditLog.create({
    data: {
      type: "ACCOUNT_LOGIN",
      objectType: "User",
      objectId: user.id,
      actor: details,
      message: `User ${user.name} with role ${isSuperAdmin ? "SuperAdmin" : merchantUser?.role} has logged in`,
      merchantId: isSuperAdmin ? null : user.merchantId,
      details: { account: details, networkInfo: networkInfo },
    },
  });

  const refreshTokenSecret = secret2;

  const [token, refreshToken] = await createTokens({
    user,
    tokenSecret1: secret1,
    tokenSecret2: refreshTokenSecret,
  });

  return {
    success: true,
    message: "Sign in successfully!",
    token: token,
    refreshToken: refreshToken,
  };
};

export const customerSignIn = async (args: { email: string; password: string }, context: AppContext) => {
  const { email, password } = args || {};
  const { prisma } = context;
  const parseIdentifier = email.toLowerCase().trim();

  const filters = {
    OR: [{ lastedEmail_eq: parseIdentifier }, { email_eq: parseIdentifier }],
    isGuest: false,
  };
  const customer =
    !!email &&
    (await prisma.customer.findFirst({
      where: buildPrismaFilter(filters),
    }));

  if (!customer) {
    return {
      success: false,
      code: "CUSTOMER_NOT_FOUND",
      message: `Sorry we couldn’t find ${email}`,
    };
  }

  if (customer.lastedEmail === "" && !customer.isEmailVerified) {
    return {
      success: false,
      code: "EMAIL_NOT_VERIFIED",
      message: "Email not verified, please verified email then comeback",
    };
  }

  if (customer.lastedEmail === email && !customer.isEmailVerified) {
    return {
      success: false,
      code: "EMAIL_NOT_VERIFIED",
      message: "New email not verified, please verified email then comeback",
    };
  }
  const valid = comparePassword(password, customer.password);

  if (!valid) {
    // bad password
    return {
      success: false,
      code: "WRONG_PASSWORD",
      message: "Wrong password",
    };
  }

  await prisma.customer.update({
    where: {
      id: customer.id,
    },
    data: {
      lastSignedInAt: new Date(),
    },
  });

  const refreshTokenSecret = secret2;

  const [token, refreshToken] = await createTokensForCustomer({
    customer,
    tokenSecret1: secret1,
    tokenSecret2: refreshTokenSecret,
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
  const createToken = jwt.sign(
    {
      customerId: id,
    },
    secret1,
    {
      expiresIn: "7d",
    }
  );

  return createToken;
};

export const checkLinkResetExpired = async (code: string, prisma: PrismaInstance) => {
  try {
    const { publicPayload, privatePayload } = decryptJwt(code, secret1 as string);
    const { email } = publicPayload;

    const customer = await prisma.customer.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!customer)
      return {
        error: {
          code: "invalid",
          message: "Not found customer",
        },
      };

    return { customer };
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
    const { token, secret } = generateOTP(email as string);
    console.log("TOKEN:", token); //LOG for testing verify api purposes

    let emailData: any = {
      id: "email-job",
      to: email,
      otp: token,
    };

    if (havingTemplate) {
      const emailTemplateOTP = await prisma.emailTemplate.findFirst({
        where: buildPrismaFilter({ setting_is: { emailType: EmailType.UPDATE_EMAIL_OTP } }, { context }),
      });

      const parsedSubject = parseHTML(emailTemplateOTP?.setting.subject as string);
      const parsedContent = parseHTML(emailTemplateOTP?.setting.content as string);

      emailData = {
        ...emailData,
        email: "template-email",
        subject: ejs.render(parsedSubject),
        content: ejs.render(parsedContent, { otp: token }),
      };
    } else {
      emailData = {
        ...emailData,
        email: `${emailName}-email`,
        subject: `OTP For Verification`,
      };
    }

    jobs.perform({ id: "email-job" }, emailData);

    const foundOtp = await prisma.otp.findFirst({
      where: buildPrismaFilter({ email }, { context }),
    });

    if (foundOtp) {
      await prisma.otp.update({
        where: buildPrismaFilter({ id: foundOtp.id }),
        data: { hashedOTP: secret },
      });
    } else {
      await prisma.otp.create({
        data: {
          hashedOTP: secret,
          email: email,
        },
      });
    }
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

export const getEmailFromHashedEmail = (token: string) => {
  try {
    const { privatePayload } = decryptJwt(token, secret1 as string);
    return privatePayload.email;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return {
        error: {
          code: "TOKEN_EXPIRED",
          message: "Your token is expired.",
        },
      };
    }
    return {
      error: {
        code: "INVALID",
        message: "Your request is invalid.",
      },
    };
  }
};
