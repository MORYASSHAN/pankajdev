"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { contact, person, socials } from "@/lib/content";
import Split from "./Split";
import { ext } from "@/lib/links";

export default function Contact() {
  const root = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.fromTo(
        q(".contact-title"),
        { scale: 1.35, yPercent: 30 },
        {
          scale: 1,
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 20%", scrub: true },
        }
      );
      gsap.from(q(".contact-title .char"), {
        yPercent: 100,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.04,
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
      gsap.from(q(".contact-fade"), {
        y: 30,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 55%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${person.email}`;
    }
  };

  return (
    <section className="contact" id="contact" ref={root} data-section="Contact">
      <div className="contact-top">
        <h2 className="contact-title">
          <Split text="Contact" />
        </h2>
        <p className="contact-lead contact-fade">
          We are open to <em>seed partners</em> and <em>licensing</em> our spatial technology. If you are working on anything
          similar, I&apos;d love to chat.
        </p>
      </div>

      <div className="contact-mid">
        <div className="contact-led contact-fade">
          <img src={person.photo} alt={person.full} />
          <div>
            <span>Led by</span>
            <strong>{person.full}</strong>
          </div>
        </div>
        <blockquote className="contact-quote contact-fade">
          “{contact.quote}”
          <cite>{person.first}, {person.company}</cite>
        </blockquote>
      </div>

      <div className="contact-bottom">
        <ul className="contact-links contact-fade">
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} {...ext(s.href)} className="hover-line">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <button type="button" className="contact-email contact-fade" onClick={copy}>
          <span className="hover-line">{person.email}</span>
          <small className="mono">{copied ? "Email copied ✓" : "Click to copy"}</small>
        </button>
      </div>
    </section>
  );
}
