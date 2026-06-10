import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { animateFold, resetGeometry } from "../utils/foldEngine";

const PaperMesh = forwardRef(function PaperMesh(_, ref) {
  const meshRef = useRef();
  const geoRef = useRef();
  const creaseRef = useRef();

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
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <planeGeometry args={[2, 2, 24, 24]} />
        <meshStandardMaterial
          color="#f8f3e8"
          side={THREE.DoubleSide}
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>
      <mesh ref={creaseRef} position={[0, 0, 0.001]}>
        <planeGeometry args={[2, 2, 24, 24]} />
        <meshStandardMaterial
          color="#e8e0d0"
          side={THREE.DoubleSide}
          roughness={1.0}
          metalness={0.0}
          transparent
          opacity={0.3}
          wireframe
        />
      </mesh>
    </group>
  );
});

export default function PaperScene({ paperRef }) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 4], fov: 45 }}
      style={{ background: "#111827" }}
      shadows
    >
      <color attach="background" args={["#111827"]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, -2, 3]} intensity={0.4} color="#b0c4ff" />
      <pointLight position={[0, 0, 3]} intensity={0.3} color="#fff8e7" />
      <PaperMesh ref={paperRef} />
      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.85}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={1} />
      </mesh>
    </Canvas>
  );
}