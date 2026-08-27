// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {afterEach, describe, expect, it} from 'vitest';

import {
  BACKGROUND_NETWORK_GUARD,
  CAPTURE_CONTEXT_SECURITY,
  blockExternalNetwork,
  isSameOrigin,
  serveDirectory,
} from './capture.mjs';

const roots = [];
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, {recursive: true, force: true});
});

describe('capture network boundary', () => {
  it('allows the exact Storybook origin', () => {
    expect(isSameOrigin('http://127.0.0.1:6100/assets/story.js', 'http://127.0.0.1:6100')).toBe(
      true,
    );
  });

  it('rejects URLs that merely share the trusted prefix', () => {
    expect(
      isSameOrigin('http://127.0.0.1:6100@evil.example/collect', 'http://127.0.0.1:6100'),
    ).toBe(false);
  });

  it('blocks service workers and every WebSocket before Storybook runs', async () => {
    let webSocketHandler;
    const context = {
      route: async () => {},
      routeWebSocket: async (_pattern, handler) => {
        webSocketHandler = handler;
      },
    };
    await blockExternalNetwork(context, 'http://127.0.0.1:6100');
    const closed = [];
    await webSocketHandler({close: options => closed.push(options)});
    expect(CAPTURE_CONTEXT_SECURITY).toEqual({serviceWorkers: 'block'});
    expect(BACKGROUND_NETWORK_GUARD).toContain("'WebSocket', 'Worker', 'SharedWorker'");
    expect(closed).toEqual([{code: 1008, reason: 'blocked'}]);
  });

  it('does not follow a Storybook artifact symlink outside its root', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'capture-server-'));
    roots.push(root);
    const served = path.join(root, 'served');
    fs.mkdirSync(served);
    fs.writeFileSync(path.join(root, 'secret'), 'credential');
    fs.symlinkSync(path.join(root, 'secret'), path.join(served, 'escape'));
    const server = await serveDirectory(served);
    try {
      const response = await fetch(`http://127.0.0.1:${server.port}/escape`);
      expect(response.status).toBe(403);
      expect(await response.text()).not.toContain('credential');
    } finally {
      await server.close();
    }
  });
});
