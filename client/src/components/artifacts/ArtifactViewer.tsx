import { useState } from 'react';
import { useInventory } from '@/hooks/use-inventory';
import { useToast } from '@/hooks/use-toast';
import FinalArtifactViewer from './FinalArtifactViewer';

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
  requiredItemName = 'Crystal',
}: ArtifactViewerProps) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState<boolean>(false);
  const { items: inventory = [] } = useInventory();
  const { toast } = useToast();
  
  // For demonstration purposes, we'll ignore inventory requirements
  const hasRequiredItem = true; // Always allow interaction
  
  // Handle hotspot clicks - this would provide information about specific parts of the artifact
  const handleHotspotClick = (hotspotId: string) => {
    let hotspotInfo = "";
    
    // This would be expanded with actual hotspot data
    switch(hotspotId) {
      case 'center':
        hotspotInfo = "This appears to be an advanced computational device of unknown origin. The sphere at its center shows remarkable craftsmanship.";
        break;
      case 'top-right':
        hotspotInfo = "These circular engravings contain mathematical relationships and celestial calculations beyond ancient knowledge.";
        break;
      case 'bottom-left':
        hotspotInfo = "The metal composition shows traces of materials not naturally occurring on Earth. Its creation method remains a mystery.";
        break;
      case 'crystal':
        hotspotInfo = "A crystalline formation that appears to channel energy. It resonates at a frequency that affects human consciousness.";
        break;
      default:
        hotspotInfo = "This section contains unknown symbols.";
    }
    
    toast({
      title: "Artifact Detail",
      description: hotspotInfo,
    });
  };
  
  // Handle unlock
  const unlockArtifact = () => {
    // Always allow unlock for immediate access
    setIsUnlocked(true);
    setShowUnlockPrompt(false);
    toast({
      title: "Artifact Activated!",
      description: "The artifact resonates with your presence and reveals its secrets!",
    });
  };

  return (
    <div className="relative w-full h-[80vh] bg-black/90">
      {/* 3D Artifact Viewer */}
      <div className="w-full h-full">
        <FinalArtifactViewer 
          isUnlocked={isUnlocked}
          onHotspotClick={handleHotspotClick}
        />
      </div>
      
      {/* Artifact Info */}
      <div className="absolute top-4 left-4 p-4 rounded-lg bg-black/60 text-white max-w-md">
        <h2 className="text-xl font-semibold text-primary">{name}</h2>
        <p className="text-sm mt-1">{description}</p>
      </div>
      
      {/* UI Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        {!isUnlocked ? (
          <button 
            onClick={unlockArtifact}
            className="px-4 py-2 bg-primary/80 text-primary-foreground rounded-md hover:bg-primary/90 transition"
          >
            Activate Artifact
          </button>
        ) : (
          <button 
            onClick={() => setIsUnlocked(false)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition"
          >
            Reset Artifact
          </button>
        )}
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 p-2 bg-black/60 text-white/70 text-xs rounded">
        <p>Drag to rotate • Scroll to zoom</p>
        {isUnlocked && <p>Click on glowing points to explore</p>}
      </div>
      
      {/* Artifact State Display */}
      {isUnlocked && (
        <div className="absolute top-4 right-4 bg-primary/20 border border-primary/40 p-2 rounded-md">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
            <span className="text-sm text-white">Artifact Activated</span>
          </div>
        </div>
      )}
    </div>
  );
}