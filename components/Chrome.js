"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { introDone } from "@/lib/intro";
import { socials } from "@/lib/content";
import { ext } from "@/lib/links";
import Roll from "./Roll";

// Fixed UI: top bar after the hero, scroll percentage on the left, section rail on the right.
export default function Chrome() {
  const header = useRef(null);
  const pct = useRef(null);
  const thumb = useRef(null);
  const [label, setLabel] = useState("Intro");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    introDone.then(() => setShown(true));

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const p = self.progress;
        pct.current.textContent = `(${String(Math.round(p * 100)).padStart(2, "0")})`;
        thumb.current.style.transform = `translateY(${p * 400}%)`;
      },
    });

    const header_st = ScrollTrigger.create({
      trigger: "#about",
      start: "top 10%",
      end: "max",
      toggleClass: { targets: header.current, className: "is-visible" },
    });

    const sections = gsap.utils.toArray("[data-section]");
    const triggers = sections.map((s) =>
      ScrollTrigger.create({
        trigger: s,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => self.isActive && setLabel(s.dataset.section),
      })
    );

    return () => {
      st.kill();
      header_st.kill();
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <header className="topbar" ref={header}>
        <a href="#top"><Roll text="→ P.K.S" /></a>
        <nav className="topbar-socials">
          {socials.map((s) => (
            <a key={s.label} href={s.href} {...ext(s.href)}>
              <Roll text={s.label} />
            </a>
          ))}
        </nav>
        <nav className="topbar-nav">
          <a href="#work"><Roll text="Work" /></a>
          <a href="#about"><Roll text="Info" /></a>
          <a href="#contact"><Roll text="Contact" /></a>
        </nav>
      </header>

      <div className={`side-pct mono ${shown ? "is-shown" : ""}`} ref={pct}>(00)</div>
      <div className={`side-rail ${shown ? "is-shown" : ""}`}>
        <div className="side-rail-track">
          <div className="side-rail-thumb" ref={thumb}>
            <span key={label} className="side-rail-label">{label}</span>
          </div>
        </div>
      </div>
    </>
  );
}
