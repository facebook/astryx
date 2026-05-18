// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it} from 'vitest';
import {RuleTester} from 'eslint';
import copyrightHeaderRule from './copyright-header.js';

const ruleTester = new RuleTester();

describe('copyright-header', () => {
  it('passes the RuleTester', () => {
    ruleTester.run('copyright-header', copyrightHeaderRule, {
      valid: [
        {code: '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;'},
        {code: '// Copyright (c) Meta Platforms, Inc. and affiliates.\n'},
        {code: '/* Copyright (c) Meta Platforms, Inc. and affiliates. */\n\nconst x = 1;'},
      ],
      invalid: [
        {
          code: 'const x = 1;',
          errors: [{messageId: 'missingHeader'}],
          output: '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;',
        },
        {
          code: "'use client';\n\nconst x = 1;",
          errors: [{messageId: 'missingHeader'}],
          output: "// Copyright (c) Meta Platforms, Inc. and affiliates.\n\n'use client';\n\nconst x = 1;",
        },
      ],
    });
  });
});
