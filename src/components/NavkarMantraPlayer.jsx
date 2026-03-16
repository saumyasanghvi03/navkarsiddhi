"use client";

import React, { useState, useCallback, useEffect } from 'react';

const SPOTIFY_PLAYLIST_URL =
  'https://open.spotify.com/playlist/4WsjlXMfJzb71wl6Krf4L4?si=lJTi-rMWS4KUDyvZYc8ttg&pi=8lC9YNbARVW-K';
// autoplay=1 starts playback as soon as the iframe is mounted
const SPOTIFY_EMBED_URL =
  'https://open.spotify.com/embed/playlist/4WsjlXMfJzb71wl6Krf4L4?utm_source=generator&autoplay=1';

/**
 * NavkarMantraPlayer
 *
 * A lightweight floating music bar that embeds the Navkar Mantra Spotify
 * playlist in a hidden iframe.
 *
 * Play/Pause work by mounting/unmounting the iframe — the most reliable
 * approach since the Spotify embed API does not support programmatic pause.
 *
 * The Spotify embed sends `postMessage` playback_update events that carry the
 * real track name + artist, which we display live instead of static text.
 *
 * @param {boolean} pageMode - When true, positions the bar near the bottom of
 *   a scrollable page (no Controls strip beneath it). Defaults to false, which
 *   places the bar above the fixed Controls strip on the Jaap page.
 */
const NavkarMantraPlayer = ({ pageMode = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // Track info received from the Spotify embed via postMessage
  const [trackName, setTrackName] = useState('');
  const [artistName, setArtistName] = useState('');

  // Listen for playback_update messages from the Spotify embed iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'https://open.spotify.com') return;
      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type === 'playback_update' && data?.payload?.track) {
          const { name, artists } = data.payload.track;
          setTrackName(name ?? '');
          setArtistName(artists?.[0]?.name ?? '');
        }
      } catch (err) {
        // Ignore malformed messages; log in development to aid debugging
        if (process.env.NODE_ENV === 'development') {
          console.debug('NavkarMantraPlayer: malformed postMessage', err);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handlePlay = useCallback(() => setIsPlaying(true), []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    setTrackName('');
    setArtistName('');
  }, []);

  const handleClose = useCallback(() => {
    setIsPlaying(false);
    setTrackName('');
    setArtistName('');
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  // jaap page: sit above the ~88 px Controls strip; page mode: 24 px from bottom
  const bottomClass = pageMode ? 'bottom-6' : 'bottom-[5.5rem]';

  // Label: show real track info when available, fall back to default
  const label = trackName
    ? `🎵 ${trackName}${artistName ? ` · ${artistName}` : ''}`
    : '🎵 Navkar Mantra';

  return (
    <>
      {/*
        Spotify iframe — mounted only while playing.
        Positioned off-screen so it is invisible but audible.
        Unmounting it is the most reliable way to stop playback
        since the embed API does not support programmatic pause.
      */}
      {isPlaying && (
        <iframe
          src={SPOTIFY_EMBED_URL}
          title="Navkar Mantra Spotify Player"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="eager"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            width: 1,
            height: 1,
            border: 'none',
          }}
        />
      )}

      {/* Floating player bar */}
      <div
        className={`fixed ${bottomClass} left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-sm`}
        role="region"
        aria-label="Navkar Mantra Player"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-amber-100 px-4 py-2.5 flex items-center gap-3">
          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800 truncate select-none">
              {label}
            </p>
            {isPlaying && !trackName && (
              <p className="text-[10px] text-amber-500 animate-pulse select-none">
                Loading…
              </p>
            )}
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Play button */}
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isPlaying
                  ? 'bg-amber-100 text-amber-300 cursor-default'
                  : 'bg-amber-600 text-white hover:bg-amber-500 shadow-sm active:scale-95'
              }`}
              title="Play Navkar Mantra"
              aria-label="Play"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>

            {/* Pause button */}
            <button
              onClick={handlePause}
              disabled={!isPlaying}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                !isPlaying
                  ? 'bg-gray-100 text-gray-300 cursor-default'
                  : 'bg-amber-600 text-white hover:bg-amber-500 shadow-sm active:scale-95'
              }`}
              title="Pause"
              aria-label="Pause"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>

            {/* Spotify icon — opens playlist in new tab */}
            <a
              href={SPOTIFY_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1DB954] text-white hover:bg-[#1ed760] transition-all shadow-sm active:scale-95"
              title="Open playlist in Spotify"
              aria-label="Open in Spotify"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </a>

            {/* Close / dismiss button */}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all active:scale-95"
              title="Close player"
              aria-label="Close player"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavkarMantraPlayer;
