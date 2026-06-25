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
      duplicateHeader:
        'File must contain exactly one copyright header: "// Copyright (c) Meta Platforms, Inc. and affiliates."',
      missingHeader:
        'File is missing the copyright header: "// Copyright (c) Meta Platforms, Inc. and affiliates."',
      misplacedHeader:
        'Copyright header must be the first line of the file: "// Copyright (c) Meta Platforms, Inc. and affiliates."',
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const source = context.sourceCode ?? context.getSourceCode();
        const comments = source.getAllComments();
        const firstToken = source.getFirstToken(node);

        const copyrightComments = comments.filter(
          comment => comment.value.trim() === COPYRIGHT,
        );
        const [copyrightComment] = copyrightComments;

        if (
          copyrightComments.length === 1 &&
          isCanonicalHeader(source, copyrightComment)
        ) {
          return;
        }

        if (copyrightComments.length > 1) {
          context.report({
            node,
            loc: {line: 1, column: 0},
            messageId: 'duplicateHeader',
            fix(fixer) {
              const canonicalHeader =
                copyrightComments.find(comment =>
                  isCanonicalHeader(source, comment),
                ) ?? null;

              if (canonicalHeader != null) {
                return copyrightComments
                  .filter(comment => comment !== canonicalHeader)
                  .map(comment =>
                    fixer.removeRange(getCommentRemovalRange(source, comment)),
                  );
              }

              return normalizeHeaderFixes(fixer, source, copyrightComments);
            },
          });
          return;
        }

        if (copyrightComments.length === 1) {
          context.report({
            node,
            loc: {line: 1, column: 0},
            messageId: 'misplacedHeader',
            fix(fixer) {
              return normalizeHeaderFixes(fixer, source, [copyrightComment]);
            },
          });
          return;
        }

        context.report({
          node,
          loc: {line: 1, column: 0},
          messageId: 'missingHeader',
          fix(fixer) {
            const insertOffset = getHeaderInsertOffset(source);
            if (firstToken || insertOffset > 0) {
              return fixer.insertTextAfterRange(
                [insertOffset, insertOffset],
                getHeaderInsertionText(source, insertOffset),
              );
            }
            return fixer.insertTextAfterRange([0, 0], `${COMMENT_TEXT}\n`);
          },
        });
      },
    };
  },
};

function isCanonicalHeader(source, comment) {
  const expectedLine = hasShebang(source) ? 2 : 1;
  return (
    comment.type === 'Line' &&
    comment.loc.start.line === expectedLine &&
    comment.loc.start.column === 0
  );
}

function normalizeHeaderFixes(fixer, source, copyrightComments) {
  const [firstCopyrightComment, ...extraCopyrightComments] = copyrightComments;
  const insertOffset = getHeaderInsertOffset(source);

  if (
    source.text.slice(insertOffset, firstCopyrightComment.range[0]).trim() ===
    ''
  ) {
    return [
      fixer.replaceTextRange(
        [
          insertOffset,
          getCommentRemovalRange(source, firstCopyrightComment)[1],
        ],
        `${COMMENT_TEXT}\n\n`,
      ),
      ...extraCopyrightComments.map(comment =>
        fixer.removeRange(getCommentRemovalRange(source, comment)),
      ),
    ];
  }

  return [
    fixer.insertTextAfterRange(
      [insertOffset, insertOffset],
      getHeaderInsertionText(source, insertOffset),
    ),
    ...copyrightComments.map(comment =>
      fixer.removeRange(getCommentRemovalRange(source, comment)),
    ),
  ];
}

function hasShebang(source) {
  return source.text.startsWith('#!');
}

function getHeaderInsertOffset(source) {
  if (!hasShebang(source)) {
    return 0;
  }
  const newlineIndex = source.text.search(/\r\n|\n|\r/);
  if (newlineIndex === -1) {
    return source.text.length;
  }
  if (source.text.startsWith('\r\n', newlineIndex)) {
    return newlineIndex + 2;
  }
  return newlineIndex + 1;
}

function getHeaderInsertionText(source, insertOffset) {
  const hasBlankLineAtInsertion = /^[ \t]*(?:\r\n|\n|\r)/.test(
    source.text.slice(insertOffset),
  );
  return hasBlankLineAtInsertion ? `${COMMENT_TEXT}\n` : `${COMMENT_TEXT}\n\n`;
}

function getCommentRemovalRange(source, comment) {
  const text = source.text;
  let [, end] = comment.range;

  if (text.startsWith('\r\n', end)) {
    end += 2;
  } else if (text[end] === '\n' || text[end] === '\r') {
    end += 1;
  }

  const blankLineAfterComment = /^[ \t]*(?:\r\n|\n|\r)/.exec(text.slice(end));

  if (blankLineAfterComment != null) {
    end += blankLineAfterComment[0].length;
  }

  return [comment.range[0], end];
}

export default rule;
