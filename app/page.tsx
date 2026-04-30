import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/layout/Footer";

// ─── Landing Page ───
// Public homepage — no auth required.
// Notion-like editorial design with Phosphor icons + Framer Motion animations.

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero — floating icon, headline, CTA */}
      <HeroSection />

      {/* Features — 3-column cards: Privacy, Formats, Speed */}
      <FeaturesGrid />

      {/* How It Works — Upload → Clean → Download visual flow */}
      <HowItWorks />

      {/* Final CTA before footer */}
      <CTASection />

      {/* Footer with privacy note */}
      <Footer />
    </main>
  );
}
