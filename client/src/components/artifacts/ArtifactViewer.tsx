import { useState, useRef, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, Environment, ContactShadows, Text } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import * as THREE from 'three';
import { useInventory } from '@/hooks/use-inventory';
import { useToast } from '@/hooks/use-toast';

// Error boundary for catching React Three Fiber errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("3D Rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-black/80 text-white p-6">
          <h2 className="text-xl font-bold text-primary mb-2">3D Viewer Unavailable</h2>
          <p className="text-center mb-4">
            The artifact viewer encountered an error. Try refreshing the page or using a different browser.
          </p>
          <div className="p-6 border border-primary/30 rounded-lg bg-black/50 max-w-md">
            <p className="text-sm text-muted-foreground">
              This ancient technology requires modern computational powers to render properly.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Define the artifact model
const ArtifactModel = ({ 
  artifactId, 
  onHotspotClick, 
  isUnlocked 
}: { 
  artifactId: string;
  onHotspotClick: (id: string) => void;
  isUnlocked: boolean;
}) => {
  // For development, we'll use a simple geometry
  // In production, you would use useGLTF to load a GLTF model
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeHotspots, setActiveHotspots] = useState<string[]>([]);

  // Hotspots are clickable areas on the model
  const hotspots = [
    { id: 'center', position: [0, 0, 0], scale: 0.5, color: isUnlocked ? '#f5d393' : '#3a7dd4' },
    { id: 'top', position: [0, 1.2, 0], scale: 0.3, color: '#3a7dd4' },
    { id: 'right', position: [1.2, 0, 0], scale: 0.3, color: '#3a7dd4' },
    { id: 'left', position: [-1.2, 0, 0], scale: 0.3, color: '#3a7dd4' },
  ];

  // Animate the model
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      
      // Pulse effect for hotspots when unlocked
      if (isUnlocked) {
        const time = state.clock.getElapsedTime();
        meshRef.current.scale.x = 1 + Math.sin(time * 0.5) * 0.05;
        meshRef.current.scale.y = 1 + Math.sin(time * 0.5) * 0.05;
        meshRef.current.scale.z = 1 + Math.sin(time * 0.5) * 0.05;
      }
    }
  });

  // Temporary model for development
  // In production, load your GLTF model here
  return (
    <group>
      {/* Main artifact body */}
      <mesh 
        ref={meshRef}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color={isUnlocked ? "#f5d393" : "#3a7dd4"} 
          metalness={0.8} 
          roughness={0.2} 
          emissive={isUnlocked ? "#f5a742" : "#0a84ff"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Hotspots */}
      {hotspots.map((hotspot) => (
        <mesh
          key={hotspot.id}
          position={hotspot.position as [number, number, number]}
          scale={[hotspot.scale, hotspot.scale, hotspot.scale]}
          onClick={() => onHotspotClick(hotspot.id)}
          onPointerOver={() => setHovered(hotspot.id)}
          onPointerOut={() => setHovered(null)}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial 
            color={hotspot.id === hovered ? '#ffffff' : hotspot.color} 
            emissive={hotspot.id === hovered ? '#ffffff' : hotspot.color}
            emissiveIntensity={hotspot.id === hovered ? 1 : 0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {/* Add some floating glyphs or details around the artifact */}
      {isUnlocked && (
        <>
          <Text
            position={[0, 2, 0]}
            rotation={[0, 0, 0]}
            fontSize={0.15}
            color="#f5d393"
          >
            ANCIENT TRANSMISSION ACTIVE
          </Text>
          <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.5, 32]} />
            <meshStandardMaterial 
              color="#f5d393" 
              emissive="#f5a742"
              emissiveIntensity={1}
              side={THREE.DoubleSide}
              transparent
              opacity={0.5}
            />
          </mesh>
        </>
      )}
    </group>
  );
};

interface ArtifactViewerProps {
  artifactId: string;
  name: string;
  description: string;
  requiredItemId?: string;
  requiredItemName?: string;
}

export default function ArtifactViewer({
  artifactId,
  name,
  description,
  requiredItemId,
  requiredItemName,
}: ArtifactViewerProps) {
  const { inventory = [] } = useInventory() || { inventory: [] };
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const { toast } = useToast();

  // Check if the user has the required item
  const hasRequiredItem = requiredItemId && inventory && inventory.length > 0
    ? inventory.some((item: any) => item.id === parseInt(requiredItemId))
    : false;

  const handleHotspotClick = (hotspotId: string) => {
    if (hotspotId === 'center') {
      if (requiredItemId && !isUnlocked) {
        setShowUnlockPrompt(true);
      } else {
        // Already unlocked or doesn't require an item
        toast({
          title: "Artifact Activated",
          description: "The artifact pulses with ancient energy.",
        });
      }
    } else {
      // Other hotspots
      toast({
        title: "Interesting Detail",
        description: `You've discovered a ${hotspotId} section of the artifact.`,
      });
    }
  };

  const unlockArtifact = () => {
    if (hasRequiredItem) {
      setIsUnlocked(true);
      setShowUnlockPrompt(false);
      toast({
        title: "Artifact Unlocked!",
        description: `Your ${requiredItemName} has activated the artifact!`,
      });
    } else {
      toast({
        title: "Unlock Failed",
        description: `The artifact does not recognize your energy. A ${requiredItemName} is required.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative w-full h-[80vh] bg-black/90">
      {/* 3D Canvas - Temporarily use a placeholder for debugging */}
      <div className="flex flex-col items-center justify-center h-full bg-black/80 text-white p-6">
        <h2 className="text-2xl font-bold text-primary mb-4">{name}</h2>
        <div className="w-64 h-64 bg-black/40 border border-primary/30 rounded-full mb-8 flex items-center justify-center">
          <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 bg-primary/40 rounded-full"></div>
          </div>
        </div>
        <div className="p-4 border border-primary/30 rounded-lg bg-black/50 max-w-md mb-4">
          <p className="text-center text-sm text-white">{description}</p>
        </div>
        <button 
          onClick={() => setShowUnlockPrompt(true)}
          className="px-4 py-2 bg-primary/80 text-primary-foreground rounded-md hover:bg-primary/90 transition"
        >
          Attempt to Unlock
        </button>
      </div>
      
      {/* Artifact Info */}
      <div className="absolute top-4 left-4 p-4 rounded-lg bg-black/60 text-white max-w-md">
        <h2 className="text-xl font-semibold text-primary">{name}</h2>
        <p className="text-sm mt-2">{description}</p>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 p-3 rounded-lg bg-black/60 text-white text-xs">
        <p>• Click and drag to rotate</p>
        <p>• Scroll to zoom in/out</p>
        <p>• Click on glowing points to interact</p>
      </div>
      
      {/* Unlock Prompt */}
      {showUnlockPrompt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-background border border-primary p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-2">Unlock Artifact</h3>
            <p className="mb-4">
              This artifact requires a <span className="text-primary font-semibold">{requiredItemName}</span> to activate. 
              {hasRequiredItem ? " You have this item in your inventory." : " You do not have this item."}
            </p>
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                onClick={() => setShowUnlockPrompt(false)}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${hasRequiredItem 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80' 
                  : 'bg-primary/50 text-primary-foreground cursor-not-allowed'}`}
                onClick={unlockArtifact}
                disabled={!hasRequiredItem}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}