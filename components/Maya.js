"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { maya } from "@/lib/content";
import { Rich } from "./Split";

// Maya in one centred block: the three pillars as image cards, then the spatial-audio demo.
export default function Maya() {
  const root = useRef(null);
  const [d, setD] = useState(4);
  const db = Math.round(20 * Math.log10(1 / Math.max(1, d)));
  const level = 1 / Math.max(1, d);
  const zone = d <= 2 ? "Whisper, intimate" : d <= 8 ? "Room conversation" : "Ambient murmur";

  useEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.from(q(".my-head .small-label, .my-live"), {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
      gsap.from(q(".my-card"), {
        y: 100,
        opacity: 0,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: q(".my-cards")[0], start: "top 85%" },
      });
      q(".my-card img").forEach((img) =>
        gsap.fromTo(
          img,
          { yPercent: -8 },
          { yPercent: 8, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true } }
        )
      );
      gsap.from(q(".my-ac"), {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: q(".my-ac")[0], start: "top 85%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="my" id="maya" ref={root} data-section="Maya">
      <div className="my-head">
        <span className="small-label">{maya.kicker}</span>
        <h2 data-reveal-words>
          <Rich text={maya.title} wordClass="w" />
        </h2>
        <p data-reveal-blur>{maya.text}</p>
        <div className="my-live mono">
          <i />
          {maya.live.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>

      <div className="my-cards">
        {maya.pillars.map((p) => (
          <article className="my-card" key={p.n}>
            <div className="my-img">
              <img src={p.image} alt={p.title} loading="lazy" />
            </div>
            <div className="my-copy">
              <span className="mono">
                {p.n} · {p.tag}
              </span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="my-friday">
        <span className="mono">FRIDAY · now</span>
        <p>{maya.friday}</p>
      </div>

      <div className="my-ac" style={{ "--level": level, "--dist": (d - 1) / 14 }}>
        <span className="small-label">{maya.acoustics.kicker}</span>
        <h3>{maya.acoustics.title}</h3>
        <p>{maya.acoustics.text}</p>
        <div className="my-ac-stage">
          <div className="my-ac-rings">
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ animationDelay: `${i * 0.8}s` }} />
            ))}
          </div>
          <span className="my-ac-speaker">Priya</span>
          <span className="my-ac-you">You</span>
        </div>
        <div className="my-ac-meter">
          <b>{db} dB</b>
          <span className="mono">
            {d}m · {zone}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="15"
          step="1"
          value={d}
          onChange={(e) => setD(+e.target.value)}
          aria-label="Distance to speaker in metres"
        />
        <div className="my-ac-scale mono">
          <span>1m whisper</span>
          <span>7m room</span>
          <span>15m murmur</span>
        </div>
      </div>
    </section>
  );
}
