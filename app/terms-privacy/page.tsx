import { HeroSection } from "@/components/terms-privacy/hero-section";
import { ContentSection } from "@/components/terms-privacy/content-section";
import { FooterCallout } from "@/components/terms-privacy/footer-callout";

export const metadata = {
  title: "Terms & Privacy | Askwiseo",
  description: "Terms of Service and Privacy Policy for Askwiseo - Your AI-powered assistant.",
};

export default function TermsPrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <ContentSection />
      <FooterCallout />
    </main>
  );
} 