"use client";

import EmailPreviewButton from "@/components/EmailPreviewButton";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";
import GqlSendOTP from "@/graphql/mutation/auth/send-otp.gql";
import GqlSignUp from "@/graphql/mutation/auth/sign-up.gql";
import GqlVerifyOTP from "@/graphql/mutation/auth/verify-otp.gql";
import { otpSchema, signupSchema } from "@/schemas/user";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type SignupFormData = z.infer<typeof signupSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      mobile: {
        code: "+84",
        country: "Vietnam",
        number: "",
      },
    },
  });

  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const [signUp] = useMutation(GqlSignUp);
  const [sendOTP] = useMutation(GqlSendOTP);
  const [verifyOTP] = useMutation(GqlVerifyOTP);

  // Handle signup submission
  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);

      // Register the user
      const signupResponse = await signUp({
        variables: {
          input: {
            email: data.email,
            username: data.username,
            name: data.name,
            password: data.password,
            mobile: data.mobile,
          },
        },
      });

      const signupResult = signupResponse.data.signUp;

      if (signupResult.success) {
        setUserEmail(data.email);
        showSuccessToast(signupResult.message);

        // Send OTP for verification
        const otpResponse = await sendOTP({
          variables: {
            email: data.email,
          },
        });

        const otpResult = otpResponse.data.sendOTP;

        if (otpResult.success) {
          showSuccessToast("Verification code sent to your email");
          setStep("verify");
        } else {
          showErrorToast(
            otpResult.message || "Failed to send verification code"
          );
        }
      } else {
        showErrorToast(signupResult.message || "Registration failed");
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

  // Handle OTP verification
  const onOTPSubmit = async (data: OTPFormData) => {
    try {
      setIsLoading(true);

      const response = await verifyOTP({
        variables: {
          input: {
            email: userEmail,
            otp: data.otp,
          },
        },
      });

      const result = response.data.verifyOTP;

      if (result.success) {
        showSuccessToast("Email verified successfully");
        router.push("/login");
      } else {
        showErrorToast(result.message || "Verification failed");
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

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setIsLoading(true);

      const response = await sendOTP({
        variables: {
          email: userEmail,
        },
      });

      const result = response.data.sendOTP;

      if (result.success) {
        showSuccessToast("Verification code resent to your email");
      } else {
        showErrorToast(result.message || "Failed to resend verification code");
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

  const title = step === "signup" ? "Create Your Account" : "Verify Your Email";
  const subtitle =
    step === "signup"
      ? "Register to access all weather report features"
      : "Enter the verification code sent to your email";

  return (
    <AuthLayout title={title} subtitle={subtitle} loading={false}>
      {step === "signup" ? (
        <form
          className="space-y-5"
          onSubmit={handleSignupSubmit(onSignupSubmit)}
        >
          <Input
            id="email"
            label="Email"
            type="email"
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
            {...registerSignup("email")}
            error={signupErrors.email?.message}
          />

          <Input
            id="username"
            label="Username"
            type="text"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
            }
            {...registerSignup("username")}
            error={signupErrors.username?.message}
          />

          <Input
            id="name"
            label="Full Name"
            type="text"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
              </svg>
            }
            {...registerSignup("name")}
            error={signupErrors.name?.message}
          />

          <Input
            id="password"
            label="Password"
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
            {...registerSignup("password")}
            error={signupErrors.password?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="flex rounded-md shadow-sm">
              <input
                id="mobileCode"
                type="text"
                {...registerSignup("mobile.code")}
                className="w-20 rounded-l-md border border-r-0 border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
              />
              <input
                id="mobileNumber"
                type="text"
                {...registerSignup("mobile.number")}
                className="block w-full flex-1 rounded-r-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                placeholder="Mobile number"
              />
            </div>
            <input type="hidden" {...registerSignup("mobile.country")} />
            {signupErrors.mobile?.number && (
              <p className="mt-2 text-sm text-red-600">
                {signupErrors.mobile.number.message}
              </p>
            )}
          </div>

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
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Sign in to your account
              </Button>
            </Link>
          </div>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={handleOTPSubmit(onOTPSubmit)}>
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
            placeholder="Enter 6-digit code"
            {...registerOTP("otp")}
            error={otpErrors.otp?.message}
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
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>

          {/* Email Preview Button for Development */}
          {userEmail && (
            <div className="mt-4">
              <EmailPreviewButton
                email={userEmail}
                className="w-full shadow-sm transition-colors hover:bg-gray-50"
              />
            </div>
          )}

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Didn&apos;t receive the code? Resend
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
