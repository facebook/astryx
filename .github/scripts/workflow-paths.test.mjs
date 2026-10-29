// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Workflows state what makes them run, never what does not
 * (spec:AST-030 FR14). An exclusion list runs on every path nobody thought to
 * exclude; a path filter on a workflow that reports a required context leaves
 * pull requests waiting on a check that never starts.
 */

import fs from 'node:fs';
import path from 'node:path';

import {expect, it} from 'vitest';
import yaml from 'yaml';

const dir = path.resolve(import.meta.dirname, '../workflows');
const workflows = fs
  .readdirSync(dir)
  .filter(name => name.endsWith('.yml'))
  .map(name => [
    name,
    yaml.parse(fs.readFileSync(path.join(dir, name), 'utf8')),
  ]);
const REQUIRED_CONTEXT_WORKFLOWS = ['ci.yml', 'lint.yml'];

it.each(workflows)('%s filters by positive paths only', (name, value) => {
  for (const [event, config] of Object.entries(value.on ?? value[true] ?? {})) {
    expect(config?.['paths-ignore'], `${name} ${event}`).toBeUndefined();
    for (const glob of config?.paths ?? []) {
      expect(glob === '**' || glob.startsWith('!'), `${name}: ${glob}`).toBe(
        false,
      );
    }
    if (REQUIRED_CONTEXT_WORKFLOWS.includes(name)) {
      expect(
        config?.paths,
        `${name} reports a required context`,
      ).toBeUndefined();
    }
  }
});
