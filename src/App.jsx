"use client";

import React from 'react';
import { useNavkar } from './hooks/useNavkar';
import { useNav } from './lib/navContext';
import MantraWord from './components/MantraWord';
import ProgressGrid from './components/ProgressGrid';
import MalaRing from './components/MalaRing';
import Dashboard from './components/Dashboard';
import Controls from './components/Controls';
import LiveMetrics from './components/LiveMetrics';
import Aura from './components/Aura';
import AdaptiveAudio from './components/AdaptiveAudio';
import BhaktiModal from './components/BhaktiModal';
import SpotifyWidget from './components/SpotifyWidget';
import NavBar from './components/NavBar';
import AboutPage from './components/AboutPage';
import TapSetupPage from './components/TapSetupPage';
import ProgressPage from './components/ProgressPage';
import PrivacyPage from './components/PrivacyPage';
import ContactPage from './components/ContactPage';
import FocusMode from './components/FocusMode';
import NavkarAudioPlayer from './components/NavkarAudioPlayer';
import { LINE_COLORS } from './utils/constants';
import { computeStreak } from './lib/tapStorage';
import { LANGUAGES } from './lib/navContext';
import { useOnlineStatus } from './hooks/useOnlineStatus';

function App() {
  const {
    totalNavkars,
    malaCount,
    navkarsInMala,
    currentIndex,
    currentWord,
    currentWordHindi,
    currentWordGujarati,
    isClearing,
    currentLineIndex,
    currentTheme,
    mode,
    history,
    showDashboard,
    setShowDashboard,
    handleTap,
    toggleMode,
    resetSession,
    resetMala,
    malaSize,
    setMalaSize,
    neuroModeEnabled,
    toggleNeuroMode,
    useMuseEnabled,
    toggleUseMuse,
    isMuseConnected,
    focus,
    calm,
    brainState,
    complexity,
    setComplexityMode,
  } = useNavkar();

  const { page, setPage, language, setLanguage } = useNav();
  const isOnline = useOnlineStatus();

  // Cycle through languages: english -> hindi -> gujarati -> english
  const cycleLanguage = () => {
    const idx = LANGUAGES.indexOf(language);
    setLanguage(LANGUAGES[(idx + 1) % LANGUAGES.length]);
  };

  // Get the display word based on selected language
  const displayWord = language === 'hindi' ? currentWordHindi
    : language === 'gujarati' ? currentWordGujarati
    : currentWord;

  // Language button label
  const langLabel = language === 'hindi' ? 'हि'
    : language === 'gujarati' ? 'ગુ'
    : 'En';

  const langTitle = language === 'hindi' ? 'Hindi — tap to switch to Gujarati'
    : language === 'gujarati' ? 'Gujarati — tap to switch to English'
    : 'English — tap to switch to Hindi';

  // Focus Mode
  const [focusModeActive, setFocusModeActive] = React.useState(false);

  // Lock Mode (No-Distraction)
  const [isLocked, setIsLocked] = React.useState(false);
  const toggleLock = () => setIsLocked(prev => !prev);

  // Soundscape — default to SILENT to avoid auto-playing audio without user gesture
  const SOUNDSCAPES = ['OM', 'SILENT'];
  const [activeSoundscape, setActiveSoundscape] = React.useState(() => {
    try {
      const saved = localStorage.getItem('navkar_soundscape');
      if (saved && SOUNDSCAPES.includes(saved)) return saved;
    } catch (_) {}
    return 'SILENT';
  });
  const cycleSoundscape = () => {
    setActiveSoundscape(prev => {
      const idx = SOUNDSCAPES.indexOf(prev);
      const next = SOUNDSCAPES[(idx + 1) % SOUNDSCAPES.length];
      try { localStorage.setItem('navkar_soundscape', next); } catch (_) {}
      return next;
    });
  };

  // Bhakti Mode
  const [showBhakti, setShowBhakti] = React.useState(false);

  // Streak
  const streak = React.useMemo(() => computeStreak(history), [history]);

  // Today's stats
  const todayStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);
  const todayEntry = history.find(h => h.date === todayStr) || { navkars: 0 };
  const todayMalas = Math.floor(todayEntry.navkars / 108);

  // If focus mode is active, render only FocusMode
  if (focusModeActive) {
    return (
      <FocusMode
        totalNavkars={totalNavkars}
        onTap={handleTap}
        currentIndex={currentIndex}
        currentWord={currentWord}
        currentWordHindi={currentWordHindi}
        currentWordGujarati={currentWordGujarati}
        currentLineIndex={currentLineIndex}
        isClearing={isClearing}
        onExit={() => setFocusModeActive(false)}
      />
    );
  }

  // Non-jaap pages
  if (page === 'about') {
    return (
      <>
        <NavBar />
        <AboutPage />
      </>
    );
  }

  if (page === 'tapsetup') {
    return (
      <>
        <NavBar />
        <TapSetupPage />
      </>
    );
  }

  if (page === 'progress') {
    return (
      <>
        <NavBar />
        <ProgressPage history={history} totalNavkars={totalNavkars} />
      </>
    );
  }

  if (page === 'privacy') {
    return (
      <>
        <NavBar />
        <PrivacyPage />
      </>
    );
  }

  if (page === 'contact') {
    return (
      <>
        <NavBar />
        <ContactPage />
      </>
    );
  }

  // Main Jaap page
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden" style={{ overscrollBehavior: 'none' }}>
      {/* Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{ backgroundColor: '#FFF8F0' }}
      />

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-center text-xs py-1 font-medium">
          Offline Mode — Your progress is saved locally
        </div>
      )}

      {/* Navigation bar (Hidden in Lock Mode) */}
      {!isLocked && <NavBar />}

      {/* Header Stats (Hidden in Lock Mode) */}
      {!isLocked && (
        <div className="fixed top-14 left-2 sm:left-4 z-20 flex flex-col items-start gap-2">
          <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-700 rounded-full shadow-lg text-white font-serif">
            <div className="flex flex-col items-center">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-60">Navkar</span>
              <span className="text-lg sm:text-xl font-bold font-headline">{totalNavkars}</span>
            </div>
            <div className="w-px h-6 sm:h-8 bg-white/20 mx-1 sm:mx-2" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-60">Mala</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-bold font-headline">{malaCount}</span>
                <span className="text-xs opacity-50">.{navkarsInMala}</span>
              </div>
            </div>
            {streak > 0 && (
              <>
                <div className="w-px h-6 sm:h-8 bg-white/20 mx-1 sm:mx-2" />
                <div className="flex flex-col items-center">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-60">Streak</span>
                  <span className="text-lg sm:text-xl font-bold font-headline">{streak}</span>
                </div>
              </>
            )}
          </div>

          {/* Today mini stats */}
          <div className="flex items-center gap-2 px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs text-gray-600 shadow-sm border border-orange-100">
            <span>Today: <strong className="text-orange-700">{todayEntry.navkars}</strong> Navkars</span>
            <span className="text-gray-300">|</span>
            <span><strong className="text-blue-700">{todayMalas}</strong> Malas</span>
          </div>
        </div>
      )}

      {/* Top-right controls: Audio + Language + Focus */}
      {!isLocked && (
        <div className="fixed top-14 right-2 sm:right-4 z-20 flex items-center gap-1.5">
          {/* Language Toggle */}
          <button
            onClick={cycleLanguage}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all
              border shadow-sm
              ${language !== 'english'
                ? 'bg-orange-100 text-orange-800 border-orange-200'
                : 'bg-white/70 text-gray-500 border-orange-200 hover:bg-orange-50'}
            `}
            title={langTitle}
          >
            {langLabel}
          </button>

          {/* Focus Mode */}
          <button
            onClick={() => setFocusModeActive(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/70 text-gray-600 border border-orange-200 shadow-sm hover:bg-orange-50 transition-all"
            title="Focus Mode"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          {/* Navkar Audio Player */}
          <NavkarAudioPlayer />
        </div>
      )}

      {/* Music Widget (Hidden in Lock Mode) */}
      {!isLocked && <SpotifyWidget onOpenBhakti={() => setShowBhakti(true)} />}

      {/* Controls (Hidden in Lock Mode) */}
      {!isLocked && (
        <Controls
          mode={mode}
          toggleMode={toggleMode}
          onOpenDashboard={() => setShowDashboard(true)}
          neuroModeEnabled={neuroModeEnabled}
          toggleNeuroMode={toggleNeuroMode}
          useMuseEnabled={useMuseEnabled}
          toggleUseMuse={toggleUseMuse}
          isMuseConnected={isMuseConnected}
          malaSize={malaSize}
          setMalaSize={setMalaSize}
          onReset={resetSession}
          onResetMala={resetMala}
          complexity={complexity}
          setComplexityMode={setComplexityMode}
          isLocked={isLocked}
          toggleLock={toggleLock}
          activeSoundscape={activeSoundscape}
          cycleSoundscape={cycleSoundscape}
          onOpenBhakti={() => setShowBhakti(true)}
        />
      )}

      {/* Main Interaction Layer */}
      <div
        onClick={handleTap}
        className="absolute inset-0 flex items-center justify-center cursor-pointer z-10 touch-manipulation"
        style={{ paddingBottom: mode === 'GRID' ? '15vh' : '0' }}
      >
        {/* Ring Mode */}
        {mode === 'RING' && (
          <MalaRing
            totalNavkars={totalNavkars}
            currentTheme={currentTheme}
            malaSize={malaSize}
          />
        )}

        {/* Word */}
        <div className="relative z-20 flex items-center justify-center">
          {currentIndex === -1 && !isClearing && (
            <span
              className="text-lg sm:text-xl tracking-[0.2em] font-serif uppercase animate-pulse select-none"
              style={{ color: LINE_COLORS[totalNavkars % LINE_COLORS.length] }}
            >
              Tap to Begin
            </span>
          )}
          {currentIndex >= 0 && !isClearing && (
            <>
              {complexity !== 'BASIC' && (
                <Aura enabled={neuroModeEnabled} state={brainState} size={1.2} />
              )}
              <MantraWord
                word={displayWord}
                lineIndex={currentLineIndex}
              />
            </>
          )}
        </div>
      </div>

      {/* Grid Mode Footer */}
      {mode === 'GRID' && (
        <ProgressGrid totalNavkars={totalNavkars} currentTheme={currentTheme} malaSize={malaSize} />
      )}

      {/* Live Metrics – visible when neuro mode enabled */}
      {neuroModeEnabled && (
        <LiveMetrics focus={focus} calm={calm} brainState={brainState} />
      )}

      {/* Adaptive Audio – always active when neuro mode enabled */}
      <AdaptiveAudio enabled={neuroModeEnabled} brainState={brainState} soundscape={activeSoundscape} />

      {/* Unlock Overlay */}
      {isLocked && (
        <div className="fixed bottom-8 left-4 z-50">
          <button
            onClick={toggleLock}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 text-orange-800/60 backdrop-blur-sm border border-white/30 hover:bg-white/40 transition-all"
            title="Unlock Controls"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
        </div>
      )}

      {/* Dashboard Overlay */}
      {showDashboard && (
        <Dashboard
          history={history}
          totalNavkars={totalNavkars}
          onClose={() => setShowDashboard(false)}
        />
      )}

      {/* Bhakti Modal */}
      {showBhakti && (
        <BhaktiModal onClose={() => setShowBhakti(false)} />
      )}

      {/* Privacy link */}
      <div className="fixed bottom-0 left-0 right-0 z-50 text-center py-1 pointer-events-none hidden sm:block">
        <span className="text-[10px] text-gray-400 pointer-events-auto">
          <a
            href="https://linkedin.com/in/ssanghvi03"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-600 transition-colors"
          >
            Built by Saumya Sanghvi
          </a>
          <span className="mx-2">|</span>
          <button
            onClick={() => setPage('privacy')}
            className="hover:text-orange-600 transition-colors"
          >
            Your Data
          </button>
        </span>
      </div>
    </div>
  );
}

export default App;
