// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {validatePrivateVars} from './theme-private-vars.mjs';

describe('validatePrivateVars', () => {
  it('accepts guaranteed properties that the compiler expands to private variables', () => {
    expect(
      validatePrivateVars({
        name: 'correct',
        tokens: {},
        components: {
          button: {base: {borderRadius: 'var(--radius-full)'}},
          card: {base: {padding: 'var(--spacing-4)'}},
        },
      }),
    ).toEqual([]);
  });

  it('reports direct private keys on every authored input surface', () => {
    const errors = validatePrivateVars({
      name: 'private-inputs',
      tokens: {'--_root-token': 'red'},
      localTokens: {'--_root-local': 'blue'},
      components: {button: {base: {'--_root-component': '1px'}}},
      onDark: {
        tokens: {'--_dark-token': 'black'},
        components: {card: {base: {'--_dark-component': '2px'}}},
      },
      adaptations: {
        rules: [
          {
            when: {pointer: 'coarse'},
            value: {
              localTokens: {'--_rule-local': '3px'},
              components: {button: {base: {'--_rule-component': '4px'}}},
            },
          },
        ],
      },
    });

    for (const name of [
      '--_root-token',
      '--_root-local',
      '--_root-component',
      '--_dark-token',
      '--_dark-component',
      '--_rule-local',
      '--_rule-component',
    ]) {
      expect(errors.join('\n')).toContain(name);
    }
  });
});
