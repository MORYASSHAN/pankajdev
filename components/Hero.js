"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createStage, fullscreenVert, noiseGLSL } from "@/lib/three-helpers";
import { introDone } from "@/lib/intro";
import { person, socials } from "@/lib/content";
import Split from "./Split";
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
      gsap.set(q(".hero-name .char"), { yPercent: 105 });
      gsap.set(q(".hero-fade"), { opacity: 0, y: 12 });

      introDone.then(() => {
        gsap
          .timeline()
          .to(q(".hero-name .char"), { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.035 })
          .to(q(".hero-fade"), { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08 }, 0.4)
          .to(uniforms.uReveal, { value: 0.55, duration: 2.6, ease: "power2.out" }, 0.2);
      });

      // scrolling deeper floods the gradient in, then the about section slides over it
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          uniforms.uReveal.value = Math.max(uniforms.uReveal.value, 0.55 + self.progress * 0.6);
        },
      });
      gsap.to(uniforms.uExit, {
        value: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "bottom bottom", end: "bottom top", scrub: true },
      });
      gsap.to(q(".hero-sticky-inner"), {
        yPercent: 18,
        scale: 0.96,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "bottom bottom", end: "bottom top", scrub: true },
      });
      gsap.to(q(".hero-last"), {
        color: "#cfe7e1",
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "30% top", scrub: true },
      });
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
        <div className="hero-sticky-inner">
          <p className="hero-tagline hero-fade">
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

          <div className="hero-bar">
            <a href="#about" className="hero-fade">
              → DFORR
            </a>
            <nav className="hero-socials hero-fade">
              {socials.map((s, i) => (
                <span key={s.label}>
                  {i > 0 && <i>/</i>}
                  <a href={s.href} {...ext(s.href)} className="hover-line">
                    {s.label}
                  </a>
                </span>
              ))}
            </nav>
            <nav className="hero-nav hero-fade">
              <a href="#work" className="hover-line">Work</a>
              <a href="#about" className="hover-line">Info</a>
              <a href="#contact" className="hover-line">Contact</a>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
