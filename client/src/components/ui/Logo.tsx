import React from "react";

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

export default function Logo({ className = "", inverted = false }: LogoProps) {
  const primaryColor = inverted ? "#F7F7F7" : "#1A365D";
  
  return (
    <div className={`relative w-14 h-14 ${className}`} style={{ position: "relative" }}>
      {/* Triangle */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          border: `2px solid ${primaryColor}`,
          borderTop: "none",
        }}
      />

      {/* Circle */}
      <div 
        style={{
          position: "absolute",
          top: "25%",
          left: "25%",
          width: "50%",
          height: "50%",
          border: `2px solid ${primaryColor}`,
          borderRadius: "50%",
        }}
      />

      {/* Dot above */}
      <div 
        style={{
          position: "absolute",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "12%",
          height: "12%",
          backgroundColor: primaryColor,
          borderRadius: "50%",
        }}
      />

      {/* Line below */}
      <div 
        style={{
          position: "absolute",
          bottom: "-10%",
          left: 0,
          width: "100%",
          height: "2px",
          backgroundColor: primaryColor,
        }}
      />
    </div>
  );
}
