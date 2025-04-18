import { z } from "zod";
export enum UserRole {
  SystemAdmin = "SystemAdmin",
  MerchantAdmin = "MerchantAdmin",
}

export const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1),
  superAdmin: z.boolean().optional().default(true),
  name: z.string().min(1),
  callbackUrl: z.string().url(),
  mobile: z.object({
    code: z.string().default("65"),
    country: z.string().default("SG"),
    number: z.string().min(8, "Mobile number must be at least 8 digits long"),
  }),
  active: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),

  mobile: z
    .object({
      code: z.string().default("65"),
      country: z.string().default("SG"),
      number: z.string().min(8, "Mobile number must be at least 8 digits long"),
    })
    .optional(),
  active: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  code: z.string(),
  newPassword: z.string().min(6),
  callbackUrl: z.string().url(),
});

export const renewPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
  code: z.string(),
});

export const resendNewUserSchema = z.object({
  id: z.string(),
  callbackUrl: z.string().url(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  callbackUrl: z.string().url(),
});
