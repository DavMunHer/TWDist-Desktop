import { inject, Injectable } from '@angular/core';
import { TokenService } from '@features/auth/infrastructure/services/token.service';
import { RuntimeConfigService } from '@shared/config/runtime-config.service';
import { openSseConnection, SseConnectionOptions, SseMessage } from '@shared/infrastructure/sse/sse-connection';
import { buildSseUrl } from '@shared/infrastructure/sse/sse-url';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SseRuntimeService {
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private readonly tokenService = inject(TokenService);

  connect<T extends string>(path: string, eventTypes: readonly T[]): Observable<SseMessage<T>> {
    const url = buildSseUrl(this.runtimeConfig.apiBaseUrl, path);
    const bearerEnabled = this.tokenService.isBearerAuthEnabled();
    const accessToken = this.tokenService.getAccessToken();

    const options: SseConnectionOptions = {
      url,
      eventTypes,
      withCredentials: !bearerEnabled,
      authorizationHeader:
        bearerEnabled && accessToken
          ? `Bearer ${accessToken}`
          : null,
    };

    return openSseConnection<T>(options);
  }
}
