"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { awards } from "@/lib/content";

export default function Awards() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.from(q(".award-row"), {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.3,
        ease: "expo.inOut",
        stagger: 0.1,
        scrollTrigger: { trigger: q(".awards-table")[0], start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="awards" ref={root} data-section="Awards">
      <h2 className="awards-title">Awards & Misc</h2>
      <div className="awards-table">
        {awards.map((a) => (
          <div className="award-row" key={a.org + a.note}>
            <span>{a.org}</span>
            <span>{a.what}</span>
            <span>{a.note}</span>
            <span className="mono">{a.date}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
