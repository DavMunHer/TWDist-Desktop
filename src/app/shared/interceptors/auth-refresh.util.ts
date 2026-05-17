import { SessionHintService } from '@features/auth/infrastructure/services/session-hint.service';
import { TokenService } from '@features/auth/infrastructure/services/token.service';

/** HTTP statuses that may indicate an expired or revoked access token (refresh may recover). */
export function isAuthRefreshableStatus(status: number): boolean {
  return status === 401 || status === 403;
}

/** Whether a silent refresh can be attempted for the current auth mode. */
export function canAttemptTokenRefresh(
  tokenService: TokenService,
  sessionHintService: SessionHintService,
): boolean {
  if (tokenService.isBearerAuthEnabled()) {
    return !!tokenService.getRefreshToken();
  }

  return sessionHintService.hasSessionHint();
}
