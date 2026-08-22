// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the `astryx mcp` command surface.
 *
 * The action itself (a long-lived stdio server) is exercised in
 * clients/mcp/*.test.mjs; what matters here is the CLI surface: the command is
 * registered, it is described, and `--json` is refused because on this command
 * stdout carries the MCP protocol rather than an envelope.
 */

import {describe, it, expect} from 'vitest';
import {program, JSON_SUPPORTED} from '../index.mjs';
import {buildManifest} from '../lib/manifest.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';
import {doc as mcpCommand} from './mcp.doc.mjs';

describe('astryx mcp — registration', () => {
  it('is a registered command', () => {
    const names = program.commands.map(c => c.name());
    expect(names).toContain('mcp');
  });

  it('appears in the capability manifest so agents can discover it', () => {
    const manifest = buildManifest(program);
    const entry = manifest.commands.find(c => c.name === 'mcp');
    expect(entry).toBeDefined();
    expect(entry?.description).toBe(mcpCommand.summary);
  });
});

describe('astryx mcp — JSON mode', () => {
  it('is not JSON-supported: stdout carries the protocol, not an envelope', () => {
    expect(JSON_SUPPORTED.has('mcp')).toBe(false);
  });

  it('refuses --json with a structured error instead of corrupting the stream', async () => {
    const {stdout} = await runCli(['mcp', '--json']);
    const envelope = JSON.parse(stdout);
    expect(envelope.code).toBe('ERR_INVALID_OPTION');
    expect(envelope.error).toContain('mcp');
  });
});
