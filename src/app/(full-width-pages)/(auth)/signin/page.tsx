"use client";

import SignInForm from "@/components/auth/SignInForm";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignIn() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen variant="auth" />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <SignInForm />;
}
