// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

// The design-judge module reads files off disk and calls fetch() against a
// provider endpoint, so exercise the MiniMax path through a stubbed fetch
// that returns a canned Anthropic-shaped Messages response. This keeps the
// test hermetic (no real MINIMAX_API_KEY, no network egress to the provider).
const TMP_DIRS: string[] = [];
function tmpDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-judge-'));
  TMP_DIRS.push(d);
  return d;
}

// Pre-built 1x1 PNG used as both ideal and screenshot image input.
const PNG_1x1 = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

const RESPONSE_BODY = {
  content: [
    {
      type: 'text',
      text: JSON.stringify({
        layout: 80,
        hierarchy: 70,
        spacing: 60,
        components: 50,
        color: 90,
        overall: 0, // intentionally wrong — design-judge recomputes it
        notes: 'mostly aligned',
      }),
    },
  ],
};

interface RecordedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
}

describe('design-judge minimax provider', () => {
  let originalFetch: typeof globalThis.fetch;
  let originalEnv: NodeJS.ProcessEnv;
  let requests: RecordedRequest[];

  beforeEach(() => {
    originalEnv = {...process.env};
    process.env.MINIMAX_API_KEY = 'test-minimax-key';
    requests = [];
    originalFetch = globalThis.fetch;
    // Stub fetch so no real network call is made. The recorded request lets
    // the assertions check URL, auth scheme, and image content blocks.
    globalThis.fetch = (async (
      input: any,
      init?: RequestInit,
    ): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      let body: any = undefined;
      if (init?.body) {
        body = JSON.parse(init.body as string);
      }
      requests.push({
        url,
        method: init?.method ?? 'GET',
        headers: (init?.headers ?? {}) as Record<string, string>,
        body,
      });
      return new Response(JSON.stringify(RESPONSE_BODY), {
        status: 200,
        headers: {'content-type': 'application/json'},
      });
    }) as typeof globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = originalEnv;
    for (const d of TMP_DIRS) {
      fs.rmSync(d, {recursive: true, force: true});
    }
    TMP_DIRS.length = 0;
  });

  it('posts base64 image blocks to the global MiniMax anthropic endpoint with Bearer auth', async () => {
    const dir = tmpDir();
    const idealPath = path.join(dir, 'ideal.png');
    const screenshotPath = path.join(dir, 'screenshot.png');
    fs.writeFileSync(idealPath, PNG_1x1);
    fs.writeFileSync(screenshotPath, PNG_1x1);

    const {callMiniMaxVisionJudge} = await import('./design-judge.js');
    const judgment = await callMiniMaxVisionJudge(
      idealPath,
      screenshotPath,
      'A login form',
      'MiniMax-M3',
      'global_en',
    );

    // The judge recomputes overall from the weighted sub-signals.
    const expectedOverall = Math.round(
      80 * 0.25 + 70 * 0.25 + 60 * 0.2 + 50 * 0.15 + 90 * 0.15,
    );
    expect(judgment.overall).toBe(expectedOverall);
    expect(judgment.scores).toEqual({
      layout: 80,
      hierarchy: 70,
      spacing: 60,
      components: 50,
      color: 90,
    });
    expect(judgment.notes).toBe('mostly aligned');

    expect(requests).toHaveLength(1);
    const req = requests[0];
    expect(req.url).toBe('https://api.minimax.io/anthropic/v1/messages');
    expect(req.method).toBe('POST');
    expect(req.headers['Authorization']).toBe('Bearer test-minimax-key');
    expect(req.headers['anthropic-version']).toBe('2023-06-01');
    expect(req.body.model).toBe('MiniMax-M3');
    expect(req.body.messages[0].content).toHaveLength(3);
    expect(req.body.messages[0].content[0].type).toBe('image');
    expect(req.body.messages[0].content[0].source.media_type).toBe('image/png');
    expect(req.body.messages[0].content[1].type).toBe('image');
    expect(req.body.messages[0].content[2].type).toBe('text');
  });

  it('routes the cn_zh region to the China endpoint host', async () => {
    const dir = tmpDir();
    const idealPath = path.join(dir, 'ideal.png');
    const screenshotPath = path.join(dir, 'screenshot.png');
    fs.writeFileSync(idealPath, PNG_1x1);
    fs.writeFileSync(screenshotPath, PNG_1x1);

    const {callMiniMaxVisionJudge} = await import('./design-judge.js');
    await callMiniMaxVisionJudge(
      idealPath,
      screenshotPath,
      'A login form',
      'MiniMax-M3',
      'cn_zh',
    );

    expect(requests[0].url).toBe(
      'https://api.minimaxi.com/anthropic/v1/messages',
    );
  });

  it('throws when MINIMAX_API_KEY is absent', async () => {
    const dir = tmpDir();
    const idealPath = path.join(dir, 'ideal.png');
    const screenshotPath = path.join(dir, 'screenshot.png');
    fs.writeFileSync(idealPath, PNG_1x1);
    fs.writeFileSync(screenshotPath, PNG_1x1);

    delete process.env.MINIMAX_API_KEY;
    const {callMiniMaxVisionJudge} = await import('./design-judge.js');
    await expect(
      callMiniMaxVisionJudge(
        idealPath,
        screenshotPath,
        'A login form',
        'MiniMax-M3',
        'global_en',
      ),
    ).rejects.toThrow(/MINIMAX_API_KEY/);
  });

  it('surfaces a non-2xx response as a MiniMax API error', async () => {
    const dir = tmpDir();
    const idealPath = path.join(dir, 'ideal.png');
    const screenshotPath = path.join(dir, 'screenshot.png');
    fs.writeFileSync(idealPath, PNG_1x1);
    fs.writeFileSync(screenshotPath, PNG_1x1);

    globalThis.fetch = (async () =>
      new Response('{"error":"bad request"}', {
        status: 400,
        headers: {'content-type': 'application/json'},
      })) as typeof globalThis.fetch;

    const {callMiniMaxVisionJudge} = await import('./design-judge.js');
    await expect(
      callMiniMaxVisionJudge(
        idealPath,
        screenshotPath,
        'A login form',
        'MiniMax-M3',
        'global_en',
      ),
    ).rejects.toThrow(/MiniMax API error \(400\)/);
  });
});
