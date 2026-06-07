import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

function PaperMesh({ step, isAnimating, onAnimationComplete }) {
  const meshRef = useRef();
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    const geo = new THREE.PlaneGeometry(2, 2, 10, 10);
    setGeometry(geo);
  }, []);

  useEffect(() => {
    if (!meshRef.current || !isAnimating || !step) return;

    const mesh = meshRef.current;
    const foldType = step.fold_type;

    if (foldType === "valley-fold") {
      gsap.to(mesh.rotation, {
        x: mesh.rotation.x + Math.PI / 6,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: onAnimationComplete,
      });
    } else if (foldType === "mountain-fold") {
      gsap.to(mesh.rotation, {
        x: mesh.rotation.x - Math.PI / 6,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: onAnimationComplete,
      });
    } else {
      gsap.to(mesh.rotation, {
        y: mesh.rotation.y + Math.PI / 8,
        duration: 1.0,
        ease: "power2.inOut",
        onComplete: onAnimationComplete,
      });
    }
  }, [step, isAnimating, onAnimationComplete]);

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#f0f0e8"
        side={THREE.DoubleSide}
        roughness={0.8}
        metalness={0.0}
      />
    </mesh>
  );
}

export default function PaperScene({ currentStep, isAnimating, onAnimationComplete }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      style={{ background: "#1a1a2e" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <PaperMesh
        step={currentStep}
        isAnimating={isAnimating}
        onAnimationComplete={onAnimationComplete}
      />
      <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
      <gridHelper args={[10, 10, "#333", "#222"]} position={[0, -1.5, 0]} />
    </Canvas>
  );
}
