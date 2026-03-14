import { HttpContext, HttpContextToken } from '@angular/common/http';

export const REQUIRES_AUTH = new HttpContextToken<boolean>(() => false);

export function requiresAuthContext(): { context: HttpContext } {
  return {
    context: new HttpContext().set(REQUIRES_AUTH, true),
  };
}