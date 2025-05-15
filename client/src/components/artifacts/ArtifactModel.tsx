import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import artifactImage from '@/assets/artifact_1.png';

interface ArtifactModelProps {
  isUnlocked: boolean;
  autoRotate: boolean;
  onHotspotClick: (hotspotId: string) => void;
}

export default function ArtifactModel({ 
  isUnlocked, 
  autoRotate,
  onHotspotClick 
}: ArtifactModelProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Load textures
  const texture = useTexture(artifactImage);
  
  // Process texture for proper sphere mapping
  useEffect(() => {
    if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      texture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [texture]);
  
  // Animate the sphere
  useFrame((state) => {
    if (sphereRef.current && autoRotate) {
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
    
    if (glowRef.current) {
      glowRef.current.rotation.y = state.clock.getElapsedTime() * -0.05;
      glowRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
      
      if (isUnlocked) {
        // Pulse glow effect when unlocked
        const pulse = Math.sin(state.clock.getElapsedTime() * 2) * 0.1 + 0.9;
        glowRef.current.scale.set(pulse * 1.2, pulse * 1.2, pulse * 1.2);
      }
    }
  });
  
  // Define hotspots
  type Hotspot = {
    id: string;
    position: [number, number, number]; // Explicitly define as tuple
    info: string;
  };
  
  const hotspots: Hotspot[] = [
    { id: 'center', position: [0, 0, 1], info: "This appears to be an advanced computational device of unknown origin. The sphere at its center shows remarkable craftsmanship." },
    { id: 'top-right', position: [0.7, 0.7, 0.3], info: "These circular engravings contain mathematical relationships and celestial calculations beyond ancient knowledge." },
    { id: 'bottom-left', position: [-0.7, -0.7, 0.3], info: "The metal composition shows traces of materials not naturally occurring on Earth. Its creation method remains a mystery." }
  ];

  return (
    <group>
      {/* Main artifact sphere */}
      <mesh ref={sphereRef} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={texture} 
          metalness={0.9}
          roughness={0.2}
          envMapIntensity={1}
          color={isUnlocked ? "#5a5a5a" : "#3a3a3a"}
        />
      </mesh>
      
      {/* Inner glow sphere */}
      {isUnlocked && (
        <mesh ref={glowRef} scale={[1.05, 1.05, 1.05]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#3a7dd4"
            emissive="#3a7dd4"
            emissiveIntensity={0.5}
            transparent={true}
            opacity={0.15}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Hotspots - only visible when unlocked */}
      {isUnlocked && hotspots.map((hotspot) => (
        <mesh
          key={hotspot.id}
          position={[hotspot.position[0], hotspot.position[1], hotspot.position[2]]}
          onClick={() => onHotspotClick(hotspot.id)}
        >
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color="#e3a008"
            emissive="#e3a008"
            emissiveIntensity={0.8}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      ))}
      
      {/* Center glow - only visible when unlocked */}
      {isUnlocked && (
        <pointLight 
          position={[0, 0, 0]} 
          color="#3a7dd4" 
          intensity={2} 
          distance={2}
          castShadow={false}
        />
      )}
    </group>
  );
}