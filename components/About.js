"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { createStage, fullscreenVert, noiseGLSL } from "@/lib/three-helpers";
import { about, person } from "@/lib/content";
import { Rich } from "./Split";

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform vec2 uImg;
  uniform vec2 uMouse;
  uniform float uVel;
  uniform float uTime;
  uniform float uReveal;
  uniform float uScroll;
  ${noiseGLSL}

  vec2 cover(vec2 uv){
    float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
    vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  void main(){
    vec2 uv = vUv;
    // gentle parallax zoom on scroll
    uv = (uv - 0.5) * (1.0 - 0.08 * uScroll) + 0.5 + vec2(0.0, 0.04 * (uScroll - 0.5));
    vec2 d = uv - uMouse;
    float falloff = smoothstep(0.45, 0.0, length(d * vec2(uRes.x / uRes.y, 1.0)));
    float n = snoise(uv * 3.0 + uTime * 0.2);
    vec2 warp = d * falloff * uVel * 0.25 + vec2(n, -n) * 0.004;
    vec2 cuv = cover(uv - warp);

    float shift = 0.0015 + uVel * 0.02 * falloff;
    float r = texture2D(uTex, cover(uv - warp * 1.4) + vec2(shift, 0.0)).r;
    float g = texture2D(uTex, cuv).g;
    float b = texture2D(uTex, cover(uv - warp * 0.6) - vec2(shift, 0.0)).b;
    vec3 col = vec3(r, g, b);

    // red light bleeding in from the right, like the reference portrait
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    float glow = smoothstep(0.35, 1.0, vUv.x + snoise(vec2(vUv.y * 2.0, uTime * 0.15)) * 0.15);
    vec3 red = vec3(1.0, 0.12, 0.05);
    col = mix(col, red * (0.25 + lum * 1.6), glow * 0.75);
    col += red * glow * 0.12;

    // dissolve in from noise
    float dn = fbm(vUv * 3.0) * 0.5 + 0.5;
    float vis = smoothstep(dn - 0.1, dn + 0.1, uReveal * 1.2);
    gl_FragColor = vec4(col * vis, vis);
  }
`;

export default function About() {
  const root = useRef(null);
  const media = useRef(null);

  useEffect(() => {
    const stage = createStage(media.current);
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const uniforms = {
      uTex: { value: null },
      uRes: { value: new THREE.Vector2(stage.size.w, stage.size.h) },
      uImg: { value: new THREE.Vector2(1672, 941) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVel: { value: 0 },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uScroll: { value: 0 },
    };
    new THREE.TextureLoader().load(person.photo, (tex) => {
      // sampled raw: the shader writes straight to the sRGB canvas
      tex.colorSpace = THREE.NoColorSpace;
      tex.minFilter = THREE.LinearFilter;
      uniforms.uTex.value = tex;
      uniforms.uImg.value.set(tex.image.width, tex.image.height);
    });
    scene.add(
      new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({ vertexShader: fullscreenVert, fragmentShader: frag, uniforms, transparent: true })
      )
    );
    stage.onResize(({ w, h }) => uniforms.uRes.value.set(w, h));

    const target = new THREE.Vector2(0.5, 0.5);
    let vel = 0;
    const last = { x: 0, y: 0 };
    const onMove = (e) => {
      const r = media.current.getBoundingClientRect();
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      vel = Math.min(vel + Math.hypot(e.clientX - last.x, e.clientY - last.y) / 120, 1.4);
      last.x = e.clientX;
      last.y = e.clientY;
    };
    media.current.addEventListener("pointermove", onMove);

    stage.loop((t) => {
      if (!uniforms.uTex.value) return;
      uniforms.uTime.value = t;
      uniforms.uMouse.value.lerp(target, 0.08);
      vel *= 0.93;
      uniforms.uVel.value += (vel - uniforms.uVel.value) * 0.1;
      stage.renderer.render(scene, camera);
    });

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);


      gsap.to(uniforms.uReveal, {
        value: 1,
        duration: 2.2,
        ease: "power2.out",
        scrollTrigger: { trigger: media.current, start: "top 75%" },
      });
      // the photo panel clears from a heavy blur as it comes up, then drifts slower than the page
      gsap.fromTo(
        q(".about-media"),
        { opacity: 0, filter: "blur(20px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: { trigger: q(".about-media")[0], start: "top bottom", end: "top 55%", scrub: true },
        }
      );
      gsap.to(uniforms.uScroll, {
        value: 1,
        ease: "none",
        scrollTrigger: { trigger: q(".about-media")[0], start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.from(q(".about-media-label"), {
        xPercent: -20,
        opacity: 0,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: q(".about-media")[0], start: "top 40%" },
      });
    }, root);

    return () => {
      ctx.revert();
      stage.dispose();
    };
  }, []);

  return (
    <section className="about" id="about" ref={root} data-section="About">
      <h2 className="about-statement" data-reveal-words>
        <Rich text={about.statement} wordClass="w" />
      </h2>

      <div className="about-grid">
        <div className="about-body" data-reveal-blur>
          <p>
            {about.body.split(". ").map((s, i, arr) => (
              <span className="line-mask" key={i}>
                <span className="line-in">{s + (i < arr.length - 1 ? ". " : "")}</span>
              </span>
            ))}
          </p>
          <a href="#contact" className="small-link hover-line">
            Info
          </a>
        </div>

        <div className="about-media" ref={media}>
          <div className="about-media-meta">
            <span>{person.vworld}</span>
            <span>
              {person.company} · {person.city}
            </span>
          </div>
          <div className="about-media-meta about-media-meta--bottom">
            <span>{person.role}</span>
            <span>{person.universe}</span>
          </div>
          <a className="about-media-label" href="#work">
            → DFORR
          </a>
        </div>
      </div>
    </section>
  );
}
