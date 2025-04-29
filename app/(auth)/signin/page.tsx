import { Metadata } from "next";
import { SignInContent } from "@/components/auth/signin-content";

export const metadata: Metadata = {
  title: "Sign In | Askwiseo",
  description: "Sign in to your Askwiseo account",
};

export default function SignInPage() {
  return <SignInContent />;
} 