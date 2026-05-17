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

function resolveDistFile(browserDistPath: string, requestUrl: string): string | null {
  const url = new URL(requestUrl);
  let resourcePath = decodeURIComponent(url.pathname);

  if (!resourcePath || resourcePath === '/') {
    resourcePath = url.hostname && url.hostname !== '.'
      ? `/${url.hostname}`
      : '/index.html';
  }

  const relativePath = resourcePath.replace(/^\//, '');
  const root = path.resolve(browserDistPath);
  const filePath = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(root, filePath);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    console.warn(`[app protocol] Blocked path traversal: ${requestUrl}`);
    return null;
  }

  return filePath;
}

/** Serves the Angular browser bundle over app:// (reload-safe; avoids file:// quirks). */
export function registerAppProtocol(browserDistPath: string): void {
  const root = path.resolve(browserDistPath);

  protocol.handle(APP_SCHEME, (request) => {
    const filePath = resolveDistFile(root, request.url);
    if (!filePath) {
      return new Response('Forbidden', { status: 403 });
    }
    return net.fetch(pathToFileURL(filePath).href);
  });
}

export function getBrowserDistPath(): string {
  return path.join(__dirname, '../dist/twdist-desktop/browser');
}

export function getAppIndexUrl(): string {
  return `${APP_SCHEME}://./index.html`;
}
