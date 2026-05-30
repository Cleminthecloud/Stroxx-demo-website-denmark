'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, ContactShadows, Sparkles } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { bagTools, toolTexture } from '@/lib/data';

/* scroll progress (0..1 over whole page) */
function useScrollRef() {
  const ref = useRef(0);
  useFrame(() => {
    ref.current = (typeof window !== 'undefined' && (window as any).__scrollProgress) || 0;
  });
  return ref;
}

/* knock the white bg out of a Carl-Ras photo on a canvas (CORS-safe via proxy) */
function useKnockoutTexture(url: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [aspect, setAspect] = useState(1.3);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!alive) return;
      try {
        const w = img.naturalWidth || 280, h = img.naturalHeight || 210;
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const id = ctx.getImageData(0, 0, w, h), d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          const mn = Math.min(r, g, b), sat = Math.max(r, g, b) - mn;
          if (mn >= 236 && sat <= 16) d[i + 3] = 0;
          else if (mn >= 222 && sat <= 24) d[i + 3] = Math.max(0, Math.round(((236 - mn) / 14) * 255));
        }
        ctx.putImageData(id, 0, 0);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
        setAspect(w / h); setTex(t);
      } catch { /* noop */ }
    };
    img.src = url;
    return () => { alive = false; };
  }, [url]);
  return { tex, aspect };
}

/* a single tool that drops into the bag when mounted */
function Tool({ url, slot }: { url: string; slot: number }) {
  const body = useRef<RapierRigidBody>(null);
  const { tex, aspect } = useKnockoutTexture(url);
  const base = 1.15;
  const w = aspect >= 1 ? base : base * aspect;
  const h = aspect >= 1 ? base / aspect : base;
  const spawn = useMemo<[number, number, number]>(() => {
    const x = ((slot * 0.7) % 1.8) - 0.9;
    const z = (((slot * 0.37) % 1.0) - 0.5) * 0.9;
    return [x, 3.4 + slot * 0.15, z];
  }, [slot]);
  const tilt = useMemo<[number, number, number]>(
    () => [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    []
  );
  useFrame(() => {
    const b = body.current;
    if (!b) return;
    const lv = b.linvel();
    const sp = Math.hypot(lv.x, lv.y, lv.z);
    if (sp > 5) b.setLinvel({ x: (lv.x / sp) * 5, y: (lv.y / sp) * 5, z: (lv.z / sp) * 5 }, true);
  });
  return (
    <RigidBody ref={body} position={spawn} rotation={tilt} colliders="cuboid"
      restitution={0.18} friction={0.95} linearDamping={0.25} angularDamping={0.5} density={1.3}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.06]} />
        {[0, 1, 2, 3].map((i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color="#0e0f12" roughness={0.6} metalness={0.4} />
        ))}
        <meshStandardMaterial attach="material-4" map={tex ?? undefined} color={tex ? '#fff' : '#15171c'}
          transparent alphaTest={tex ? 0.4 : 0} roughness={0.5} metalness={0.1} />
        <meshStandardMaterial attach="material-5" map={tex ?? undefined} color={tex ? '#fff' : '#15171c'}
          transparent alphaTest={tex ? 0.4 : 0} roughness={0.5} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
}

/* open tool-tote seen from above: dark fabric panels + blue rim + containment */
function Bag() {
  const fabric = <meshStandardMaterial color="#0c0d10" roughness={0.95} metalness={0.04} />;
  const W = 1.75, D = 1.15, H = 1.25, t = 0.07;
  return (
    <group position={[0, 0, 0]}>
      {/* floor */}
      <mesh position={[0, 0.02, 0]} receiveShadow><boxGeometry args={[W * 2, t, D * 2]} />{fabric}</mesh>
      {/* walls */}
      <mesh position={[0, H / 2, D]} receiveShadow castShadow><boxGeometry args={[W * 2, H, t]} />{fabric}</mesh>
      <mesh position={[0, H / 2, -D]} receiveShadow castShadow><boxGeometry args={[W * 2, H, t]} />{fabric}</mesh>
      <mesh position={[W, H / 2, 0]} receiveShadow castShadow><boxGeometry args={[t, H, D * 2]} />{fabric}</mesh>
      <mesh position={[-W, H / 2, 0]} receiveShadow castShadow><boxGeometry args={[t, H, D * 2]} />{fabric}</mesh>
      {/* blue STROXX rim */}
      {[[0, D], [0, -D]].map(([x, z], i) => (
        <mesh key={i} position={[x, H + 0.02, z]}>
          <boxGeometry args={[W * 2 + 0.04, 0.1, 0.12]} />
          <meshStandardMaterial color="#0082CA" emissive="#0082CA" emissiveIntensity={0.35} roughness={0.4} />
        </mesh>
      ))}
      {[[W, 0], [-W, 0]].map(([x, z], i) => (
        <mesh key={`s${i}`} position={[x, H + 0.02, z]}>
          <boxGeometry args={[0.12, 0.1, D * 2 + 0.04]} />
          <meshStandardMaterial color="#0082CA" emissive="#0082CA" emissiveIntensity={0.2} roughness={0.4} />
        </mesh>
      ))}
      {/* colliders */}
      <CuboidCollider args={[W, 0.1, D]} position={[0, 0.05, 0]} />
      <CuboidCollider args={[W, H, t]} position={[0, H / 2, D]} />
      <CuboidCollider args={[W, H, t]} position={[0, H / 2, -D]} />
      <CuboidCollider args={[t, H, D]} position={[W, H / 2, 0]} />
      <CuboidCollider args={[t, H, D]} position={[-W, H / 2, 0]} />
    </group>
  );
}

function Rig({ scroll }: { scroll: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0.3, 0), []);
  useFrame(() => {
    const p = scroll.current;
    // slow descent + gentle orbit as you scroll
    const angle = -0.25 + p * 0.5;
    const r = 4.6;
    camera.position.x += (Math.sin(angle) * r - camera.position.x) * 0.04;
    camera.position.z += (Math.cos(angle) * r + 1.2 - camera.position.z) * 0.04;
    camera.position.y += (5.2 - p * 0.8 - camera.position.y) * 0.04;
    camera.lookAt(target);
  });
  return null;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 9, 3]} intensity={2.6} color="#fff4ea" castShadow
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
      <pointLight position={[-5, 3, -2]} intensity={28} color="#1f9fe6" distance={26} />
      <pointLight position={[5, 2, 4]} intensity={12} color="#bfe3ff" distance={20} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 6, 2]} scale={[10, 5, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.2} position={[-6, 3, 0]} scale={[3, 8, 1]} color="#7fb8ff" />
        <Lightformer form="rect" intensity={1.2} position={[6, 2, -2]} scale={[3, 8, 1]} color="#d8edff" />
      </Environment>
    </>
  );
}

function SceneInner({ onFill }: { onFill?: (count: number) => void }) {
  const scroll = useScrollRef();
  const urls = useMemo(() => bagTools.map((t) => toolTexture(t.id)), []);
  const [count, setCount] = useState(0);
  // fill the bag over the first ~55% of the page scroll
  useFrame(() => {
    const target = Math.min(urls.length, Math.round(THREE.MathUtils.clamp(scroll.current / 0.55, 0, 1) * urls.length));
    if (target !== count) {
      setCount(target);
      onFill?.(target);
    }
  });
  return (
    <>
      <fog attach="fog" args={['#0b0c0e', 9, 22]} />
      <Lights />
      <Rig scroll={scroll} />
      <Physics gravity={[0, -9.2, 0]}>
        <Bag />
        {urls.slice(0, count).map((u, i) => (
          <Tool key={u} url={u} slot={i} />
        ))}
      </Physics>
      <ContactShadows position={[0, -0.02, 0]} opacity={0.7} scale={11} blur={2.4} far={5} color="#000000" />
      <Sparkles count={70} scale={[12, 6, 8]} size={2.4} speed={0.22} opacity={0.4} color="#bcd6ea" />
    </>
  );
}

export default function ToolBagScene({ onFill }: { onFill?: (count: number) => void }) {
  return (
    <div className="absolute inset-0">
      <Canvas shadows dpr={[1, 1.6]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 5.2, 5.8], fov: 40, near: 0.1, far: 60 }}>
        <Suspense fallback={null}>
          <SceneInner onFill={onFill} />
        </Suspense>
      </Canvas>
    </div>
  );
}
