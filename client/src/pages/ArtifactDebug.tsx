import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, useTexture } from '@react-three/drei';

/**
 * This is a debug component to help diagnose and fix 3D model loading issues
 * Use it to test if your model loads correctly and find any rendering issues
 */

// Simple model loader that can be tested with various file formats
function ModelLoader({ url }: { url: string }) {
  try {
    const gltf = useGLTF(url);
    return <primitive object={gltf.scene} position={[0, 0, 0]} scale={1} />;
  } catch (error) {
    console.error('Error loading model:', error);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }
}

// Fallback sphere with texture when model loading fails
function FallbackSphere({ textureUrl }: { textureUrl: string }) {
  const texture = useTexture(textureUrl);
  
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function ArtifactDebug() {
  const [modelUrl, setModelUrl] = useState('/models/artifact.glb');
  const [textureUrl, setTextureUrl] = useState('/assets/artifact_1.png');
  const [useModelView, setUseModelView] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fileExtension = modelUrl.split('.').pop()?.toLowerCase();
  
  const handleModelError = (errorMessage: string) => {
    console.error('Model loading error:', errorMessage);
    setError(errorMessage);
    setUseModelView(false);
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">3D Artifact Debug</h1>
      
      <div className="mb-8 space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-lg">Model URL:</label>
          <div className="flex">
            <input 
              type="text" 
              value={modelUrl}
              onChange={(e) => setModelUrl(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <button 
              onClick={() => setUseModelView(true)}
              className="ml-2 px-4 py-2 bg-primary text-white rounded"
            >
              Load Model
            </button>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="text-lg">Texture URL (Fallback):</label>
          <div className="flex">
            <input 
              type="text" 
              value={textureUrl}
              onChange={(e) => setTextureUrl(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <button 
              onClick={() => setUseModelView(false)}
              className="ml-2 px-4 py-2 bg-secondary text-white rounded"
            >
              Use Texture
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-700">
          <p className="font-semibold">Error loading model:</p>
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}
      
      <div className="bg-black w-full h-[600px] rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Environment preset="sunset" />
          
          <OrbitControls />
          
          <Suspense fallback={null}>
            {useModelView ? (
              <ModelLoader url={modelUrl} />
            ) : (
              <FallbackSphere textureUrl={textureUrl} />
            )}
          </Suspense>
        </Canvas>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Model Debugging Info</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <span className="font-semibold">Current View:</span> {useModelView ? 'Model' : 'Texture Sphere'}
          </li>
          <li>
            <span className="font-semibold">File Extension:</span> {fileExtension || 'none'}
          </li>
          <li>
            <span className="font-semibold">Supported Formats:</span> GLB, GLTF, OBJ (with MTL), FBX
          </li>
          <li>
            <span className="font-semibold">Status:</span> {error ? 'Error' : 'Loading/Loaded'}
          </li>
        </ul>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> For best results, convert your models to GLB format using 
            a tool like Blender or an online converter. Make sure textures are properly embedded
            in the GLB file.
          </p>
        </div>
      </div>
    </div>
  );
}