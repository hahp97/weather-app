"use client";

import EmailPreviewButton from "@/components/EmailPreviewButton";
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

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {step === "signup" ? "Create a new account" : "Verify your email"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === "signup" ? (
            <form
              className="space-y-6"
              onSubmit={handleSignupSubmit(onSignupSubmit)}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    {...registerSignup("email")}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                  {signupErrors.email && (
                    <p className="mt-2 text-sm text-red-600">
                      {signupErrors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    type="text"
                    {...registerSignup("username")}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                  {signupErrors.username && (
                    <p className="mt-2 text-sm text-red-600">
                      {signupErrors.username.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    type="text"
                    {...registerSignup("name")}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                  {signupErrors.name && (
                    <p className="mt-2 text-sm text-red-600">
                      {signupErrors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    {...registerSignup("password")}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                  {signupErrors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {signupErrors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="mobileNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mobile Number
                </label>
                <div className="mt-1 flex">
                  <input
                    id="mobileCode"
                    type="text"
                    {...registerSignup("mobile.code")}
                    className="w-20 rounded-l-md border border-r-0 border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                  <input
                    id="mobileNumber"
                    type="text"
                    {...registerSignup("mobile.number")}
                    className="block w-full flex-1 rounded-r-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
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

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleOTPSubmit(onOTPSubmit)}>
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
                    {...registerOTP("otp")}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter 6-digit code"
                  />
                  {otpErrors.otp && (
                    <p className="mt-2 text-sm text-red-600">
                      {otpErrors.otp.message}
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
                  {isLoading ? "Verifying..." : "Verify"}
                </button>
              </div>

              {/* Email Preview Button for Development */}
              {userEmail && (
                <div className="mt-4">
                  <EmailPreviewButton
                    email={userEmail}
                    className="w-full mt-2"
                  />
                </div>
              )}

              <div className="text-sm text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Didn&apos;t receive the code? Resend
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
