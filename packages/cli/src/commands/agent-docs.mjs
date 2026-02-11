/**
 * @file agent-docs command — Install/update AGENTS.md + .xds-docs/
 *
 * Delegates to the existing @xds/agent-tools agents-md.mjs script.
 */

import {execSync} from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import {findAgentToolsDir} from '../utils/paths.mjs';

export function registerAgentDocs(program) {
  program
    .command('agent-docs')
    .description('Install/update AGENTS.md and .xds-docs/ for AI coding agents')
    .option('--remove', 'Remove XDS agent docs instead of installing')
    .action(options => {
      const agentToolsDir = findAgentToolsDir(process.cwd());

      if (!agentToolsDir) {
        console.error(
          'Error: Could not find @xds/agent-tools package.\n' +
            'Make sure you are inside the XDS monorepo or have @xds/agent-tools installed.',
        );
        process.exit(1);
      }

      const scriptPath = path.join(agentToolsDir, 'bin', 'agents-md.mjs');

      if (!fs.existsSync(scriptPath)) {
        console.error(`Error: agents-md.mjs not found at ${scriptPath}`);
        process.exit(1);
      }

      const args = options.remove ? '--remove' : '';

      try {
        execSync(`node ${scriptPath} ${args}`, {
          stdio: 'inherit',
          cwd: process.cwd(),
        });
      } catch (error) {
        process.exit(error.status ?? 1);
      }
    });
}
