"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { finishIntro } from "@/lib/intro";
import { person, galleryImages } from "@/lib/content";

// Intro: the name rises letter by letter from the centre, grows to full width and drops to the
// bottom, then a dark and a red panel sweep up over it and off again to uncover the hero.
export default function Loader() {
  const root = useRef(null);
  const name = useRef(null);

  useEffect(() => {
    const el = root.current;
    const q = gsap.utils.selector(el);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // wait for the first images, but never longer than a few seconds on a slow connection
    const preload = Promise.race([
      Promise.all(
        [person.photo, ...galleryImages.slice(0, 4)].map(
          (u) =>
            new Promise((r) => {
              const img = new Image();
              img.onload = img.onerror = r;
              img.src = u;
            })
        )
      ),
      new Promise((r) => setTimeout(r, 4000)),
    ]);

    const done = () => {
      finishIntro();
      window.__lenis?.start();
    };

    if (reduce) {
      Promise.all([preload, document.fonts.ready]).then(() => {
        gsap.set(el, { display: "none" });
        done();
      });
      return;
    }

    gsap.set(q(".ld-char"), { yPercent: 110 });
    gsap.set(q(".ld-dot"), { opacity: 0 });

    Promise.all([preload, document.fonts.ready]).then(() => {
      const box = name.current.getBoundingClientRect();
      const pad = window.innerWidth < 700 ? 20 : 48;
      const scale = (window.innerWidth - pad * 2) / box.width;
      const targetY = window.innerHeight - 80 - (box.height * scale) / 2 - (box.top + box.height / 2);

      gsap
        .timeline({ delay: 0.2 })
        .to(q(".ld-char"), { yPercent: 0, duration: 0.4, ease: "power3.out", stagger: { each: 0.025, from: "center" } })
        .to(q(".ld-dot"), { opacity: 1, duration: 0.25, ease: "power2.out" })
        .to({}, { duration: 0.3 })
        .addLabel("grow")
        .to(name.current, { scale, y: targetY, duration: 0.75, ease: "power3.inOut" }, "grow")
        .to(q(".ld-panel--dark"), { yPercent: 0, duration: 0.45, ease: "power3.inOut" }, "grow+=0.05")
        .to(q(".ld-panel--red"), { yPercent: 0, duration: 0.45, ease: "power3.inOut" }, "-=0.3")
        .add(() => {
          gsap.set([name.current, q(".ld-bg")], { autoAlpha: 0 });
          done();
        })
        .to(q(".ld-panel--red"), { yPercent: -100, duration: 0.55, ease: "power3.inOut" }, "+=0.05")
        .to(q(".ld-panel--dark"), { yPercent: -100, duration: 0.55, ease: "power3.inOut" }, "-=0.4")
        .set(el, { display: "none" });
    });
  }, []);

  return (
    <div className="loader" ref={root} aria-hidden="true">
      <div className="ld-bg" />
      <div className="ld-name" ref={name}>
        {[...person.first].map((c, i) => (
          <span className="ld-mask" key={`f${i}`}>
            <span className="ld-char sans">{c}</span>
          </span>
        ))}
        <span className="ld-gap" />
        {[...person.last].map((c, i) => (
          <span className="ld-mask" key={`l${i}`}>
            <span className="ld-char serif">{c}</span>
          </span>
        ))}
        <span className="ld-dot" />
      </div>
      <div className="ld-panel ld-panel--dark" />
      <div className="ld-panel ld-panel--red" />
    </div>
  );
}
