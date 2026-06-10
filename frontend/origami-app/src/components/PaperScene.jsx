import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { animateFold, resetGeometry } from "../utils/foldEngine";

const PaperMesh = forwardRef(function PaperMesh(_, ref) {
  const meshRef = useRef();
  const geoRef = useRef();

  useEffect(() => {
    const geo = new THREE.PlaneGeometry(2, 2, 24, 24);
    geoRef.current = geo;
    if (meshRef.current) meshRef.current.geometry = geo;
  }, []);

  useImperativeHandle(ref, () => ({
    fold: (instruction, onComplete) => {
      if (!geoRef.current) return;
      animateFold({
        geometry: geoRef.current,
        foldAxis: instruction.foldAxis,
        foldPosition: instruction.foldPosition,
        angle: instruction.angle,
        duration: instruction.duration,
        onComplete
      });
    },
    reset: () => {
      if (!geoRef.current) return;
      resetGeometry(geoRef.current);
    }
  }));

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2, 24, 24]} />
      <meshStandardMaterial
        color="#f5f0e8"
        side={THREE.DoubleSide}
        roughness={0.6}
        metalness={0.0}
      />
    </mesh>
  );
});

export default function PaperScene({ paperRef }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      style={{ background: "#1a1a2e" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, -3, 3]} intensity={0.3} />
      <PaperMesh ref={paperRef} />
      <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
      <gridHelper args={[10, 10, "#333", "#222"]} position={[0, -1.5, 0]} />
    </Canvas>
  );
}