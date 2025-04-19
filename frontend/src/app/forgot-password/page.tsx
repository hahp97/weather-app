"use client";

import EmailPreviewButton from "@/components/EmailPreviewButton";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const title =
    step === "email" ? "Forgot your password?" : "Reset your password";
  const subtitle =
    step === "email"
      ? "Enter your email address and we'll send you a code to reset your password"
      : "Enter the verification code sent to your email and create a new password";

  return (
    <AuthLayout title={title} subtitle={subtitle} loading={isLoading}>
      {step === "email" ? (
        <form className="space-y-6" onSubmit={handleEmailSubmit(onEmailSubmit)}>
          <Input
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
              </svg>
            }
            {...registerEmail("email")}
            error={emailErrors.email?.message}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              "Send reset instructions"
            )}
          </Button>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleResetSubmit(onResetSubmit)}>
          <div className="bg-blue-50 text-blue-700 p-4 rounded-md mb-6 text-sm">
            <p>
              We&apos;ve sent a 6-digit verification code to{" "}
              <span className="font-medium">{userEmail}</span>
            </p>
          </div>

          <Input
            id="otp"
            label="Verification Code"
            type="text"
            maxLength={6}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path
                  fillRule="evenodd"
                  d="M9.83 8.79a.75.75 0 01.12 1.06l-4.83 6a.75.75 0 01-1.18-.93l4.83-6a.75.75 0 011.06-.12z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M6.43 8.44a.75.75 0 01-.43.31H2a.75.75 0 010-1.5h4a.75.75 0 01.43 1.19zm9.57 6.31a.75.75 0 01-.43.31H2a.75.75 0 010-1.5h13.57a.75.75 0 01.43 1.19z"
                  clipRule="evenodd"
                />
              </svg>
            }
            {...registerReset("otp")}
            error={resetErrors.otp?.message}
            placeholder="Enter 6-digit code"
          />

          <Input
            id="newPassword"
            label="New Password"
            type="password"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                  clipRule="evenodd"
                />
              </svg>
            }
            {...registerReset("newPassword")}
            error={resetErrors.newPassword?.message}
          />

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                  clipRule="evenodd"
                />
              </svg>
            }
            {...registerReset("confirmPassword")}
            error={resetErrors.confirmPassword?.message}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>

          {/* Email Preview Button for Development */}
          {userEmail && (
            <div className="mt-4">
              <EmailPreviewButton email={userEmail} className="w-full" />
            </div>
          )}
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
