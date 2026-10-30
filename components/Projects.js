"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { projects } from "@/lib/content";
import ProjectDetail from "./ProjectDetail";
import { Rich } from "./Split";

// All projects on one screen as an image grid; each tile opens the full case study.
export default function Projects() {
  const root = useRef(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.from(q(".work-head .small-label, .work-head p"), {
        y: 30,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
      const path = q(".work-ribbon path")[0];
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 20%", scrub: 1 },
      });
      gsap.fromTo(
        q(".tile"),
        { clipPath: "inset(100% 0% 0% 0% round 18px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 18px)",
          duration: 1.4,
          ease: "expo.inOut",
          stagger: 0.09,
          scrollTrigger: { trigger: q(".tiles")[0], start: "top 80%" },
        }
      );
      gsap.from(q(".tile img"), {
        scale: 1.4,
        duration: 1.8,
        ease: "expo.out",
        stagger: 0.09,
        scrollTrigger: { trigger: q(".tiles")[0], start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // gentle 3D tilt toward the cursor
  const tilt = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: x * 6, rotateX: -y * 6, duration: 0.6, ease: "power3.out" });
    gsap.to(el.querySelector("img"), { x: -x * 18, y: -y * 18, duration: 0.8, ease: "power3.out" });
  };
  const untilt = (e) => {
    gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "power3.out" });
    gsap.to(e.currentTarget.querySelector("img"), { x: 0, y: 0, duration: 0.8, ease: "power3.out" });
  };

  return (
    <section className="work" id="work" ref={root} data-section="Projects">
      <svg className="work-ribbon" viewBox="0 0 1440 1200" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M 1520 140 C 1100 60, 420 80, 180 360 C -40 620, 260 900, 720 860 C 1180 820, 1380 980, 1240 1180"
          fill="none"
          stroke="var(--red)"
          strokeWidth="72"
          strokeLinecap="round"
        />
      </svg>
      <div className="work-head">
        <span className="small-label">Selected work ({String(projects.length).padStart(2, "0")})</span>
        <h2 data-reveal-words>
          <Rich text="Everything I'm *building*, in one place." wordClass="w" />
        </h2>
        <p className="mono">Click any project to see all of it</p>
      </div>

      <div className="tiles">
        {projects.map((p, i) => (
          <button
            type="button"
            key={p.slug}
            className={`tile tile--${p.slug}`}
            onClick={() => setOpen(i)}
            onMouseMove={tilt}
            onMouseLeave={untilt}
          >
            <img src={p.images[0]} alt={p.name} loading={i < 3 ? "eager" : "lazy"} />
            <span className="tile-shade" />
            <span className="tile-top mono">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span>{p.date}</span>
            </span>
            <span className="tile-info">
              <span className="tile-tag mono">{p.tag}</span>
              <span className="tile-name">{p.name}</span>
              <span className="tile-text">{p.text}</span>
            </span>
            <span className="tile-plus" aria-hidden="true">
              +
            </span>
          </button>
        ))}
      </div>

      <ProjectDetail index={open} onClose={() => setOpen(null)} onNav={setOpen} />
    </section>
  );
}
