"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// Endless band whose speed and direction follow your scroll.
export default function Marquee({ words, tilt = -3 }) {
  const track = useRef(null);

  useEffect(() => {
    const el = track.current;
    let x = 0;
    let dir = -1;
    let boost = 0;
    let lenis = null;
    const onScroll = (l) => {
      boost = Math.min(Math.abs(l.velocity) * 0.6, 30);
      if (l.direction) dir = l.direction > 0 ? -1 : 1;
    };
    const tick = () => {
      if (!lenis && window.__lenis) {
        lenis = window.__lenis;
        lenis.on("scroll", onScroll);
      }
      const half = el.scrollWidth / 2;
      x += dir * (1.1 + boost);
      boost *= 0.92;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const row = words.map((w, i) => (
    <span key={i}>
      {w}
      <i> — </i>
    </span>
  ));

  return (
    <div className="marquee" style={{ "--tilt": `${tilt}deg` }} aria-hidden="true">
      <div className="marquee-track" ref={track}>
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}
