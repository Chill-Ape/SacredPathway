import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';

// Path to model is imported as a URL via Vite's import.meta.url handling
const MODEL_PATH = '/burger_model.glb';

function Model({ path }: { path: string }) {
  // Use drei's GLTF loader for easier handling
  const { scene } = useGLTF(path);
  const modelRef = useRef<THREE.Group>(null);
  
  // Add slow rotation to the model
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.002;
    }
  });
  
  return (
    <group ref={modelRef}>
      <primitive 
        object={scene} 
        scale={0.5} 
        position={[0, 0, 0]} 
      />
    </group>
  );
}

// Camera setup component to ensure proper positioning
function CameraSetup() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 1, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return null;
}

export default function ImportModelViewer() {
  return (
    <div className="w-full h-[600px] bg-black/90 rounded-lg overflow-hidden relative">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full w-full bg-black/90">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <p className="ml-2 text-blue-300">Loading 3D artifact...</p>
        </div>
      }>
        <Canvas>
          <CameraSetup />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Model path={MODEL_PATH} />
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={10}
            autoRotate={false}
          />
          <Environment preset="warehouse" />
        </Canvas>
      </Suspense>
      
      <div className="absolute bottom-4 left-4 right-4 px-4 py-3 bg-slate-900/70 backdrop-blur-sm text-slate-100 rounded-md">
        <h3 className="text-lg font-semibold text-blue-400">Ancient Artifact</h3>
        <p className="text-sm text-slate-300">
          Interact with this artifact by clicking and dragging to rotate. Use scroll to zoom in/out.
        </p>
      </div>
    </div>
  );
}