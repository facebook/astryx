// Copyright (c) Meta Platforms, Inc. and affiliates.

import {RuleTester} from 'eslint';
import copyrightHeaderRule from './copyright-header.js';

const ruleTester = new RuleTester();

// RuleTester registers its own describe/it blocks internally, so it
// must run at the top level. Vitest 4 forbids calling suite functions
// (describe/it) from inside another it() callback.
ruleTester.run('copyright-header', copyrightHeaderRule, {
  valid: [
    {
      code: '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;',
    },
    {
      code: '#!/usr/bin/env node\n// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;',
    },
    {code: '// Copyright (c) Meta Platforms, Inc. and affiliates.\n'},
  ],
  invalid: [
    {
      code: 'const x = 1;',
      errors: [{messageId: 'missingHeader'}],
      output:
        '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;',
    },
    {
      code: "'use client';\n\nconst x = 1;",
      errors: [{messageId: 'missingHeader'}],
      output:
        "// Copyright (c) Meta Platforms, Inc. and affiliates.\n\n'use client';\n\nconst x = 1;",
    },
    {
      code: '#!/usr/bin/env node\n\nconst x = 1;',
      errors: [{messageId: 'missingHeader'}],
      output:
        '#!/usr/bin/env node\n// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;',
    },
    {
      code: '\n// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;',
      errors: [{messageId: 'misplacedHeader'}],
      output:
        '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;',
    },
    {
      code: 'const x = 1;\n\n// Copyright (c) Meta Platforms, Inc. and affiliates.\n',
      errors: [{messageId: 'misplacedHeader'}],
      output:
        '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;\n\n',
    },
    {
      code: '/* Copyright (c) Meta Platforms, Inc. and affiliates. */\n\nconst x = 1;',
      errors: [{messageId: 'misplacedHeader'}],
      output:
        '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;',
    },
    {
      code: '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\n// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;',
      errors: [{messageId: 'duplicateHeader'}],
      output:
        '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;',
    },
    {
      code: '/* Copyright (c) Meta Platforms, Inc. and affiliates. */\n\n// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;',
      errors: [{messageId: 'duplicateHeader'}],
      output:
        '// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nconst x = 1;',
    },
  ],
});
