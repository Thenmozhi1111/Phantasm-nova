// import { Canvas, useFrame } from '@react-three/fiber'
// import { Float, Stars, TorusKnot, MeshDistortMaterial, Sparkles } from '@react-three/drei'
// import { useRef } from 'react'
// import * as THREE from 'three'

// function EnergyCore() {
//   const group = useRef(null)
//   const inner = useRef(null)

//   useFrame((state, delta) => {
//     if (!group.current) return
//     group.current.rotation.x += delta * 0.12
//     group.current.rotation.y += delta * 0.28
//     group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, state.pointer.x * 0.45, 0.035)
//     group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, state.pointer.y * 0.28, 0.035)
//     if (inner.current) inner.current.rotation.z -= delta * 0.45
//   })

//   return (
//     <group ref={group} scale={0.95}>
//       <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.8}>
//         <TorusKnot args={[1.22, 0.055, 160, 20, 2, 3]}>
//           <meshStandardMaterial color="#4ac5ff" emissive="#0077ff" emissiveIntensity={5} metalness={0.9} roughness={0.12} transparent opacity={0.72} />
//         </TorusKnot>
//         <mesh ref={inner} rotation={[Math.PI / 2, 0, 0]}>
//           <icosahedronGeometry args={[0.78, 3]} />
//           <MeshDistortMaterial color="#0078ff" emissive="#005cff" emissiveIntensity={2.8} transparent opacity={0.16} wireframe speed={2} distort={0.22} />
//         </mesh>
//         <mesh>
//           <sphereGeometry args={[0.5, 32, 32]} />
//           <meshBasicMaterial color="#35baff" transparent opacity={0.1} />
//         </mesh>
//       </Float>
//     </group>
//   )
// }

// function HoloRing({ radius, rotation, speed }) {
//   const ref = useRef(null)
//   useFrame((_, delta) => {
//     if (ref.current) ref.current.rotation.z += delta * speed
//   })
//   return (
//     <mesh ref={ref} rotation={rotation}>
//       <torusGeometry args={[radius, 0.012, 12, 96]} />
//       <meshBasicMaterial color="#1aa7ff" transparent opacity={0.32} />
//     </mesh>
//   )
// }

// export default function Scene() {
//   return (
//     <div className="pointer-events-none absolute inset-0 z-0 opacity-90" aria-hidden="true">
//       <Canvas camera={{ position: [0, 0, 7], fov: 46 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
//         <ambientLight intensity={0.14} />
//         <pointLight position={[3, 2, 4]} intensity={18} color="#188dff" />
//         <pointLight position={[-4, -2, 3]} intensity={10} color="#00c6ff" />
//         <EnergyCore />
//         <HoloRing radius={2.05} rotation={[1.15, 0.2, 0]} speed={0.22} />
//         <HoloRing radius={2.55} rotation={[0.35, 0.8, 0]} speed={-0.16} />
//         <Sparkles count={110} scale={[7, 5, 5]} size={1.6} speed={0.22} color="#55c7ff" opacity={0.55} />
//         <Stars radius={13} depth={9} count={1000} factor={1.8} saturation={0} fade speed={0.5} />
//       </Canvas>
//     </div>
//   )
// }
