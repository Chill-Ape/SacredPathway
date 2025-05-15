import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BasicModelProps {
  isUnlocked: boolean;
  autoRotate: boolean;
  onHotspotClick: (id: string) => void;
}

export default function BasicModel({ 
  isUnlocked, 
  autoRotate,
  onHotspotClick 
}: BasicModelProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  // Animate the sphere rotation
  useFrame((state) => {
    if (sphereRef.current && autoRotate) {
      sphereRef.current.rotation.y += 0.005;
    }
  });
  
  return (
    <group>
      {/* Main sphere */}
      <mesh 
        ref={sphereRef} 
        castShadow 
        receiveShadow
        onClick={() => onHotspotClick('center')}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={isUnlocked ? "#5a5a5a" : "#3a3a3a"} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Hotspots - only visible when unlocked */}
      {isUnlocked && (
        <>
          <mesh 
            position={[1, 0, 0]} 
            onClick={() => onHotspotClick('right')}
          >
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#e3a008" emissive="#e3a008" />
          </mesh>
          
          <mesh 
            position={[-1, 0, 0]} 
            onClick={() => onHotspotClick('left')}
          >
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#e3a008" emissive="#e3a008" />
          </mesh>
          
          <mesh 
            position={[0, 1, 0]} 
            onClick={() => onHotspotClick('top')}
          >
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#e3a008" emissive="#e3a008" />
          </mesh>
        </>
      )}
      
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </group>
  );
}