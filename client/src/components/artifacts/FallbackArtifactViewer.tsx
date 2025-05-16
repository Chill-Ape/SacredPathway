import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FallbackArtifactViewerProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

export default function FallbackArtifactViewer({ 
  isUnlocked, 
  onHotspotClick 
}: FallbackArtifactViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  // Hotspots - these will be interactive areas when unlocked
  const hotspots = [
    {
      id: 'center',
      label: 'Central Crystal Matrix',
      position: { top: '40%', left: '50%' },
    },
    {
      id: 'top-right',
      label: 'Ancient Inscription',
      position: { top: '25%', left: '70%' },
    },
    {
      id: 'bottom-left',
      label: 'Energy Source',
      position: { top: '65%', left: '30%' },
    },
    {
      id: 'crystal',
      label: 'Crystal Chamber',
      position: { top: '35%', left: '35%' },
    },
  ];

  // Handle mouse and touch interactions for rotation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationFrame);
    };
  }, [isDragging, lastPosition]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black/90 cursor-grab active:cursor-grabbing"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/assets/sacred_geometry.svg')] opacity-5 bg-repeat"></div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/40"></div>
      
      {/* 3D Representation using CSS */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Main artifact container with 3D rotation */}
        <div
          className="relative w-80 h-80"
          style={{ 
            transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Base platform */}
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-amber-900/30"
            style={{ transform: 'translateZ(-30px)' }}
          ></div>
          
          {/* Crystal formations */}
          <div 
            className={`absolute left-1/4 top-1/4 w-16 h-24 
                      ${isUnlocked ? 'animate-pulse' : ''}`}
            style={{ 
              transform: 'translate(-50%, -50%) translateZ(10px) rotateY(-30deg) rotateX(10deg)',
              clipPath: 'polygon(50% 0%, 100% 40%, 80% 90%, 20% 100%, 0% 60%)',
              background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.4), rgba(100, 149, 237, 0.2))',
              boxShadow: isUnlocked ? '0 0 15px rgba(65, 105, 225, 0.5)' : 'none',
            }}
          ></div>
          
          <div 
            className={`absolute right-1/4 top-1/4 w-16 h-28 
                      ${isUnlocked ? 'animate-pulse' : ''}`}
            style={{ 
              transform: 'translate(50%, -50%) translateZ(15px) rotateY(30deg) rotateX(15deg)',
              clipPath: 'polygon(50% 0%, 90% 30%, 100% 70%, 50% 100%, 0% 70%, 10% 30%)',
              background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.4), rgba(184, 134, 11, 0.2))',
              boxShadow: isUnlocked ? '0 0 15px rgba(218, 165, 32, 0.5)' : 'none',
            }}
          ></div>
          
          <div 
            className={`absolute left-1/2 bottom-1/4 w-20 h-24 
                      ${isUnlocked ? 'animate-pulse' : ''}`}
            style={{ 
              transform: 'translate(-50%, 50%) translateZ(20px) rotateY(-15deg) rotateX(-20deg)',
              clipPath: 'polygon(50% 0%, 80% 30%, 100% 60%, 50% 100%, 0% 60%, 20% 30%)',
              background: 'linear-gradient(135deg, rgba(153, 102, 204, 0.5), rgba(120, 81, 169, 0.3))',
              boxShadow: isUnlocked ? '0 0 20px rgba(153, 102, 204, 0.6)' : 'none',
            }}
          ></div>
          
          {/* Central crystal sphere */}
          <div
            className="absolute left-1/2 top-1/2 w-32 h-32 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ 
              transform: 'translate(-50%, -50%) translateZ(40px)',
              background: isUnlocked 
                ? 'radial-gradient(circle, rgba(194,166,75,0.7) 0%, rgba(20,20,20,0.8) 80%)' 
                : 'radial-gradient(circle, rgba(60,60,60,0.4) 0%, rgba(20,20,20,0.9) 80%)',
              boxShadow: isUnlocked 
                ? '0 0 30px rgba(194, 166, 75, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.4)' 
                : 'none',
              border: isUnlocked ? '3px solid rgba(194, 166, 75, 0.5)' : '3px solid rgba(70, 70, 70, 0.3)'
            }}
          >
            {/* Inner details */}
            <div 
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{
                background: 'url(/assets/sacred_geometry_3.svg)',
                backgroundSize: '120%',
                backgroundPosition: 'center',
                opacity: isUnlocked ? 0.7 : 0.2,
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
          
          {/* Surrounding rings */}
          <div
            className={`absolute left-1/2 top-1/2 w-48 h-48 rounded-full border ${isUnlocked ? 'border-amber-500/40' : 'border-gray-600/20'}`}
            style={{ 
              transform: `translate(-50%, -50%) translateZ(0px) rotateX(75deg) rotateY(${rotation.y / 4}deg)`,
              boxShadow: isUnlocked ? '0 0 10px rgba(194, 166, 75, 0.3)' : 'none',
            }}
          ></div>
          
          <div
            className={`absolute left-1/2 top-1/2 w-64 h-64 rounded-full border ${isUnlocked ? 'border-amber-400/30' : 'border-gray-700/20'}`}
            style={{ 
              transform: `translate(-50%, -50%) translateZ(-10px) rotateX(80deg) rotateY(${-rotation.y / 8}deg)`,
              boxShadow: isUnlocked ? '0 0 5px rgba(194, 166, 75, 0.2)' : 'none',
            }}
          ></div>
          
          {/* Interactive hotspots - only visible when unlocked */}
          {isUnlocked && hotspots.map(hotspot => (
            <div
              key={hotspot.id}
              className="absolute cursor-pointer group z-50"
              style={{ 
                top: hotspot.position.top, 
                left: hotspot.position.left, 
                transform: 'translateZ(60px) translate(-50%, -50%)',
              }}
              onClick={() => onHotspotClick(hotspot.id)}
            >
              {/* The hotspot marker */}
              <div 
                className="w-5 h-5 rounded-full bg-amber-400/80 animate-pulse group-hover:bg-amber-300"
                style={{ 
                  boxShadow: '0 0 10px rgba(194, 166, 75, 0.7)',
                }}
              ></div>
              
              {/* Label that appears on hover */}
              <div 
                className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/90 text-amber-200 text-xs px-2 py-1 rounded whitespace-nowrap z-50"
                style={{
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

      {/* Ambient particles */}
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
    </div>
  );
}