import { useState, useRef, useEffect } from 'react';
import artifactImage from '@/assets/artifact_1.png';

interface CSS3DModelProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

type Hotspot = {
  id: string;
  x: number;
  y: number;
  info: string;
}

export default function CSS3DModel({ isUnlocked, onHotspotClick }: CSS3DModelProps) {
  const [rotation, setRotation] = useState({ x: 15, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const modelRef = useRef<HTMLDivElement>(null);

  // Define hotspots for the artifact
  const hotspots: Hotspot[] = [
    { id: 'center', x: 50, y: 50, info: "This appears to be an advanced computational device of unknown origin. The sphere at its center shows remarkable craftsmanship." },
    { id: 'top-right', x: 70, y: 30, info: "These circular engravings contain mathematical relationships and celestial calculations beyond ancient knowledge." },
    { id: 'bottom-left', x: 30, y: 70, info: "The metal composition shows traces of materials not naturally occurring on Earth. Its creation method remains a mystery." }
  ];

  // Handle mouse down on the model
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPosition({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move for rotation
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - startPosition.x;
      const deltaY = e.clientY - startPosition.y;
      
      setRotation({
        x: rotation.x + deltaY * 0.5,
        y: rotation.y + deltaX * 0.5
      });
      
      setStartPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.5, scale + delta), 2.5);
    setScale(newScale);
  };
  
  // Set up and cleanup event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);
  
  // Auto rotation
  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    
    const animate = (time: number) => {
      if (!isDragging) {
        // Only auto-rotate if not being dragged
        const delta = (time - lastTime) / 20;
        lastTime = time;
        
        setRotation(prev => ({
          ...prev,
          y: prev.y + 0.1 * delta
        }));
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isDragging]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* The 3D scene container */}
      <div 
        className="relative w-full h-full perspective-1000 perspective-origin-center"
        style={{ perspective: '1000px', perspectiveOrigin: 'center' }}
      >
        {/* The rotating artifact */}
        <div
          ref={modelRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64
                   transition-transform duration-100 ease-out cursor-move
                   transform-style-preserve-3d"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
            transformStyle: 'preserve-3d'
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Main artifact image */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <img
              src={artifactImage}
              alt="Ancient artifact"
              className={`w-full h-full object-cover transition-all duration-300 ${
                isUnlocked ? 'brightness-110 saturate-150' : 'brightness-75 saturate-75'
              }`}
            />
          </div>
          
          {/* Glowing overlay for unlocked state */}
          {isUnlocked && (
            <div className="absolute inset-0 rounded-full bg-blue-500/10 shadow-[0_0_15px_5px_rgba(59,130,246,0.3)] animate-pulse"></div>
          )}
          
          {/* Hotspots - only visible when unlocked */}
          {isUnlocked && hotspots.map((hotspot) => (
            <button
              key={hotspot.id}
              className="absolute w-6 h-6 rounded-full bg-yellow-500/80 shadow-[0_0_8px_2px_rgba(234,179,8,0.6)] 
                       flex items-center justify-center animate-pulse z-10
                       hover:bg-yellow-400 transition-colors"
              style={{
                top: `${hotspot.y}%`,
                left: `${hotspot.x}%`,
                transform: 'translate(-50%, -50%) translateZ(10px)'
              }}
              onClick={() => onHotspotClick(hotspot.id)}
            >
              <span className="text-xs font-bold text-black">?</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}