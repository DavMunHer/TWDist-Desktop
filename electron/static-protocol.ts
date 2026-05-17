import { net, protocol } from 'electron';
import * as path from 'path';
import { pathToFileURL } from 'url';

export const APP_SCHEME = 'app';

/** Must run before app.whenReady(). */
export function registerAppScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_SCHEME,
      privileges: {
        secure: true,
        standard: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true,
      },
    },
  ]);
}

function resolveDistFile(browserDistPath: string, requestUrl: string): string {
  const url = new URL(requestUrl);
  let resourcePath = decodeURIComponent(url.pathname);

  if (!resourcePath || resourcePath === '/') {
    resourcePath = url.hostname && url.hostname !== '.'
      ? `/${url.hostname}`
      : '/index.html';
  }

  const relativePath = resourcePath.replace(/^\//, '');
  return path.join(browserDistPath, relativePath);
}

/** Serves the Angular browser bundle over app:// (reload-safe; avoids file:// quirks). */
export function registerAppProtocol(browserDistPath: string): void {
  protocol.handle(APP_SCHEME, (request) => {
    const filePath = resolveDistFile(browserDistPath, request.url);
    return net.fetch(pathToFileURL(filePath).href);
  });
}

export function getBrowserDistPath(): string {
  return path.join(__dirname, '../dist/twdist-desktop/browser');
}

export function getAppIndexUrl(): string {
  return `${APP_SCHEME}://./index.html`;
}
