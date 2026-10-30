"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { finishIntro } from "@/lib/intro";
import { person, galleryImages, maya } from "@/lib/content";

// Everything the first screens need. The WebGL gallery requests its textures as soon as it mounts,
// so warming them here keeps the ring from popping in card by card.
const ASSETS = [...new Set([person.photo, ...maya.pillars.map((p) => p.image), ...galleryImages])];
// on a very slow connection stop waiting after this long; the rest keeps loading in the background
const MAX_WAIT = 9000;
// share of the counter that covers the page's own scripts arriving, before React can track anything
const BOOT = 0.2;

// Runs straight from the HTML so the counter moves while the scripts are still downloading.
// It creeps toward BOOT and hands its value over once the component mounts.
const bootScript = `(function(){var t=performance.now(),n=document.getElementById("ld-n"),b=document.getElementById("ld-b");
function f(){if(window.__ldTaken||!n)return;var s=${BOOT}*(1-Math.exp(-(performance.now()-t)/2500));window.__ldShown=s;
n.textContent=Math.round(s*100);b.style.transform="scaleX("+s+")";requestAnimationFrame(f)}f()})()`;

// Streams one file so its progress moves byte by byte, then lets the HTTP cache serve it to the page.
function track(url, onProgress) {
  return fetch(url)
    .then(async (res) => {
      const total = +res.headers.get("content-length") || 0;
      if (!res.body || !total) return res.blob();
      const reader = res.body.getReader();
      let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        got += value.length;
        onProgress(Math.min(got / total, 1));
      }
    })
    .catch(() => {})
    .finally(() => onProgress(1));
}

// Intro: the name rises letter by letter from the centre (CSS, so it plays before the scripts
// arrive) while a counter runs 0 to 100 on the real download progress, then the name grows to full
// width and drops to the bottom while the black fades away into the hero underneath.
export default function Loader() {
  const root = useRef(null);
  const name = useRef(null);
  const count = useRef(null);
  const bar = useRef(null);

  useEffect(() => {
    const el = root.current;
    const q = gsap.utils.selector(el);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // one share per asset plus one for the fonts, each filled 0..1
    const parts = new Array(ASSETS.length + 1).fill(0);
    window.__ldTaken = true;
    let shown = window.__ldShown || 0;
    let target = Math.max(shown, BOOT);
    const setPart = (i, v) => {
      parts[i] = Math.max(parts[i], v);
      target = Math.max(target, BOOT + (1 - BOOT) * (parts.reduce((a, b) => a + b, 0) / parts.length));
    };
    const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]).then(() =>
      setPart(ASSETS.length, 1)
    );
    const loaded = Promise.race([
      Promise.all([fonts, ...ASSETS.map((u, i) => track(u, (v) => setPart(i, v)))]),
      new Promise((r) => setTimeout(r, MAX_WAIT)),
    ]).then(() => {
      target = 1;
    });

    // the shown number eases toward the real one and never goes backwards
    let finished;
    const reached = new Promise((r) => (finished = r));
    const tick = (_, dt) => {
      const step = (target - shown) * Math.min(dt / 220, 1);
      shown = Math.min(target, shown + Math.max(step, target >= 1 ? dt / 900 : 0));
      const pct = Math.round(shown * 100);
      if (count.current) count.current.textContent = pct;
      if (bar.current) bar.current.style.transform = `scaleX(${shown})`;
      if (shown >= 1) {
        gsap.ticker.remove(tick);
        finished();
      }
    };
    gsap.ticker.add(tick);

    const done = () => {
      finishIntro();
      window.__lenis?.start();
    };

    if (reduce) {
      Promise.all([loaded, reached]).then(() => {
        gsap.set(el, { display: "none" });
        done();
      });
      return () => gsap.ticker.remove(tick);
    }

    // the letters and the counter already rose in with CSS, straight from the HTML
    let tl;
    Promise.all([fonts, reached]).then(() => {
      const box = name.current.getBoundingClientRect();
      const pad = window.innerWidth < 700 ? 20 : 48;
      let scale = (window.innerWidth - pad * 2) / box.width;
      let targetX = 0;
      let targetY = window.innerHeight - 80 - (box.height * scale) / 2 - (box.top + box.height / 2);
      // when the hero's name is on one line too, land exactly on it so the crossfade doesn't double up
      const hero = document.querySelector(".hero-name")?.getBoundingClientRect();
      if (hero && Math.abs(hero.width / hero.height / (box.width / box.height) - 1) < 0.3) {
        scale = hero.width / box.width;
        targetX = hero.left + hero.width / 2 - (box.left + box.width / 2);
        targetY = hero.bottom - (box.height * scale) / 2 - (box.top + box.height / 2);
      }

      tl = gsap
        .timeline({ delay: 0.25 })
        .to(q(".ld-meta"), { autoAlpha: 0, y: 12, duration: 0.3, ease: "power2.in" })
        .addLabel("grow")
        .to(name.current, { scale, x: targetX, y: targetY, duration: 0.75, ease: "power3.inOut" }, "grow")
        // the hero sits right underneath: start its entrance and dissolve the black into it
        .add(done, "grow+=0.55")
        .to(q(".ld-bg"), { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" }, "grow+=0.55")
        .to(name.current, { autoAlpha: 0, duration: 0.45, ease: "power2.out" }, "grow+=0.75")
        .set(el, { display: "none" });
    });

    return () => {
      gsap.ticker.remove(tick);
      tl?.kill();
    };
  }, []);

  const letters = person.first.length + person.last.length;
  const delay = (i) => `${0.1 + Math.abs(i - (letters - 1) / 2) * 0.025}s`;

  return (
    <div className="loader" ref={root} aria-hidden="true">
      <div className="ld-bg" />
      <div className="ld-name" ref={name}>
        {[...person.first].map((c, i) => (
          <span className="ld-mask" key={`f${i}`}>
            <span className="ld-char sans" style={{ animationDelay: delay(i) }}>
              {c}
            </span>
          </span>
        ))}
        <span className="ld-gap" />
        {[...person.last].map((c, i) => (
          <span className="ld-mask" key={`l${i}`}>
            <span className="ld-char serif" style={{ animationDelay: delay(person.first.length + i) }}>
              {c}
            </span>
          </span>
        ))}
        <span className="ld-dot" />
      </div>
      <div className="ld-meta">
        <span className="ld-label">Loading</span>
        <span className="ld-count">
          <span id="ld-n" ref={count} suppressHydrationWarning>
            0
          </span>
          <span className="ld-pct">%</span>
        </span>
        <span className="ld-track">
          <span id="ld-b" className="ld-bar" ref={bar} suppressHydrationWarning />
        </span>
      </div>
      <script dangerouslySetInnerHTML={{ __html: bootScript }} />
    </div>
  );
}
