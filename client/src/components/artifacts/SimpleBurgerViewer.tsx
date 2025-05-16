import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// A very simple component to render a 3D burger model
export default function SimpleBurgerViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);

  useEffect(() => {
    // When the component mounts, try to load the burger model
    const loadModel = async () => {
      // Create a new loader
      const loader = new GLTFLoader();
      
      try {
        // Try to load the model
        console.log('Attempting to load burger model...');
        
        // The model path
        const modelPath = '/basic-models/burger.glb';
        
        // Load the model
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            modelPath,
            resolve,
            (xhr) => {
              console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
            },
            (error) => {
              console.error('Error loading model:', error);
              reject(error);
            }
          );
        });
        
        console.log('Model loaded successfully!', gltf);
        setModel(gltf.scene);
        setModelLoaded(true);
      } catch (error) {
        console.error('Failed to load burger model:', error);
        setModelError('Could not load the 3D burger model');
      }
    };
    
    loadModel();
  }, []);
  
  // Define a simple scene 
  const Scene = () => {
    return (
      <>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Display the loaded model if available */}
        {model && (
          <primitive 
            object={model}
            position={[0, 0, 0]}
            scale={2}
          />
        )}
        
        {/* Fallback cube if model isn't loaded */}
        {!model && !modelError && (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ff4500" />
          </mesh>
        )}
        
        {/* Controls */}
        <OrbitControls />
      </>
    );
  };
  
  return (
    <div className="relative w-full h-[500px] bg-gray-900 rounded-lg">
      {/* Loading indicator */}
      {!modelLoaded && !modelError && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/80 rounded-lg p-4 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-white">Loading burger model...</p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {modelError && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/80 rounded-lg p-4 text-center max-w-md">
            <div className="text-red-500 text-xl mb-2">Error</div>
            <p className="text-white">{modelError}</p>
          </div>
        </div>
      )}
      
      {/* The 3D canvas */}
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Scene />
      </Canvas>
    </div>
  );
}