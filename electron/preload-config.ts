import type { ElectronAppConfig } from './app-config';

const CONFIG_ARG_PREFIX = '--electron-config=';

export function encodeConfigForPreload(config: ElectronAppConfig): string {
  return `${CONFIG_ARG_PREFIX}${Buffer.from(JSON.stringify(config), 'utf8').toString('base64')}`;
}

export function readConfigFromPreloadArgv(argv: string[]): ElectronAppConfig | null {
  const encoded = argv.find((entry) => entry.startsWith(CONFIG_ARG_PREFIX));
  if (!encoded) {
    return null;
  }

  const json = Buffer.from(encoded.slice(CONFIG_ARG_PREFIX.length), 'base64').toString('utf8');
  return JSON.parse(json) as ElectronAppConfig;
}
