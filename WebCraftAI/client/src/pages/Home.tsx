import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ExamplesSection from "@/components/ExamplesSection";
import CreateWebsite from "@/components/CreateWebsite";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <HeroSection />
      <HowItWorks />
      <ExamplesSection />
      <CreateWebsite />
      <TestimonialsSection />
      <FaqSection />
      <CallToAction />
      <Footer />
    </div>
  );
}
