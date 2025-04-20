"use client";

import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";
import SignInMutation from "@/graphql/mutation/auth/sign-in.gql";
import GetMeQuery from "@/graphql/query/user/me.gql";
import { loginSchema } from "@/schemas/user";
import { useMutation, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const { setUser } = useUser();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [signIn] = useMutation(SignInMutation);
  const { refetch } = useQuery(GetMeQuery);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await signIn({
        variables: {
          identifier: data.identifier,
          password: data.password,
        },
      });

      const result = response.data.signIn;

      if (result.success) {
        document.cookie = `x-token=${result.token}; path=/`;
        document.cookie = `x-refresh-token=${result.refreshToken}; path=/`;

        const userResponse = await refetch();

        setUser(userResponse.data.me);
        showSuccessToast("Login successful!");

        router.push(returnUrl);
      } else {
        showErrorToast(result.message || "Login failed");
      }
    } catch (err) {
      showErrorToast("An error occurred during login");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const subtitle =
    returnUrl !== "/"
      ? "You need to sign in to access this page"
      : "Enter your credentials to access your account";

  return (
    <AuthLayout title="Welcome Back" subtitle={subtitle} loading={false}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="identifier"
          label="Email or Username"
          type="text"
          autoComplete="email"
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
          {...register("identifier")}
          error={errors.identifier?.message}
        />

        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
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
          {...register("password")}
          error={errors.password?.message}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot your password?
          </Link>
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
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">New here?</span>
          </div>
        </div>

        <div className="text-center">
          <Link href="/signup">
            <Button variant="outline" className="w-full">
              Create a new account
            </Button>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
