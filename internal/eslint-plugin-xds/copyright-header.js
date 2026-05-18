// Copyright (c) Meta Platforms, Inc. and affiliates.

const COPYRIGHT = 'Copyright (c) Meta Platforms, Inc. and affiliates.';
const COMMENT_TEXT = `// ${COPYRIGHT}`;

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require a copyright header as the first line of every source file',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      missingHeader:
        'File is missing the copyright header: "// Copyright (c) Meta Platforms, Inc. and affiliates."',
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const source = context.sourceCode ?? context.getSourceCode();
        const comments = source.getAllComments();
        const firstToken = source.getFirstToken(node);

        const hasCopyright =
          comments.some(
            (c) => c.type === 'Line' && c.value.trim() === COPYRIGHT,
          ) ||
          comments.some(
            (c) => c.type === 'Block' && c.value.trim() === COPYRIGHT,
          );

        if (hasCopyright) {
          return;
        }

        context.report({
          node,
          loc: {line: 1, column: 0},
          messageId: 'missingHeader',
          fix(fixer) {
            if (firstToken) {
              return fixer.insertTextBefore(firstToken, `${COMMENT_TEXT}\n\n`);
            }
            return fixer.insertTextAfterRange([0, 0], `${COMMENT_TEXT}\n`);
          },
        });
      },
    };
  },
};

export default rule;
