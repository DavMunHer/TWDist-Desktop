import { Injectable } from '@angular/core';
import { environment } from '@shared/config/environment';

export interface ElectronAppConfig {
  apiBaseUrl: string;
  useBearerAuth?: boolean;
}

export interface ResolvedRuntimeConfig {
  apiBaseUrl: string;
  isBearerAuthEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private config: ResolvedRuntimeConfig;

  constructor() {
    this.config = this.buildInitialConfig();
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  isBearerAuthEnabled(): boolean {
    return this.config.isBearerAuthEnabled;
  }

  /** Loads Electron-side config when running inside the desktop shell. */
  async load(): Promise<void> {
    const syncConfig = this.getSyncElectronConfig();
    if (syncConfig?.apiBaseUrl) {
      this.config = this.configFromElectron(syncConfig);
      return;
    }

    if (typeof window === 'undefined' || !window.electronAPI?.getAppConfig) {
      return;
    }

    const electronConfig = await window.electronAPI.getAppConfig();
    if (!electronConfig?.apiBaseUrl) {
      if (environment.isElectronRelease) {
        console.error(
          '[RuntimeConfig] Missing electron/config.local.json (or packaged config.json). ' +
            'Copy electron/config.example.json and set apiBaseUrl.',
        );
      }
      return;
    }

    this.config = this.configFromElectron(electronConfig);
  }

  private buildInitialConfig(): ResolvedRuntimeConfig {
    const syncConfig = this.getSyncElectronConfig();
    if (syncConfig?.apiBaseUrl) {
      return this.configFromElectron(syncConfig);
    }

    return {
      apiBaseUrl: environment.apiBaseUrl,
      isBearerAuthEnabled: environment.isElectronRelease,
    };
  }

  private getSyncElectronConfig(): ElectronAppConfig | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.__electronRuntimeConfig ?? null;
  }

  private configFromElectron(electronConfig: ElectronAppConfig): ResolvedRuntimeConfig {
    return {
      apiBaseUrl: electronConfig.apiBaseUrl,
      isBearerAuthEnabled:
        electronConfig.useBearerAuth ?? environment.isElectronRelease,
    };
  }
}
