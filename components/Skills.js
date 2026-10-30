"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { skills } from "@/lib/content";
import Split from "./Split";
import Roll from "./Roll";

export default function Skills() {
  const root = useRef(null);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.from(q(".skills-heading .word"), {
        yPercent: 110,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.03,
        scrollTrigger: { trigger: q(".skills-heading")[0], start: "top 80%" },
      });
      gsap.fromTo(
        q(".skills-arrow"),
        { x: "-38vw" },
        { x: "38vw", ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.5 } }
      );
      gsap.from(q(".acc"), {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: { trigger: q(".skills-list")[0], start: "top 85%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="skills" id="skills" ref={root} data-section="Skills">
      <span className="small-label">Skills</span>
      <h2 className="skills-heading">
        <Split text={skills.heading} by="word" />
      </h2>
      <a href="#contact" className="skills-contact small-link">
        <Roll text="Contact me +" />
      </a>
      <svg className="skills-arrow" viewBox="0 0 120 80" aria-hidden="true">
        <path d="M0 30 H72 L50 6 H76 L108 40 L76 74 H50 L72 50 H0 Z" fill="var(--red)" />
      </svg>

      <div className="skills-list">
        {skills.groups.map((g, i) => (
          <div className={`acc ${open === i ? "is-open" : ""}`} key={g.name}>
            <button type="button" className="acc-head" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              <span>{g.name}</span>
              <span className="acc-icon" />
            </button>
            <div className="acc-body">
              <ul>
                {g.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
