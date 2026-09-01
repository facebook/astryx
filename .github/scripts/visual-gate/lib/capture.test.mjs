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
  partitionCapturePlan,
  partitionScoutStories,
  serveDirectory,
} from './capture.mjs';

const roots = [];
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, {recursive: true, force: true});
});

describe('scout partitioning', () => {
  it('balances the current 388-story scout across two workers', () => {
    const stories = Array.from({length: 388}, (_, index) => `story-${index}`);
    const partitions = partitionScoutStories(stories, 2);
    expect(partitions.map(partition => partition.length)).toEqual([194, 194]);
    expect(new Set(partitions.flat()).size).toBe(388);
  });
});

describe('capture plan partitioning', () => {
  it('keeps the 3,378-shot release workload below 1,700 shots per worker', () => {
    const plan = [];
    for (let story = 0; story < 388; story += 1) {
      const shots = story < 274 ? 9 : 8;
      for (let index = 0; index < shots; index += 1) {
        plan.push({key: `${story}-${index}`, storyId: `story-${story}`});
      }
    }

    const partitions = partitionCapturePlan(plan, 2);
    expect(partitions).toHaveLength(2);
    expect(partitions.flat()).toHaveLength(3378);
    expect(Math.max(...partitions.map(partition => partition.length))).toBeLessThan(1700);

    const ownerByStory = {};
    partitions.forEach((partition, worker) => {
      for (const shot of partition) {
        ownerByStory[shot.storyId] ??= worker;
        expect(ownerByStory[shot.storyId]).toBe(worker);
      }
    });
    expect(new Set(partitions.flat().map(shot => shot.key)).size).toBe(3378);
  });

  it('uses one worker for empty or single-worker plans and never splits interleaved stories', () => {
    expect(partitionCapturePlan([], 2)).toEqual([]);
    const plan = [
      {key: 'a-light', storyId: 'a'},
      {key: 'a-dark', storyId: 'a'},
      {key: 'b-light', storyId: 'b'},
    ];
    expect(partitionCapturePlan(plan, 1)).toEqual([plan]);

    const interleaved = [plan[0], plan[2], plan[1]];
    const partitions = partitionCapturePlan(interleaved, 2);
    const aWorkers = partitions
      .map((partition, worker) => (partition.some(shot => shot.storyId === 'a') ? worker : null))
      .filter(worker => worker !== null);
    expect(aWorkers).toHaveLength(1);
  });
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
