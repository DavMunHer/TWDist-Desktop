import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface ElectronAppConfig {
  apiBaseUrl: string;
  useBearerAuth?: boolean;
}

function readConfigFile(configPath: string): ElectronAppConfig | null {
  if (!fs.existsSync(configPath)) {
    return null;
  }

  const raw = fs.readFileSync(configPath, 'utf-8');
  const parsed = JSON.parse(raw) as ElectronAppConfig;

  if (!parsed.apiBaseUrl) {
    throw new Error(`Invalid config at ${configPath}: "apiBaseUrl" is required`);
  }

  return parsed;
}

/**
 * Loads API settings from disk (never from the Angular bundle).
 *
 * Packaged app:  resources/config.json (generated in CI via TWDIST_API_BASE_URL)
 * Local override: electron/config.local.json (gitignored)
 */
export function loadElectronAppConfig(): ElectronAppConfig | null {
  const candidates: string[] = [];

  if (app.isPackaged) {
    candidates.push(path.join(process.resourcesPath, 'config.json'));
  }

  candidates.push(path.join(__dirname, '..', 'electron', 'config.local.json'));

  for (const configPath of candidates) {
    const config = readConfigFile(configPath);
    if (config) {
      return config;
    }
  }

  return null;
}
