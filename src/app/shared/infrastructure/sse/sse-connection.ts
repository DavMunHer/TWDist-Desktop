import { Observable } from 'rxjs';

export interface SseMessage<T extends string = string> {
  type: T;
  data: unknown;
}

export interface SseConnectionOptions {
  url: string;
  eventTypes: readonly string[];
  withCredentials?: boolean;
  authorizationHeader?: string | null;
}

/** Opens an SSE stream. Uses fetch when a Bearer token is required (Electron). */
export function openSseConnection<T extends string>(
  options: SseConnectionOptions,
): Observable<SseMessage<T>> {
  if (options.authorizationHeader) {
    return openFetchSse<T>(options);
  }
  return openNativeEventSource<T>(options);
}

function openNativeEventSource<T extends string>(
  options: SseConnectionOptions,
): Observable<SseMessage<T>> {
  return new Observable(subscriber => {
    const source = new EventSource(options.url, {
      withCredentials: options.withCredentials ?? true,
    });

    for (const type of options.eventTypes) {
      source.addEventListener(type, ((event: MessageEvent) => {
        try {
          subscriber.next({ type: type as T, data: JSON.parse(event.data) });
        } catch (error) {
          console.error(`[SSE] Failed to parse "${type}" event:`, error, event.data);
          subscriber.error(error);
        }
      }) as EventListener);
    }

    source.onerror = () => subscriber.error(new Error(`SSE connection error: ${options.url}`));

    return () => source.close();
  });
}

function openFetchSse<T extends string>(
  options: SseConnectionOptions,
): Observable<SseMessage<T>> {
  return new Observable(subscriber => {
    const abort = new AbortController();

    void (async () => {
      try {
        const response = await fetch(options.url, {
          method: 'GET',
          headers: {
            Accept: 'text/event-stream',
            Authorization: options.authorizationHeader!,
          },
          signal: abort.signal,
        });

        if (!response.ok) {
          throw new Error(`SSE request failed (${response.status}): ${options.url}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error(`SSE response has no body: ${options.url}`);
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          buffer = dispatchSseBuffer(buffer, options.eventTypes, subscriber);
        }
      } catch (error) {
        if (!abort.signal.aborted) {
          subscriber.error(error);
        }
      } finally {
        subscriber.complete();
      }
    })();

    return () => abort.abort();
  });
}

function dispatchSseBuffer<T extends string>(
  buffer: string,
  eventTypes: readonly string[],
  subscriber: { next: (value: SseMessage<T>) => void; error: (err: unknown) => void },
): string {
  const blocks = buffer.split(/\n\n/);
  const remainder = blocks.pop() ?? '';

  for (const block of blocks) {
    if (!block.trim()) {
      continue;
    }

    let eventType = 'message';
    const dataLines: string[] = [];

    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (!eventTypes.includes(eventType) || dataLines.length === 0) {
      continue;
    }

    try {
      subscriber.next({
        type: eventType as T,
        data: JSON.parse(dataLines.join('\n')),
      });
    } catch (error) {
      console.error(`[SSE] Failed to parse "${eventType}" event:`, error, dataLines.join('\n'));
      subscriber.error(error);
    }
  }

  return remainder;
}
