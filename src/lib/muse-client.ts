// @ts-nocheck
import { BehaviorSubject, Subject } from 'rxjs';

export interface MuseMetrics {
    focus: number;
    calm: number;
    connected: boolean;
    signalQuality: number;
}

export class MuseManager {
    private muse: any = null;
    private destroy$ = new Subject<void>();

    // Observables
    public connectionStatus$ = new BehaviorSubject<boolean>(false);
    public rawEEG$ = new Subject<any>();
    public telemetry$ = new Subject<any>();

    // Metrics Stream (Derived)
    public metrics$ = new BehaviorSubject<MuseMetrics>({
        focus: 0,
        calm: 0,
        connected: false,
        signalQuality: 0
    });

    constructor() {}

    private async getMuse(): Promise<any> {
        if (!this.muse) {
            if (typeof window === 'undefined') {
                throw new Error('MuseClient can only be initialized in the browser');
            }
            try {
                // Use Function/eval dynamic import to prevent Next.js Turbopack static tracer from crawling muse-js's internal legacy RxJS 5 dependencies
                const importMuse = new Function('return import("muse-js")');
                const museModule = await importMuse();
                const MuseClient = museModule.MuseClient || museModule.default?.MuseClient;
                if (MuseClient) {
                    this.muse = new MuseClient();
                } else {
                    throw new Error('MuseClient class not found in muse-js');
                }
            } catch (err) {
                console.warn('Muse-js library unavailable or incompatible with bundler. Mock client active.', err);
                this.muse = {
                    connect: async () => {},
                    start: async () => {},
                    disconnect: () => {},
                    eegReadings: null,
                    telemetryData: null,
                };
            }
        }
        return this.muse;
    }

    async connect(): Promise<void> {
        try {
            const client = await this.getMuse();
            await client.connect();
            await client.start();

            this.connectionStatus$.next(true);

            // Subscribe to raw readings
            if (client.eegReadings) {
                client.eegReadings.subscribe((reading: any) => {
                    this.rawEEG$.next(reading);
                    this.processReading(reading);
                });
            }

            // Subscribe to telemetry
            if (client.telemetryData) {
                client.telemetryData.subscribe((telemetry: any) => {
                    this.telemetry$.next(telemetry);
                });
            }

        } catch (err) {
            console.error('Muse Connection Failed:', err);
            this.connectionStatus$.next(false);
            throw err;
        }
    }

    disconnect() {
        if (this.muse && typeof this.muse.disconnect === 'function') {
            try { this.muse.disconnect(); } catch (_) {}
        }
        this.connectionStatus$.next(false);
        this.metrics$.next({ ...this.metrics$.value, connected: false });
        this.destroy$.next();
    }

    private buffer: number[] = [];
    private processReading(reading: any) {
        if (!reading || !reading.samples) return;
        const avgValue = reading.samples.reduce((a: number, b: number) => a + Math.abs(b), 0) / reading.samples.length;

        this.buffer.push(avgValue);
        if (this.buffer.length > 256) {
            this.buffer.shift();
        }

        if (this.buffer.length >= 256) {
            const variance = this.calculateVariance(this.buffer);
            const calmScore = Math.max(0, Math.min(100, 100 - (variance / 2)));
            const focusScore = Math.max(0, Math.min(100, (variance / 5) * 10));

            this.metrics$.next({
                focus: Math.round(focusScore),
                calm: Math.round(calmScore),
                connected: true,
                signalQuality: 100
            });
        }
    }

    private calculateVariance(data: number[]): number {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        return data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    }
}

export const museManager = new MuseManager();
