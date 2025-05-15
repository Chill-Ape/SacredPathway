import { useState, useRef, useEffect } from 'react';
import { useInventory } from '@/hooks/use-inventory';
import { useToast } from '@/hooks/use-toast';
import artifactImage from '@/assets/artifact_1.png';

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
  const [unlockCode, setUnlockCode] = useState<string>('');
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showHotspot, setShowHotspot] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { inventory } = useInventory();
  const { toast } = useToast();
  
  // Check if the user has the required item in their inventory
  const hasRequiredItem = inventory.some(item => 
    requiredItemId ? item.id.toString() === requiredItemId : false
  );
  
  // Handle artifact image mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // Handle artifact image mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setRotateY((prev) => prev + deltaX * 0.5);
      setRotateX((prev) => Math.max(-30, Math.min(30, prev + deltaY * 0.5)));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  // Handle artifact image mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle zoom in/out with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => Math.max(0.5, Math.min(2.5, prev - e.deltaY * 0.001)));
  };
  
  // Simulate auto-rotation when not dragging
  useEffect(() => {
    let animationId: number;
    
    if (!isDragging) {
      let rotationSpeed = 0.2;
      
      const rotate = () => {
        setRotateY((prev) => prev + rotationSpeed);
        animationId = requestAnimationFrame(rotate);
      };
      
      animationId = requestAnimationFrame(rotate);
    }
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isDragging]);
  
  // Define hotspot locations (in percentages of container size)
  const hotspots = [
    { id: 'center', x: 50, y: 50, info: "This appears to be an advanced computational device of unknown origin. The sphere at its center shows remarkable craftsmanship." },
    { id: 'top-right', x: 70, y: 30, info: "These circular engravings contain mathematical relationships and celestial calculations beyond ancient knowledge." },
    { id: 'bottom-left', x: 30, y: 70, info: "The metal composition shows traces of materials not naturally occurring on Earth. Its creation method remains a mystery." }
  ];
  
  // Handle hotspot clicks
  const handleHotspotClick = (hotspotId: string, info: string) => {
    setShowHotspot(hotspotId === showHotspot ? null : hotspotId);
    
    toast({
      title: "Artifact Detail",
      description: info,
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
  
  // Handle unlock prompt submission
  const handleUnlockPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    unlockArtifact();
  };

  return (
    <div className="relative w-full h-[80vh] bg-black/90">
      {/* Interactive Artifact Viewer */}
      <div className="flex flex-col items-center justify-center h-full bg-black/80 text-white p-6">
        <h2 className="text-2xl font-bold text-primary mb-4">{name}</h2>
        
        {/* Artifact container with interactive controls */}
        <div 
          ref={containerRef}
          className="w-full max-w-2xl h-[400px] relative flex items-center justify-center mb-4"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div 
            className="relative"
            style={{ 
              transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >
            <img 
              src={artifactImage} 
              alt={name}
              className="w-[300px] h-[300px] object-contain select-none"
              draggable="false"
            />
            
            {/* Hotspots - visible when unlocked */}
            {isUnlocked && hotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className={`absolute w-6 h-6 rounded-full cursor-pointer
                  ${showHotspot === hotspot.id ? 'bg-primary/80' : 'bg-primary/40'} 
                  hover:bg-primary/70 border-2 border-white/30 flex items-center justify-center
                  transition-all duration-300 animate-pulse-slow`}
                style={{
                  left: `calc(${hotspot.x}% - 12px)`,
                  top: `calc(${hotspot.y}% - 12px)`,
                  zIndex: 10,
                }}
                onClick={() => handleHotspotClick(hotspot.id, hotspot.info)}
              >
                <span className="text-xs font-bold">i</span>
              </div>
            ))}
            
            {/* Active effects when unlocked */}
            {isUnlocked && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-primary/10 rounded-full mix-blend-overlay"></div>
                <div className="absolute inset-0 animate-spin-slow opacity-50">
                  <div className="w-full h-[1px] bg-primary/50 absolute top-1/2 transform -translate-y-1/2"></div>
                  <div className="h-full w-[1px] bg-primary/50 absolute left-1/2 transform -translate-x-1/2"></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Control prompts */}
          <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-white/60 bg-black/50 p-1">
            Drag to rotate • Scroll to zoom {isUnlocked ? "• Click hotspots to explore" : ""}
          </div>
        </div>
        
        {/* Description and unlock button */}
        <div className="p-4 border border-primary/30 rounded-lg bg-black/50 max-w-md mb-4">
          <p className="text-center text-sm text-white">
            {isUnlocked 
              ? "The artifact has been activated, revealing its ancient secrets. The intricate patterns suggest advanced mathematical knowledge and cosmic awareness."
              : description
            }
          </p>
        </div>
        
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
      
      {/* Artifact Info Sidebar */}
      <div className="absolute top-4 left-4 p-4 rounded-lg bg-black/60 text-white max-w-md">
        <h2 className="text-xl font-semibold text-primary">{name}</h2>
        <p className="text-sm mt-1">Origin: Unknown • Age: Estimated 12,000+ years</p>
      </div>
      
      {/* Unlock Prompt Modal - no longer needed as we're allowing direct access */}
      {showUnlockPrompt && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full border border-primary/30">
            <h3 className="text-lg font-semibold text-primary mb-4">Activate Artifact</h3>
            
            <div className="space-y-4">
              <p>This ancient device appears to be activating in your presence...</p>
              
              <div className="flex justify-between">
                <button 
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80"
                  onClick={() => setShowUnlockPrompt(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
                  onClick={unlockArtifact}
                >
                  Continue Activation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}