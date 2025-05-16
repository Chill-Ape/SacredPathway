import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Environment, 
  PerspectiveCamera,
  Html,
  ContactShadows,
  Stage,
  useProgress
} from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';

interface ModelViewerProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

// Custom loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
        <p className="text-amber-200 text-sm">
          Loading artifact... {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

// Define hotspot positions - adjust these to match your model
const HOTSPOTS = [
  { id: 'center', position: [0, 0, 0], label: 'Central Core' },
  { id: 'top-right', position: [0.5, 0.5, 0], label: 'Energy Matrix' },
  { id: 'bottom-left', position: [-0.5, -0.5, 0], label: 'Ancient Inscription' },
  { id: 'crystal', position: [0, 0.5, 0.5], label: 'Crystal Chamber' },
];

function Model({ isUnlocked, onHotspotClick }: ModelViewerProps) {
  // Load your CGTrader 3D model
  const { scene } = useGLTF('/models/3d_artifact.glb');
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  
  // Auto-rotate when not interacting
  useFrame((_, delta) => {
    if (groupRef.current && !hovered) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });
  
  // Process the loaded model to enhance visuals
  React.useEffect(() => {
    if (scene) {
      console.log("Loaded CGTrader model:", scene);
      
      // Scale adjustment if needed
      scene.scale.set(1, 1, 1);
      
      // Enhanced materials for better visuals
      scene.traverse((node: any) => {
        if (node.isMesh) {
          // Enable shadows
          node.castShadow = true;
          node.receiveShadow = true;
          
          if (node.material) {
            // Make materials more reflective/metallic
            if (node.material.metalness !== undefined) {
              node.material.metalness = 0.8;
            }
            if (node.material.roughness !== undefined) {
              node.material.roughness = 0.2;
            }
            if (node.material.envMapIntensity !== undefined) {
              node.material.envMapIntensity = 1.5;
            }
            
            // Make crystals glow when unlocked
            if (isUnlocked && 
                (node.name.toLowerCase().includes('crystal') || 
                node.name.toLowerCase().includes('gem'))) {
              node.material.emissive = new THREE.Color(0xc2a64b);
              node.material.emissiveIntensity = 0.5;
            }
          }
        }
      });
    }
  }, [scene, isUnlocked]);
  
  return (
    <group ref={groupRef}>
      {/* Your actual 3D model */}
      <primitive 
        object={scene} 
        castShadow
        receiveShadow
      />
      
      {/* Interactive hotspots when unlocked */}
      {isUnlocked && HOTSPOTS.map((hotspot) => (
        <group 
          key={hotspot.id}
          position={hotspot.position as any}
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
            <Html position={[0, 0.08, 0]} center distanceFactor={8}>
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

export default function ModelViewer({ isUnlocked, onHotspotClick }: ModelViewerProps) {
  return (
    <div className="w-full h-full">
      {/* Dark background for 3D scene - sacred vault style */}
      <div className="absolute inset-0 bg-black bg-opacity-95 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-gray-900/0 to-black/80"></div>
        <div className="absolute inset-0 bg-[url('/assets/sacred_geometry.svg')] opacity-5 bg-repeat"></div>
      </div>
      
      {/* Three.js Canvas with your CGTrader model */}
      <Canvas 
        shadows 
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ 
          antialias: true,
          outputEncoding: THREE.sRGBEncoding,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0
        }}
        className="z-10"
      >
        {/* Black background */}
        <color attach="background" args={['#000']} />
        
        {/* Main camera */}
        <PerspectiveCamera makeDefault position={[0, 0, 3]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <spotLight
          position={[-5, 5, 2]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
          shadow-bias={-0.0001}
        />
        
        {/* Special lighting when unlocked */}
        {isUnlocked && (
          <>
            <pointLight position={[0, 1, 2]} intensity={1.5} color="#c2a64b" />
            <pointLight position={[0, -1, -2]} intensity={0.8} color="#8568b9" />
          </>
        )}
        
        {/* 3D Model with loading state */}
        <Suspense fallback={<Loader />}>
          <Model isUnlocked={isUnlocked} onHotspotClick={onHotspotClick} />
          <Environment preset="sunset" />
          <ContactShadows 
            position={[0, -1, 0]} 
            opacity={0.6} 
            scale={10} 
            blur={2} 
            far={4.5} 
          />
        </Suspense>
        
        {/* Controls for rotation and zoom */}
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
      
      {/* Artifact state indicator */}
      {isUnlocked && (
        <div className="absolute top-4 right-4 bg-black/50 text-amber-200 px-3 py-1 rounded z-20 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
          <span className="text-xs">Artifact Active</span>
        </div>
      )}
    </div>
  );
}

// Preload the model to avoid flickering
useGLTF.preload('/models/3d_artifact.glb');