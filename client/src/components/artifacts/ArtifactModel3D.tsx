import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useToast } from '@/hooks/use-toast';

interface ArtifactProps {
  modelPath: string;
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

// The component that loads and renders the model
function Model({ modelPath, isUnlocked }: { modelPath: string; isUnlocked: boolean }) {
  const model = useGLTF(modelPath);
  const modelRef = useRef<any>(null);
  
  return (
    <primitive
      ref={modelRef}
      object={model.scene}
      position={[0, 0, 0]}
      scale={[1, 1, 1]}
      rotation={[0, 0, 0]}
    />
  );
}

// This marks which areas light up when activated
function Hotspots({ isUnlocked, onHotspotClick }: { isUnlocked: boolean; onHotspotClick: (id: string) => void }) {
  if (!isUnlocked) return null;
  
  return (
    <>
      <mesh 
        position={[0.5, 0.5, 0.5]} 
        onClick={() => onHotspotClick('top')}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#e3a008" 
          emissive="#e3a008" 
          emissiveIntensity={0.8} 
        />
      </mesh>

      <mesh 
        position={[-0.5, 0, 0.5]} 
        onClick={() => onHotspotClick('left')}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#e3a008" 
          emissive="#e3a008" 
          emissiveIntensity={0.8} 
        />
      </mesh>

      <mesh 
        position={[0, -0.5, 0]} 
        onClick={() => onHotspotClick('bottom')}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#e3a008" 
          emissive="#e3a008" 
          emissiveIntensity={0.8} 
        />
      </mesh>
    </>
  );
}

export default function ArtifactModel3D({ modelPath, isUnlocked, onHotspotClick }: ArtifactProps) {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Handle errors in loading the model
  const handleError = (err: Error) => {
    console.error("3D Model error:", err);
    setError(err.message);
    toast({
      title: "Failed to load 3D model",
      description: "The 3D model could not be loaded. Using fallback view.",
      variant: "destructive"
    });
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center">
        <div className="p-4 bg-black/60 rounded-md">
          <h3 className="text-lg font-semibold text-primary mb-2">Could not load 3D model</h3>
          <p className="text-sm text-white/80">Check that your model file is in a supported format and correctly uploaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Blue-ish light from below when activated */}
        {isUnlocked && (
          <pointLight 
            position={[0, -3, 0]} 
            intensity={1.5}
            color="#3a7dd4"
          />
        )}
        
        <OrbitControls 
          enablePan={false}
          minDistance={1.5}
          maxDistance={6}
          autoRotate={!isUnlocked}
          autoRotateSpeed={1}
        />
        
        <Suspense fallback={null}>
          <Model modelPath={modelPath} isUnlocked={isUnlocked} />
          <Hotspots isUnlocked={isUnlocked} onHotspotClick={onHotspotClick} />
        </Suspense>
      </Canvas>
      
      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="p-2 bg-black/60 rounded-md text-white/80 text-sm">
          {isUnlocked ? 'Click on glowing points to explore' : 'Drag to rotate • Scroll to zoom'}
        </div>
      </div>
    </div>
  );
}