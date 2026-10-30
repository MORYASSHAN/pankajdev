"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Site-wide scroll reveals: big lines clear word by word from a blur, paragraphs clear as a block.
export default function Reveals() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray("[data-reveal-words]").forEach((el) => {
        const words = el.querySelectorAll(".w");
        gsap.fromTo(
          words,
          { opacity: 0.08, filter: "blur(8px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            ease: "none",
            stagger: 0.12,
            scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 55%", scrub: true },
          }
        );
      });
      gsap.utils.toArray("[data-reveal-blur]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0.15, filter: "blur(12px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 85%", end: "top 60%", scrub: true },
          }
        );
      });
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);
  return null;
}
