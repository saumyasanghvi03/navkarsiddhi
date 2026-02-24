import React, { useEffect, useRef, useCallback } from 'react';

// Om Frequency (A=432Hz Standard)
const OM_FREQ = 432;

export const AdaptiveAudio = ({ enabled, brainState, soundscape = 'OM' }) => {
    const contextRef = useRef(null);
    const nodesRef = useRef(null);
    const bellTimeoutRef = useRef(null);
    const initPendingRef = useRef(false);

    const initAudio = useCallback(() => {
        // Prevent double-init
        if (contextRef.current) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();

        // Resume suspended context (required after user gesture on some browsers)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        // Master Gain
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.05;
        masterGain.connect(ctx.destination);

        // Breath LFO (Simulates inhaling/exhaling Om)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // 10 seconds per breath cycle
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.3; // Modulation depth
        lfo.connect(lfoGain);
        lfoGain.connect(masterGain.gain);

        // Vocal Chain (Sawtooth -> Formants)
        const vocalIn = ctx.createGain();
        vocalIn.gain.value = 0.5;
        vocalIn.connect(masterGain);

        // Fundamental Oscillator (The Voice)
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = OM_FREQ;

        // Formant Filters (The "Mouth" shape)
        const f1 = ctx.createBiquadFilter();
        f1.type = 'bandpass';
        f1.frequency.value = 450;
        f1.Q.value = 4;

        const f2 = ctx.createBiquadFilter();
        f2.type = 'bandpass';
        f2.frequency.value = 800;
        f2.Q.value = 4;

        // Connect Parallel Filters
        osc.connect(f1);
        osc.connect(f2);
        f1.connect(vocalIn);
        f2.connect(vocalIn);

        // Sub-bass 1 (Octave down - 216 Hz)
        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.value = OM_FREQ / 2;
        const subGain = ctx.createGain();
        subGain.gain.value = 0.4;
        subOsc.connect(subGain);
        subGain.connect(masterGain);

        // Sub-bass 2 (Deep Hum - 108 Hz)
        const deepOsc = ctx.createOscillator();
        deepOsc.type = 'sine';
        deepOsc.frequency.value = OM_FREQ / 4;
        const deepGain = ctx.createGain();
        deepGain.gain.value = 0.6;
        deepOsc.connect(deepGain);
        deepGain.connect(masterGain);

        osc.start();
        subOsc.start();
        deepOsc.start();
        lfo.start();

        contextRef.current = ctx;
        nodesRef.current = { masterGain, f1, f2, osc, subGain, deepGain };
        initPendingRef.current = false;
    }, []);

    // Defer audio init until first user gesture when enabled
    useEffect(() => {
        if (!enabled) return;

        // If already initialized, just resume if suspended
        if (contextRef.current) {
            if (contextRef.current.state === 'suspended') {
                contextRef.current.resume();
            }
            return;
        }

        // Wait for user gesture to initialize AudioContext
        initPendingRef.current = true;

        const handleGesture = () => {
            if (initPendingRef.current) {
                initAudio();
            }
            cleanup();
        };

        const cleanup = () => {
            document.removeEventListener('click', handleGesture);
            document.removeEventListener('touchstart', handleGesture);
            document.removeEventListener('keydown', handleGesture);
        };

        document.addEventListener('click', handleGesture, { once: true });
        document.addEventListener('touchstart', handleGesture, { once: true });
        document.addEventListener('keydown', handleGesture, { once: true });

        return () => {
            initPendingRef.current = false;
            cleanup();
        };
    }, [enabled, initAudio]);

    // Clean up on disable
    useEffect(() => {
        if (!enabled && contextRef.current) {
            contextRef.current.close();
            contextRef.current = null;
            nodesRef.current = null;
        }
    }, [enabled]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (contextRef.current) {
                contextRef.current.close();
                contextRef.current = null;
            }
            if (bellTimeoutRef.current) clearTimeout(bellTimeoutRef.current);
        };
    }, []);

    // Modulate Drone based on Brain State & Soundscape
    useEffect(() => {
        if (!contextRef.current || !nodesRef.current || !enabled) return;

        const { masterGain, f1, f2 } = nodesRef.current;
        const now = contextRef.current.currentTime;
        const rampTime = 2.0;

        let targetVolume = 0.05;
        let targetF1 = 450;
        let targetF2 = 800;

        switch (brainState) {
            case 'gold':
                targetVolume = 0.35;
                targetF1 = 700;
                targetF2 = 1250;
                break;
            case 'cyan':
                targetVolume = 0.25;
                targetF1 = 550;
                targetF2 = 950;
                break;
            case 'indigo':
                targetVolume = 0.25;
                targetF1 = 300;
                targetF2 = 450;
                break;
            case 'orange':
            default:
                targetVolume = 0.08;
                targetF1 = 400;
                targetF2 = 700;
                break;
        }

        // If Soundscape is NOT 'OM', mute the drone
        if (soundscape !== 'OM') {
            targetVolume = 0;
        }

        masterGain.gain.setTargetAtTime(targetVolume, now, rampTime);
        f1.frequency.setTargetAtTime(targetF1, now, rampTime);
        f2.frequency.setTargetAtTime(targetF2, now, rampTime);

    }, [brainState, enabled, soundscape]);

    // Temple Bell Logic
    useEffect(() => {
        if (!enabled || soundscape !== 'TEMPLE' || !contextRef.current) {
            if (bellTimeoutRef.current) clearTimeout(bellTimeoutRef.current);
            return;
        }

        const playBell = () => {
            const ctx = contextRef.current;
            if (!ctx) return;
            const now = ctx.currentTime;

            const fundamental = 200;
            const partials = [0.5, 1, 1.18, 1.5, 2, 2.74, 3, 3.81, 4.2];
            const masterVol = ctx.createGain();
            masterVol.connect(ctx.destination);
            masterVol.gain.setValueAtTime(0.3, now);

            partials.forEach((ratio, i) => {
                const osc = ctx.createOscillator();
                osc.type = i === 0 ? 'sine' : 'triangle';
                osc.frequency.value = fundamental * ratio;

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(1.0 / (i + 1), now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 4 + (Math.random() * 2));

                osc.connect(gain);
                gain.connect(masterVol);

                osc.start(now);
                osc.stop(now + 6);
            });

            bellTimeoutRef.current = setTimeout(playBell, 10000 + Math.random() * 10000);
        };

        playBell();

        return () => {
            if (bellTimeoutRef.current) clearTimeout(bellTimeoutRef.current);
        };
    }, [soundscape, enabled]);

    return null;
};

export default AdaptiveAudio;
