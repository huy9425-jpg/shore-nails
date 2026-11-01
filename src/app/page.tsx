import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Prices } from "@/components/sections/Prices";
import { Gallery } from "@/components/sections/Gallery";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { LocationMap } from "@/components/sections/LocationMap";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-ivory text-ink">
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <Services />
        <Prices />
        <Gallery />
        <WhyChooseUs />
        <LocationMap />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
