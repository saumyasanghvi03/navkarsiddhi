import { useState, useEffect, useRef } from 'react';

// Adds organic "life" to a static metric
export const useOrganicMetric = (targetValue, intensity = 2) => {
    const [displayValue, setDisplayValue] = useState(targetValue);
    const targetRef = useRef(targetValue);

    // Update ref when prop changes
    useEffect(() => {
        targetRef.current = targetValue;
    }, [targetValue]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayValue(prev => {
                const target = targetRef.current;
                const diff = target - prev;
                // Slower drift for "heavy" realistic feel
                const drift = diff * 0.05;

                // Very subtle jitter (micro-fluctuations)
                const jitter = (Math.random() - 0.5) * 0.5 * intensity;

                let next = prev + drift + jitter;

                // Slow, deep breathing (period ~6 seconds)
                const time = Date.now() / 3000;
                const breath = Math.sin(time) * (intensity * 0.8);

                next += breath;

                return Math.max(0, Math.min(100, next));
            });
        }, 50); // Higher framerate (50ms) for smoothness, but smaller changes
        return () => clearInterval(interval);
    }, [intensity]);

    return Math.round(displayValue);
};
