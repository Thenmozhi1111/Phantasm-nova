import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useRef } from "react";

/**
 * Lightweight 3D crystal cluster rendered with Three.js + React Three Fiber + Drei.
 * Mouse-parallax tilt, slow rotation, low polygon count for performance.
 */
function CrystalCluster() {
  const group = useRef(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.25;
    const { x, y } = state.pointer;
    group.current.rotation.x += (y * 0.3 - group.current.rotation.x) * 0.04;
    group.current.rotation.z += (x * -0.2 - group.current.rotation.z) * 0.04;
  });

  return (
    <group ref={group}>
      <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1.1}>
        {/* main shard */}
        <mesh>
          <octahedronGeometry args={[1.3, 0]} />
          <meshStandardMaterial
            color="#38bdf8"
            metalness={0.85}
            roughness={0.15}
            emissive="#0284c7"
            emissiveIntensity={0.55}
            flatShading
          />
        </mesh>
        {/* glowing core */}
        <mesh scale={0.5}>
          <octahedronGeometry args={[1.3, 0]} />
          <meshStandardMaterial color="#e0f2fe" emissive="#bae6fd" emissiveIntensity={1.8} />
        </mesh>
      </Float>
      <Float speed={2.1} rotationIntensity={0.9} floatIntensity={1.4}>
        <mesh position={[1.7, -0.4, -0.4]} rotation={[0.4, 0.8, 0.2]}>
          <octahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial
            color="#22d3ee"
            metalness={0.8}
            roughness={0.2}
            emissive="#0891b2"
            emissiveIntensity={0.7}
            flatShading
          />
        </mesh>
      </Float>
      <Float speed={1.9} rotationIntensity={0.8} floatIntensity={1.2}>
        <mesh position={[-1.7, 0.5, -0.6]} rotation={[0.9, -0.4, -0.3]}>
          <octahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial
            color="#818cf8"
            metalness={0.8}
            roughness={0.2}
            emissive="#4f46e5"
            emissiveIntensity={0.7}
            flatShading
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function PhantomScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 4, 4]} intensity={40} color="#38bdf8" />
      <pointLight position={[-4, -2, 3]} intensity={25} color="#818cf8" />
      <CrystalCluster />
      <Sparkles count={70} scale={[9, 5, 5]} size={2} speed={0.3} color="#7dd3fc" />
    </Canvas>
  );
}
