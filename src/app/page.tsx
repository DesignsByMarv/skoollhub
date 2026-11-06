import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import CampusMarquee from '@/components/landing/CampusMarquee';
import StatsSection from '@/components/landing/StatsSection';
import InteractiveFeatureCards from '@/components/landing/InteractiveFeatureCards';
import BentoGridSection from '@/components/landing/BentoGridSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FaqSection from '@/components/landing/FaqSection';
import CtaSection from '@/components/landing/CtaSection';
import LandingFooter from '@/components/landing/LandingFooter';
import MotivationalQuote from '@/components/MotivationalQuote';

export default function Home() {
  return (
    <div className="landing-page min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative selection:bg-indigo-500 selection:text-white">
      {/* Top Fixed Header with Blur */}
      <LandingHeader />

      {/* Main Content Sections */}
      <main className="relative">
        {/* Hero Section with Floating 3D Cards */}
        <HeroSection />

        {/* Live Campus Marquee */}
        <CampusMarquee />

        {/* Impact Numbers & Metrics */}
        <StatsSection />

        {/* Interactive Feature Matrix (Full of Cards & Interactive Tabs) */}
        <InteractiveFeatureCards />

        {/* Asymmetrical Bento Grid */}
        <BentoGridSection />

        {/* 4-Step How It Works Card Journey */}
        <HowItWorksSection />

        {/* Student Testimonials & Love */}
        <TestimonialsSection />

        {/* Interactive FAQ Accordion */}
        <FaqSection />

        {/* High Conversion Bottom CTA */}
        <CtaSection />
      </main>

      {/* Floating Minimize-friendly Motivation Card */}
      <MotivationalQuote />

      {/* Modern Comprehensive Footer */}
      <LandingFooter />
    </div>
  );
}
