import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { Categories } from "@/components/home/categories";
import { HowItWorks } from "@/components/home/how-it-works";
import { Services } from "@/components/home/services";
import { Pros } from "@/components/home/pros";
import { TrustStrip } from "@/components/home/trust-strip";
import { Cta } from "@/components/home/cta";
import { Footer } from "@/components/home/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-ticket text-ink">
      <Header />
      <main className="flex-1">
        <Hero />
        <Categories />
        <HowItWorks />
        <Services />
        <Pros />
        <TrustStrip />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
