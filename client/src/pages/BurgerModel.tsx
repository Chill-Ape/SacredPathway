import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html } from '@react-three/drei';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { ChevronLeft, Loader2 } from 'lucide-react';

// Simple loading component
function LoadingScreen() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-blue-400" />
        <p className="mt-4 text-xl text-blue-300">Loading 3D Model...</p>
      </div>
    </Html>
  );
}

// A simple component that displays only the burger model
function BurgerModel() {
  const MODEL_PATH = '/burger_models/uploads_files_2465920_burger_merged.glb';
  
  // Load the model - simplified approach
  const { scene } = useGLTF(MODEL_PATH);
  
  // Log that we're attempting to load
  console.log('Attempting to load burger model from:', MODEL_PATH);
  
  // Return the model scene directly
  return (
    <primitive 
      object={scene} 
      scale={2.5}
      position={[0, 0, 0]}
    />
  );
}

// The main page component
export default function BurgerModelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 pb-16">
      <Helmet>
        <title>3D Burger Model | Interactive Viewer</title>
        <meta name="description" content="View an interactive 3D burger model with rotation and zoom capabilities" />
      </Helmet>
      
      <div className="container mx-auto px-4 pt-8">
        <Link href="/ark/artifacts">
          <a className="flex items-center text-blue-400 hover:text-blue-300 mb-6 transition">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Artifacts
          </a>
        </Link>
        
        <h1 className="text-3xl font-bold text-center text-white mb-8">Interactive 3D Burger Model</h1>
        
        <div className="max-w-5xl mx-auto mb-10">
          <div className="h-[70vh] bg-black rounded-lg overflow-hidden border border-gray-800">
            <Canvas
              camera={{ position: [0, 0, 6], fov: 45 }}
              shadows
            >
              <color attach="background" args={['#000814']} />
              
              {/* Lighting */}
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
              <pointLight position={[-5, 5, -5]} intensity={0.5} />
              
              {/* The model with loading state */}
              <Suspense fallback={<LoadingScreen />}>
                <BurgerModel />
              </Suspense>
              
              {/* Controls for user interaction */}
              <OrbitControls 
                enableZoom={true} 
                enablePan={true}
                minDistance={3}
                maxDistance={20}
              />
            </Canvas>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-800/90 rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Model Information</h2>
              <p className="text-gray-300 mb-4">
                This is a 3D model of a burger rendered directly from a GLB file. The model demonstrates real-time 3D rendering capabilities using Three.js and React Three Fiber.
              </p>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Format:</span>
                  <span className="text-gray-200">GLB (glTF Binary)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-gray-200">/burger_models/uploads_files_2465920_burger_merged.glb</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/60 rounded-lg p-6 border border-blue-900/30">
              <h3 className="text-xl font-medium text-amber-300 mb-4">Controls</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-blue-400 mt-1.5 mr-3 flex-shrink-0"></div>
                  <span><strong>Rotate:</strong> Click and drag to rotate the model</span>
                </li>
                <li className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-green-400 mt-1.5 mr-3 flex-shrink-0"></div>
                  <span><strong>Zoom:</strong> Scroll up/down to zoom in/out</span>
                </li>
                <li className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-amber-400 mt-1.5 mr-3 flex-shrink-0"></div>
                  <span><strong>Pan:</strong> Right-click and drag to move the view</span>
                </li>
                <li className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-red-400 mt-1.5 mr-3 flex-shrink-0"></div>
                  <span><strong>Reset:</strong> Double-click to reset the view</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preload the models to avoid delays
[
  '/burger_models/uploads_files_2465920_burger_merged.glb',
  '/3d_burger.glb',
  '/burger_model.glb',
  '/burger_direct.glb'
].forEach(path => {
  try {
    useGLTF.preload(path);
  } catch (e) {
    console.warn(`Couldn't preload ${path}`, e);
  }
});