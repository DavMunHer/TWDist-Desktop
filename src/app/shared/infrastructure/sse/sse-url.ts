/**
 * Resolves a relative API base (e.g. `/api`) against the current page origin when running
 * behind the Angular dev-server proxy (`http://localhost:4200`). EventSource cannot use
 * HttpClient interceptors, so this mirrors {@link baseUrlInterceptor} for SSE only.
 */
export function resolveApiBaseUrlForSse(apiBaseUrl: string): string {
  const base = apiBaseUrl.replace(/\/$/, '');

  if (!base || base.startsWith('http://') || base.startsWith('https://')) {
    return base;
  }

  if (base.startsWith('/') && typeof window !== 'undefined') {
    const { protocol, origin } = window.location;
    if (protocol === 'http:' || protocol === 'https:') {
      return `${origin}${base}`;
    }
  }

  return base;
}

/** Builds an absolute API URL for SSE (EventSource does not use HttpClient interceptors). */
export function buildSseUrl(apiBaseUrl: string, path: string): string {
  const base = resolveApiBaseUrlForSse(apiBaseUrl);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!base) {
    throw new Error(
      'API base URL is not configured. Set apiBaseUrl in electron/config.local.json (or packaged config.json).',
    );
  }

  const isAbsolute = base.startsWith('http://') || base.startsWith('https://');
  if (!isAbsolute) {
    throw new Error(
      `SSE requires an absolute API base URL (http/https). Got "${apiBaseUrl}". ` +
        'In packaged Electron, set apiBaseUrl in electron/config.local.json (or packaged config.json).',
    );
  }

  return `${base}${normalizedPath}`;
}
