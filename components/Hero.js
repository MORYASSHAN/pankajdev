"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { createStage, fullscreenVert, noiseGLSL } from "@/lib/three-helpers";
import { introDone } from "@/lib/intro";
import { person, socials } from "@/lib/content";
import Split from "./Split";
import Roll from "./Roll";
import { ext } from "@/lib/links";

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uReveal;
  uniform float uExit;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  ${noiseGLSL}

  // low-octave fbm keeps the gradient soft and blurry
  float sfbm(vec2 p){ return snoise(p) * 0.6 + snoise(p * 1.9 + 7.3) * 0.28 + snoise(p * 3.7 + 1.1) * 0.12; }

  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }

  void main(){
    vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    float t = uTime * 0.07;

    // big soft streaks, like light leaking through frosted glass
    vec2 sp = p * vec2(1.15, 0.2);
    vec2 q = vec2(sfbm(sp + vec2(t, -t * 0.6)), sfbm(sp + vec2(3.1, 1.7) - t));
    vec2 r = vec2(
      sfbm(sp + q * 0.7 + uMouse * 0.25 + vec2(1.7, 9.2) + t * 1.1),
      sfbm(sp + q * 0.7 + vec2(8.3, 2.8) - t * 0.7)
    );
    float f = sfbm(sp * 0.9 + r * 0.8);
    float m = clamp(f * 1.1 + 0.5 + r.x * 0.3, 0.0, 1.0);

    vec3 col = vec3(0.02, 0.018, 0.018);
    col = mix(col, vec3(0.38, 0.02, 0.03), smoothstep(0.1, 0.45, m));
    col = mix(col, vec3(0.95, 0.14, 0.06), smoothstep(0.4, 0.8, m));
    col = mix(col, vec3(1.0, 0.42, 0.24), smoothstep(0.8, 1.0, m) * 0.6);
    col += vec3(0.3, 0.05, 0.4) * smoothstep(0.1, 0.8, q.y + 0.3) * 0.3 * smoothstep(0.3, 1.0, vUv.x);

    // mouse glow
    vec2 mp = uMouse * vec2(uRes.x / uRes.y, 1.0) * 0.5;
    col += vec3(1.0, 0.25, 0.1) * 0.18 * smoothstep(0.55, 0.0, length(p - mp));

    // darker toward the bottom so the name reads
    col *= mix(0.35, 1.0, smoothstep(-0.55, 0.15, p.y));
    col *= 1.0 - 0.45 * smoothstep(0.35, 0.95, abs(p.x) / (uRes.x / uRes.y));

    // noisy dissolve reveal
    float d = sfbm(p * 1.4 + 4.0) * 0.5 + 0.5;
    float vis = smoothstep(d - 0.12, d + 0.12, uReveal * 1.25);
    col *= vis * (1.0 - uExit * 0.85);

    col += (hash(vUv * uRes + uTime) - 0.5) * 0.045;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const phrase = "Basically, I build what comes after the feed.";

export default function Hero() {
  const root = useRef(null);
  const canvasWrap = useRef(null);

  useEffect(() => {
    const stage = createStage(canvasWrap.current, { alpha: false, dpr: 1.25 });
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const uniforms = {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uExit: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({ vertexShader: fullscreenVert, fragmentShader: frag, uniforms })
    );
    scene.add(mesh);
    stage.onResize(({ w, h }) => uniforms.uRes.value.set(w, h));
    uniforms.uRes.value.set(stage.size.w, stage.size.h);

    const mouse = new THREE.Vector2();
    const onMove = (e) => mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    window.addEventListener("pointermove", onMove);

    stage.loop((t) => {
      uniforms.uTime.value = t;
      uniforms.uMouse.value.lerp(mouse, 0.04);
      stage.renderer.render(scene, camera);
    });

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const mobile = window.innerWidth < 900;
      gsap.set(q(".hero-tagline, .hero-bar"), { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(q(".hero-line"), { scaleX: 0 });
      gsap.set(q(".hero-phrase .pc"), { opacity: 0, filter: "blur(10px)" });

      // the hero is already in place under the intro panels; the gradient, tagline and bar arrive as they lift
      introDone.then(() => {
        gsap
          .timeline()
          .to(uniforms.uReveal, { value: 1, duration: 2.4, ease: "power2.out" }, 0)
          .to(q(".hero-tagline"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power3.inOut" }, 0.35)
          .to(q(".hero-bar"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power3.inOut" }, 0.65)
          .to(q(".hero-line"), { scaleX: 1, duration: 1, ease: "power3.inOut" }, 0.65)
          .to(q(".hero-last"), { color: "#cfe7e1", duration: 1.6, ease: "power2.out" }, 0.4);
      });

      // scrolling: the name rises to the centre, splits apart, and a phrase blurs in behind it
      const name = q(".hero-name")[0];
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.5, invalidateOnRefresh: true },
        })
        .to(q(".hero-tagline, .hero-bar, .hero-line"), { opacity: 0, duration: 0.15 }, 0)
        .to(name, { y: () => window.innerHeight / 2 - (name.offsetTop + name.offsetHeight / 2), duration: 0.3 }, 0)
        .to(q(".hero-first"), { x: mobile ? "-35vw" : "-55vw", opacity: 0, duration: 0.7 }, 0.3)
        .to(q(".hero-last"), { x: mobile ? "35vw" : "55vw", opacity: 0, duration: 0.7 }, 0.3)
        .to(q(".hero-phrase .pc"), { opacity: 1, filter: "blur(0px)", duration: 0.06, stagger: 0.007 }, 0.62);

      // on the way out the next section slides over a dimmed, blurred hero
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "bottom bottom", end: "bottom top", scrub: true },
        })
        .to(q(".hero-sticky-inner"), { y: "-30vh" }, 0)
        .to(q(".hero-dim"), { opacity: 0.7 }, 0)
        .to(uniforms.uExit, { value: 1 }, 0)
        .to(q(".hero-phrase .pc"), { opacity: 0, stagger: { each: 0.01, from: "end" } }, 0);
    }, root);

    return () => {
      window.removeEventListener("pointermove", onMove);
      ctx.revert();
      stage.dispose();
    };
  }, []);

  return (
    <section className="hero" id="top" ref={root} data-section="Intro">
      <div className="hero-sticky">
        <div className="hero-canvas" ref={canvasWrap} />
        <div className="hero-dim" />
        <p className="hero-phrase" aria-label={phrase}>
          {[...phrase].map((c, i) => (
            <span className="pc" key={i} aria-hidden="true">
              {c === " " ? " " : c}
            </span>
          ))}
        </p>
        <div className="hero-sticky-inner">
          <p className="hero-tagline">
            {person.tagline.map((l, i) => (
              <span key={i}>
                {i === 0 ? (
                  <>
                    Builder | <em>Designer</em> | Founder.
                  </>
                ) : (
                  l
                )}
                <br />
              </span>
            ))}
          </p>

          <h1 className="hero-name" aria-label={person.full}>
            <Split text={person.first} className="hero-first sans" />
            <Split text={`${person.last}.`} className="hero-last serif" />
          </h1>

          <span className="hero-line" />
          <div className="hero-bar">
            <a href="#dforr">
              <Roll text="→ DFORR" />
            </a>
            <nav className="hero-socials">
              {socials.map((s, i) => (
                <span key={s.label}>
                  {i > 0 && <i>/</i>}
                  <a href={s.href} {...ext(s.href)}>
                    <Roll text={s.label} />
                  </a>
                </span>
              ))}
            </nav>
            <nav className="hero-nav">
              <a href="#work">
                <Roll text="Work" />
              </a>
              <a href="#about">
                <Roll text="Info" />
              </a>
              <a href="#contact">
                <Roll text="Contact" />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
