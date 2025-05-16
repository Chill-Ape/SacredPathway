import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { useToast } from '@/hooks/use-toast';
import * as THREE from 'three';

// Hotspot type definition
interface Hotspot {
  id: string;
  position: [number, number, number];
  info: string;
}

interface Model3DViewerProps {
  modelPath: string;
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

function Model({ modelPath, isUnlocked, onHotspotClick }: Model3DViewerProps) {
  const gltf = useGLTF(modelPath);
  const modelRef = useRef<any>(null);
  
  // Example hotspots - adjust positions based on your model
  const hotspots: Hotspot[] = [
    { id: 'center', position: [0, 0, 0], info: "Central artifact component" },
    { id: 'top', position: [0, 1, 0], info: "Upper section contains symbols" },
    { id: 'side', position: [1, 0, 0], info: "Side panel shows astronomical data" }
  ];
  
  useEffect(() => {
    if (modelRef.current) {
      // Center the model if needed
      // modelRef.current.position.set(0, 0, 0);
    }
  }, []);

  return (
    <group ref={modelRef}>
      <primitive object={gltf.scene} scale={1} />
      
      {/* Hotspots - only visible when unlocked */}
      {isUnlocked && hotspots.map((hotspot) => (
        <mesh
          key={hotspot.id}
          position={hotspot.position}
          onClick={() => onHotspotClick(hotspot.id)}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#e3a008" emissive="#e3a008" />
        </mesh>
      ))}
    </group>
  );
}

export default function Model3DViewer({ modelPath, isUnlocked, onHotspotClick }: Model3DViewerProps) {
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  
  // Track if model loading fails
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('GLTFLoader') || event.message.includes('Failed to load')) {
        setHasError(true);
        toast({
          title: "Model Load Error",
          description: "Could not load the 3D model. Using fallback view.",
          variant: "destructive"
        });
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [toast]);

  // Show error message if model fails to load
  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-black/50 rounded-lg max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">Model Loading Failed</h3>
          <p className="text-gray-300 mb-4">
            The 3D model could not be loaded. Please ensure the model is in a supported format (GLB/GLTF) 
            and properly converted for web use.
          </p>
          <div className="text-primary">
            Recommended formats: GLB or GLTF
          </div>
        </div>
      </div>
    );
  }

  return (
    <Canvas shadows className="w-full h-full">
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
      <OrbitControls 
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        autoRotate={!isUnlocked}
        autoRotateSpeed={0.5}
      />
      <Environment preset="sunset" />
      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} />
      
      {/* Load the model with error boundary */}
      <React.Suspense fallback={null}>
        <Model 
          modelPath={modelPath} 
          isUnlocked={isUnlocked} 
          onHotspotClick={onHotspotClick} 
        />
      </React.Suspense>
    </Canvas>
  );
}