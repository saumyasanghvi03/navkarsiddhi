#!/usr/bin/env node
// Builds the static bundle embedded in the Android APK (see capacitor.config.ts).
//
// Next.js static export (`output: 'export'`) cannot include Route Handlers
// that read the request body or use any HTTP verb other than GET+force-static
// — see node_modules/next/dist/docs/01-app/02-guides/static-exports.md. Every
// route under src/app/api is a POST handler, so the export build fails unless
// that directory is out of the tree. This moves it aside for the build only —
// the live Vercel deployment builds normally and keeps those routes; the APK
// calls them over HTTPS instead (see src/lib/apiBase.ts).
import { rename, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const apiDir = path.join(root, 'src/app/api');
const apiBackup = path.join(root, '.capacitor-build-api-backup');

function run(cmd, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`))));
  });
}

async function main() {
  if (existsSync(apiBackup)) {
    await rm(apiBackup, { recursive: true, force: true });
  }
  await rename(apiDir, apiBackup);
  try {
    await run('npx', ['next', 'build'], { CAPACITOR_BUILD: '1' });
  } finally {
    await rm(apiDir, { recursive: true, force: true }).catch(() => {});
    await rename(apiBackup, apiDir);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
