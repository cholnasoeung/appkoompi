import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import CardSection from "../components/CardSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <CardSection />
      <Footer />
    </div>
  );
}