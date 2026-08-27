// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The MCP client entry point.
 *
 * `clients/mcp/` is a second user-facing app over `api/`, the arrangement
 * packages/cli/CONTRIBUTING.md describes as the point of the api/clients split:
 * "The API is the reusable core; the CLI is one consumer of it."
 *
 * It is a client, not an API: `api/` never imports from here.
 *
 * @input a project directory and a pair of streams
 * @output an MCP session on those streams
 * @position packages/cli/clients/mcp — entry point
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../../foundation/fs/paths.mjs';
import {loadProjectContext, renderInstructions} from './project-context.mjs';
import {createHandler} from './server.mjs';
import {pump} from './stdio.mjs';
import {createTools} from './tools.mjs';

/**
 * This CLI's own version, reported as the MCP `serverInfo.version`.
 * @returns {string}
 */
function cliVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf-8'),
    );
    return typeof pkg.version === 'string' ? pkg.version : '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Serve one MCP session and resolve when the client disconnects.
 *
 * The streams are injectable so a test can drive a whole session without
 * spawning a process.
 *
 * @param {object} [options]
 * @param {string} [options.cwd] project to answer for (default: process.cwd())
 * @param {NodeJS.ReadableStream} [options.input]
 * @param {NodeJS.WritableStream} [options.output]
 * @returns {Promise<void>}
 */
export async function startServer({
  cwd = process.cwd(),
  input = process.stdin,
  output = process.stdout,
} = {}) {
  const context = await loadProjectContext(cwd);
  const handler = createHandler({
    tools: createTools({cwd}),
    version: cliVersion(),
    instructions: renderInstructions(context),
  });
  await pump({input, output, handle: handler.handle});
}
