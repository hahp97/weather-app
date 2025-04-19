"use client";

import EmailPreviewButton from "@/components/EmailPreviewButton";
import { useToast } from "@/context/ToastContext";
import FORGOT_PASSWORD from "@/graphql/mutation/auth/forgot-password.gql";
import RESET_PASSWORD_WITH_OTP from "@/graphql/mutation/auth/reset-password-with-otp.gql";
import { emailSchema, resetPasswordSchema } from "@/schemas/user";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type EmailFormData = z.infer<typeof emailSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const [forgotPassword] = useMutation(FORGOT_PASSWORD);
  const [resetPasswordWithOTP] = useMutation(RESET_PASSWORD_WITH_OTP);

  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      setIsLoading(true);

      const response = await forgotPassword({
        variables: {
          email: data.email,
          callbackUrl: `${window.location.origin}/reset-password`,
        },
      });

      const result = response.data.forgotPassword;

      if (result.success) {
        setUserEmail(data.email);
        showSuccessToast(
          result.message || "Password reset instructions sent to your email"
        );
        setStep("reset");
      } else {
        showErrorToast(result.message || "Failed to process your request");
      }
    } catch (err) {
      if (err instanceof Error) {
        showErrorToast(err.message || "An error occurred");
      } else {
        showErrorToast("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);

      const response = await resetPasswordWithOTP({
        variables: {
          email: userEmail,
          otp: data.otp,
          newPassword: data.newPassword,
        },
      });

      const result = response.data.resetPasswordWithOTP;

      if (result.success) {
        showSuccessToast("Password reset successfully");
        router.push("/login");
      } else {
        showErrorToast(result.message || "Failed to reset password");
      }
    } catch (err) {
      if (err instanceof Error) {
        showErrorToast(err.message || "An error occurred");
      } else {
        showErrorToast("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {step === "email" ? "Forgot your password?" : "Reset your password"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === "email"
            ? "Enter your email address and we'll send you a code to reset your password"
            : "Enter the verification code sent to your email and create a new password"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === "email" ? (
            <form
              className="space-y-6"
              onSubmit={handleEmailSubmit(onEmailSubmit)}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...registerEmail("email")}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                  {emailErrors.email && (
                    <p className="mt-2 text-sm text-red-600">
                      {emailErrors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Send reset instructions"}
                </button>
              </div>
            </form>
          ) : (
            <form
              className="space-y-6"
              onSubmit={handleResetSubmit(onResetSubmit)}
            >
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    {...registerReset("otp")}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter 6-digit code"
                  />
                  {resetErrors.otp && (
                    <p className="mt-2 text-sm text-red-600">
                      {resetErrors.otp.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    type="password"
                    {...registerReset("newPassword")}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                  {resetErrors.newPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {resetErrors.newPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    type="password"
                    {...registerReset("confirmPassword")}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                  {resetErrors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {resetErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>

              {userEmail && (
                <div className="mt-4">
                  <EmailPreviewButton
                    email={userEmail}
                    className="w-full mt-2"
                  />
                </div>
              )}
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
