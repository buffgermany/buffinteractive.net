"use client";

import { useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PARTICLE_COUNT_DESKTOP = 10000;
const PARTICLE_COUNT_MOBILE = 5000;

const INTERACTION_RADIUS = 3.2;
const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS;
const REPULSION_STRENGTH = 1.3;
const SPRING_FACTOR = 0.07;
const SMOOTH_LERP = 0.12;
const ROT_SPEED = 0.04;

// ---------------------------------------------------------------------------
// Pre-allocated scratch objects — zero GC pressure per frame
// ---------------------------------------------------------------------------
const _plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const _mouseWorld = new THREE.Vector3();
const _ndcPointer = new THREE.Vector2();

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

// ---------------------------------------------------------------------------
// Cloud component
//
// Architecture:
//   <group ref={groupRef}>       ← cinematic rotation lives here
//     <points ref={pointsRef}>   ← ALWAYS at identity (no rotation)
//
// Because <points> has no transform of its own, its local space IS world
// space. The plane intersection (_mouseWorld) is therefore the exact cursor
// position in particle-local coordinates — always, regardless of how much
// the parent group has rotated. No worldToLocal needed, no drift.
// ---------------------------------------------------------------------------
function LidarCloud({ scrollProgress }: { scrollProgress: any }) {
  const { camera, raycaster } = useThree();

  const groupRef  = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const isMobile = useMemo(() => isMobileDevice(), []);
  const particleCount = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

  // ---- Glow sprite texture (created once) --------------------------------
  const particleTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0,    "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.75)");
    gradient.addColorStop(1,    "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // ---- Particle positions -------------------------------------------------
  const { originalPositions, currentPositions } = useMemo(() => {
    const orig = new Float32Array(particleCount * 3);
    const curr = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3   = i * 3;
      const roll = Math.random();
      let x: number, y: number, z: number;

      if (roll < 0.5) {
        // Terrain
        x = (Math.random() - 0.5) * 50;
        z = (Math.random() - 0.5) * 30;
        y = Math.sin(x * 0.2) * 2 + Math.cos(z * 0.2) * 2 - 6;
      } else if (roll < 0.8) {
        // Floating data rings
        const angle  = Math.random() * Math.PI * 2;
        const radius = 8 + (Math.random() - 0.5) * 2;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = (Math.random() - 0.5) * 4 + 3;
      } else {
        // Atmospheric scatter
        x = (Math.random() - 0.5) * 50;
        y = (Math.random() - 0.5) * 30;
        z = (Math.random() - 0.5) * 30;
      }

      x += (Math.random() - 0.5) * 0.4;
      y += (Math.random() - 0.5) * 0.4;
      z += (Math.random() - 0.5) * 0.4;

      orig[i3] = curr[i3] = x;
      orig[i3 + 1] = curr[i3 + 1] = y;
      orig[i3 + 2] = curr[i3 + 2] = z;
    }
    return { originalPositions: orig, currentPositions: curr };
  }, [particleCount]);

  // ---- Gyroscope (mobile) ------------------------------------------------
  const gyroRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      const maxTilt = 45;
      gyroRef.current.x = Math.max(-1, Math.min(1,  e.gamma / maxTilt));
      gyroRef.current.y = Math.max(-1, Math.min(1, -(e.beta - 45) / maxTilt));
      gyroRef.current.active = true;
    };

    const requestGyro = async () => {
      const DOE = DeviceOrientationEvent as any;
      if (typeof DOE.requestPermission === "function") {
        try {
          const perm = await DOE.requestPermission();
          if (perm === "granted") window.addEventListener("deviceorientation", handleOrientation);
        } catch { /* iOS denied — fall through to pointer */ }
      } else {
        window.addEventListener("deviceorientation", handleOrientation);
      }
    };

    if (isMobileDevice()) requestGyro();
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  // ---- Touch NDC tracking (mobile) ----------------------------------------
  const touchNDCRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    if (typeof window === "undefined" || !isMobileDevice()) return;

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      touchNDCRef.current.x =   (t.clientX / window.innerWidth)  * 2 - 1;
      touchNDCRef.current.y = -((t.clientY / window.innerHeight) * 2 - 1);
      touchNDCRef.current.active = true;
    };
    const onTouchEnd = () => { touchNDCRef.current.active = false; };

    window.addEventListener("touchmove",  onTouch,    { passive: true });
    window.addEventListener("touchend",   onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchmove",  onTouch);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  // ---- Smoothed NDC pointer -----------------------------------------------
  const smoothNDC = useRef({ x: 0, y: 0 });

  // ---- Render loop --------------------------------------------------------
  useFrame((state, delta) => {
    const group = groupRef.current;
    const mesh  = pointsRef.current;
    if (!group || !mesh) return;

    // 1. Cinematic rotation on the GROUP (not the points mesh)
    group.rotation.y += delta * ROT_SPEED;
    group.rotation.x  = Math.sin(state.clock.elapsedTime * 0.1) * 0.08;

    // 2. Resolve raw NDC from whichever input source is active
    let rawX: number, rawY: number;
    if (gyroRef.current.active) {
      rawX = gyroRef.current.x * 0.8 + (touchNDCRef.current.active ? touchNDCRef.current.x * 0.2 : 0);
      rawY = gyroRef.current.y * 0.8 + (touchNDCRef.current.active ? touchNDCRef.current.y * 0.2 : 0);
    } else if (touchNDCRef.current.active) {
      rawX = touchNDCRef.current.x;
      rawY = touchNDCRef.current.y;
    } else {
      rawX = state.pointer.x;
      rawY = state.pointer.y;
    }

    // 3. Smooth lerp for organic lag
    smoothNDC.current.x = THREE.MathUtils.lerp(smoothNDC.current.x, rawX, SMOOTH_LERP);
    smoothNDC.current.y = THREE.MathUtils.lerp(smoothNDC.current.y, rawY, SMOOTH_LERP);

    // 4. Unproject NDC → world-space point on the z=0 plane.
    //    Because <points> has NO rotation of its own, its local space IS
    //    world space. _mouseWorld.x / .y are directly usable as particle
    //    reference coordinates — no worldToLocal required, ever.
    _ndcPointer.set(smoothNDC.current.x, smoothNDC.current.y);
    raycaster.setFromCamera(_ndcPointer, camera);
    const hit = raycaster.ray.intersectPlane(_plane, _mouseWorld);

    const mx = _mouseWorld.x;
    const my = _mouseWorld.y;

    // 5. Per-particle physics
    const posAttr = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      const ox = originalPositions[i3]!;
      const oy = originalPositions[i3 + 1]!;
      const oz = originalPositions[i3 + 2]!;

      let cx = pos[i3]!;
      let cy = pos[i3 + 1]!;
      let cz = pos[i3 + 2]!;

      // Screen-space (XY-only) distance check.
      // Every particle at any Z depth within the cursor radius reacts.
      if (hit) {
        const dx      = cx - mx;
        const dy      = cy - my;
        const distSq2D = dx * dx + dy * dy;

        if (distSq2D < INTERACTION_RADIUS_SQ && distSq2D > 0.0001) {
          const dist2D = Math.sqrt(distSq2D);
          const force  = ((INTERACTION_RADIUS - dist2D) / INTERACTION_RADIUS) * REPULSION_STRENGTH;
          cx += (dx / dist2D) * force;
          cy += (dy / dist2D) * force;
          // Pop Z toward camera — creates a satisfying depth-parting effect
          cz += force * 0.6;
        }
      }

      // Spring back to rest
      cx += (ox - cx) * SPRING_FACTOR;
      cy += (oy - cy) * SPRING_FACTOR;
      cz += (oz - cz) * SPRING_FACTOR;

      pos[i3]     = cx;
      pos[i3 + 1] = cy;
      pos[i3 + 2] = cz;
    }

    posAttr.needsUpdate = true;

    // 6. Scroll-based fade
    if (materialRef.current && scrollProgress) {
      const p: number = scrollProgress.get();
      materialRef.current.opacity = Math.max(0, 0.82 * (1 - p * 1.5));
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef as any} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[currentPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={materialRef}
          transparent
          color="#CCFF00"
          size={isMobile ? 0.16 : 0.12}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.82}
          toneMapped={false}
          map={particleTexture}
          alphaTest={0.01}
        />
      </points>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Exported wrapper
// ---------------------------------------------------------------------------
export default function LidarBackground({ scrollProgress }: { scrollProgress: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="w-full h-full"
    >
      <Canvas
        camera={{ position: [0, 0, 16], fov: 60 }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <LidarCloud scrollProgress={scrollProgress} />
      </Canvas>
    </motion.div>
  );
}
