"use client";

import { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function LidarCloud({ scrollProgress }: { scrollProgress: any }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  // Create a soft, glowing spherical texture for the particles
  const particleTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  const particleCount = 12000;
  
  const { originalPositions, currentPositions } = useMemo(() => {
    const orig = new Float32Array(particleCount * 3);
    const curr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        let x, y, z;
        
        const type = Math.random();
        if (type < 0.5) {
           // Base terrain
           x = (Math.random() - 0.5) * 50;
           z = (Math.random() - 0.5) * 30;
           y = Math.sin(x * 0.2) * 2 + Math.cos(z * 0.2) * 2 - 6;
        } else if (type < 0.8) {
           // Floating data rings
           const angle = Math.random() * Math.PI * 2;
           const radius = 8 + (Math.random() - 0.5) * 2;
           x = Math.cos(angle) * radius;
           z = Math.sin(angle) * radius;
           y = (Math.random() - 0.5) * 4 + 3;
        } else {
           // Ambient atmospheric noise
           x = (Math.random() - 0.5) * 50;
           y = (Math.random() - 0.5) * 30;
           z = (Math.random() - 0.5) * 30;
        }

        // Add lidar-like jitter
        x += (Math.random() - 0.5) * 0.4;
        y += (Math.random() - 0.5) * 0.4;
        z += (Math.random() - 0.5) * 0.4;
        
        orig[i * 3] = x;
        orig[i * 3 + 1] = y;
        orig[i * 3 + 2] = z;

        curr[i * 3] = x;
        curr[i * 3 + 1] = y;
        curr[i * 3 + 2] = z;
    }
    return { originalPositions: orig, currentPositions: curr };
  }, []);

  const gyroRef = useRef({ x: 0, y: 0, hasGyro: false });

  // Capture device tilt on mobile for hardware-accelerated interaction
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      
      const maxTilt = 45;
      // Gamma is left-to-right rotation in degrees (-90 to 90)
      const normalizedX = Math.max(-1, Math.min(1, event.gamma / maxTilt));
      
      // Beta is front-to-back tilt in degrees (-180 to 180). 
      // Subtract 45 to assume standard phone holding angle.
      const normalizedY = Math.max(-1, Math.min(1, (event.beta - 45) / maxTilt));
      
      gyroRef.current.x = normalizedX;
      gyroRef.current.y = -normalizedY; 
      gyroRef.current.hasGyro = true;
    };
    
    // Add event listener for Android/compatible browsers natively
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Soft interpolation target for smooth mouse/gyro transition
  const smoothPointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    // Slow cinematic rotation
    pointsRef.current.rotation.y += delta * 0.05;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;

    const geom = pointsRef.current.geometry;
    const posAttribute = geom.getAttribute('position') as THREE.BufferAttribute;
    const positions = posAttribute.array as Float32Array;
    
    // Mix static mouse with active gyro data
    const targetX = gyroRef.current.hasGyro ? gyroRef.current.x : state.pointer.x;
    const targetY = gyroRef.current.hasGyro ? gyroRef.current.y : state.pointer.y;
    
    // Lerp towards target for organic feel
    smoothPointer.current.x = THREE.MathUtils.lerp(smoothPointer.current.x, targetX, 0.15);
    smoothPointer.current.y = THREE.MathUtils.lerp(smoothPointer.current.y, targetY, 0.15);

    // Map pointer (-1 to 1) accurately to the 3D plane at Z=0
    const mouseX = smoothPointer.current.x * (state.viewport.width / 2);
    const mouseY = smoothPointer.current.y * (state.viewport.height / 2);
    
    const mouseWorld = new THREE.Vector3(mouseX, mouseY, 0);
    // Convert to local space to match rotated points
    pointsRef.current.updateMatrixWorld();
    mouseWorld.applyMatrix4(pointsRef.current.matrixWorld.clone().invert());

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        const ox = originalPositions[i3] as number;
        const oy = originalPositions[i3 + 1] as number;
        const oz = originalPositions[i3 + 2] as number;
        
        let cx = positions[i3] as number;
        let cy = positions[i3 + 1] as number;
        let cz = positions[i3 + 2] as number;
        
        // Mouse repulsion - completely accurately mapped
        const dx = cx - mouseWorld.x;
        const dy = cy - mouseWorld.y; 
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 2.0) {
            const force = (2.0 - dist) / 2.0;
            cx += (dx / dist) * force * 0.8;
            cy += (dy / dist) * force * 0.8;
            cz += force * 0.8;
        }
        
        // Spring back to original shape
        cx += (ox - cx) * 0.08;
        cy += (oy - cy) * 0.08;
        cz += (oz - cz) * 0.08;
        
        positions[i3] = cx;
        positions[i3 + 1] = cy;
        positions[i3 + 2] = cz;
    }
    
    posAttribute.needsUpdate = true;
    
    // Dynamic Opacity based on Scroll Progress (Fade out transition)
    if (materialRef.current && scrollProgress) {
        const p = scrollProgress.get();
        // Base opacity is 0.8. We fade to 0 slightly before the section ends
        materialRef.current.opacity = Math.max(0, 0.8 * (1 - p * 1.5));
    }
  });

  return (
    <points
      ref={pointsRef as any}
      frustumCulled={false}
    >
      <bufferGeometry>
         <bufferAttribute attach="attributes-position" args={[currentPositions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        transparent
        color="#CCFF00"
        size={0.12} // Increased size slightly to account for the soft feathering of the texture
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.8}
        toneMapped={false}
        map={particleTexture}
        alphaTest={0.01}
      />
    </points>
  );
}

export default function LidarBackground({ scrollProgress }: { scrollProgress: any }) {
  return (
    <Canvas camera={{ position: [0, 0, 16], fov: 60 }} gl={{ alpha: true, antialias: false }}>
      <LidarCloud scrollProgress={scrollProgress} />
    </Canvas>
  );
}
