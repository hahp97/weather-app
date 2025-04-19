import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobile: z.object({
    code: z.string().min(1, "Country code is required"),
    country: z.string().min(1, "Country is required"),
    number: z.string().min(8, "Mobile number must be at least 8 digits"),
  }),
});

export const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});
