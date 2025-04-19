import { compareObject } from "@/helpers/model";
import jobs from "@/jobs";
import { getUserByCredential, recreateCredential, requestResetPassword, tryLogin } from "@/libs/auth";
import type { AppContext } from "@/types";
import buildPrismaFilter from "@/utils/buildPrismaFilter";
import { getConfigs } from "@/utils/configs";
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
  updateProfileSchema,
  updateUserSchema,
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
  },
  Mutation: {
    createUser: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma } = context;
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
      const { id, input } = args;

      const { error, data } = updateUserSchema.safeParse(input);

      const isSuperAdmin = authorizedUser.superAdmin;

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
        const { prisma } = context;
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

        const { error, data } = forgotPasswordSchema.safeParse(args);
        if (error) {
          return {
            success: false,
            message: "Invalid input",
            errors: normalizeErrors(error.errors),
          };
        }

        const user = await prisma.user.findFirst({ where: buildPrismaFilter({ email: args.email }) });

        if (user) {
          await requestResetPassword(user, data.callbackUrl, prisma);
        }

        return {
          success: true,
          message: "We received your request reset password. We'll send a email to reset password",
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
  },
};
