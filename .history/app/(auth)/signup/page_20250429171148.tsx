import { AuthForm } from "@/components/AuthForm";
import { Metadata } from "next";
import { motion } from "framer-motion";
import { fadeIn, slideIn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign Up | Askwiseo",
  description: "Create a new Askwiseo account",
};

export default function SignUpPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <motion.div
        className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeIn}
      >
        <div className="absolute inset-0 bg-zinc-900" />
        <motion.div
          className="relative z-20 flex items-center text-lg font-medium"
          variants={slideIn}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Askwiseo
        </motion.div>
        <motion.div
          className="relative z-20 mt-auto"
          variants={slideIn}
          transition={{ delay: 0.2 }}
        >
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Askwiseo has transformed how I interact with AI. It's like having a personal assistant that truly understands me."
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </motion.div>
      </motion.div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
} 