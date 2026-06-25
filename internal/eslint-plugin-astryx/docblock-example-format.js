// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docblock-example-format.js
 * @description ESLint rule enforcing @example blocks use fenced code.
 *
 * Valid:
 *   @example
 *   ```
 *   <Button label="Click" />
 *   ```
 *
 * Invalid:
 *   @example <Button label="Click" />
 *   @example
 *   <Button label="Click" />
 */

/**
 * Checks JSDoc comments for @example formatting violations.
 *
 * Pattern 1 (inline): @example followed by code on the same line
 *   e.g. `@example getInitials('John') // 'J'`
 *
 * Pattern 2 (missing fence): @example on its own line, but the next
 *   non-empty line is not a code fence (```)
 */
const docblockExampleFormatRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce @example blocks use ``` fenced code on a separate line',
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      inlineExample:
        '@example must not have code on the same line. Put ``` on the next line, then the code.',
      missingFence:
        '@example must be followed by a ``` code fence on the next line.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        for (const comment of comments) {
          if (comment.type !== 'Block') continue;

          const lines = comment.value.split('\n');

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.replace(/^\s*\*?\s*/, '');

            // Pattern 1: @example with code on the same line
            // e.g. "@example getInitials('John')" or '@example "mod+k"'
            if (/^@example\s+\S/.test(trimmed)) {
              context.report({
                node: comment,
                messageId: 'inlineExample',
              });
              continue;
            }

            // Pattern 2: @example alone, but next non-empty line isn't ```
            if (/^@example\s*$/.test(trimmed)) {
              // Look ahead for the next non-empty comment line
              for (let j = i + 1; j < lines.length; j++) {
                const nextTrimmed = lines[j].replace(/^\s*\*?\s*/, '');
                if (nextTrimmed === '') continue; // skip blank lines
                if (!nextTrimmed.startsWith('```')) {
                  context.report({
                    node: comment,
                    messageId: 'missingFence',
                  });
                }
                break; // only check the first non-empty line after @example
              }
            }
          }
        }
      },
    };
  },
};

export default docblockExampleFormatRule;
