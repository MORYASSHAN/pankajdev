import * as THREE from "three";

// Creates a renderer bound to a container and only renders while it is on screen.
export function createStage(container, { alpha = true, dpr = 1.75 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
  io.observe(container);

  const size = { w: 1, h: 1 };
  const listeners = new Set();
  const measure = () => {
    size.w = container.clientWidth || 1;
    size.h = container.clientHeight || 1;
    renderer.setSize(size.w, size.h);
    listeners.forEach((fn) => fn(size));
  };
  const ro = new ResizeObserver(measure);
  ro.observe(container);
  measure();

  let raf = 0;
  const loop = (fn) => {
    const clock = new THREE.Clock();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      fn(clock.getElapsedTime(), Math.min(clock.getDelta(), 0.05));
    };
    tick();
  };

  const dispose = () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    renderer.dispose();
    renderer.domElement.remove();
  };

  return { renderer, size, onResize: (fn) => listeners.add(fn), loop, dispose, isVisible: () => visible };
}

export const fullscreenVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const noiseGLSL = /* glsl */ `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
    vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
    vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
    vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
    m=m*m; m=m*m;
    vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
    m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
    vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.0*dot(m,g);
  }
  float fbm(vec2 p){ float f=0.0; float a=0.5; for(int i=0;i<5;i++){ f+=a*snoise(p); p*=2.02; a*=0.5; } return f; }
`;
