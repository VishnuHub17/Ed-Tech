
import React from "react";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  subLabel?: string;
  color?: string;
}

export function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  className = "",
  label,
  subLabel,
  color = "url(#gradient)"
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = (progress * circumference) / 100;
  
  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9b87f5" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
        </defs>
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e6e6e6"
          strokeWidth={strokeWidth}
        />
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - dash}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      
      {label && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{label}</span>
          {subLabel && <span className="text-sm text-gray-500">{subLabel}</span>}
        </div>
      )}
    </div>
  );
}
