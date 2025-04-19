import { compareObject } from "@/helpers/model";
import jobs from "@/jobs";
import {
  generateHashedEmail,
  getEmailFromHashedEmail,
  getUserByCredential,
  recreateCredential,
  tryLogin,
} from "@/libs/auth";
import type { AppContext } from "@/types";
import buildPrismaFilter from "@/utils/buildPrismaFilter";
import { getConfigs } from "@/utils/configs";
import { generateOTP, saveOTP, verifyOTPFromDB, verifyTOTP } from "@/utils/otp";
import { comparePassword, hashPassword } from "@/utils/password";
import pubsub from "@/utils/pubsub";
import { normalizeQueryArgs } from "@/utils/query";
import { normalizeErrors } from "@/utils/zod";
import {
  createUserSchema,
  forgotPasswordSchema,
  renewPasswordSchema,
  resendNewUserSchema,
  resetPasswordSchema,
  resetPasswordWithOTPSchema,
  sendOTPSchema,
  signUpSchema,
  updateProfileSchema,
  updateUserSchema,
  verifyEmailSchema,
  verifyOTPSchema,
} from "@/validators/user";
import { withFilter } from "graphql-subscriptions";
import _ from "lodash";

export default {
  Subscription: {
    User: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(getConfigs().appNamespace + "-User"),
        (payload, args) => {
          if (!payload) {
            return false;
          }
          return compareObject(payload.User.node, args.dataFilter);
        }
      ),
    },
  },
  Query: {
    users: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma, authorizedUser } = context;

      // Check if user is admin
      if (!authorizedUser || !authorizedUser.superAdmin) {
        throw new Error("Admin privileges required");
      }

      const { first, skip, filter, orderBy } = normalizeQueryArgs(args);
      return prisma.user.findMany({
        take: first,
        skip: skip,
        where: filter,
        orderBy: orderBy,
      });
    },
    usersMeta: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma, authorizedUser } = context;

      // Check if user is admin
      if (!authorizedUser || !authorizedUser.superAdmin) {
        throw new Error("Admin privileges required");
      }

      const { filter } = normalizeQueryArgs(args);

      const count = await prisma.user.count({
        where: filter,
      });

      return {
        count,
      };
    },
    user: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma, authorizedUser } = context;
      const { id } = args;
      return prisma.user.findFirst({
        where: {
          id,
        },
      });
    },
    me: async (parent: any, args: any, context: AppContext, info: any) => {
      const { authorizedUser } = context;
      if (!authorizedUser) return null;

      return authorizedUser;
    },
    resetPasswordInfo: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma } = context;

      try {
        const { error } = await getUserByCredential(args.code, prisma);
        if (error) {
          return {
            success: false,
            message: error.message,
          };
        }
        return {
          success: true,
          message: "Your request is valid.",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    createPasswordInfo: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma } = context;
      try {
        if (!args.code) {
          return {
            code: "invalid",
            success: false,
            message: "Your request is invalid.",
          };
        }
        const { error, user } = await getUserByCredential(args.code, prisma);

        if (error) {
          if (error.code === "token_expired") {
            return {
              code: "token_expired",
              success: false,
              message: "Your request is expired, Please contact admin for help.",
            };
          }
          return {
            success: false,
            message: error.message,
          };
        }
        if (user && user.lastSignedInAt) {
          return {
            success: false,
            message: "Your request is invalid.",
          };
        }

        return {
          success: true,
          message: "Your request is valid.",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    verifyEmail: async (parent: any, args: any, context: AppContext, info: any) => {
      try {
        const { prisma } = context;
        const { token } = args;

        if (!token) {
          return {
            success: false,
            message: "Invalid verification token",
          };
        }

        // Extract email from token
        try {
          const email = getEmailFromHashedEmail(token);

          if (!email) {
            return {
              success: false,
              message: "Invalid verification token",
            };
          }

          // Find user with the email
          const user = await prisma.user.findFirst({
            where: {
              email: email,
              deletedAt: null,
            },
          });

          if (!user) {
            return {
              success: false,
              message: "User not found",
            };
          }

          // Update user's email verification status
          // Note: We need to add isEmailVerified field to User model
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isEmailVerified: true,
            },
          });

          return {
            success: true,
            message: "Email verified successfully",
          };
        } catch (error) {
          return {
            success: false,
            message: "Invalid verification token",
          };
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
  },
  Mutation: {
    createUser: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma, authorizedUser } = context;

      // Check if user is admin
      if (!authorizedUser || !authorizedUser.superAdmin) {
        return {
          success: false,
          message: "Admin privileges required",
        };
      }

      const { error, data } = createUserSchema.safeParse(args.input);

      if (error) {
        return {
          success: false,
          message: "Invalid input",
          errors: normalizeErrors(error.errors),
        };
      }

      try {
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: data.email }, { username: data.username }],
            deletedAt: null,
          },
        });

        if (user) {
          const errors = [];
          if (user.email === data.email) {
            errors.push({
              field: "email",
              message: "Email already exists",
              path: "email",
            });
          }

          if (user.username === data.username) {
            errors.push({
              field: "username",
              message: "UserName already exists.",
              path: "username",
            });
          }
          return {
            success: false,
            message: "Email or username already exists.",
            errors,
          };
        }

        const createdUser = await prisma.user.create({
          data: {
            ..._.omit(data, ["callbackUrl"]),
            password: "",
          },
        });

        return {
          success: true,
          message: "User created successfully, an email has been sent to set the password.",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    updateUser: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma, authorizedUser } = context;

      // Check if user is admin
      if (!authorizedUser || !authorizedUser.superAdmin) {
        return {
          success: false,
          message: "Admin privileges required",
        };
      }

      const { id, input } = args;

      const { error, data } = updateUserSchema.safeParse(input);

      if (error) {
        return {
          success: false,
          message: "Invalid input",
          errors: normalizeErrors(error.errors),
        };
      }

      try {
        const user = await prisma.user.findFirst({
          where: buildPrismaFilter({ id }),
        });

        if (!user) {
          return {
            success: false,
            message: "User not found.",
          };
        }

        if (data.email && user.email !== data.email) {
          const user = await prisma.user.findFirst({
            where: buildPrismaFilter({
              email: data.email,
            }),
          });

          if (user) {
            return {
              success: false,
              message: "Email already exists.",
            };
          }
        }

        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            ...data,
          },
        });

        await pubsub.publish(getConfigs().appNamespace + "-User", {
          User: {
            mutation: "UPDATED",
            node: updatedUser,
          },
        });
        return {
          success: true,
          message: "User updated successfully.",
          user: updatedUser,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    resendNewUser: async (parent: any, args: any, context: AppContext, info: any) => {
      try {
        const { prisma, authorizedUser } = context;

        // Check if user is admin
        if (!authorizedUser || !authorizedUser.superAdmin) {
          return {
            success: false,
            message: "Admin privileges required",
          };
        }

        const { id } = args;

        const { error, data } = resendNewUserSchema.safeParse(args);

        if (error) {
          return {
            success: false,
            message: "Invalid input",
            errors: normalizeErrors(error.errors),
          };
        }

        const user = await prisma.user.findFirst({
          where: {
            id,
            deletedAt: null,
          },
        });

        if (!user) {
          return {
            success: false,
            message: "User not found.",
          };
        }

        if (user.lastSignedInAt) {
          return {
            success: false,
            message: "User already change password, please use forgot password",
          };
        }

        await recreateCredential(user, data.callbackUrl, prisma);

        return {
          success: true,
          message: "New password link has been resent successfully.",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    createPassword: async (parent: any, args: any, context: AppContext, info: any) => {
      try {
        const { prisma } = context;
        const { code, newPassword } = args;

        const { error: errorValidate, data } = renewPasswordSchema.safeParse(args);

        if (errorValidate) {
          return { success: false, message: "Invalid input", errors: normalizeErrors(errorValidate.errors) };
        }

        const { error, user } = await getUserByCredential(code, prisma);

        if (error) {
          return { success: false, message: error.message };
        }

        if (user.lastSignedInAt) {
          return { success: false, message: "User already change password, please use forgot password" };
        }

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashPassword(newPassword),
            lastSignedInAt: new Date(),
          },
        });

        if (updatedUser) {
          return {
            success: true,
            message: "Password updated successfully.",
          };
        }

        return {
          success: false,
          message: "Password update failed.",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    forgotPassword: async (parent: any, args: any, context: AppContext, info: any) => {
      try {
        const { prisma } = context;
        const { email, callbackUrl } = args;

        const { error } = forgotPasswordSchema.safeParse(args);
        if (error) {
          return {
            success: false,
            message: "Invalid input",
            errors: normalizeErrors(error.errors),
          };
        }

        const user = await prisma.user.findFirst({ where: buildPrismaFilter({ email }) });

        if (!user) {
          // Don't reveal if user exists for security
          return {
            success: true,
            message: "If your email exists in our system, a verification code will be sent to reset your password",
          };
        }

        // Generate OTP for password reset
        const otp = generateOTP();

        // Save OTP to database
        await saveOTP(email, otp);

        // Send email with OTP
        await jobs.perform(
          { id: "email-job" },
          {
            email: "otp-verification-email",
            subject: "Reset Your Password",
            to: email,
            user,
            otp,
            code: otp,
            callbackUrl,
          }
        );

        return {
          success: true,
          message: "Password reset code has been sent to your email",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    resetPassword: async (parent: any, args: any, context: AppContext, info: any) => {
      try {
        const { prisma } = context;
        const { error, data } = resetPasswordSchema.safeParse(args);

        if (error) {
          return {
            success: false,
            message: "Invalid input",
            errors: normalizeErrors(error.errors),
          };
        }

        const { error: errorCredential, user } = await getUserByCredential(args.code, prisma);

        if (errorCredential) {
          return errorCredential;
        }

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashPassword(data.newPassword),
          },
        });

        if (updatedUser) {
          const callbackUrl = data.callbackUrl;
          jobs.perform(
            { id: "email-job" },
            {
              email: "reset-password-successfully-email",
              subject: "Reset Password Successfully",
              to: user.email,
              user: user,
              callbackUrl,
              otp: null,
            }
          );
        }

        return {
          success: true,
          message: "Password reset successfully!",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    updateProfile: async (parent: any, args: any, context: AppContext, info: any) => {
      try {
        const { authorizedUser, prisma } = context;

        if (!authorizedUser) {
          return {
            success: false,
            message: "User is not authenticated",
          };
        }

        // validate
        const { data, error } = updateProfileSchema.safeParse(args.input);

        if (error) {
          return {
            success: false,
            message: "Invalid input",
            errors: normalizeErrors(error.errors),
          };
        }

        if ((data.currentPassword && !data.newPassword) || (!data.currentPassword && data.newPassword)) {
          return {
            success: false,
            message: "Please provide both current password and new password",
          };
        }

        const { id } = authorizedUser;

        if (data.currentPassword) {
          const validCurrentPassword = comparePassword(data.currentPassword, authorizedUser.password);
          if (!validCurrentPassword) {
            return {
              success: false,
              message: "Current password not correct",
            };
          }
        }

        if (data.newPassword) {
          const hashedPassword = hashPassword(data.newPassword);
          data.newPassword = hashedPassword;
        }

        await prisma.user.update({
          where: {
            id: id,
          },
          data:
            data.currentPassword && data.newPassword
              ? {
                  name: data.name,
                  password: data.newPassword,
                  mobile: data.mobile,
                }
              : {
                  name: data.name,
                  mobile: data.mobile,
                },
        });

        return {
          success: true,
          message: "Profile updated successfully",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    signIn: async (parent: any, args: any, context: AppContext, info: any) => {
      try {
        const { identifier, password } = args;
        if (!identifier || !password) {
          return {
            success: false,
            message: "Missing identifier or password",
          };
        }
        const result = await tryLogin({ identifier, password }, context);
        return result;
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    signUp: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma } = context;
      const { error, data } = signUpSchema.safeParse(args.input);

      if (error) {
        return {
          success: false,
          message: "Invalid input",
          errors: normalizeErrors(error.errors),
        };
      }

      try {
        // Check if user with email or username already exists
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ email: data.email }, { username: data.username }],
            deletedAt: null,
          },
        });

        if (existingUser) {
          const errors = [];
          if (existingUser.email === data.email) {
            errors.push({
              field: "email",
              message: "Email already exists",
              path: "email",
            });
          }

          if (existingUser.username === data.username) {
            errors.push({
              field: "username",
              message: "Username already exists",
              path: "username",
            });
          }
          return {
            success: false,
            message: "Email or username already exists",
            errors,
          };
        }

        // Create the user with hashed password
        const hashedPassword = hashPassword(data.password);
        const newUser = await prisma.user.create({
          data: {
            email: data.email,
            username: data.username,
            name: data.name,
            password: hashedPassword,
            mobile: data.mobile,
            active: true,
            isEmailVerified: false, // User starts as not verified
            superAdmin: false,
          },
        });

        // Generate OTP for email verification
        const otp = generateOTP();

        // Save OTP to database
        await saveOTP(data.email, otp);

        // Send verification email with OTP
        await jobs.perform(
          { id: "email-job" },
          {
            email: "otp-verification-email",
            subject: "Verify Your Email",
            to: data.email,
            user: newUser,
            otp: otp,
          }
        );

        return {
          success: true,
          message: "Account created successfully. Please check your email for the verification code.",
        };
      } catch (error: any) {
        console.error("Error creating new user:", error);
        return {
          success: false,
          message: "Failed to create account",
          errors: [{ message: error.message }],
        };
      }
    },
    verifyEmailRequest: async (parent: any, args: any, context: AppContext, info: any) => {
      try {
        const { prisma } = context;
        const { error, data } = verifyEmailSchema.safeParse(args);

        if (error) {
          return {
            success: false,
            message: "Invalid input",
            errors: normalizeErrors(error.errors),
          };
        }

        const user = await prisma.user.findFirst({
          where: {
            email: data.email,
            deletedAt: null,
          },
        });

        if (!user) {
          return {
            success: false,
            message: "User not found",
          };
        }

        // Generate verification token
        const verificationToken = generateHashedEmail(data.email);

        // Send verification email
        await jobs.perform(
          { id: "email-job" },
          {
            email: "verify-email",
            subject: "Verify Your Email",
            to: data.email,
            user: user,
            verificationToken: verificationToken,
          }
        );

        return {
          success: true,
          message: "Verification email sent successfully",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    sendOTP: async (parent: any, args: any, context: AppContext, info: any) => {
      try {
        const { prisma } = context;
        const { email } = args;

        // Validate email
        const { error } = sendOTPSchema.safeParse({ email });

        if (error) {
          return {
            success: false,
            message: "Invalid email address",
            errors: normalizeErrors(error.errors),
          };
        }

        // Check if user exists
        const user = await prisma.user.findFirst({
          where: buildPrismaFilter({ email }),
        });

        if (!user) {
          // Don't reveal if user exists or not for security
          return {
            success: true,
            message: "If your email exists in our system, an OTP has been sent to your email",
          };
        }

        // Generate OTP
        const otp = generateOTP();

        // Save OTP to database
        await saveOTP(email, otp);

        // Send OTP via email
        await jobs.perform(
          { id: "email-job" },
          {
            email: "otp-verification-email",
            subject: "Your Verification Code",
            to: email,
            user,
            otp,
          }
        );

        return {
          success: true,
          message: "OTP sent successfully to your email",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    verifyOTP: async (parent: any, args: any, context: AppContext, info: any) => {
      try {
        const { input } = args;
        const { email, otp } = input;

        // Validate input
        const { error } = verifyOTPSchema.safeParse(input);

        if (error) {
          return {
            success: false,
            message: "Invalid input",
            errors: normalizeErrors(error.errors),
          };
        }

        // Try time-based verification first (more secure)
        let isValid = verifyTOTP(email, otp);

        // If time-based verification fails, try database verification as fallback
        if (!isValid) {
          isValid = await verifyOTPFromDB(email, otp);
        }

        if (!isValid) {
          return {
            success: false,
            message: "Invalid or expired OTP",
          };
        }

        // If OTP used for email verification, update the user
        const { prisma } = context;
        await prisma.user.updateMany({
          where: {
            email,
            isEmailVerified: false,
          },
          data: {
            isEmailVerified: true,
          },
        });

        return {
          success: true,
          message: "OTP verified successfully",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    resetPasswordWithOTP: async (parent: any, args: any, context: AppContext, info: any) => {
      try {
        const { prisma } = context;
        const { email, otp, newPassword } = args;

        // Validate input
        const { error } = resetPasswordWithOTPSchema.safeParse(args);

        if (error) {
          return {
            success: false,
            message: "Invalid input",
            errors: normalizeErrors(error.errors),
          };
        }

        // Check if user exists
        const user = await prisma.user.findFirst({
          where: {
            email,
            deletedAt: null,
          },
        });

        if (!user) {
          return {
            success: false,
            message: "User not found",
          };
        }

        // Try time-based verification first (more secure)
        let isValid = verifyTOTP(email, otp);

        // If time-based verification fails, try database verification as fallback
        if (!isValid) {
          isValid = await verifyOTPFromDB(email, otp);
        }

        if (!isValid) {
          return {
            success: false,
            message: "Invalid or expired OTP",
          };
        }

        // Update password
        const hashedPassword = hashPassword(newPassword);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            lastSignedInAt: new Date(),
          },
        });

        return {
          success: true,
          message: "Password reset successfully",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
  },
};
