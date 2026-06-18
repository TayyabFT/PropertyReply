import LandingNav from "@/components/landing/LandingNav";
import CtaBand from "@/components/landing/CtaBand";
import Hero from "@/components/Hero";
import Listings from "@/components/Listings";
import Membership from "@/components/Membership";
import Trust from "@/components/Trust";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <LandingNav />
      <Hero />
      <Listings />
      <Membership />
      <Trust />
      <CtaBand />
      <Footer />
    </>
  );
}
