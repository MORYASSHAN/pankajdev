"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { manifesto } from "@/lib/content";
import { Rich } from "./Split";

// Same maths as founder.dforr.in: hours reclaimed = (daily hours - 0.53) * 365.
function calc(h) {
  const back = Math.max(0, Math.round((h - 0.53) * 365));
  return {
    lost: Math.round(h * 365),
    back,
    days: Math.round(back / 24),
    books: Math.round(back / 12),
    passions: Math.round(back / 35),
    talks: Math.round(back / 3.5),
  };
}

export default function Manifesto() {
  const root = useRef(null);
  const [h, setH] = useState(4.2);
  const out = calc(h);
  const shown = useRef({ ...out });
  const nums = useRef({});

  // numbers roll to their new value instead of jumping
  useEffect(() => {
    gsap.to(shown.current, {
      ...out,
      duration: 0.8,
      ease: "power3.out",
      onUpdate: () =>
        Object.entries(nums.current).forEach(([k, el]) => {
          if (el) el.textContent = Math.round(shown.current[k]).toLocaleString("en-IN");
        }),
    });
  }, [h]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.utils.toArray(q(".mf-reveal")).forEach((el) =>
        gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } })
      );
      gsap.from(q(".mf-card"), {
        x: (i) => (i ? 80 : -80),
        opacity: 0,
        duration: 1.3,
        ease: "expo.out",
        scrollTrigger: { trigger: q(".mf-compare")[0], start: "top 85%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const n = (k) => <span ref={(el) => (nums.current[k] = el)}>{out[k].toLocaleString("en-IN")}</span>;

  return (
    <section className="mf" id="vision" ref={root} data-section="Vision">
      <span className="small-label mf-kicker">{manifesto.kicker}</span>
      <h2 className="mf-title" data-reveal-words>
        <Rich text={manifesto.title} wordClass="w" />
      </h2>
      <p className="mf-body" data-reveal-blur>
        {manifesto.body}
      </p>

      <div className="mf-compare">
        {[manifesto.today, manifesto.maya].map((c, i) => (
          <article className={`mf-card ${i ? "is-maya" : ""}`} key={c.label}>
            <span className="mono">{c.label}</span>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </article>
        ))}
      </div>

      <ul className="mf-checks mf-reveal">
        {manifesto.checks.map(([t, d]) => (
          <li key={t}>
            <b>✓ {t}</b>
            <span>{d}</span>
          </li>
        ))}
      </ul>

      <div className="mf-calc mf-reveal">
        <span className="small-label">Time calculator</span>
        <h3>{manifesto.calc.title}</h3>
        <div className="mf-presets">
          {manifesto.calc.presets.map(([v, label]) => (
            <button type="button" key={label} className={Math.abs(h - v) < 0.05 ? "is-on" : ""} onClick={() => setH(v)}>
              {v}h · {label}
            </button>
          ))}
        </div>
        <label className="mf-slider">
          <span className="mf-hours">
            {h.toFixed(1)}
            <small> hrs / day</small>
          </span>
          <input type="range" min="1" max="8" step="0.1" value={h} onChange={(e) => setH(+e.target.value)} />
        </label>
        <div className="mf-out">
          <div className="mf-lost">
            <b>{n("lost")} hrs</b>
            <span className="mono">Lost to feeds every year</span>
          </div>
          <div className="mf-back">
            <b>+{n("back")} hrs</b>
            <span className="mono">Life reclaimed · {n("days")} full days</span>
          </div>
        </div>
        <div className="mf-regain">
          <div>
            <b>{n("books")}</b>
            <span>{manifesto.calc.books}</span>
          </div>
          <div>
            <b>{n("passions")}</b>
            <span>{manifesto.calc.passions}</span>
          </div>
          <div>
            <b>{n("talks")}</b>
            <span>{manifesto.calc.talks}</span>
          </div>
        </div>
      </div>

      <blockquote className="mf-quote mf-reveal">
        “{manifesto.quote}”<cite>Pankaj</cite>
      </blockquote>
    </section>
  );
}
