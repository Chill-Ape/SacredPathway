import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

// Basic burger model component with minimal setup
function BurgerModel() {
  const MODEL_PATH = '/burger_models/uploads_files_2465920_burger_merged.glb';
  
  // Load the model
  const { scene } = useGLTF(MODEL_PATH);
  
  console.log('Attempting to load burger model from:', MODEL_PATH);
  
  return (
    <primitive 
      object={scene} 
      scale={2.5}
      position={[0, 0, 0]}
    />
  );
}

// Loading indicator
function ModelLoadingIndicator() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
        <p className="mt-2 text-blue-300">Loading burger model...</p>
      </div>
    </Html>
  );
}

// Basic Error Indicator
function ModelErrorIndicator({ message }: { message: string }) {
  return (
    <Html center>
      <div className="bg-black/80 p-4 rounded-lg text-center max-w-md">
        <h3 className="text-red-500 text-lg font-semibold mb-2">Error Loading Model</h3>
        <p className="text-white">{message}</p>
      </div>
    </Html>
  );
}

// Main component
export default function BasicBurgerViewer() {
  return (
    <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
      >
        <color attach="background" args={['#000814']} />
        
        {/* Basic lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Load the model with error handling */}
        <ErrorBoundary fallback={<ModelErrorIndicator message="Failed to load 3D model" />}>
          <Suspense fallback={<ModelLoadingIndicator />}>
            <BurgerModel />
          </Suspense>
        </ErrorBoundary>
        
        {/* Controls */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

// Error boundary for handling model loading errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Model loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Preload model
useGLTF.preload('/burger_models/uploads_files_2465920_burger_merged.glb');