"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { dforr, person, socials } from "@/lib/content";
import { ext } from "@/lib/links";
import Split, { Rich } from "./Split";
import Roll from "./Roll";

const istFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// One screen about the company: red, centred, heavy type, a soft black orb that follows the cursor.
export default function Dforr() {
  const root = useRef(null);
  const orb = useRef(null);
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    setTime(istFmt.format(new Date()));
    const id = setInterval(() => setTime(istFmt.format(new Date())), 1000);

    const el = root.current;
    const xTo = gsap.quickTo(orb.current, "x", { duration: 1.4, ease: "power3.out" });
    const yTo = gsap.quickTo(orb.current, "y", { duration: 1.4, ease: "power3.out" });
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      xTo(e.clientX - r.left - r.width / 2);
      yTo(e.clientY - r.top - r.height / 2);
    };
    el.addEventListener("pointermove", onMove);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.from(q(".dx-word .char"), {
        yPercent: 110,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: q(".dx-word")[0], start: "top 80%" },
      });
      q(".dx-fade").forEach((f) =>
        gsap.from(f, { y: 30, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: f, start: "top 90%" } })
      );
      gsap.from(q(".dx-card"), {
        y: 80,
        rotate: (i) => (i - 1.5) * 3,
        opacity: 0,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: q(".dx-cards")[0], start: "top 85%" },
      });
      gsap.from(q(".dx-want"), {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: q(".dx-vision ol")[0], start: "top 85%" },
      });
      // the giant word drifts a little against the scroll
      gsap.fromTo(
        q(".dx-word"),
        { yPercent: 12 },
        { yPercent: -12, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }
      );
    }, root);

    return () => {
      clearInterval(id);
      el.removeEventListener("pointermove", onMove);
      ctx.revert();
    };
  }, []);

  return (
    <section className="dx dot-grid dot-grid--dark" id="dforr" ref={root} data-section="DFORR">
      <div className="dx-orb" ref={orb} aria-hidden="true" />

      <div className="dx-top mono">
        <span>{dforr.legal}</span>
        <span>Jaipur · {time} IST</span>
        <span>Est. 2026</span>
      </div>

      <h2 className="dx-word" aria-label="DFORR">
        <Split text="DFORR" />
      </h2>

      <p className="dx-lead" data-reveal-blur>
        {dforr.lead}
      </p>
      <p className="dx-born dx-fade mono">{dforr.born}</p>

      <div className="dx-cards">
        {dforr.pillars.map((p) => (
          <article className="dx-card" key={p.n}>
            <span className="dx-n">{p.n}</span>
            <h3>{p.title}</h3>
            <p>{p.line}</p>
          </article>
        ))}
      </div>

      <div className="dx-vision">
        <span className="mono dx-fade">{dforr.vision.kicker}</span>
        <h3 data-reveal-words>
          <Rich text={dforr.vision.title} wordClass="w" />
        </h3>
        <p className="dx-fade">{dforr.vision.intro}</p>
        <ol>
          {dforr.vision.wants.map((w, i) => (
            <li key={i} className="dx-want">
              <span>0{i + 1}</span>
              <p>{w}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="dx-relation dx-fade">
        <img src={person.photo} alt={person.full} />
        <div>
          <span className="mono">My relation to DFORR</span>
          <h3>{dforr.relation.title}</h3>
          <p>{dforr.relation.text}</p>
          <dl>
            {dforr.relation.rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <ul className="dx-facts dx-fade mono">
        {[...dforr.facts, ...dforr.principles].map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <div className="dx-cta dx-fade">
        <p>{dforr.open}</p>
        <a className="dx-mail" href={`mailto:${person.email}?subject=DFORR`}>
          {person.email} <span>↗</span>
        </a>
        <div className="dx-links mono">
          {socials.map((s) => (
            <a key={s.label} href={s.href} {...ext(s.href)}>
              <Roll text={s.label} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
