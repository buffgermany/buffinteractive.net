"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from 'next-intl';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";

function Starfield() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0002;
      groupRef.current.rotation.x += 0.0001;
    }
  });
  return (
    <group ref={groupRef}>
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
      />
    </group>
  );
}

function Planet({ name, color, isLeft, progress, description }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const htmlRef = useRef<HTMLDivElement>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;

  const radius = isMobile ? 0.6 : 1.0;

  const orbitR_X = isMobile ? 0 : viewport.width / 7;
  const orbitR_Y = isMobile ? 1.05 : 0;

  // The text layout is permanently bound to the FINAL swapped position
  const isFinalLeft = !isLeft;

  useFrame(() => {
    if (!groupRef.current || !meshRef.current) return;

    meshRef.current.rotation.y += isLeft ? 0.005 : -0.005;
    meshRef.current.rotation.x += 0.002;

    const p = progress.get(); // Goes smoothly from 0 to 1
    const angle = p * Math.PI; // Exactly 180-degree swap

    if (isMobile) {
      const y = isLeft ? orbitR_Y * Math.cos(angle) : -orbitR_Y * Math.cos(angle);
      const z = isLeft ? -orbitR_Y * Math.sin(angle) : orbitR_Y * Math.sin(angle);

      groupRef.current.position.y = y;
      groupRef.current.position.z = z;
      groupRef.current.position.x = 0;
    } else {
      const x = isLeft ? -orbitR_X * Math.cos(angle) : orbitR_X * Math.cos(angle);
      const z = isLeft ? -orbitR_X * Math.sin(angle) : orbitR_X * Math.sin(angle);

      // Brings the planets into perfectly centered vertical alignment at p=1
      const parallaxY = 1.0 - p;

      groupRef.current.position.x = x;
      groupRef.current.position.y = parallaxY;
      groupRef.current.position.z = z;
    }

    // Text fades in cleanly only as they reach their final resting places (from p=0.4 to p=0.9)
    const opacity = THREE.MathUtils.clamp((p - 0.4) / 0.5, 0, 1);

    if (htmlRef.current) {
      htmlRef.current.style.opacity = opacity.toString();
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere ref={meshRef} args={[radius, 64, 64]}>
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          wireframe={false}
        />
        <mesh>
          <sphereGeometry args={[radius * 1.02, 32, 32]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.15} />
        </mesh>
      </Sphere>

      <Html
        position={isMobile ? [0, isFinalLeft ? radius : -radius, 0] : (isFinalLeft ? [-radius, 0, 0] : [radius, 0, 0])}
        center
        style={{ pointerEvents: 'none' }}
        zIndexRange={[10, 0]}
      >
        <div
          ref={htmlRef}
          style={{ opacity: 0 }}
          className={
            isMobile
              ? (isFinalLeft
                ? "absolute bottom-0 left-1/2 -translate-x-1/2 pb-4 w-64 flex flex-col items-center"
                : "absolute top-0 left-1/2 -translate-x-1/2 pt-4 w-64 flex flex-col items-center")
              : (isFinalLeft
                ? "absolute top-1/2 -translate-y-1/2 right-0 pr-8 lg:pr-12 w-56 lg:w-64 flex flex-col items-end"
                : "absolute top-1/2 -translate-y-1/2 left-0 pl-8 lg:pl-12 w-56 lg:w-64 flex flex-col items-start")
          }
        >
          <div className={`relative z-10 ${isMobile ? 'text-center' : (isFinalLeft ? 'text-right' : 'text-left')}`}>
            <h3 className="text-xl md:text-3xl font-extrabold text-white mb-1 font-heading drop-shadow-lg">{name}</h3>
            <p className="text-xs md:text-sm text-white/60 font-sans drop-shadow-md whitespace-normal leading-relaxed">{description}</p>
          </div>

          {isMobile ? (
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-[1px] h-4 ${isFinalLeft ? 'bottom-0' : 'top-0'}`}
              style={{ background: `linear-gradient(to ${isFinalLeft ? 'bottom' : 'top'}, transparent, ${color})` }}
            />
          ) : (
            <div
              className={`absolute top-1/2 -translate-y-1/2 h-[1px] w-8 lg:w-12 ${isFinalLeft ? 'right-0' : 'left-0'}`}
              style={{ background: `linear-gradient(to ${isFinalLeft ? 'right' : 'left'}, transparent, ${color})` }}
            />
          )}
        </div>
      </Html>
    </group>
  );
}

function Scene({ progress, t }: any) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-5, -5, -5]} intensity={1} color="#4444ff" />
      <Starfield />
      <Planet
        name="Buff"
        color="#ccff00"
        isLeft={true}
        progress={progress}
        description={t('ecosystem_buff_desc')}
      />
      <Planet
        name="bitfog"
        color="#00F0FF"
        isLeft={false}
        progress={progress}
        description={t('ecosystem_bitfog_desc')}
      />
    </>
  );
}

export function AboutEcosystem() {
  const t = useTranslations('About');
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Map scroll progress so it reaches 100% (1.0) exactly at the middle of the screen (0.5 scroll)
  const clampedProgress = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  // Dampen the clamped value for buttery smooth physics that stop gently
  const smoothProgress = useSpring(clampedProgress, {
    damping: 30,
    stiffness: 80,
    mass: 1.2
  });

  return (
    <section
      ref={containerRef}
      className="py-32 overflow-hidden relative min-h-[120vh] flex flex-col items-center justify-center bg-black"
    >
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <Scene progress={smoothProgress} t={t} />
        </Canvas>
      </div>

      <div className="absolute top-0 inset-x-0 h-32 lg:h-48 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 inset-x-0 h-32 lg:h-48 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />

      <div className="max-w-6xl mx-auto w-full relative z-20 pointer-events-none flex flex-col items-center justify-center lg:justify-start h-full pt-0 lg:pt-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-white font-sans text-center"
        >
          <span className="inline-block bg-black/40 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/5 shadow-2xl">
            {t('ecosystem_title')}
          </span>
        </motion.h2>
      </div>
    </section>
  );
}
