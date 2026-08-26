// Copyright (c) Meta Platforms, Inc. and affiliates.

const MAX_INLINE_COMMENT_LINES = 19;

function normalizeFilename(filename) {
  return filename.replaceAll('\\', '/');
}

function commentText(comments) {
  return comments
    .flatMap(comment => comment.value.split(/\r\n|\n|\r/))
    .map(line => line.trim().replace(/^\*\s?/, ''))
    .filter(Boolean)
    .join(' ');
}

function isAllowed(comments, filename, allow) {
  const normalizedFilename = normalizeFilename(filename);
  const text = commentText(comments);
  return allow.some(
    entry =>
      (normalizedFilename === entry.file ||
        normalizedFilename.endsWith(`/${entry.file}`)) &&
      text.startsWith(entry.startsWith),
  );
}

function groupComments(source) {
  const groups = [];
  for (const comment of source
    .getAllComments()
    .filter(comment => comment.type === 'Line' || comment.type === 'Block')
    .sort((left, right) => left.range[0] - right.range[0])) {
    const previous = groups.at(-1);
    if (
      comment.type === 'Line' &&
      previous?.type === 'Line' &&
      source.text
        .slice(previous.comments.at(-1).range[1], comment.range[0])
        .trim() === ''
    ) {
      previous.comments.push(comment);
    } else {
      groups.push({type: comment.type, comments: [comment]});
    }
  }
  return groups;
}

function isInsideContainer(comments, containers) {
  const start = comments[0].range[0];
  const end = comments.at(-1).range[1];
  return containers.some(
    container => container.range[0] < start && container.range[1] > end,
  );
}

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Keep implementation comment blocks under 20 lines; move longer protocols to a named hook or file-level docblock',
      category: 'Astryx Conventions',
      recommended: true,
    },
    messages: {
      tooLong:
        'This inline implementation comment spans {{lineCount}} lines. Keep the local invariant brief and move the full protocol to a named hook or file-level docblock.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                file: {type: 'string', minLength: 1},
                startsWith: {type: 'string', minLength: 1},
                reason: {type: 'string', minLength: 1},
              },
              required: ['file', 'startsWith', 'reason'],
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const source = context.sourceCode ?? context.getSourceCode();
    const containers = [];
    const allow = context.options[0]?.allow ?? [];

    function rememberContainer(node) {
      containers.push(node);
    }

    return {
      FunctionDeclaration: rememberContainer,
      FunctionExpression: rememberContainer,
      ArrowFunctionExpression: rememberContainer,
      ObjectExpression: rememberContainer,
      'Program:exit'() {
        for (const {comments} of groupComments(source)) {
          const first = comments[0];
          const last = comments.at(-1);
          const lineCount = last.loc.end.line - first.loc.start.line + 1;
          if (
            lineCount <= MAX_INLINE_COMMENT_LINES ||
            !isInsideContainer(comments, containers) ||
            isAllowed(comments, context.filename, allow)
          ) {
            continue;
          }
          context.report({
            loc: {start: first.loc.start, end: last.loc.end},
            messageId: 'tooLong',
            data: {lineCount},
          });
        }
      },
    };
  },
};

export default rule;
