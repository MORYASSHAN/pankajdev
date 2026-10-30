"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { person } from "@/lib/content";

// Jaipur local time, drawn huge in the corners with a soft black orb for a face.
const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  day: "2-digit",
  month: "short",
  hour12: false,
});

function readIST() {
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return { h: parts.hour, m: parts.minute, s: +parts.second, d: parts.day, mon: parts.month.toUpperCase().slice(0, 3) };
}

export default function Clock() {
  const root = useRef(null);
  const orb = useRef(null);
  const [t, setT] = useState({ h: "--", m: "--", s: 0, d: "--", mon: "---" });

  useEffect(() => {
    setT(readIST());
    const id = setInterval(() => setT(readIST()), 1000);

    const xTo = gsap.quickTo(orb.current, "x", { duration: 1.2, ease: "power3.out" });
    const yTo = gsap.quickTo(orb.current, "y", { duration: 1.2, ease: "power3.out" });
    const el = root.current;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.25);
      yTo((e.clientY - r.top - r.height / 2) * 0.25);
    };
    el.addEventListener("pointermove", onMove);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.from(q(".clock-digit"), {
        yPercent: 100,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 65%" },
      });
      gsap.fromTo(
        q(".clock-orb-inner"),
        { scale: 0.2 },
        { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "center center", scrub: true } }
      );
    }, root);

    return () => {
      clearInterval(id);
      el.removeEventListener("pointermove", onMove);
      ctx.revert();
    };
  }, []);

  const hh = +t.h || 0;
  const mm = +t.m || 0;
  const hourDeg = ((hh % 12) + mm / 60) * 30;
  const minDeg = (mm + t.s / 60) * 6;
  const secDeg = t.s * 6;

  return (
    <section className="clock dot-grid dot-grid--dark" ref={root} data-section="Jaipur">
      <div className="clock-corner tl"><span className="clock-digit">{t.h}</span></div>
      <div className="clock-corner tr"><span className="clock-digit">{t.m}</span></div>
      <div className="clock-corner bl"><span className="clock-digit">{t.mon}</span></div>
      <div className="clock-corner br"><span className="clock-digit">{t.d}</span></div>

      <div className="clock-label mono">
        <span>{person.city}</span>
        <span>IST · UTC+5:30</span>
      </div>

      <div className="clock-orb" ref={orb}>
        <div className="clock-orb-inner">
          <span className="hand hour" style={{ transform: `rotate(${hourDeg}deg)` }} />
          <span className="hand min" style={{ transform: `rotate(${minDeg}deg)` }} />
          <span className="hand sec" style={{ transform: `rotate(${secDeg}deg)` }} />
          <span className="hand-pin" />
        </div>
      </div>

      <p className="clock-note mono">Building from Jaipur, for everywhere</p>
    </section>
  );
}
