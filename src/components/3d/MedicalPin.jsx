import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MedicalPin = (props) => {
  const group = useRef();
  const innerCross = useRef();
  const animGroup = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Smoothly rotate the entire pin
    if (group.current) {
      group.current.rotation.y = t * 0.4;
    }

    // Floating up and down
    if (animGroup.current) {
       animGroup.current.position.y = Math.sin(t * 1.5) * 0.15;
    }

    // Pulse the glowing inner cross
    if (innerCross.current) {
      const pulse = 1 + Math.sin(t * 3) * 0.1;
      innerCross.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={group} {...props}>
      <group ref={animGroup}>
        {/* The Map Pin Shell - Glassy/Translucent Cyan */}
        <group position={[0, 0.5, 0]}>
          {/* Top Sphere of the precise map pin */}
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshPhysicalMaterial 
              color="#0891b2" // Cyan-600 outline
              transparent
              transmission={0.8}
              opacity={0.3}
              roughness={0.1}
              metalness={0.2}
              thickness={1.5}
              clearcoat={1}
            />
          </mesh>

          {/* Bottom Cone part leading to the point */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
            {/* RadiusTop, RadiusBottom, Height, RadialSegments */}
             <cylinderGeometry args={[1.13, 0.05, 1.8, 32, 1, false]} />
             <meshPhysicalMaterial 
              color="#0891b2"
              transparent
              transmission={0.8}
              opacity={0.3}
              roughness={0.1}
              metalness={0.2}
              thickness={1.5}
              clearcoat={1}
            />
          </mesh>
        </group>

        {/* The Medical Cross Inside the Pin */}
        {/* We place it in the center of the top sphere (y = 0.5 + 1.2 = 1.7) */}
        <group ref={innerCross} position={[0, 1.7, 0]}>
          {/* Horizontal bar of the cross */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.1, 0.35, 0.35]} />
            <meshStandardMaterial 
              color="#10b981" // Emerald green glowing cross
              emissive="#10b981"
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
          {/* Vertical bar of the cross */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.35, 1.1, 0.35]} />
            <meshStandardMaterial 
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Simple Ring orbiting the pin to give it a sci-fi scanning vibe */}
        <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[1.8, 0.02, 16, 100]} />
          <meshStandardMaterial 
            color="#06b6d4" 
            emissive="#06b6d4"
            emissiveIntensity={1}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>
    </group>
  );
};

export default MedicalPin;
