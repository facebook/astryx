// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Content-target resolution tests.
 *
 * Pins the DOCSITE_TARGET × VERCEL_ENV matrix of getTarget() exactly as it
 * behaves today — test-only documentation of an intentional contract, not a
 * behavior change. The explicit DOCSITE_TARGET override always wins: it exists
 * for CI lanes and local runs. Deployments rely on VERCEL_ENV alone (canary
 * site = preview, production → latest) and never set the override.
 *
 * @input DOCSITE_TARGET / VERCEL_ENV environment combinations
 * @output Regression coverage for the target-selection contract
 * @position Build-time docsite target verification
 * Run: pnpm -F @astryxdesign/docsite test
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {getTarget} from '../../scripts/resolve-content-root.mjs';

const ENV_KEYS = ['DOCSITE_TARGET', 'VERCEL_ENV'] as const;
const saved: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> =
  {};

function setEnv(vercelEnv: string | null, docsiteTarget: string | null) {
  if (vercelEnv == null) {delete process.env.VERCEL_ENV;}
  else {process.env.VERCEL_ENV = vercelEnv;}
  if (docsiteTarget == null) {delete process.env.DOCSITE_TARGET;}
  else {process.env.DOCSITE_TARGET = docsiteTarget;}
}

beforeEach(() => {
  for (const key of ENV_KEYS) {saved[key] = process.env[key];}
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = saved[key];
    if (value === undefined) {delete process.env[key];}
    else {process.env[key] = value;}
  }
});

describe('getTarget', () => {
  it('defaults to canary outside production (development, preview, unset)', () => {
    setEnv(null, null);
    expect(getTarget()).toBe('canary');
    setEnv('preview', null);
    expect(getTarget()).toBe('canary');
    setEnv('development', null);
    expect(getTarget()).toBe('canary');
  });

  it('derives latest from a production deployment', () => {
    setEnv('production', null);
    expect(getTarget()).toBe('latest');
  });

  it('lets an explicit DOCSITE_TARGET override the deployment default', () => {
    // The override exists for CI lanes and local runs (e.g. generating the
    // latest catalog on a dev machine, or pinning a preview to published
    // content). Deployed environments never set it: the canary site deploys
    // as VERCEL_ENV=preview and production deploys with no override, so
    // production always resolves to latest in practice.
    setEnv(null, 'latest');
    expect(getTarget()).toBe('latest');
    setEnv('preview', 'latest');
    expect(getTarget()).toBe('latest');
    setEnv('production', 'latest');
    expect(getTarget()).toBe('latest');
    setEnv('production', 'canary');
    expect(getTarget()).toBe('canary');
  });

  it('rejects unknown target values', () => {
    setEnv(null, 'bogus');
    expect(() => getTarget()).toThrow(/Invalid DOCSITE_TARGET="bogus"/);
  });
});
