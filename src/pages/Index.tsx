import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QuickActions from "@/components/QuickActions";
import AboutSection from "@/components/AboutSection";
import RegistrationSection from "@/components/RegistrationSection";
import SpiritWearSection from "@/components/SpiritWearSection";
import UmpiresSection from "@/components/UmpiresSection";
import SponsorsSection from "@/components/SponsorsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <QuickActions />
        <AboutSection />
        <RegistrationSection />
        <SpiritWearSection />
        <UmpiresSection />
        <SponsorsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
