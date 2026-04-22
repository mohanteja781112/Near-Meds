import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MedicalCapsule = (props) => {
  const group = useRef();
  const topHalf = useRef();
  const bottomHalf = useRef();
  const core = useRef();
  
  const animGroup = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Rotation
    if (group.current) {
      group.current.rotation.y = t * 0.2;
      group.current.rotation.z = Math.sin(t * 0.15) * 0.1;
    }

    // Horizontal Oscillation (Avoid overlap)
    // Moves between +2 and +5 relative to parent.
    // Parent is at 2.5. So range is [4.5, 7.5].
    // This ensures it never crosses into the text area (Left < 4.5).
    if (animGroup.current) {
       // Vertical Floating (Manual to prevent Z-axis zoom issues)
       animGroup.current.position.y = Math.sin(t * 1.5) * 0.1;
    }

    // Split Animation (Sine wave)
    // Opens every 4 seconds
    const split = Math.max(0, Math.sin(t * 0.8) * 1.5 - 0.5); 
    const openAmount = split * 0.8; // Max separation distance

    if (topHalf.current && bottomHalf.current) {
      topHalf.current.position.y = openAmount;
      bottomHalf.current.position.y = -openAmount;
    }

    // Core pulsing
    if (core.current) {
      const pulse = 1 + split * 0.5;
      core.current.scale.setScalar(pulse * 0.8);
      core.current.material.opacity = 0.5 + split * 0.5;
    }
  });

  const capsuleRadius = 1;
  const cylinderHeight = 1.5;

  return (
    <group ref={group} {...props}>
      <group ref={animGroup}>
        {/* TOP HALF - Matte White */}
        <group ref={topHalf}>
          {/* Hemisphere Top */}
          <mesh position={[0, cylinderHeight / 2, 0]}>
            <sphereGeometry args={[capsuleRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial 
              color="#ffffff" 
              roughness={0.3} 
              metalness={0.1}
            />
          </mesh>
          {/* Cylinder Top Body */}
          <mesh position={[0, cylinderHeight / 4, 0]}>
            <cylinderGeometry args={[capsuleRadius, capsuleRadius, cylinderHeight/2, 32, 1, true]} />
            <meshStandardMaterial 
              color="#ffffff" 
              roughness={0.3} 
              metalness={0.1}
            />
          </mesh>
        </group>

        {/* BOTTOM HALF - Glass/Cyan */}
        <group ref={bottomHalf}>
           {/* Hemisphere Bottom */}
           <mesh position={[0, -cylinderHeight / 2, 0]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[capsuleRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial 
              color="#06b6d4" // Cyan
              transparent
              transmission={0.6}
              opacity={0.5}
              roughness={0.1}
              metalness={0.1}
              thickness={0.5}
              clearcoat={1}
            />
          </mesh>
          {/* Cylinder Bottom Body */}
          <mesh position={[0, -cylinderHeight / 4, 0]}>
            <cylinderGeometry args={[capsuleRadius, capsuleRadius, cylinderHeight/2, 32, 1, true]} />
            <meshPhysicalMaterial 
              color="#06b6d4"
              transparent
              transmission={0.6}
              opacity={0.5}
              roughness={0.1}
              metalness={0.1}
              thickness={0.5}
              clearcoat={1}
            />
          </mesh>
        </group>

        {/* INNER CORE - Visible when open */}
        <mesh ref={core}>
          <sphereGeometry args={[capsuleRadius * 0.6, 32, 32]} />
          <meshStandardMaterial 
            color="#ec4899" // Pink core
            emissive="#ec4899"
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>

      </group>
    </group>
  );
};

export default MedicalCapsule;
