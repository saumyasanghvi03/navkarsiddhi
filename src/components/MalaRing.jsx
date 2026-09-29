import React, { useEffect, useRef } from 'react';
import { useToast } from '../hooks/use-toast';

// Each bead's fill cycles through this sequence as it's tapped/counted,
// repeating around the ring — a colored marker pattern rather than one
// flat color for every completed bead.
const BEAD_COLOR_CYCLE = ['#FFFFFF', '#DC2626', '#EAB308', '#22C55E', '#111827'];

const MalaRing = ({ totalNavkars, currentTheme, malaSize = 108 }) => {
  const { toast } = useToast();
  const count = totalNavkars % malaSize;
  const beads = Array.from({ length: malaSize }, (_, i) => i);
  // Track previous count to prevent toast on mount
  const prevTotalRef = useRef(totalNavkars);

  useEffect(() => {
    if (prevTotalRef.current !== totalNavkars) {
      if (totalNavkars > 0 && totalNavkars % malaSize === 0) {
        toast({
          title: "Mala Complete!",
          description: `You have completed ${malaSize} Navkars.`,
          duration: 3000,
          className: "bg-green-50 border-green-200 text-green-900",
        });
      }
      prevTotalRef.current = totalNavkars;
    }
  }, [totalNavkars, malaSize, toast]);

  // SVG Config
  const radius = 140;
  const centerX = 160;
  const centerY = 160;

  // Theme Color
  const activeColor = currentTheme ? currentTheme.gridFill : '#b91c1c';

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-10">
      <svg
        viewBox="0 0 320 320"
        className="w-[70vmin] h-[70vmin] max-w-[400px] max-h-[400px] opacity-80"
      >
        {beads.map((i) => {
          // Calculate position
          // Start from top ( -90 degrees)
          const angle = (i * (360 / malaSize)) - 90;
          const radian = (angle * Math.PI) / 180;
          const x = centerX + radius * Math.cos(radian);
          const y = centerY + radius * Math.sin(radian);

          const isCompleted = i < count;
          // If count is 0 (just completed), show full ring completion briefly or reset? 
          // Current logic: i < 0 is false. So empty ring.
          // That's fine for "new mala start".

          const isCurrent = i === (count === 0 ? malaSize - 1 : count - 1);
          // If count is 0, no bead is current? Or maybe the last one was?
          // Visually, reset means empty.

          // Let's stick to simple logic:
          const activeBeadIndex = count - 1;
          const isCurrentBead = i === activeBeadIndex;

          const beadColor = BEAD_COLOR_CYCLE[i % BEAD_COLOR_CYCLE.length];
          const isWhiteBead = beadColor === '#FFFFFF';

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={malaSize < 20 ? (isCurrentBead ? 10 : 6) : (isCurrentBead ? 4 : 2.5)}
              fill={isCompleted ? beadColor : '#d1d5db'}
              stroke={isCompleted && isWhiteBead ? '#9CA3AF' : 'none'}
              strokeWidth={isCompleted && isWhiteBead ? 0.75 : 0}
              className="transition-all duration-300"
              style={{
                fill: isCompleted ? beadColor : undefined,
                opacity: isCompleted ? 0.9 : 0.4
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default MalaRing;
