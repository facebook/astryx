// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it, vi} from 'vitest';
import {
  PREVIEW_CONNECT,
  acceptPreviewConnect,
  createPreviewConnector,
  connectToPreview,
} from '../app/playground/previewChannel';

const parent = {} as MessageEventSource;
const other = {} as MessageEventSource;

function connectEvent(overrides: {
  data?: unknown;
  source?: MessageEventSource | null;
  ports?: readonly MessagePort[];
}) {
  const {port1} = new MessageChannel();
  return {
    data: {type: PREVIEW_CONNECT},
    source: parent,
    ports: [port1],
    ...overrides,
  } as Pick<MessageEvent, 'data' | 'source' | 'ports'>;
}

describe('acceptPreviewConnect', () => {
  it('adopts the port from a connect sent by the parent window', () => {
    const event = connectEvent({});
    expect(acceptPreviewConnect(event, parent)).toBe(event.ports[0]);
  });

  it('rejects a connect from a window that is not the parent', () => {
    expect(acceptPreviewConnect(connectEvent({source: other}), parent)).toBe(
      null,
    );
  });

  it('rejects a connect with no source', () => {
    expect(acceptPreviewConnect(connectEvent({source: null}), parent)).toBe(
      null,
    );
  });

  it('rejects everything while there is no parent window', () => {
    expect(acceptPreviewConnect(connectEvent({}), null)).toBe(null);
    expect(acceptPreviewConnect(connectEvent({}), undefined)).toBe(null);
  });

  it('rejects a connect that carries no port', () => {
    expect(acceptPreviewConnect(connectEvent({ports: []}), parent)).toBe(null);
  });

  it('ignores unrelated message types, ports and all', () => {
    expect(
      acceptPreviewConnect(
        connectEvent({data: {type: 'preview-code'}}),
        parent,
      ),
    ).toBe(null);
    expect(acceptPreviewConnect(connectEvent({data: null}), parent)).toBe(null);
    expect(acceptPreviewConnect(connectEvent({data: 'connect'}), parent)).toBe(
      null,
    );
  });
});

describe('connectToPreview', () => {
  it('offers the frame one end of a fresh channel and returns the other', () => {
    const postMessage = vi.fn();
    const port = connectToPreview({postMessage} as Pick<Window, 'postMessage'>);

    expect(postMessage).toHaveBeenCalledTimes(1);
    const [message, targetOrigin, transfer] = postMessage.mock.calls[0] as [
      {type: string},
      string,
      MessagePort[],
    ];
    expect(message).toEqual({type: PREVIEW_CONNECT});
    // An opaque origin cannot be named, so the offer necessarily targets '*';
    // it carries no data and goes only to the window handle of our own iframe.
    expect(targetOrigin).toBe('*');
    expect(transfer).toHaveLength(1);
    expect(transfer[0]).toBeInstanceOf(MessagePort);
    expect(port).toBeInstanceOf(MessagePort);
    expect(port).not.toBe(transfer[0]);
  });

  it('returns entangled ports — a message sent on one arrives on the other', async () => {
    const captured: MessagePort[] = [];
    const postMessage = (
      _msg: unknown,
      _target: string,
      transfer: MessagePort[],
    ) => {
      captured.push(...transfer);
    };
    const local = connectToPreview({
      postMessage,
    } as unknown as Pick<Window, 'postMessage'>);
    const remote = captured[0];

    const received = new Promise<unknown>(resolve => {
      remote.onmessage = event => resolve(event.data);
    });
    local.postMessage({type: 'preview-code', code: 'x'});
    await expect(received).resolves.toEqual({type: 'preview-code', code: 'x'});
    local.close();
    remote.close();
  });
});

describe('createPreviewConnector', () => {
  it('offers until ready, goes quiet, and reset() recovers a replaced document', async () => {
    // Fake only the interval — port delivery rides the real event loop.
    vi.useFakeTimers({toFake: ['setInterval', 'clearInterval']});
    const flush = () => new Promise(resolve => setTimeout(resolve, 0));
    try {
      const offered: MessagePort[] = [];
      const frame = {
        postMessage: (
          _message: unknown,
          _target: string,
          transfer: MessagePort[],
        ) => {
          offered.push(transfer[0]);
        },
      };
      const received: Array<{type?: string}> = [];
      const connector = createPreviewConnector({
        getFrame: () => frame as unknown as Window,
        onMessage: event => received.push(event.data as {type?: string}),
      });

      // Offers start immediately and repeat while unanswered.
      connector.start();
      expect(offered).toHaveLength(1);
      vi.advanceTimersByTime(900);
      expect(offered.length).toBeGreaterThan(2);

      // The preview document adopts the LATEST offer and answers on it;
      // offers stop, and traffic flows over the adopted pair.
      const firstDoc = offered[offered.length - 1];
      const firstDocInbox: Array<{type?: string; code?: string}> = [];
      firstDoc.onmessage = event => firstDocInbox.push(event.data);
      firstDoc.postMessage({type: 'preview-ready'});
      await flush();
      expect(received.map(m => m?.type)).toContain('preview-ready');
      const offersAtReady = offered.length;
      vi.advanceTimersByTime(1500);
      expect(offered.length).toBe(offersAtReady);
      connector.post({type: 'preview-code', code: 'A'});
      await flush();
      expect(firstDocInbox.map(m => m.code)).toContain('A');

      // The document is replaced (previewed code reloaded its frame): its
      // port died with it. reset() re-offers; the new document adopts,
      // answers, and an edit reaches IT — the reload-then-edit lifecycle.
      connector.reset();
      expect(offered.length).toBe(offersAtReady + 1);
      const secondDoc = offered[offered.length - 1];
      const secondDocInbox: Array<{type?: string; code?: string}> = [];
      secondDoc.onmessage = event => secondDocInbox.push(event.data);
      secondDoc.postMessage({type: 'preview-ready'});
      await flush();
      const offersAfterRecovery = offered.length;
      vi.advanceTimersByTime(1500);
      expect(offered.length).toBe(offersAfterRecovery);
      connector.post({type: 'preview-code', code: 'B'});
      await flush();
      expect(secondDocInbox.map(m => m.code)).toContain('B');

      connector.stop();
      firstDoc.close();
      secondDoc.close();
      for (const port of offered) {
        port.close();
      }
    } finally {
      vi.useRealTimers();
    }
  });
});
