"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { createStage } from "@/lib/three-helpers";
import { galleryImages, galleryStatement } from "@/lib/content";
import { Rich } from "./Split";

const vert = /* glsl */ `
  uniform float uBend;
  uniform float uRadius;
  varying vec2 vUv;
  void main(){
    vUv = uv;
    vec3 p = position;
    // curve each card around the ring so the row reads as one cylinder
    float a = p.x / uRadius;
    p.z += uRadius * (cos(a) - 1.0) * uBend;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uImg;
  uniform vec2 uPlane;
  uniform float uOpacity;
  uniform float uHover;
  varying vec2 vUv;
  void main(){
    float rp = uPlane.x / uPlane.y, ri = uImg.x / uImg.y;
    vec2 s = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
    vec2 uv = (vUv - 0.5) * s * (1.0 - uHover * 0.06) + 0.5;
    vec4 c = texture2D(uTex, uv);
    float edge = smoothstep(0.0, 0.015, vUv.x) * smoothstep(1.0, 0.985, vUv.x);
    gl_FragColor = vec4(c.rgb * (0.85 + uHover * 0.25), uOpacity * edge);
    #include <colorspace_fragment>
  }
`;

export default function Gallery() {
  const root = useRef(null);
  const canvasWrap = useRef(null);

  useEffect(() => {
    const stage = createStage(canvasWrap.current);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 1.6, 13.5);
    camera.lookAt(0, 0, 0);
    stage.onResize(({ w, h }) => {
      camera.aspect = w / h;
      // pull back on narrow screens so the ring still fits
      camera.position.z = w / h < 1 ? 19 : 13.5;
      camera.updateProjectionMatrix();
    });
    camera.aspect = stage.size.w / stage.size.h;
    camera.updateProjectionMatrix();

    const ring = new THREE.Group();
    ring.rotation.x = 0.16;
    scene.add(ring);

    const R = 4.8;
    const count = galleryImages.length;
    const loader = new THREE.TextureLoader();
    const cards = galleryImages.map((src, i) => {
      const w = 1.7 + (i % 3) * 0.25;
      const h = w * (i % 2 ? 0.62 : 0.78);
      const uniforms = {
        uTex: { value: null },
        uImg: { value: new THREE.Vector2(1, 1) },
        uPlane: { value: new THREE.Vector2(w, h) },
        uOpacity: { value: 0 },
        uHover: { value: 0 },
        uBend: { value: 1 },
        uRadius: { value: R },
      };
      loader.load(src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        uniforms.uTex.value = tex;
        uniforms.uImg.value.set(tex.image.width, tex.image.height);
      });
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h, 24, 1),
        new THREE.ShaderMaterial({
          vertexShader: vert,
          fragmentShader: frag,
          uniforms,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      const a = (i / count) * Math.PI * 2;
      const y = Math.sin(i * 2.3) * 1.1;
      mesh.position.set(Math.sin(a) * R, y, Math.cos(a) * R);
      mesh.rotation.y = a;
      mesh.userData = { uniforms, baseY: y, a };
      ring.add(mesh);
      return mesh;
    });

    const state = { rot: 0, spread: 0, fade: 0, tilt: 0 };
    const pointer = new THREE.Vector2(10, 10);
    const raycaster = new THREE.Raycaster();
    const onMove = (e) => {
      const r = canvasWrap.current.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    window.addEventListener("pointermove", onMove);

    let smoothRot = 0;
    stage.loop((t) => {
      smoothRot += (state.rot - smoothRot) * 0.08;
      ring.rotation.y = smoothRot + t * 0.03;
      ring.rotation.z = Math.sin(t * 0.2) * 0.02 + state.tilt;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(cards)[0]?.object;
      cards.forEach((m, i) => {
        const u = m.userData.uniforms;
        const s = 0.55 + state.spread * 0.45;
        m.position.x = Math.sin(m.userData.a) * R * s;
        m.position.z = Math.cos(m.userData.a) * R * s;
        m.position.y = m.userData.baseY * s + Math.sin(t * 0.6 + i) * 0.06;
        // cards facing away fade so the front of the ring stays readable
        const world = m.getWorldPosition(new THREE.Vector3());
        const facing = THREE.MathUtils.smoothstep(world.z, -R, R * 0.6);
        u.uOpacity.value = state.fade * (0.25 + facing * 0.75) * (u.uTex.value ? 1 : 0);
        u.uHover.value += ((m === hit ? 1 : 0) - u.uHover.value) * 0.1;
      });
      stage.renderer.render(scene, camera);
    });

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 1 },
        })
        .fromTo(state, { spread: 0, fade: 0 }, { spread: 1, fade: 1, duration: 0.25, ease: "power2.out" }, 0)
        .fromTo(state, { rot: 0 }, { rot: Math.PI * 1.6, duration: 1, ease: "none" }, 0)
        .fromTo(state, { tilt: 0.08 }, { tilt: -0.05, duration: 1, ease: "none" }, 0)
        .fromTo(q(".gallery-statement"), { y: 100 }, { y: -100, duration: 0.5 }, 0.25)
        .fromTo(
          q(".gallery-statement .w"),
          { opacity: 0, filter: "blur(8px)" },
          { opacity: 1, filter: "blur(0px)", stagger: 0.025, duration: 0.08 },
          0.25
        )
        .to(q(".gallery-statement .w"), { opacity: 0, stagger: 0.01, duration: 0.1 }, 0.66)
        .to(state, { fade: 0, spread: 1.25, duration: 0.15 }, 0.85);
    }, root);

    return () => {
      window.removeEventListener("pointermove", onMove);
      ctx.revert();
      stage.dispose();
    };
  }, []);

  return (
    <section className="gallery" ref={root} data-section="Gallery">
      <div className="gallery-sticky">
        <div className="gallery-canvas" ref={canvasWrap} />
        <h2 className="gallery-statement">
          <Rich text={galleryStatement} wordClass="w" />
        </h2>
      </div>
    </section>
  );
}
