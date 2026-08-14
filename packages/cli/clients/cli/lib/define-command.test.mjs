// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for the CommandDoc -> Commander converter.
 */

import {Command} from 'commander';
import {describe, it, expect} from 'vitest';
import {defineCommand} from './define-command.mjs';
import {doc as searchCommand} from '../commands/search.doc.mjs';
import {doc as searchFn} from '../../../api/search/search.doc.mjs';

describe('defineCommand', () => {
  it('builds a Commander command from a CommandDoc', () => {
    const program = new Command();
    const cmd = defineCommand(program, searchCommand, {
      fn: searchFn,
      action: () => {},
    });

    expect(cmd.name()).toBe('search');
    expect(cmd.description()).toBe(searchCommand.summary);
    expect(cmd.registeredArguments.map(a => a.name())).toEqual(['query']);
    expect(cmd.registeredArguments[0].required).toBe(true);
    expect(cmd.options.map(o => o.flags)).toEqual([
      '--type <domain>',
      '--limit <n>',
      '--verbose',
    ]);
  });

  it('nests a subcommand token under a group parent', () => {
    const program = new Command();
    const group = program.command('theme');
    const cmd = defineCommand(
      group,
      {
        type: 'command',
        name: 'theme build',
        displayName: 'astryx theme build',
        summary: 'Build.',
        args: [{name: 'file', required: true}],
      },
      {action: () => {}},
    );
    expect(cmd.name()).toBe('build');
    expect(cmd.registeredArguments.map(a => a.name())).toEqual(['file']);
  });
});
