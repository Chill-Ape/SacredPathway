import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';

// Define the model component
function BurgerModel() {
  // Use a normal ref here
  const groupRef = useRef<THREE.Group>(null);
  
  // Try multiple paths to load the model
  const MODEL_PATHS = [
    '/burger_model.glb',
    '/3d_burger.glb', 
    '/burger_direct.glb',
    '/public/burger_model.glb'
  ];
  
  // Try to load the model from the first path and fallback to others if needed
  const { scene } = useGLTF(MODEL_PATHS[0]);
  
  console.log('Attempting to load burger model:', MODEL_PATHS[0]);
  
  // Animation - simple rotation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  // Clone and return the scene
  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        scale={2.5}
        position={[0, -1, 0]}
      />
    </group>
  );
}

// Fallback component for when model is loading
function ModelLoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
        <p className="mt-2 text-gray-300">Loading 3D model...</p>
      </div>
    </Html>
  );
}

// Main component
export default function BurgerModelViewer() {
  return (
    <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden">
      <Canvas
        shadows
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 5], fov: 50 }}
      >
        <color attach="background" args={['#000814']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense fallback={<ModelLoadingFallback />}>
          <BurgerModel />
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 8}
        />
      </Canvas>
    </div>
  );
}

// Preload all possible model paths to avoid rendering delays
[
  '/burger_model.glb',
  '/3d_burger.glb', 
  '/burger_direct.glb'
].forEach(path => useGLTF.preload(path));