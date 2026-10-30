"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { projects } from "@/lib/content";
import { cases } from "@/lib/cases";

export default function ProjectDetail({ index, onClose, onNav }) {
  const root = useRef(null);
  const open = index !== null && index !== undefined;
  const p = open ? projects[index] : null;

  useEffect(() => {
    const el = root.current;
    if (open) {
      window.__lenis?.stop();
      gsap.set(el, { display: "block" });
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.inOut" });
      gsap.fromTo(
        el.querySelectorAll(".pd-in"),
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.06, delay: 0.55 }
      );
      gsap.fromTo(
        el.querySelectorAll(".pd-sec, .pd-images"),
        { y: 40, opacity: 0, filter: "blur(10px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.9 }
      );
      el.scrollTop = 0;
      const onKey = (e) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    } else if (el.style.display === "block") {
      gsap.to(el, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(el, { display: "none" });
          window.__lenis?.start();
        },
      });
    }
  }, [open, index, onClose]);

  const next = open ? (index + 1) % projects.length : 0;

  return (
    <div className="pd" ref={root} data-lenis-prevent role="dialog" aria-modal="true" aria-hidden={!open}>
      {p && (
        <div className="pd-inner">
          <div className="pd-top mono">
            <span className="pd-in">
              {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
            </span>
            <button type="button" className="pd-close hover-line" onClick={onClose}>
              Close ✕
            </button>
          </div>

          <h3 className="pd-title">
            <span className="line-mask">
              <span className="pd-in">{p.name}</span>
            </span>
          </h3>

          <div className="pd-grid">
            <div className="pd-meta mono">
              <div className="pd-in">
                <small>Year</small>
                {p.date}
              </div>
              <div className="pd-in">
                <small>Type</small>
                {p.tag}
              </div>
              {p.link && (
                <a className="pd-in hover-line" href={p.link} target="_blank" rel="noreferrer">
                  Launch live ↗
                </a>
              )}
            </div>
            <div>
              <p className="pd-text pd-in">{p.text}</p>
              <ul className="pd-facts">
                {p.facts.map((f) => (
                  <li key={f} className="pd-in">
                    {f}
                  </li>
                ))}
              </ul>
              <div className="chips pd-in">
                {p.disciplines.map((d) => (
                  <span key={d} className="chip">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {(cases[p.slug] || []).map((sec) => (
            <section className="pd-sec" key={sec.title}>
              <h4 className="mono">{sec.title}</h4>
              <div className="pd-sec-body">
                {sec.text && <p className="pd-sec-text">{sec.text}</p>}
                {sec.quote && <blockquote className="pd-sec-quote">“{sec.quote}”</blockquote>}
                {sec.bars && (
                  <div className="pd-bars">
                    {sec.bars.map(([label, ms]) => (
                      <div className="pd-bar" key={label} style={{ "--w": ms / sec.bars[0][1] }}>
                        <span>{label}</span>
                        <i />
                        <b>{ms.toLocaleString("en-US")} ms</b>
                      </div>
                    ))}
                  </div>
                )}
                {sec.rows && (
                  <dl className="pd-rows">
                    {sec.rows.map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {sec.chips && (
                  <div className="chips">
                    {sec.chips.map((c) => (
                      <span key={c} className="chip">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}

          <div className="pd-images">
            {p.images.map((src) => (
              <img key={src} src={src} alt={p.name} loading="lazy" />
            ))}
          </div>

          <button type="button" className="pd-next" onClick={() => onNav(next)}>
            <span className="mono">Next project</span>
            <span className="pd-next-name">{projects[next].name} →</span>
          </button>
        </div>
      )}
    </div>
  );
}
