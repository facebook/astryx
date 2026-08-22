// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx mcp` — hand stdin/stdout to the MCP client.
 *
 * Thin by design: the CLI's only job here is to start the other client and get
 * out of the way. Everything the server does lives in clients/mcp/.
 *
 * Nothing may print to stdout on this path — it is the protocol channel. The
 * shared `logger` is silent unless a client enables it, and this command never
 * does.
 */

import {startServer} from '../../mcp/index.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {doc as mcpCommand} from './mcp.doc.mjs';

/**
 * Register the `astryx mcp` command.
 * @param {import('commander').Command} program
 */
export function registerMcp(program) {
  defineCommand(program, mcpCommand, {
    action: async () => {
      await startServer({cwd: process.cwd()});
    },
  }).addHelpText(
    'after',
    '\nMCP client config (same shape for Claude Code, Cursor, Windsurf, Cline):\n' +
      '  {"mcpServers": {"astryx": {"command": "npx", "args": ["@astryxdesign/cli", "mcp"]}}}\n' +
      '\nThe hosted server at https://astryx.atmeta.com/mcp needs no install but\n' +
      'answers for the deployed version; this one answers for the version installed here.\n',
  );
}
