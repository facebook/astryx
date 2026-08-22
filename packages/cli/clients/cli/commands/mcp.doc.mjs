// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx mcp`. A client-only command (like `manifest`):
 * it has no `fn` because it starts a second client over `api/` rather than
 * calling one API function.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'mcp',
  displayName: 'astryx mcp',
  namespace: 'cli',
  summary: 'Run a local MCP server over stdio for this project',
  description:
    'Serves the Model Context Protocol on stdin/stdout so an MCP-capable agent can ' +
    'query this project directly. It exposes the same two tools as the hosted server ' +
    'at astryx.atmeta.com/mcp (search and get), but answers from the ' +
    '@astryxdesign/core installed here, with the wired theme and configured ' +
    'integrations, instead of the version the docs site was deployed with. ' +
    'Read-only. Intended to be launched by an MCP client, not run by hand.',
  examples: [
    {
      label: 'Run the server (an MCP client does this for you)',
      cli: 'astryx mcp',
    },
  ],
  exitCodes: [
    {code: 0, when: 'the client disconnected and the session ended cleanly'},
    {code: 1, when: 'the server could not start'},
  ],
  notes: [
    {
      type: 'prose',
      text: 'stdout carries the protocol, so this command does not support --json.',
    },
    {
      type: 'prose',
      text: 'Add it to an MCP client config as the command `npx @astryxdesign/cli mcp`.',
    },
  ],
  related: ['search', 'docs', 'doctor'],
};
