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

export const signUpSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  mobile: z.object({
    code: z.string(),
    country: z.string(),
    number: z.string().min(8, "Mobile number must be at least 8 digits long"),
  }),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  mobile: z
    .object({
      code: z.string(),
      country: z.string(),
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
  code: z.string(),
  newPassword: z.string().min(6),
});

export const resendNewUserSchema = z.object({
  id: z.string(),
  callbackUrl: z.string().url(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  callbackUrl: z.string().url(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
  mobile: z
    .object({
      code: z.string(),
      country: z.string(),
      number: z.string().min(8, "Mobile number must be at least 8 digits long"),
    })
    .optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
});

// New schemas for OTP operations
export const sendOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const resetPasswordWithOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
