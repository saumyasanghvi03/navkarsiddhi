import type { NextConfig } from 'next';
import path from 'path';

// Set only by scripts/build-capacitor-export.mjs, which builds a static
// bundle of the app to embed in the Android APK (see capacitor.config.ts).
// The live Vercel deployment never sets this, so its build is unaffected —
// full server mode, API routes and all.
const isCapacitorBuild = process.env.CAPACITOR_BUILD === '1';

const nextConfig: NextConfig = {
  /* config options here */
  ...(isCapacitorBuild ? { output: 'export' as const } : {}),
  async headers() {
    return [
      {
        source: '/navkar-siddhi.apk',
        headers: [
          { key: 'Content-Type', value: 'application/vnd.android.package-archive' },
          { key: 'Content-Disposition', value: 'attachment; filename="navkar-siddhi.apk"' },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    unoptimized: isCapacitorBuild,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
