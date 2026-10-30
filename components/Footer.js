"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { createStage } from "@/lib/three-helpers";
import { person, socials } from "@/lib/content";
import Split from "./Split";
import { ext } from "@/lib/links";
import Roll from "./Roll";

const vert = /* glsl */ `
  attribute float aSize;
  attribute float aLum;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uPixel;
  uniform float uIn;
  uniform float uSpread;
  varying float vLum;
  varying float vLens;
  void main(){
    vec3 p = position;
    vec2 d = p.xy - uMouse;
    float dist = length(d);

    // a lens under the cursor: dots swell, brighten and bulge outward
    float lens = smoothstep(0.42, 0.0, dist);
    p.xy += normalize(d + 1e-4) * lens * lens * 0.03;
    // a ripple ring travelling out from the cursor
    float ring = smoothstep(0.03, 0.0, abs(dist - fract(uTime * 0.5) * 0.6)) * (1.0 - fract(uTime * 0.5));
    p.y += sin(uTime * 0.8 + p.x * 5.0) * 0.004;

    // arrives from a wider scatter
    p.xy *= mix(1.0 + uSpread, 1.0, uIn);

    vLum = aLum;
    vLens = max(lens, ring * smoothstep(0.7, 0.0, dist));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixel * uIn * (1.0 + lens * 1.6 + ring * 0.8);
  }
`;
const frag = /* glsl */ `
  varying float vLum;
  varying float vLens;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 dim = vec3(0.38, 0.08, 0.06);
    vec3 red = vec3(1.0, 0.2, 0.09);
    vec3 warm = vec3(1.0, 0.75, 0.6);
    vec3 col = mix(dim, red, smoothstep(0.04, 0.35, vLum));
    col = mix(col, warm, pow(vLum, 2.2));
    col = mix(col, warm, vLens * 0.85);
    float a = smoothstep(0.5, 0.32, d) * mix(0.7, 1.0, max(smoothstep(0.03, 0.2, vLum), vLens));
    gl_FragColor = vec4(col, a);
  }
`;

// The portrait rebuilt as a halftone field that fills the whole footer; the cursor is a lens over it.
export default function Footer() {
  const root = useRef(null);
  const canvasWrap = useRef(null);
  const cursor = useRef(null);

  useEffect(() => {
    const stage = createStage(canvasWrap.current);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    const uniforms = {
      uMouse: { value: new THREE.Vector2(9, 9) },
      uTime: { value: 0 },
      uPixel: { value: 1 },
      uIn: { value: 0 },
      uSpread: { value: 0.6 },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms,
      transparent: true,
      depthWrite: false,
    });
    let points = null;
    let aspect = 1;
    let pixels = null;

    const img = new Image();
    img.src = person.photo;

    // sample the photo onto a grid that covers the canvas, zoomed so the face sits large in the middle
    const build = () => {
      if (!pixels) return;
      const { data, w: iw, h: ih } = pixels;
      const cols = Math.round(Math.min(220, Math.max(90, aspect * 85)));
      const step = (2 * aspect) / cols;
      const rows = Math.ceil(2 / step);
      const zoom = 1.35; // photo height relative to canvas height
      const imgH = 2 * zoom;
      const imgW = imgH * (iw / ih);
      const pos = [];
      const size = [];
      const lum = [];
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = -aspect + c * step;
          const y = 1 - r * step;
          // face centre in the photo is about (0.5, 0.42)
          const u = (x + imgW * 0.5) / imgW;
          const v = (0.42 * imgH - y + 0.05) / imgH;
          let l = 0;
          if (u >= 0 && u < 1 && v >= 0 && v < 1) {
            const i = (Math.floor(v * ih) * iw + Math.floor(u * iw)) * 4;
            l = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
          }
          pos.push(x, y, 0);
          lum.push(l);
          size.push(step * (0.22 + Math.min(1, l * 1.5) * 0.8));
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("aSize", new THREE.Float32BufferAttribute(size, 1));
      geo.setAttribute("aLum", new THREE.Float32BufferAttribute(lum, 1));
      if (points) {
        points.geometry.dispose();
        points.geometry = geo;
      } else {
        points = new THREE.Points(geo, material);
        scene.add(points);
      }
    };

    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 420;
      c.height = Math.round(420 * (img.height / img.width));
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0, c.width, c.height);
      pixels = { data: g.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
      build();
    };

    let rebuild = 0;
    const fit = ({ w, h }) => {
      aspect = w / h;
      camera.left = -aspect;
      camera.right = aspect;
      camera.updateProjectionMatrix();
      uniforms.uPixel.value = (h / 2) * Math.min(window.devicePixelRatio, 1.75);
      clearTimeout(rebuild);
      rebuild = setTimeout(build, 150);
    };
    stage.onResize(fit);
    fit(stage.size);

    // track the cursor over the whole footer, not just the canvas
    const target = new THREE.Vector2(9, 9);
    const el = root.current;
    const wrap = canvasWrap.current;
    const cx = gsap.quickTo(cursor.current, "x", { duration: 0.5, ease: "power3.out" });
    const cy = gsap.quickTo(cursor.current, "y", { duration: 0.5, ease: "power3.out" });
    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      target.set(((e.clientX - r.left) / r.width) * 2 * aspect - aspect, -(((e.clientY - r.top) / r.height) * 2 - 1));
      const fr = el.getBoundingClientRect();
      cx(e.clientX - fr.left);
      cy(e.clientY - fr.top);
      cursor.current.classList.add("is-on");
    };
    const onLeave = () => {
      target.set(9, 9);
      cursor.current.classList.remove("is-on");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    stage.loop((t) => {
      uniforms.uTime.value = t;
      uniforms.uMouse.value.lerp(target, 0.14);
      stage.renderer.render(scene, camera);
    });

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.to(uniforms.uIn, {
        value: 1,
        duration: 2.6,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 75%" },
      });
      // the name rises letter by letter from the middle outwards as the page bottoms out
      gsap.fromTo(
        q(".footer-name .char, .footer-dot"),
        { yPercent: 110 },
        {
          yPercent: 0,
          ease: "none",
          stagger: { each: 0.04, from: "center" },
          scrollTrigger: { trigger: el, start: "top 40%", end: "bottom bottom", scrub: 0.5 },
        }
      );
    }, root);

    return () => {
      clearTimeout(rebuild);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      ctx.revert();
      material.dispose();
      points?.geometry.dispose();
      stage.dispose();
    };
  }, []);

  return (
    <footer className="footer" ref={root} data-section="Thanks">
      <div className="footer-cursor" ref={cursor} aria-hidden="true">
        <div className="footer-cursor-ring">
          <span>Say hi ↗</span>
        </div>
      </div>

      <div className="footer-top">
        <div>
          <a href={`mailto:${person.email}`} className="hover-line">
            {person.email}
          </a>
          <span>© 2026 {person.company}</span>
        </div>
        <nav>
          {socials.map((s) => (
            <a key={s.label} href={s.href} {...ext(s.href)}>
              <Roll text={s.label} />
            </a>
          ))}
        </nav>
        <nav>
          <a href="#work">
            <Roll text="Work" />
          </a>
          <a href="#about">
            <Roll text="Info" />
          </a>
          <a href="#top">
            <Roll text="Back to top ↑" />
          </a>
        </nav>
      </div>

      <a className="footer-canvas" ref={canvasWrap} href={`mailto:${person.email}`} aria-label={`Email ${person.full}`} />

      <h2 className="footer-name" aria-label={person.full}>
        <Split text={person.first.toUpperCase()} className="sans" />
        <span className="footer-last">
          <Split text={person.last.toUpperCase()} className="serif" />
          <span className="footer-dot" />
        </span>
      </h2>
    </footer>
  );
}
