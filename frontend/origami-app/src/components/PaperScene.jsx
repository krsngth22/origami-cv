import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { createGeometryWithRegions, animateFold, goToStep, resetGeometry } from "../utils/foldEngine";

const PaperMesh = forwardRef(function PaperMesh({ color = "#e63946" }, ref) {
  const frontRef = useRef();
  const backRef = useRef();
  const geoRef = useRef();
  const geoBackRef = useRef();

  useEffect(() => {
    const geo = createGeometryWithRegions();
    const geoBack = createGeometryWithRegions();
    geoRef.current = geo;
    geoBackRef.current = geoBack;
    if (frontRef.current) frontRef.current.geometry = geo;
    if (backRef.current) backRef.current.geometry = geoBack;
  }, []);

  useImperativeHandle(ref, () => ({
    fold: (step, onComplete) => {
      if (!geoRef.current) return;
      const fold = {
        foldAxis: step.foldAxis,
        foldPosition: step.foldPosition,
        angle: step.angle,
        movingSide: step.movingSide
      };
      animateFold({
        geometry: geoRef.current,
        fold,
        duration: step.duration || 1.2,
        onComplete: () => {
          if (geoBackRef.current) {
            animateFold({
              geometry: geoBackRef.current,
              fold,
              duration: 0.01,
              onComplete
            });
          } else {
            onComplete?.();
          }
        }
      });
    },
    goToStep: (allSteps, targetIndex, onComplete) => {
      if (!geoRef.current || !geoBackRef.current) return;
      const allFolds = allSteps.map(s => ({
        foldAxis: s.foldAxis,
        foldPosition: s.foldPosition,
        angle: s.angle,
        movingSide: s.movingSide
      }));
      goToStep({
        geometry: geoRef.current,
        allFolds,
        targetIndex,
        duration: 0.6,
        onComplete: () => {
          goToStep({
            geometry: geoBackRef.current,
            allFolds,
            targetIndex,
            duration: 0.01,
            onComplete
          });
        }
      });
    },
    reset: () => {
      if (geoRef.current) resetGeometry(geoRef.current);
      if (geoBackRef.current) resetGeometry(geoBackRef.current);
    }
  }));

  return (
    <group>
      <mesh ref={frontRef} castShadow receiveShadow>
        <planeGeometry args={[3, 3, 48, 48]} />
        <meshStandardMaterial
          color={color}
          side={THREE.FrontSide}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>
      <mesh ref={backRef} castShadow receiveShadow>
        <planeGeometry args={[3, 3, 48, 48]} />
        <meshStandardMaterial
          color="#f8f3e8"
          side={THREE.BackSide}
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
});

export default function PaperScene({ paperRef, paperColor, isAnimating }) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 5], fov: 45 }}
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
      <PaperMesh ref={paperRef} color={paperColor || "#e63946"} />
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enablePan={false}
        enableRotate={!isAnimating}
        minDistance={2}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.85}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={1} />
      </mesh>
    </Canvas>
  );
}