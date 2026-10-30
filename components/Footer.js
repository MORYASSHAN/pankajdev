"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { createStage } from "@/lib/three-helpers";
import { person, socials } from "@/lib/content";
import Split from "./Split";
import { ext } from "@/lib/links";

const vert = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uPixel;
  uniform float uIn;
  varying vec3 vColor;
  void main(){
    vec3 p = position;
    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float push = smoothstep(0.32, 0.0, dist);
    p.xy += normalize(d + 1e-4) * push * 0.18;
    p.z += push * 0.4;
    p.y += sin(uTime * 0.8 + p.x * 6.0) * 0.004;
    p.xy *= mix(1.6, 1.0, uIn);
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixel * uIn * (1.0 + push * 0.8);
  }
`;
const frag = /* glsl */ `
  varying vec3 vColor;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.35, d));
  }
`;

// Rebuilds the portrait as a field of red halftone dots that scatter under the cursor.
export default function Footer() {
  const root = useRef(null);
  const canvasWrap = useRef(null);

  useEffect(() => {
    const stage = createStage(canvasWrap.current);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    const uniforms = {
      uMouse: { value: new THREE.Vector2(9, 9) },
      uTime: { value: 0 },
      uPixel: { value: 1 },
      uIn: { value: 0 },
    };
    let points;
    let aspect = 1;
    const fit = ({ w, h }) => {
      aspect = w / h;
      camera.left = -aspect;
      camera.right = aspect;
      camera.updateProjectionMatrix();
      uniforms.uPixel.value = (h / 2) * Math.min(window.devicePixelRatio, 1.75);
    };
    stage.onResize(fit);
    fit(stage.size);

    const img = new Image();
    img.src = person.photo;
    img.onload = () => {
      const cols = 150;
      const rows = Math.round(cols * (img.height / img.width));
      const c = document.createElement("canvas");
      c.width = cols;
      c.height = rows;
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0, cols, rows);
      const data = g.getImageData(0, 0, cols, rows).data;
      const pos = [];
      const size = [];
      const color = [];
      const scale = 1.9 / rows;
      const red = new THREE.Color("#ff3a1f");
      const warm = new THREE.Color("#ffb08a");
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const l = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
          if (l < 0.07) continue;
          pos.push((x - cols / 2) * scale, -(y - rows / 2) * scale, 0);
          size.push(scale * (0.35 + l * 1.25));
          const col = red.clone().lerp(warm, Math.pow(l, 2.2));
          color.push(col.r, col.g, col.b);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("aSize", new THREE.Float32BufferAttribute(size, 1));
      geo.setAttribute("aColor", new THREE.Float32BufferAttribute(color, 3));
      points = new THREE.Points(
        geo,
        new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, transparent: true, depthWrite: false })
      );
      scene.add(points);
    };

    const target = new THREE.Vector2(9, 9);
    const el = canvasWrap.current;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      target.set(((e.clientX - r.left) / r.width) * 2 * aspect - aspect, -(((e.clientY - r.top) / r.height) * 2 - 1));
    };
    const onLeave = () => target.set(9, 9);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    stage.loop((t) => {
      uniforms.uTime.value = t;
      uniforms.uMouse.value.lerp(target, 0.12);
      stage.renderer.render(scene, camera);
    });

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.to(uniforms.uIn, {
        value: 1,
        duration: 2.4,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 60%" },
      });
      gsap.from(q(".footer-name .char"), {
        yPercent: 105,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.035,
        scrollTrigger: { trigger: q(".footer-name")[0], start: "top 95%" },
      });
    }, root);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      ctx.revert();
      stage.dispose();
    };
  }, []);

  return (
    <footer className="footer" ref={root} data-section="Thanks">
      <div className="footer-top">
        <div>
          <a href={`mailto:${person.email}`} className="hover-line">{person.email}</a>
          <span>© 2026 {person.company}</span>
        </div>
        <nav>
          {socials.map((s) => (
            <a key={s.label} href={s.href} {...ext(s.href)} className="hover-line">
              {s.label}
            </a>
          ))}
        </nav>
        <nav>
          <a href="#work" className="hover-line">Work</a>
          <a href="#about" className="hover-line">Info</a>
          <a href="#top" className="hover-line">Back to top ↑</a>
        </nav>
      </div>

      <div className="footer-canvas" ref={canvasWrap} />

      <h2 className="footer-name" aria-label={person.full}>
        <Split text={person.first} className="sans" />
        <span className="footer-last">
          <Split text={person.last} className="serif" />
          <span className="footer-dot" />
        </span>
      </h2>
    </footer>
  );
}
