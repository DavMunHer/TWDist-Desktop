#!/usr/bin/env node
/**
 * Writes electron/config.packaged.json for production Electron builds.
 * Run in CI with TWDIST_API_BASE_URL set (value is not committed to git).
 *
 *   TWDIST_API_BASE_URL=https://api.example.com/api node scripts/write-electron-config.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiBaseUrl = process.env.TWDIST_API_BASE_URL?.trim();

if (!apiBaseUrl) {
  console.error('TWDIST_API_BASE_URL is required (e.g. https://api.example.com/api)');
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = join(root, 'electron', 'config.packaged.json');

writeFileSync(
  outputPath,
  `${JSON.stringify({ apiBaseUrl, useBearerAuth: true }, null, 2)}\n`,
  'utf-8',
);

console.log(`Wrote ${outputPath}`);
