import { AuthForm } from '@/components/auth/AuthForm';
import { Toaster } from 'sonner';

export default function SignInPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white">
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold">Welcome to Askwiseo</h1>
          <p className="text-lg opacity-90">
            Your AI-powered assistant for smarter business decisions. Sign in to access your dashboard and start making data-driven decisions.
          </p>
          <div className="mt-8">
            <img
              src="/auth-illustration.svg"
              alt="Authentication illustration"
              className="w-full max-w-md"
            />
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Sign in to Askwiseo</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <AuthForm mode="signin" />
        </div>
      </div>
      <Toaster />
    </div>
  );
} 