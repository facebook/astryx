// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file previewChannel.ts
 * @input The preview frame's window (playground side) / an incoming
 *   MessageEvent (preview side)
 * @output A dedicated MessagePort pair both ends trust
 * @position Playground <-> preview iframe — the postMessage trust boundary.
 *
 * The preview iframe compiles and evaluates whatever source arrives on this
 * channel, and it runs in a sandbox without `allow-same-origin`, so its
 * document has an opaque origin: no cookies, no storage, no reach into the
 * parent document — and no origin string that could identify either end. The
 * trust anchor is therefore a MessagePort handshake rather than an origin
 * check. The playground creates a MessageChannel and hands one port to the
 * window of the iframe it created itself; the preview adopts a port only from
 * a connect message whose sender is its own parent window (and frame-ancestors
 * on this route pins who that parent can be). All traffic then flows over the
 * port pair, which no third window can reach: ports are transferable
 * capabilities, not broadcasts.
 */

/** The handshake message type. Everything after it travels over the port. */
export const PREVIEW_CONNECT = 'astryx-preview-connect';

/**
 * Playground side: open a fresh channel to the preview frame and return the
 * local port. The remote port travels inside the connect message. The
 * wildcard target is required — an opaque origin cannot be named in
 * `targetOrigin` — and carries no data: the message goes to the window of the
 * iframe the playground itself created and whose src it controls.
 */
export function connectToPreview(
  frame: Pick<Window, 'postMessage'>,
): MessagePort {
  const channel = new MessageChannel();
  frame.postMessage({type: PREVIEW_CONNECT}, '*', [channel.port2]);
  return channel.port1;
}

/**
 * Playground side: the full offer lifecycle around {@link connectToPreview}.
 *
 * Offers a fresh port on an interval until the preview answers
 * `preview-ready` on one, then goes quiet. `reset()` re-arms the loop for a
 * REPLACED preview document — previewed code reloading its own frame, or a
 * crash — whose adopted port died with it; the new document can only adopt,
 * never announce itself, so recovery has to come from this side.
 */
export function createPreviewConnector({
  getFrame,
  onMessage,
  offerIntervalMs = 300,
}: {
  /** The preview frame's window, when it exists. */
  getFrame: () => Pick<Window, 'postMessage'> | null | undefined;
  /** Receives every message that arrives on the adopted port. */
  onMessage: (event: MessageEvent) => void;
  offerIntervalMs?: number;
}): {
  start: () => void;
  reset: () => void;
  post: (message: unknown) => void;
  stop: () => void;
} {
  let port: MessagePort | null = null;
  let ready = false;
  let interval: ReturnType<typeof setInterval> | null = null;

  function stopOffering() {
    if (interval != null) {
      clearInterval(interval);
      interval = null;
    }
  }

  function offer() {
    const frame = getFrame();
    if (!frame) {
      return;
    }
    port?.close();
    const next = connectToPreview(frame);
    next.onmessage = event => {
      if (
        (event.data as {type?: unknown} | null)?.type === 'preview-ready' &&
        port === next
      ) {
        ready = true;
        stopOffering();
      }
      onMessage(event);
    };
    port = next;
  }

  function startOffering() {
    if (interval != null) {
      return;
    }
    offer();
    interval = setInterval(() => {
      if (ready) {
        stopOffering();
        return;
      }
      offer();
    }, offerIntervalMs);
  }

  return {
    start: startOffering,
    reset() {
      ready = false;
      startOffering();
    },
    post(message: unknown) {
      port?.postMessage(message);
    },
    stop() {
      stopOffering();
      port?.close();
      port = null;
    },
  };
}

/**
 * Preview side: the port from a connect handshake sent by this frame's own
 * parent, or null for anything else — other windows, self-sends, connects
 * without a port, unrelated messages. A nullish `parentWindow` means there is
 * no embedder, so nothing can be trusted.
 */
export function acceptPreviewConnect(
  event: Pick<MessageEvent, 'data' | 'source' | 'ports'>,
  parentWindow: MessageEventSource | null | undefined,
): MessagePort | null {
  const type = (event.data as {type?: unknown} | null)?.type;
  if (type !== PREVIEW_CONNECT) {
    return null;
  }
  if (parentWindow == null || event.source == null) {
    return null;
  }
  if (event.source !== parentWindow) {
    return null;
  }
  return event.ports[0] ?? null;
}
