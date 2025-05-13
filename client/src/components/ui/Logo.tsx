import React from "react";

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

export default function Logo({ className = "", inverted = false }: LogoProps) {
  const primaryColor = inverted ? "#F7F7F7" : "#1A365D";
  
  return (
    <div className={`relative w-14 h-14 ${className}`}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Dot above */}
        <circle cx="100" cy="30" r="10" fill={primaryColor} />
        
        {/* Triangle */}
        <path 
          d="M100 55 L25 165 L175 165 Z" 
          fill="none" 
          stroke={primaryColor} 
          strokeWidth="8"
        />
        
        {/* Circle inside */}
        <circle 
          cx="100" 
          cy="110" 
          r="35" 
          fill="none" 
          stroke={primaryColor} 
          strokeWidth="8"
        />
        
        {/* Line below */}
        <line 
          x1="20" 
          y1="185" 
          x2="180" 
          y2="185" 
          stroke={primaryColor} 
          strokeWidth="8"
        />
      </svg>
    </div>
  );
}
