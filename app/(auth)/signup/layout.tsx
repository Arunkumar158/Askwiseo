import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Askwiseo",
  description: "Create a new Askwiseo account",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 