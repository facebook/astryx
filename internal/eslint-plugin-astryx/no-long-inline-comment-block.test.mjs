// Copyright (c) Meta Platforms, Inc. and affiliates.

import {RuleTester} from 'eslint';
import rule from './no-long-inline-comment-block.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

function block(lineCount, firstLine = 'Implementation protocol.') {
  const body = [firstLine];
  while (body.length < lineCount - 2) {
    body.push(`Detail ${body.length}.`);
  }
  return ['/**', ...body.map(line => ` * ${line}`), ' */'].join('\n');
}

function lineBlock(lineCount) {
  return Array.from(
    {length: lineCount},
    (_, index) => `// Implementation detail ${index + 1}.`,
  ).join('\n');
}

function indent(text) {
  return text
    .split('\n')
    .map(line => `  ${line}`)
    .join('\n');
}

ruleTester.run('no-long-inline-comment-block', rule, {
  valid: [
    {
      code: `function component() {\n${indent(block(19))}\n  return null;\n}`,
    },
    {
      code: `${block(24, 'File-level protocol.')}\nfunction useProtocol() {\n  return null;\n}`,
    },
    {
      code: `${block(24, 'Named hook contract.')}\nconst useProtocol = () => null;`,
    },
    {
      code: `function component() {\n${indent(lineBlock(10))}\n  run();\n${indent(lineBlock(10))}\n}`,
    },
    {
      code: `const styles = {\n${indent(block(20, 'Known legacy protocol.'))}\n  item: {},\n};`,
      filename: 'packages/core/src/Legacy/Legacy.tsx',
      options: [
        {
          allow: [
            {
              file: 'packages/core/src/Legacy/Legacy.tsx',
              startsWith: 'Known legacy protocol.',
              reason: 'Tracked legacy protocol from #1234.',
            },
          ],
        },
      ],
    },
  ],
  invalid: [
    {
      code: `function component() {\n${indent(block(20))}\n  return null;\n}`,
      errors: [{messageId: 'tooLong', data: {lineCount: 20}}],
    },
    {
      code: `const styles = {\n${indent(block(20))}\n  item: {},\n};`,
      errors: [{messageId: 'tooLong', data: {lineCount: 20}}],
    },
    {
      code: `const component = () => {\n${indent(lineBlock(20))}\n  return null;\n};`,
      errors: [{messageId: 'tooLong', data: {lineCount: 20}}],
    },
    {
      code: `function component() {\n${indent(block(20))}\n  const styles = {\n${indent(indent(block(21, 'Nested object protocol.')))}\n    item: {},\n  };\n  return styles;\n}`,
      errors: [
        {messageId: 'tooLong', data: {lineCount: 20}},
        {messageId: 'tooLong', data: {lineCount: 21}},
      ],
    },
  ],
});
