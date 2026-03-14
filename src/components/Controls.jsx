import React from 'react';

const Controls = ({
  mode,
  toggleMode,
  onOpenDashboard,
  neuroModeEnabled,
  toggleNeuroMode,
  useMuseEnabled,
  toggleUseMuse,
  isMuseConnected,
  malaSize,
  setMalaSize,
  onReset,
  onResetMala,
  isLocked,
  toggleLock,
  activeSoundscape,
  cycleSoundscape,
  onOpenBhakti,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="bg-white/50 backdrop-blur-md border-t border-orange-100/40 rounded-t-3xl px-2 sm:px-4 pt-3 pb-2">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-4xl mx-auto">
          {/* Mala Size */}
          <div className="flex bg-orange-700 rounded-full p-1 gap-1">
            {[9, 27, 36, 108].map(size => (
              <button
                key={size}
                onClick={() => setMalaSize(size)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs ${malaSize === size ? 'bg-white text-orange-800' : 'text-white'}`}
                title={`${size} beads`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="hidden sm:block w-px h-6 bg-orange-300 mx-1" />

          {/* Mode Toggle */}
          <button
            onClick={toggleMode}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-700 text-white hover:bg-orange-600"
            title={mode === 'GRID' ? 'View Ring' : 'View Grid'}
          >
            {mode === 'GRID' ? '🕸️' : '🔘'}
          </button>

          <div className="hidden sm:block w-px h-6 bg-orange-300 mx-1" />

          {/* Muse */}
          <button
            onClick={toggleUseMuse}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${useMuseEnabled ? (isMuseConnected ? 'bg-purple-200 text-purple-800' : 'bg-amber-200 text-amber-800 animate-pulse') : 'bg-orange-700 text-white'}`}
            title={isMuseConnected ? 'Muse Linked' : 'Connect Muse'}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </button>

          <div className="hidden sm:block w-px h-6 bg-orange-300 mx-1" />

          {/* Dashboard */}
          <button
            onClick={onOpenDashboard}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-700 text-white hover:bg-orange-600"
            title="Sadhana stats"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

          <div className="hidden sm:block w-px h-6 bg-orange-300 mx-1" />

          {/* Reset */}
          <button
            onClick={onReset}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-red-600 text-white hover:bg-red-500"
            title="Reset Session"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Mala Reset */}
          <button
            onClick={onResetMala}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-500 text-white hover:bg-orange-400"
            title="Reset Current Mala"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
            </svg>
          </button>
          <div className="hidden sm:block w-px h-6 bg-orange-300 mx-1" />

          {/* Lock Mode */}
          <button
            onClick={toggleLock}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-700 text-white hover:bg-orange-600"
            title="Lock Mode (Focus)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>

          <div className="hidden sm:block w-px h-6 bg-orange-300 mx-1" />

          {/* Soundscape */}
          <button
            onClick={cycleSoundscape}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-700 text-white hover:bg-orange-600 font-bold text-xs"
            title={`Soundscape: ${activeSoundscape}`}
          >
            {activeSoundscape === 'OM' ? '🕉️' : '🔇'}
          </button>

          <div className="hidden sm:block w-px h-6 bg-orange-300 mx-1" />

          {/* Bhakti Mode */}
          <button
            onClick={onOpenBhakti}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-700 text-white hover:bg-orange-600"
            title="Bhakti Mode (Stotras)"
          >
            🙏
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
