"use client";

import { useMemo, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
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
// Shaders
// ---------------------------------------------------------------------------
const vertexShader = `
  uniform vec3 uMouse; // In world space
  uniform float uRadius;
  uniform float uRadiusSq;
  uniform float uRepulsionStrength;
  uniform float uSize;
  uniform float uMouseActive;

  void main() {
    // 1. Transform local position to world space
    vec4 worldPos = modelMatrix * vec4(position, 1.0);

    // 2. Transform world coordinates to eye space (view space)
    vec4 mvPosition = viewMatrix * worldPos;
    vec4 mvMouse = viewMatrix * vec4(uMouse, 1.0);

    if (uMouseActive > 0.5) {
      // 3. Project eye position onto the plane at z = mvMouse.z (which is negative)
      // In eye space, the camera is at (0,0,0) looking down -Z.
      if (mvPosition.z < -0.0001 && mvMouse.z < -0.0001) {
        float t = mvMouse.z / mvPosition.z;
        vec2 projPos = mvPosition.xy * t;

        // 4. Compute distance in projected space (matches screen/pointer space perfectly)
        float dx = projPos.x - mvMouse.x;
        float dy = projPos.y - mvMouse.y;
        float distSq2D = dx * dx + dy * dy;

        if (distSq2D < uRadiusSq && distSq2D > 0.0001) {
          float dist2D = sqrt(distSq2D);
          float force = ((uRadius - dist2D) / uRadius) * uRepulsionStrength;
          
          // 5. Scale repulsion force by depth factor t so on-screen movement is visually consistent
          float worldForce = force / t;

          // Displace position away from mouse in eye space
          mvPosition.x += (dx / dist2D) * worldForce;
          mvPosition.y += (dy / dist2D) * worldForce;
          
          // Pop Z toward camera in eye space (making it less negative / closer to 0)
          mvPosition.z += force * 0.6;
        }
      }
    }

    // 6. Project eye-space position to clip space
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation (simulates perspective scaling)
    gl_PointSize = uSize * (300.0 / -mvPosition.z);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform sampler2D uTexture;

  void main() {
    // Render glow sprite
    vec4 texColor = texture2D(uTexture, gl_PointCoord);
    gl_FragColor = vec4(uColor, 1.0) * texColor * uOpacity;
  }
`;

// ---------------------------------------------------------------------------
// Cloud component
// ---------------------------------------------------------------------------
function LidarCloud({ scrollProgress, isInView }: { scrollProgress: any; isInView: boolean }) {
  const { camera, raycaster } = useThree();

  const groupRef  = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

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

  // ---- Particle positions (static, uploaded to GPU once) ------------------
  const originalPositions = useMemo(() => {
    const orig = new Float32Array(particleCount * 3);

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

      orig[i3] = x;
      orig[i3 + 1] = y;
      orig[i3 + 2] = z;
    }
    return orig;
  }, [particleCount]);

  // ---- Shader uniforms (defined once, mutated in render loop) ------------
  const uniforms = useMemo(() => ({
    uMouse: { value: new THREE.Vector3() },
    uMouseActive: { value: 0.0 },
    uRadius: { value: INTERACTION_RADIUS },
    uRadiusSq: { value: INTERACTION_RADIUS_SQ },
    uRepulsionStrength: { value: REPULSION_STRENGTH },
    uSize: { value: isMobile ? 0.16 : 0.12 },
    uColor: { value: new THREE.Color("#CCFF00") },
    uOpacity: { value: 0.82 },
    uTexture: { value: particleTexture }
  }), [isMobile, particleTexture]);

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
    if (!isInView) return;

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
    _ndcPointer.set(smoothNDC.current.x, smoothNDC.current.y);
    raycaster.setFromCamera(_ndcPointer, camera);
    const hit = raycaster.ray.intersectPlane(_plane, _mouseWorld);

    // 5. Update shader uniforms directly
    const material = mesh.material as THREE.ShaderMaterial;
    if (material && material.uniforms) {
      const uniforms = material.uniforms;
      if (hit && uniforms['uMouse'] && uniforms['uMouseActive']) {
        uniforms['uMouse'].value.copy(_mouseWorld);
        uniforms['uMouseActive'].value = 1.0;
      } else if (uniforms['uMouseActive']) {
        uniforms['uMouseActive'].value = 0.0;
      }

      if (scrollProgress && uniforms['uOpacity']) {
        const p: number = scrollProgress.get();
        const opacityVal = Math.max(0, 0.82 * (1 - p * 1.5));
        uniforms['uOpacity'].value = opacityVal;
        
        // Hide mesh completely to skip expensive draw calls when scrolled out/invisible
        mesh.visible = opacityVal > 0.001;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef as any} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[originalPositions, 3]} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </points>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Stable, static WebGL and Camera configurations to avoid inline object recreation
// ---------------------------------------------------------------------------
const CAMERA_CONFIG = { position: [0, 0, 16] as [number, number, number], fov: 60 };
const GL_CONFIG = { alpha: true, antialias: false, powerPreference: "high-performance" as const };
const DPR_CONFIG: [number, number] = [1, 1.5];

// ---------------------------------------------------------------------------
// Exported wrapper
// ---------------------------------------------------------------------------
export default function LidarBackground({ scrollProgress }: { scrollProgress: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Freeze WebGL rendering loop when scrolled completely out of view
  const isInView = useInView(containerRef, { amount: 0.05 });

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="w-full h-full"
    >
      <Canvas
        camera={CAMERA_CONFIG}
        gl={GL_CONFIG}
        dpr={DPR_CONFIG}
        frameloop={isInView ? "always" : "demand"}
      >
        <LidarCloud scrollProgress={scrollProgress} isInView={isInView} />
      </Canvas>
    </motion.div>
  );
}
