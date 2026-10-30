"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "@/lib/content";
import ProjectDetail from "./ProjectDetail";

export default function Projects() {
  const root = useRef(null);
  const preview = useRef(null);
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const el = root.current;
    // the preview card trails the cursor while you hover the list
    const xTo = gsap.quickTo(preview.current, "x", { duration: 0.7, ease: "power3.out" });
    const yTo = gsap.quickTo(preview.current, "y", { duration: 0.7, ease: "power3.out" });
    const rTo = gsap.quickTo(preview.current, "rotate", { duration: 0.9, ease: "power3.out" });
    let lastX = 0;
    const onMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
      rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    };
    el.addEventListener("pointermove", onMove);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      q(".work-item").forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });

      gsap.from(q(".work-item"), {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: q(".work-list")[0], start: "top 80%" },
      });

      // the red ribbon draws itself as the list scrolls past
      const path = q(".work-ribbon path")[0];
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 30%", scrub: 1 },
      });
    }, root);

    return () => {
      el.removeEventListener("pointermove", onMove);
      ctx.revert();
    };
  }, []);

  const p = projects[active];

  return (
    <section className="work" id="work" ref={root} data-section="Projects">
      <svg className="work-ribbon" viewBox="0 0 1440 1400" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M 1500 100 C 900 40, 300 140, 200 480 C 100 820, 500 980, 820 900 C 1160 820, 1320 1060, 1100 1240 C 900 1400, 300 1340, -80 1300"
          fill="none"
          stroke="var(--red)"
          strokeWidth="80"
          strokeLinecap="round"
        />
      </svg>

      <div className="work-head mono">
        <span>Selected work</span>
        <span>({String(projects.length).padStart(2, "0")})</span>
      </div>

      <ul className="work-list" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
        {projects.map((proj, i) => (
          <li key={proj.slug} className={`work-item ${i === active ? "is-active" : ""}`}>
            <button type="button" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setOpen(i)}>
              <span className="work-index mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="work-name">{proj.name}</span>
              <span className="work-date mono">{proj.date}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="work-caption">
        <p key={p.slug} className="work-caption-text">
          {p.text}
        </p>
        <div className="chips">
          {p.disciplines.map((d) => (
            <span key={d} className="chip">
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className={`work-float ${hovering ? "is-on" : ""}`} ref={preview} aria-hidden="true">
        <div className="work-float-inner">
          {projects.map((proj, i) => (
            <img key={proj.slug} src={proj.images[0]} alt="" className={i === active ? "is-active" : ""} />
          ))}
          <span className="mono">See project</span>
        </div>
      </div>

      <ProjectDetail index={open} onClose={() => setOpen(null)} onNav={setOpen} />
    </section>
  );
}
