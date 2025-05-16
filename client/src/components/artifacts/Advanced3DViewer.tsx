import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, SpotLight, Html, PerspectiveCamera } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import { Group } from 'three';

interface Advanced3DViewerProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

interface Hotspot {
  id: string;
  position: [number, number, number];
  label: string;
}

// Define hotspot positions on the model
const HOTSPOTS: Hotspot[] = [
  { id: 'center', position: [0, 0.2, 0], label: 'Central Core' },
  { id: 'top-right', position: [0.4, 0.3, 0.2], label: 'Energy Matrix' },
  { id: 'bottom-left', position: [-0.3, -0.1, 0.2], label: 'Ancient Inscription' },
  { id: 'crystal', position: [0.2, 0.4, -0.3], label: 'Crystal Chamber' },
];

function ArtifactModel({ isUnlocked, onHotspotClick }: Advanced3DViewerProps) {
  // Point to your 3D model file
  const { scene, nodes, materials } = useGLTF('/models/3d_artifact.glb');
  const modelRef = useRef<Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  
  // Check if the model loaded successfully
  useEffect(() => {
    console.log("Model loaded:", { scene, nodes, materials });
  }, [scene, nodes, materials]);
  
  // Auto-rotate when not interacting
  useFrame((_, delta) => {
    if (modelRef.current && !hovered) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });
  
  // Apply enhanced materials to make the model look better
  useEffect(() => {
    if (scene) {
      scene.traverse((node: any) => {
        if (node.isMesh) {
          // Enhance materials for better visuals
          if (node.material) {
            node.material.roughness = 0.2;
            node.material.metalness = 0.8;
            node.material.envMapIntensity = 1.5;
            
            // Make crystals glow when unlocked
            if (isUnlocked && node.name.toLowerCase().includes('crystal')) {
              node.material.emissive.set(isUnlocked ? '#c2a64b' : '#000000');
              node.material.emissiveIntensity = 0.4;
            }
          }
          
          // Enable shadows
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
    }
  }, [scene, isUnlocked]);
  
  return (
    <group ref={modelRef}>
      {/* The actual 3D model from CGTrader */}
      <primitive 
        object={scene} 
        scale={1.5}
        position={[0, -0.5, 0]}
        castShadow
        receiveShadow
      />
      
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
              toneMapped={false}
            />
          </mesh>
          
          {hovered === hotspot.id && (
            <Html position={[0, 0.08, 0]} center distanceFactor={10}>
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

export default function Advanced3DViewer({ isUnlocked, onHotspotClick }: Advanced3DViewerProps) {
  return (
    <div className="w-full h-full">
      {/* Background effects */}
      <div className="absolute inset-0 bg-black bg-opacity-95 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-gray-900/0 to-black/80"></div>
        <div className="absolute inset-0 bg-[url('/assets/sacred_geometry.svg')] opacity-5 bg-repeat"></div>
      </div>
      
      {/* Three.js Canvas */}
      <Canvas 
        shadows 
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="z-10"
      >
        <color attach="background" args={['#000']} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <SpotLight 
          position={[5, 10, 7.5]} 
          angle={0.3} 
          penumbra={1} 
          intensity={1} 
          castShadow 
          shadow-bias={-0.0001}
        />
        <SpotLight 
          position={[-5, 5, 5]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.5} 
          castShadow 
          shadow-bias={-0.0001}
        />
        
        {/* Add special lighting when unlocked */}
        {isUnlocked && (
          <>
            <pointLight position={[0, 1, 3]} intensity={1.5} color="#c2a64b" />
            <pointLight position={[0, -1, -2]} intensity={0.8} color="#8568b9" />
          </>
        )}
        
        {/* The 3D model with Suspense for loading state */}
        <Suspense fallback={
          <Html center>
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
              <p className="text-amber-200 text-sm">Loading artifact...</p>
            </div>
          </Html>
        }>
          <ArtifactModel isUnlocked={isUnlocked} onHotspotClick={onHotspotClick} />
          <Environment preset="warehouse" />
        </Suspense>
        
        {/* Controls for interaction */}
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.5}
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-amber-200/80 px-4 py-2 rounded-full text-sm z-20">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}

// Pre-load the model
useGLTF.preload('/models/3d_artifact.glb');