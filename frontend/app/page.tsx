"use client";

import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustLogos from "@/components/landing/TrustLogos";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import Footer from "@/components/landing/Footer";
import AuthModal from "@/components/landing/AuthModal";

export default function LandingPage() {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#060b11] text-foreground selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar />
      <main>
        <HeroSection />
        <TrustLogos />
        <FeaturesSection />
        <HowItWorksSection />
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
}

