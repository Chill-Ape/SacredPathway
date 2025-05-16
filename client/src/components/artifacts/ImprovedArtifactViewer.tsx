import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ImprovedArtifactViewerProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

// Create a proper artifact viewer that uses CSS 3D transforms
export default function ImprovedArtifactViewer({ 
  isUnlocked, 
  onHotspotClick 
}: ImprovedArtifactViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artifactRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const { toast } = useToast();

  // Hotspots - these will be interactive areas
  const hotspots = [
    {
      id: 'center',
      label: 'Central Crystal Matrix',
      position: { x: '50%', y: '40%' },
      size: 20,
    },
    {
      id: 'top-right',
      label: 'Ancient Inscription',
      position: { x: '70%', y: '25%' },
      size: 16,
    },
    {
      id: 'bottom-left',
      label: 'Dimensional Gateway',
      position: { x: '30%', y: '65%' },
      size: 16,
    },
  ];

  // Simulate loading the 3D model
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle mouse and touch interactions for rotation
  useEffect(() => {
    const artifactElement = artifactRef.current;
    if (!artifactElement) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setLastPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - lastPosition.x;
      const deltaY = e.clientY - lastPosition.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5
      }));
      
      setLastPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(prev => Math.min(Math.max(prev - e.deltaY * 0.001, 0.5), 2.5));
    };

    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setIsDragging(true);
        setLastPosition({ 
          x: e.touches[0].clientX, 
          y: e.touches[0].clientY 
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      
      const deltaX = e.touches[0].clientX - lastPosition.x;
      const deltaY = e.touches[0].clientY - lastPosition.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5
      }));
      
      setLastPosition({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    // Auto-rotation when not interacting
    let animationFrame: number;
    let lastTimestamp: number;

    const autoRotate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      
      if (!isDragging) {
        setRotation(prev => ({
          ...prev,
          y: prev.y + delta * 20
        }));
      }
      
      animationFrame = requestAnimationFrame(autoRotate);
    };
    
    animationFrame = requestAnimationFrame(autoRotate);

    // Attach event listeners
    artifactElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    artifactElement.addEventListener('wheel', handleWheel);
    artifactElement.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      artifactElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      artifactElement.removeEventListener('wheel', handleWheel);
      artifactElement.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationFrame);
    };
  }, [isDragging, lastPosition]);

  // Handle hotspot click
  const handleHotspotClick = (hotspotId: string) => {
    onHotspotClick(hotspotId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/80">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />
          <p className="text-primary-foreground">Loading artifact...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black/90"
    >
      {/* Sacred geometry background */}
      <div className="absolute inset-0 z-0 bg-[url('/assets/sacred_geometry.svg')] opacity-5 bg-repeat"></div>
      <div className="absolute inset-0 z-0 bg-gradient-radial from-transparent to-black/40"></div>
      
      {/* 3D Artifact Container */}
      <div 
        ref={artifactRef}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ 
          perspective: '1200px',
          touchAction: 'none',
        }}
      >
        {/* 3D Artifact */}
        <div
          className="relative"
          style={{ 
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${zoom}, ${zoom}, ${zoom})`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Core structure - a layered artifact with multiple elements */}
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            {/* Base platform */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ 
                transform: 'translateZ(-40px)', 
                transformStyle: 'preserve-3d' 
              }}
            >
              <div className="w-4/5 h-4/5 rounded-full bg-gray-800 border border-amber-900/30 shadow-xl"></div>
            </div>
            
            {/* Rear crystalline structure */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{ 
                transform: 'translate(-50%, -50%) translateZ(-20px) rotateY(45deg)', 
                transformStyle: 'preserve-3d' 
              }}
            >
              <div 
                className="w-24 h-36"
                style={{
                  clipPath: 'polygon(50% 0%, 80% 30%, 100% 60%, 50% 100%, 0% 60%, 20% 30%)',
                  background: 'linear-gradient(135deg, rgba(106, 90, 205, 0.3), rgba(70, 130, 180, 0.2))',
                  boxShadow: isUnlocked ? '0 0 20px rgba(147, 112, 219, 0.4)' : 'none',
                  transition: 'all 0.5s ease-in-out',
                }}
              ></div>
            </div>
            
            {/* Left crystal formation */}
            <div
              className="absolute left-1/4 top-1/2"
              style={{ 
                transform: 'translate(-50%, -50%) translateZ(10px) rotateY(-30deg)', 
                transformStyle: 'preserve-3d' 
              }}
            >
              <div 
                className="w-16 h-24"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 40%, 80% 90%, 20% 100%, 0% 60%)',
                  background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.4), rgba(100, 149, 237, 0.2))',
                  boxShadow: isUnlocked ? '0 0 15px rgba(65, 105, 225, 0.5)' : 'none',
                  transition: 'all 0.5s ease-in-out',
                }}
              ></div>
            </div>
            
            {/* Right crystal formation */}
            <div
              className="absolute left-3/4 top-1/2"
              style={{ 
                transform: 'translate(-50%, -50%) translateZ(15px) rotateY(30deg)', 
                transformStyle: 'preserve-3d' 
              }}
            >
              <div 
                className="w-16 h-28"
                style={{
                  clipPath: 'polygon(50% 0%, 90% 30%, 100% 70%, 50% 100%, 0% 70%, 10% 30%)',
                  background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.4), rgba(184, 134, 11, 0.2))',
                  boxShadow: isUnlocked ? '0 0 15px rgba(218, 165, 32, 0.5)' : 'none',
                  transition: 'all 0.5s ease-in-out',
                }}
              ></div>
            </div>
            
            {/* Central orb - main focal point */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{ 
                transform: 'translate(-50%, -50%) translateZ(30px)', 
                transformStyle: 'preserve-3d' 
              }}
            >
              <div 
                className={`w-20 h-20 rounded-full border-4 ${isUnlocked ? 'border-amber-500/60' : 'border-gray-600/40'}`}
                style={{
                  background: isUnlocked 
                    ? 'radial-gradient(circle, rgba(194,166,75,0.7) 0%, rgba(20,20,20,0.8) 80%)' 
                    : 'radial-gradient(circle, rgba(60,60,60,0.4) 0%, rgba(20,20,20,0.9) 80%)',
                  boxShadow: isUnlocked 
                    ? '0 0 30px rgba(194, 166, 75, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.4)' 
                    : 'none',
                  transition: 'all 0.5s ease-in-out',
                }}
              >
                {/* Inner details of the central orb */}
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: 'url(/assets/sacred_geometry_3.svg)',
                    backgroundSize: '120%',
                    backgroundPosition: 'center',
                    opacity: isUnlocked ? 0.7 : 0.2,
                    transition: 'opacity 0.5s ease-in-out',
                  }}
                >
                  <div 
                    className={`w-1/2 h-1/2 rounded-full ${isUnlocked ? 'animate-pulse' : ''}`}
                    style={{
                      background: isUnlocked 
                        ? 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(194,166,75,0.2) 70%)' 
                        : 'radial-gradient(circle, rgba(80,80,80,0.3) 0%, rgba(40,40,40,0.1) 70%)',
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Surrounding rings */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{ 
                transform: `translate(-50%, -50%) translateZ(5px) rotateX(75deg) rotateY(${rotation.y / 4}deg)`, 
                transformStyle: 'preserve-3d' 
              }}
            >
              <div 
                className={`w-40 h-40 rounded-full border ${isUnlocked ? 'border-amber-500/30' : 'border-gray-600/20'}`}
                style={{
                  boxShadow: isUnlocked ? '0 0 10px rgba(194, 166, 75, 0.3)' : 'none',
                  transition: 'all 0.5s ease-in-out',
                }}
              ></div>
            </div>
            
            <div
              className="absolute left-1/2 top-1/2"
              style={{ 
                transform: `translate(-50%, -50%) translateZ(10px) rotateX(60deg) rotateY(${-rotation.y / 6}deg)`, 
                transformStyle: 'preserve-3d' 
              }}
            >
              <div 
                className={`w-48 h-48 rounded-full border ${isUnlocked ? 'border-amber-400/20' : 'border-gray-700/10'}`}
                style={{
                  boxShadow: isUnlocked ? '0 0 5px rgba(194, 166, 75, 0.2)' : 'none',
                  transition: 'all 0.5s ease-in-out',
                }}
              ></div>
            </div>
            
            {/* Mysterious glyphs that appear when unlocked */}
            {isUnlocked && (
              <div
                className="absolute w-full h-full left-0 top-0"
                style={{ 
                  transform: 'translateZ(40px)', 
                  transformStyle: 'preserve-3d',
                  opacity: 0.7,
                }}
              >
                {/* Energy beams connecting different parts */}
                <div className="absolute w-px h-24 left-1/2 top-1/3 bg-gradient-to-b from-amber-400/0 via-amber-400/60 to-amber-400/0 animate-pulse"></div>
                <div className="absolute w-px h-16 left-1/3 top-1/2 rotate-45 bg-gradient-to-b from-blue-400/0 via-blue-400/50 to-blue-400/0 animate-pulse"></div>
                <div className="absolute w-px h-16 left-2/3 top-1/2 -rotate-45 bg-gradient-to-b from-purple-400/0 via-purple-400/50 to-purple-400/0 animate-pulse"></div>
              </div>
            )}
            
            {/* Interactive hotspots - only visible when unlocked */}
            {isUnlocked && hotspots.map(hotspot => (
              <div
                key={hotspot.id}
                className="absolute cursor-pointer group"
                style={{ 
                  left: hotspot.position.x, 
                  top: hotspot.position.y, 
                  transform: 'translateZ(50px) translate(-50%, -50%)',
                  zIndex: 20,
                }}
                onClick={() => handleHotspotClick(hotspot.id)}
              >
                {/* The hotspot marker */}
                <div 
                  className="rounded-full bg-amber-400/80 animate-pulse group-hover:bg-amber-300"
                  style={{ 
                    width: `${hotspot.size}px`, 
                    height: `${hotspot.size}px`,
                    boxShadow: '0 0 10px rgba(194, 166, 75, 0.7)',
                  }}
                ></div>
                
                {/* Label that appears on hover */}
                <div 
                  className="absolute opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/90 text-amber-200 text-xs px-2 py-1 rounded whitespace-nowrap"
                  style={{
                    bottom: `${hotspot.size + 5}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {hotspot.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ambient particles effect for mystical atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-300/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 5px rgba(194, 166, 75, 0.5)',
              animation: `float ${3 + Math.random() * 7}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: isUnlocked ? 0.7 : 0.3,
            }}
          ></div>
        ))}
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 text-amber-200/80 px-3 py-1 rounded-full text-xs md:text-sm z-20">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}