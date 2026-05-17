/** Auth endpoints that must not carry an access-token Bearer header. */
const BEARER_EXCLUDED_AUTH_PATHS = ['/auth/refresh', '/auth/login', '/auth/signup'];

export function isBearerExcludedAuthUrl(url: string): boolean {
  const path = stripQueryString(stripOrigin(url));

  return BEARER_EXCLUDED_AUTH_PATHS.some((authPath) => path.endsWith(authPath));
}

function stripOrigin(url: string): string {
  return url.replace(/^https?:\/\/[^/]+/u, '');
}

function stripQueryString(url: string): string {
  return url.split('?')[0] ?? url;
}
