"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/auth-context";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const DEMO_ACCOUNTS = {
  admin: {
    email: "admin@example.com",
    password: "123456",
    label: "Sign in as Admin",
  },
  user: {
    email: "newuser@example.com",
    password: "123456",
    label: "Sign in as User",
  },
} as const;

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const signInAndRedirect = async (nextEmail: string, nextPassword: string) => {
    setError("");
    await login(nextEmail, nextPassword);
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    setError("");
    try {
      await signInAndRedirect(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleQuickSignIn = async (role: keyof typeof DEMO_ACCOUNTS) => {
    try {
      await signInAndRedirect(DEMO_ACCOUNTS[role].email, DEMO_ACCOUNTS[role].password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            
          <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  
                </span>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSignIn("admin")}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : DEMO_ACCOUNTS.admin.label}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleQuickSignIn("user")}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : DEMO_ACCOUNTS.user.label}
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <span className="fill-gray-500 dark:fill-gray-400">
                          <EyeIcon />
                        </span>
                      ) : (
                        <span className="fill-gray-500 dark:fill-gray-400">
                          <EyeCloseIcon />
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                {error && <p className="text-error-500 text-sm">{error}</p>}
              
                <div>
                  <Button type="submit" className="w-full" size="sm" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
