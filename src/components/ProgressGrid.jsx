import React from 'react';

const GRID_CONFIG = {
  9: { columns: 3, boxClass: 'w-10 h-10 text-sm' },
  27: { columns: 9, boxClass: 'w-8 h-8 text-xs' },
  108: { columns: 12, boxClass: 'w-6 h-6 text-[10px]' },
};

const ProgressGrid = ({ totalNavkars, currentTheme, malaSize = 108 }) => {
  const size = GRID_CONFIG[malaSize] ? malaSize : 108;
  const { columns, boxClass } = GRID_CONFIG[size];

  const filledCount = totalNavkars % size;
  const boxes = Array.from({ length: size }, (_, i) => i);

  const defaultFill = '#b91c1c';
  const activeFill = currentTheme ? currentTheme.gridFill : defaultFill;

  return (
    <div className="fixed left-0 right-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 pointer-events-none flex justify-center px-2">
      <div
        className="bg-white/55 backdrop-blur-sm border border-white/60 rounded-2xl p-2 sm:p-3 shadow-md"
        style={{ maxWidth: 'min(95vw, 34rem)' }}
      >
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {boxes.map(i => (
            <div
              key={i}
              className={`${boxClass} rounded-[3px] transition-colors duration-200 flex items-center justify-center font-medium`}
              style={{
                backgroundColor: i < filledCount ? activeFill : 'rgba(0,0,0,0.1)',
                color: i < filledCount ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.45)',
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressGrid;
