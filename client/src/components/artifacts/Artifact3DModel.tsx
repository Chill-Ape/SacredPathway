import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface Artifact3DModelProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  z: number;
  label: string;
}

export default function Artifact3DModel({ isUnlocked, onHotspotClick }: Artifact3DModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 15, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Define interactive hotspots on the model
  const hotspots: Hotspot[] = [
    { id: 'hotspot-1', x: 0, y: -60, z: 50, label: 'Ancient Inscription' },
    { id: 'hotspot-2', x: 70, y: 20, z: 30, label: 'Power Source' },
    { id: 'hotspot-3', x: -60, y: 30, z: 40, label: 'Crystal Interface' },
    { id: 'hotspot-4', x: 20, y: 75, z: 20, label: 'Hidden Compartment' },
  ];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Mouse down handler to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
    setAutoRotate(false);
    
    // Capture window events to handle drag outside component
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  // Mouse move handler for rotation
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPoint.x;
    const deltaY = e.clientY - startPoint.y;
    
    setRotation(prev => ({
      x: Math.max(-40, Math.min(40, prev.x + deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));
    
    setStartPoint({ x: e.clientX, y: e.clientY });
  };
  
  // Mouse up handler to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Remove window event listeners
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    
    // Resume auto-rotation after a pause
    setTimeout(() => setAutoRotate(true), 2000);
  };
  
  // Wheel handler for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setScale(prev => Math.max(0.7, Math.min(1.5, prev + delta)));
  };
  
  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate) return;
    
    const rotationInterval = setInterval(() => {
      setRotation(prev => ({
        ...prev,
        y: prev.y + 0.3
      }));
    }, 30);
    
    return () => clearInterval(rotationInterval);
  }, [autoRotate]);
  
  // When the component is unmounted, clean up
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-amber-500 mb-4 mx-auto" />
          <p className="text-lg text-amber-100 font-serif">Materializing Ancient Artifact...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black/90 overflow-hidden"
      onWheel={handleWheel}
    >
      {/* Mystical backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-[url('/assets/sacred_geometry.svg')] opacity-5 bg-repeat"></div>
      
      {/* 3D artifact container with perspective */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        {/* Model wrapper with 3D transforms */}
        <div
          className="w-4/5 max-w-xl aspect-square cursor-move"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.05s ease-out'
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Enhanced 3D artifact using multiple elements for depth */}
          <div 
            className="w-full h-full relative"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Base structure - create a cuboid rather than a sphere */}
            <div 
              className="absolute inset-10 bg-gray-800 border border-amber-700/30"
              style={{ 
                transform: 'translateZ(-30px) rotateX(45deg) rotateY(45deg)',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)'
              }}
            ></div>
            
            {/* Secondary structure */}
            <div
              className="absolute inset-16 bg-gray-900 border border-amber-600/20 overflow-hidden"
              style={{ 
                transform: 'translateZ(-20px) rotateX(45deg) rotateY(45deg)',
                boxShadow: 'inset 0 0 15px rgba(193, 145, 30, 0.1)'
              }}
            >
              <div 
                className="absolute inset-0"
                style={{ 
                  backgroundImage: "url('/assets/sacred_geometry.svg')",
                  backgroundSize: '80%',
                  backgroundPosition: 'center',
                  opacity: 0.2
                }}
              ></div>
            </div>
            
            {/* Center pyramid */}
            <div
              className="absolute left-1/2 top-1/4 w-1/2 h-1/2 bg-gradient-to-b from-amber-700/30 to-gray-900"
              style={{ 
                transform: 'translateX(-50%) translateY(25%) translateZ(10px) rotateX(210deg)',
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                boxShadow: '0 5px 20px rgba(0, 0, 0, 0.5)'
              }}
            ></div>
            
            {/* Central orb */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: 'translateZ(15px)' }}
            >
              <div 
                className={`w-1/3 h-1/3 rounded-full bg-gradient-radial from-amber-500/30 to-gray-900 border border-amber-500/40 ${
                  isUnlocked ? 'animate-pulse' : ''
                }`}
                style={{
                  boxShadow: isUnlocked 
                    ? '0 0 25px 5px rgba(193, 145, 30, 0.3)' 
                    : '0 0 15px rgba(0, 0, 0, 0.5)'
                }}
              ></div>
            </div>
            
            {/* Orbiting ring */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ 
                transform: `translateZ(5px) rotateX(75deg) rotateY(${rotation.y / 2}deg)`,
              }}
            >
              <div 
                className={`w-3/4 h-3/4 rounded-full border-2 border-amber-700/20 ${
                  isUnlocked ? 'border-amber-500/40' : ''
                }`}
                style={{
                  boxShadow: isUnlocked 
                    ? '0 0 10px rgba(193, 145, 30, 0.2)' 
                    : 'none'
                }}
              ></div>
            </div>
            
            {/* Secondary ring */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ 
                transform: `translateZ(8px) rotateX(60deg) rotateY(${-rotation.y / 3}deg)`,
              }}
            >
              <div 
                className={`w-2/3 h-2/3 rounded-full border border-amber-600/30 ${
                  isUnlocked ? 'border-amber-400/30' : ''
                }`}
              ></div>
            </div>
            
            {/* Light effects */}
            <div
              className="absolute top-1/4 left-1/4 w-1/8 h-1/8 rounded-full bg-amber-300/50 pointer-events-none blur-sm"
              style={{ 
                transform: 'translateZ(20px)',
                filter: 'blur(5px)'
              }}
            ></div>
            
            {/* Glow effect when unlocked */}
            {isUnlocked && (
              <div 
                className="absolute inset-0 rounded-full bg-amber-500/10 mix-blend-overlay animate-pulse pointer-events-none"
                style={{ transform: 'translateZ(15px)' }}
              ></div>
            )}
          </div>
          
          {/* Interactive hotspots */}
          {isUnlocked && hotspots.map(hotspot => (
            <button
              key={hotspot.id}
              className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-black
                        transform -translate-x-1/2 -translate-y-1/2 hover:bg-amber-400 transition
                        shadow-[0_0_10px_2px_rgba(234,179,8,0.6)] group"
              style={{
                left: `calc(50% + ${hotspot.x}px)`,
                top: `calc(50% + ${hotspot.y}px)`,
                transform: `translate(-50%, -50%) translateZ(${hotspot.z}px)`,
                zIndex: hotspot.z
              }}
              onClick={(e) => {
                e.stopPropagation();
                onHotspotClick(hotspot.id);
              }}
            >
              <span className="text-xs">?</span>
              <div className="absolute opacity-0 group-hover:opacity-100 -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-amber-200 px-3 py-1 rounded text-xs whitespace-nowrap transition-opacity duration-200">
                {hotspot.label}
              </div>
              <div className="absolute w-full h-full rounded-full border-2 border-amber-500/60 animate-ping"></div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-amber-200/80 text-sm font-serif bg-black/50 px-4 py-2 rounded-full">
        {isUnlocked 
          ? "Click on the glowing points to explore the artifact" 
          : "Drag to rotate • Scroll to zoom"}
      </div>
    </div>
  );
}