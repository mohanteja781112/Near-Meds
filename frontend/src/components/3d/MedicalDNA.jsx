import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DNAStrand = (props) => {
  const group = useRef();
  const animGroup = useRef();
  
  // DNA parameters
  const count = 40;
  const radius = 2;
  const height = 8;
  
  useFrame((state, delta) => {
    // Rotation animation - Rotation around Y-axis only
    if (animGroup.current) {
      // Slow continuous rotation (delta * 0.2)
      animGroup.current.rotation.y += delta * 0.2;
      
      // Subtle breathing: Scale range roughly 0.98 to 1.02
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.02;
      animGroup.current.scale.setScalar(scale);
    }
  });

  const particles = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 4; // 2 turns
    const y = (t - 0.5) * height;
    
    // Strand 1 (Cyan)
    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    
    // Strand 2 (Pink - offset by PI)
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;

    particles.push(
      <group key={i} position={[0, y, 0]}>
        {/* Node 1 */}
        <mesh position={[x1, 0, z1]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial 
            color="#06b6d4" 
            emissive="#06b6d4"
            emissiveIntensity={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        
        {/* Node 2 */}
        <mesh position={[x2, 0, z2]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial 
            color="#ec4899" 
            emissive="#ec4899"
            emissiveIntensity={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Connector (Base pair) */}
        {i % 2 === 0 && (
          <mesh position={[0, 0, 0]} rotation={[0, -angle, 0]} scale={[radius * 2, 0.05, 0.05]}>
             <cylinderGeometry args={[1, 1, 1, 8]} />
             <meshStandardMaterial color="#ffffff" opacity={0.3} transparent />
          </mesh>
        )}
      </group>
    );
  }

  return (
    <group ref={group} {...props}>
      <group ref={animGroup}>
        {particles}
      </group>
    </group>
  );
};

export default DNAStrand;
