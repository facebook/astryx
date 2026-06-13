// Copyright (c) Meta Platforms, Inc. and affiliates.

export type InlineMarkdownToken =
  | {kind: 'text'; text: string}
  | {kind: 'code'; text: string}
  | {kind: 'strong'; children: InlineMarkdownToken[]}
  | {kind: 'emphasis'; children: InlineMarkdownToken[]}
  | {kind: 'link'; href: string; children: InlineMarkdownToken[]};

export function splitMarkdownParagraphs(markdown: string): string[] {
  return markdown
    .trim()
    .split(/\n{2,}/)
    .map(block => block.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

export function parseInlineMarkdown(markdown: string): InlineMarkdownToken[] {
  return parseTokens(markdown, 0, markdown.length);
}

function parseTokens(
  markdown: string,
  start: number,
  end: number,
): InlineMarkdownToken[] {
  const tokens: InlineMarkdownToken[] = [];
  let i = start;

  while (i < end) {
    if (markdown[i] === '\\' && i + 1 < end) {
      pushText(tokens, markdown[i + 1]);
      i += 2;
      continue;
    }

    if (markdown[i] === '`') {
      const close = findDelimiter(markdown, '`', i + 1, end);
      if (close !== -1) {
        tokens.push({kind: 'code', text: markdown.slice(i + 1, close)});
        i = close + 1;
        continue;
      }
    }

    if (markdown.startsWith('**', i) || markdown.startsWith('__', i)) {
      const delimiter = markdown.slice(i, i + 2);
      const close = findDelimiter(markdown, delimiter, i + 2, end);
      if (close !== -1) {
        tokens.push({
          kind: 'strong',
          children: parseTokens(markdown, i + 2, close),
        });
        i = close + 2;
        continue;
      }
    }

    if (markdown[i] === '*' && !markdown.startsWith('**', i)) {
      const close = findDelimiter(markdown, '*', i + 1, end);
      if (close !== -1) {
        tokens.push({
          kind: 'emphasis',
          children: parseTokens(markdown, i + 1, close),
        });
        i = close + 1;
        continue;
      }
    }

    if (markdown[i] === '[') {
      const closeBracket = findDelimiter(markdown, ']', i + 1, end);
      const openParen = closeBracket + 1;
      if (
        closeBracket !== -1 &&
        openParen < end &&
        markdown[openParen] === '('
      ) {
        const closeParen = findDelimiter(markdown, ')', openParen + 1, end);
        const label = markdown.slice(i + 1, closeBracket);
        const href =
          closeParen === -1
            ? ''
            : markdown.slice(openParen + 1, closeParen).trim();

        if (closeParen !== -1 && label !== '' && isSafeMarkdownHref(href)) {
          tokens.push({
            kind: 'link',
            href,
            children: parseTokens(markdown, i + 1, closeBracket),
          });
          i = closeParen + 1;
          continue;
        }
      }
    }

    const next = findNextSpecial(markdown, i + 1, end);
    pushText(tokens, markdown.slice(i, next));
    i = next;
  }

  return tokens;
}

function pushText(tokens: InlineMarkdownToken[], text: string) {
  if (text === '') {
    return;
  }

  const last = tokens[tokens.length - 1];
  if (last?.kind === 'text') {
    last.text += text;
  } else {
    tokens.push({kind: 'text', text});
  }
}

function findDelimiter(
  source: string,
  delimiter: string,
  from: number,
  end: number,
): number {
  let index = source.indexOf(delimiter, from);

  while (index !== -1 && index < end) {
    if (!isEscaped(source, index)) {
      return index;
    }
    index = source.indexOf(delimiter, index + delimiter.length);
  }

  return -1;
}

function findNextSpecial(source: string, from: number, end: number): number {
  for (let i = from; i < end; i += 1) {
    if ('\\`[*_'.includes(source[i] ?? '')) {
      return i;
    }
  }
  return end;
}

function isEscaped(source: string, index: number): boolean {
  let slashCount = 0;
  for (let i = index - 1; i >= 0 && source[i] === '\\'; i -= 1) {
    slashCount += 1;
  }
  return slashCount % 2 === 1;
}

function isSafeMarkdownHref(href: string): boolean {
  if (href === '') {
    return false;
  }

  const normalized = href.trim().toLowerCase();
  return (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('mailto:') ||
    normalized.startsWith('/') ||
    normalized.startsWith('#')
  );
}
