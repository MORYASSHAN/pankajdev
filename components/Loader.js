"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { finishIntro } from "@/lib/intro";
import { person, galleryImages } from "@/lib/content";

export default function Loader() {
  const root = useRef(null);
  const bar = useRef(null);
  const count = useRef(null);

  useEffect(() => {
    const el = root.current;
    const urls = [person.photo, ...galleryImages.slice(0, 6)];
    const progress = { v: 0 };
    let loaded = 0;

    const tl = gsap.timeline();
    tl.from(el.querySelectorAll(".loader-word > span"), {
      yPercent: 110,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.12,
    });

    const target = { v: 0 };
    const update = () => {
      gsap.to(progress, {
        v: target.v,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: () => {
          bar.current.style.transform = `scaleX(${progress.v / 100})`;
          count.current.textContent = String(Math.round(progress.v)).padStart(3, "0");
        },
      });
    };

    const done = new Promise((resolve) => {
      urls.forEach((u) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loaded++;
          target.v = (loaded / urls.length) * 100;
          update();
          if (loaded === urls.length) resolve();
        };
        img.src = u;
      });
    });

    const minTime = new Promise((r) => setTimeout(r, 1600));
    Promise.all([done, minTime, document.fonts.ready]).then(() => {
      target.v = 100;
      update();
      gsap
        .timeline({ delay: 0.5 })
        .to(el.querySelectorAll(".loader-word > span"), { yPercent: -110, duration: 0.8, ease: "power3.in", stagger: 0.06 })
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, "-=0.2")
        .add(() => {
          finishIntro();
          window.__lenis?.start();
        }, "-=0.75")
        .set(el, { display: "none" });
    });
  }, []);

  return (
    <div className="loader" ref={root} aria-hidden="true">
      <div className="loader-bar" ref={bar} />
      <div className="loader-name">
        <span className="loader-word sans"><span>{person.first}</span></span>
        <span className="loader-word serif"><span>{person.last}.</span></span>
      </div>
      <div className="loader-count mono" ref={count}>000</div>
    </div>
  );
}
