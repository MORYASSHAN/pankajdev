"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const lenis = new Lenis({ lerp: 0.06, smoothWheel: true });
    window.__lenis = lenis;
    lenis.stop(); // the loader starts it again
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // anchor links glide instead of jumping
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      e.preventDefault();
      lenis.scrollTo(id, { duration: 1.2 });
    };
    document.addEventListener("click", onClick);

    // late fonts and images change section heights; re-measure so every trigger stays reachable
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}
