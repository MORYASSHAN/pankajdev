import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader";
import Chrome from "@/components/Chrome";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Marquee from "@/components/Marquee";
import Clock from "@/components/Clock";
import Projects from "@/components/Projects";
import Gallery from "@/components/Gallery";
import Skills from "@/components/Skills";
import Awards from "@/components/Awards";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const roles = ["Builder", "Designer", "Developer", "Artist", "Systems Architect", "Founder"];

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Loader />
      <Chrome />
      <main>
        <Hero />
        <div className="after-hero">
          <About />
          <Marquee words={roles} />
          <Clock />
          <Projects />
          <Gallery />
          <Skills />
          <Marquee words={["Maya", "Wishtara", "MahaBhav", "Tingle", "Taste Roast", "DFORR"]} tilt={2} />
          <Awards />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}
