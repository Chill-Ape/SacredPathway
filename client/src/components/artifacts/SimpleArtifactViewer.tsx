import { useState, useEffect, useRef } from 'react';
import artifactImage from '@/assets/artifact_1.png';

interface SimpleArtifactViewerProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
}

export default function SimpleArtifactViewer({ 
  isUnlocked, 
  onHotspotClick 
}: SimpleArtifactViewerProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Define interaction hotspots
  const hotspots: Hotspot[] = [
    { id: 'center', x: 50, y: 50, label: 'Core' },
    { id: 'top-right', x: 75, y: 25, label: 'Symbols' },
    { id: 'bottom-left', x: 25, y: 75, label: 'Elements' }
  ];
  
  // Handle mouse down for starting rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // Handle mouse move for rotation
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setRotation({
      x: rotation.x + deltaY * 0.5,
      y: rotation.y + deltaX * 0.5
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // Handle mouse up to stop rotation
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle scroll for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.003;
    setScale(Math.max(0.5, Math.min(2, scale + delta)));
  };
  
  // Auto-rotation effect when not dragging
  useEffect(() => {
    if (isDragging) return;
    
    const interval = setInterval(() => {
      setRotation(prev => ({
        ...prev,
        y: prev.y + 0.5
      }));
    }, 50);
    
    return () => clearInterval(interval);
  }, [isDragging]);
  
  // Handle global mouse up
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);
  
  return (
    <div 
      className="h-full w-full bg-black/80 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      ref={containerRef}
    >
      <div 
        className="relative h-full w-full flex items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-3/4 h-3/4 max-w-lg"
          style={{ 
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.05s ease-out',
            transformStyle: 'preserve-3d'
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Artifact image with rounded corners */}
          <div 
            className="w-full h-full rounded-full overflow-hidden cursor-move" 
            style={{ 
              backgroundImage: `url(${artifactImage})`, 
              backgroundSize: 'cover',
              boxShadow: isUnlocked 
                ? '0 0 30px 5px rgba(59, 130, 246, 0.5)' 
                : '0 0 20px rgba(0, 0, 0, 0.5)'
            }}
          />
          
          {/* Glowing effect when unlocked */}
          {isUnlocked && (
            <div 
              className="absolute inset-0 rounded-full animate-pulse"
              style={{ 
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 70%)',
                boxShadow: '0 0 15px 5px rgba(59, 130, 246, 0.3)'
              }}
            />
          )}
          
          {/* Hotspots that appear when artifact is unlocked */}
          {isUnlocked && hotspots.map(hotspot => (
            <button
              key={hotspot.id}
              className="absolute w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center
                         text-xs font-bold text-black transform -translate-x-1/2 -translate-y-1/2
                         cursor-pointer hover:bg-yellow-400 transition-colors z-10
                         animate-pulse shadow-lg"
              style={{ 
                left: `${hotspot.x}%`, 
                top: `${hotspot.y}%`,
                boxShadow: '0 0 10px 2px rgba(234, 179, 8, 0.6)'
              }}
              onClick={() => onHotspotClick(hotspot.id)}
            >
              ?
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}