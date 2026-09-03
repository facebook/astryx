// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Contract coverage for DebugEvent result and agent-session fields.
 *
 * @position packages/cli/foundation/debug — telemetry contract coverage
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createHash} from 'node:crypto';
import {
  begin,
  finish,
  recordResultSummary,
  resetRecorder,
  setEventHandler,
} from './recorder.mjs';
import {captureEnv} from './event.mjs';
import {parseDebugEvent} from '../../authoring/debug/parse.mjs';

const ATTRIBUTION_ENV_KEYS = [
  'ASTRYX_AGENT_ID',
  'ASTRYX_AGENT_SESSION_ID',
  'ASTRYX_AGENT_METADATA',
  'AGENT',
  'AGENT_SESSION_ID',
  'CURSOR_TRACE_ID',
  'CURSOR_AGENT',
  'CLAUDECODE',
  'CLAUDE_CODE',
  'AIDER_MODEL',
  'GITHUB_COPILOT_AGENT',
  'REPLIT_USER',
  'CODESPACES',
  'TERM_PROGRAM',
  'CI',
  'GITHUB_ACTIONS',
  'GITLAB_CI',
  'CIRCLECI',
  'BUILDKITE',
  'TRAVIS',
  'JENKINS_URL',
  'TEAMCITY_VERSION',
  'TF_BUILD',
  'BITBUCKET_BUILD_NUMBER',
  'CODEBUILD_BUILD_ID',
  'DRONE',
  'VERCEL',
  'NETLIFY',
];

function clearAttributionEnv() {
  for (const key of ATTRIBUTION_ENV_KEYS) vi.stubEnv(key, '');
}

/** @param {() => void} [setup] */
function collectEvent(setup = () => {}) {
  /** @type {any[]} */
  const seen = [];
  setEventHandler(event => seen.push(event));
  begin({argv: ['docs'], cliVersion: '9.9.9'});
  setup();
  finish({exitCode: 0});
  expect(seen).toHaveLength(1);
  return seen[0];
}

beforeEach(() => {
  vi.unstubAllEnvs();
  resetRecorder();
});

afterEach(() => {
  vi.unstubAllEnvs();
  resetRecorder();
});

describe('DebugEvent additive fields', () => {
  it('keeps every existing field and adds null result fields', () => {
    const event = collectEvent();
    expect(Object.keys(event).sort()).toEqual(
      [
        'args',
        'argv',
        'command',
        'commandPath',
        'durationMs',
        'endedAt',
        'env',
        'error',
        'exitCode',
        'globalOptions',
        'id',
        'optionSources',
        'options',
        'outcome',
        'output',
        'project',
        'redacted',
        'schemaVersion',
        'signal',
        'startedAt',
      ].sort(),
    );
    expect(Object.keys(event.output).sort()).toEqual(
      [
        'directMatch',
        'emptyResult',
        'envelopeTypes',
        'handled',
        'helpDisplayed',
        'jsonMode',
        'resultCount',
        'resultKind',
        'stderr',
        'stderrBytes',
        'stdout',
        'stdoutBytes',
        'truncated',
      ].sort(),
    );
    expect(Object.keys(event.env).sort()).toEqual(
      [
        'agent',
        'agentIdentity',
        'agentSessionId',
        'agentSessionIdHash',
        'agentSessionIdSource',
        'arch',
        'ci',
        'ciName',
        'cliVersion',
        'invocationSource',
        'locale',
        'nodeVersion',
        'oneOff',
        'packageManager',
        'platform',
        'timezone',
        'tty',
      ].sort(),
    );
    expect(event.output).toMatchObject({
      resultCount: null,
      emptyResult: null,
      resultKind: null,
      directMatch: null,
    });
    expect(() => parseDebugEvent(event)).not.toThrow();
  });

  it('accepts persisted schema-v1 events that predate the fields', () => {
    const legacy = structuredClone(collectEvent());
    for (const key of [
      'resultCount',
      'emptyResult',
      'resultKind',
      'directMatch',
    ]) {
      delete legacy.output[key];
    }
    for (const key of [
      'agentIdentity',
      'agentSessionId',
      'agentSessionIdHash',
      'agentSessionIdSource',
      'invocationSource',
    ]) {
      delete legacy.env[key];
    }
    expect(parseDebugEvent(legacy)).toMatchObject({
      schemaVersion: 1,
      output: {
        resultCount: null,
        emptyResult: null,
        resultKind: null,
        directMatch: null,
      },
      env: {
        agentIdentity: null,
        agentSessionId: null,
        agentSessionIdHash: null,
        agentSessionIdSource: null,
        invocationSource: 'unknown',
      },
    });
  });

  it('records count, empty, kind, and direct-match facts', () => {
    const event = collectEvent(() => {
      recordResultSummary([{domain: 'template'}, {domain: 'component'}], {
        directMatch: true,
        resultCount: 9,
        emptyResult: false,
      });
    });
    expect(event.output).toMatchObject({
      resultCount: 9,
      emptyResult: false,
      resultKind: 'mixed',
      directMatch: true,
    });
  });

  it('records a successful empty result set', () => {
    const event = collectEvent(() => recordResultSummary([]));
    expect(event.outcome).toBe('ok');
    expect(event.output).toMatchObject({
      resultCount: 0,
      emptyResult: true,
      resultKind: null,
      directMatch: null,
    });
  });
});

describe('environment attribution', () => {
  it('detects an explicit agent and hashes its session id', () => {
    clearAttributionEnv();
    vi.stubEnv('ASTRYX_AGENT_ID', 'test-agent');
    vi.stubEnv('ASTRYX_AGENT_SESSION_ID', 'agent-session-123');
    const env = captureEnv();
    expect(env).toMatchObject({
      agent: 'test-agent',
      agentIdentity: 'test-agent',
      agentSessionId: 'agent-session-123',
      agentSessionIdSource: 'ASTRYX_AGENT_SESSION_ID',
      invocationSource: 'ai',
    });
    expect(env.agentSessionIdHash).toBe(
      createHash('sha256').update('agent-session-123', 'utf8').digest('hex'),
    );
  });

  it('uses the generic AGENT identity', () => {
    clearAttributionEnv();
    vi.stubEnv('AGENT', 'generic-agent');
    expect(captureEnv()).toMatchObject({
      agent: 'generic-agent',
      agentIdentity: 'generic-agent',
      invocationSource: 'ai',
    });
  });

  it('parses comma-separated metadata', () => {
    clearAttributionEnv();
    vi.stubEnv(
      'ASTRYX_AGENT_METADATA',
      'id=future-agent,invocation_id=future-session,malformed',
    );
    expect(captureEnv()).toMatchObject({
      agentIdentity: 'future-agent',
      agentSessionId: 'future-session',
      agentSessionIdSource: 'ASTRYX_AGENT_METADATA.invocation_id',
      invocationSource: 'ai',
    });
  });

  it('parses JSON metadata', () => {
    clearAttributionEnv();
    vi.stubEnv(
      'ASTRYX_AGENT_METADATA',
      JSON.stringify({id: 'json-agent', session_id: 'json-session'}),
    );
    expect(captureEnv()).toMatchObject({
      agentIdentity: 'json-agent',
      agentSessionId: 'json-session',
      agentSessionIdSource: 'ASTRYX_AGENT_METADATA.session_id',
      invocationSource: 'ai',
    });
  });

  it('leaves agent fields null without a signal', () => {
    clearAttributionEnv();
    vi.stubEnv('CI', '1');
    expect(captureEnv()).toMatchObject({
      agent: null,
      agentIdentity: null,
      agentSessionId: null,
      agentSessionIdHash: null,
      agentSessionIdSource: null,
      invocationSource: 'automation',
    });
  });

  it('keeps vscode in the legacy field without calling it AI', () => {
    clearAttributionEnv();
    vi.stubEnv('TERM_PROGRAM', 'vscode');
    vi.stubEnv('CI', '1');
    expect(captureEnv()).toMatchObject({
      agent: 'vscode',
      agentIdentity: null,
      invocationSource: 'automation',
    });
  });
});
