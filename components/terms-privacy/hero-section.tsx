import { Shield } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-background py-24 sm:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute right-0 top-0 -z-10 transform-gpu blur-3xl">
          <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-primary/20 opacity-20" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Shield className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Terms & Privacy
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We value your trust and want you to know exactly how we handle your data.
          </p>
        </div>
      </div>
    </div>
  );
} 