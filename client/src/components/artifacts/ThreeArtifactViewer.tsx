import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Environment, PerspectiveCamera } from '@react-three/drei';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ThreeArtifactViewerProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

// Define hotspots for the artifact
interface Hotspot {
  id: string;
  position: [number, number, number];
  label: string;
}

const HOTSPOTS: Hotspot[] = [
  { id: 'center', position: [0, 0, 0.5], label: 'Central Core' },
  { id: 'top-right', position: [0.8, 0.5, 0], label: 'Energy Matrix' },
  { id: 'bottom-left', position: [-0.5, -0.5, 0.3], label: 'Ancient Inscription' },
  { id: 'crystal', position: [0.3, 0.1, -0.5], label: 'Crystal Chamber' },
];

function ArtifactModel({ isUnlocked, onHotspotClick }: ThreeArtifactViewerProps) {
  const groupRef = useRef<any>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  
  // Auto-rotate when not interacting
  useFrame((_, delta) => {
    if (groupRef.current && !hovered) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* This is a placeholder until your model loads properly */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.7} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Central orb */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial 
          color={isUnlocked ? "#c2a64b" : "#444444"} 
          emissive={isUnlocked ? "#c2a64b" : "#222222"}
          emissiveIntensity={isUnlocked ? 0.5 : 0.1}
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Crystal formations */}
      <mesh position={[0.5, 0.5, 0]}>
        <coneGeometry args={[0.2, 0.6, 6]} />
        <meshStandardMaterial 
          color="#6495ED" 
          transparent={true}
          opacity={0.8}
          metalness={0.9} 
          roughness={0.1} 
        />
      </mesh>
      
      <mesh position={[-0.5, 0.3, 0.3]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.15, 0.5, 6]} />
        <meshStandardMaterial 
          color="#9370DB" 
          transparent={true}
          opacity={0.7}
          metalness={0.9} 
          roughness={0.1} 
        />
      </mesh>
      
      {/* Only show hotspots if artifact is unlocked */}
      {isUnlocked && HOTSPOTS.map((hotspot) => (
        <group 
          key={hotspot.id}
          position={hotspot.position}
          onClick={(e) => {
            e.stopPropagation();
            onHotspotClick(hotspot.id);
          }}
          onPointerOver={() => setHovered(hotspot.id)}
          onPointerOut={() => setHovered(null)}
        >
          <mesh>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial 
              color={hovered === hotspot.id ? "#ffc857" : "#c2a64b"}
              emissive={hovered === hotspot.id ? "#ffc857" : "#c2a64b"}
              emissiveIntensity={hovered === hotspot.id ? 0.8 : 0.4}
            />
          </mesh>
          
          {hovered === hotspot.id && (
            <Html position={[0, 0.08, 0]} center>
              <div className="bg-black/80 px-2 py-1 rounded text-amber-200 text-xs whitespace-nowrap">
                {hotspot.label}
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

export default function ThreeArtifactViewer({ isUnlocked, onHotspotClick }: ThreeArtifactViewerProps) {
  const { toast } = useToast();
  
  return (
    <div className="w-full h-full relative">
      {/* Background atmospheric effect */}
      <div className="absolute inset-0 bg-black bg-opacity-95 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-gray-900/0 to-black/80"></div>
        <div className="absolute inset-0 bg-[url('/assets/sacred_geometry.svg')] opacity-5 bg-repeat"></div>
      </div>
      
      {/* 3D Viewer */}
      <div className="relative w-full h-full z-10">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 3]} />
          <ambientLight intensity={0.3} />
          <spotLight 
            position={[5, 10, 7.5]} 
            angle={0.15} 
            penumbra={1} 
            intensity={1} 
            castShadow 
          />
          <spotLight 
            position={[-5, 10, 7.5]} 
            angle={0.15} 
            penumbra={1} 
            intensity={0.5} 
            castShadow 
          />
          
          {/* Add a special glow when unlocked */}
          {isUnlocked && (
            <pointLight position={[0, 0, 3]} intensity={1.5} color="#c2a64b" />
          )}
          
          <Suspense fallback={
            <Html center>
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
                <p className="text-amber-200 text-sm">Loading artifact...</p>
              </div>
            </Html>
          }>
            <ArtifactModel isUnlocked={isUnlocked} onHotspotClick={onHotspotClick} />
            <Environment preset="night" />
          </Suspense>
          
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.5}
            dampingFactor={0.05}
            rotateSpeed={0.5}
          />
        </Canvas>
      </div>
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-amber-200/80 px-4 py-2 rounded-full text-sm z-20">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}