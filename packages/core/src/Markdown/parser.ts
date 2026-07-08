// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file parser.ts
 * @input Markdown string
 * @output Array of MarkdownNode AST nodes
 * @position Core parser; consumed by Markdown.tsx
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InlineNode =
  | {type: 'text'; content: string}
  | {type: 'bold'; children: InlineNode[]}
  | {type: 'italic'; children: InlineNode[]}
  | {type: 'strikethrough'; children: InlineNode[]}
  | {type: 'code'; content: string}
  | {type: 'link'; href: string; children: InlineNode[]}
  | {type: 'image'; src: string; alt: string}
  | {type: 'citation'; sourceId: string}
  | {type: 'break'};

export type BlockNode =
  | {type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[]}
  | {type: 'paragraph'; children: InlineNode[]}
  | {type: 'codeblock'; language: string; content: string}
  | {type: 'blockquote'; children: BlockNode[]}
  | {
      type: 'list';
      ordered: boolean;
      start?: number;
      /** Ordered-list marker delimiter ('.' or ')'). Undefined for bullets. */
      delimiter?: '.' | ')';
      loose?: boolean;
      items: ListItemNode[];
    }
  | {
      type: 'table';
      headers: TableCellNode[];
      alignments: TableAlignment[];
      rows: TableCellNode[][];
    }
  | {type: 'hr'}
  | {type: 'image'; src: string; alt: string};

export type ListItemNode = {checked?: boolean; children: BlockNode[]};
export type TableCellNode = {children: InlineNode[]};
export type TableAlignment = 'left' | 'center' | 'right' | null;

// ---------------------------------------------------------------------------
// Parse options
// ---------------------------------------------------------------------------

/**
 * Options for the markdown parser entry points.
 *
 * Backward-compatible: the public `parseMarkdown` / `parseInline` /
 * `parseMarkdownIncremental` functions also accept the legacy
 * `ReadonlySet<string>` shape as the second argument.
 */
export type ParseOptions = {
  /** Set of citation source ids — `[id]` / `【id】` markers in this set
   *  become citation nodes instead of plain text / links. */
  sourceIds?: ReadonlySet<string>;
  /**
   * Autolink mode. When set to `'gfm'`, the parser turns bare
   * `https?://…` / `www.…` URLs, `<URL>` / `<email>` angle-bracket
   * forms, and `user@host` emails into `link` inline nodes (per the
   * GitHub Flavored Markdown autolink-literal extension plus the
   * CommonMark §6.5 autolink form). Disabled by default.
   *
   * Two intentional deviations from the strict GFM spec for v1:
   * trailing `&entity;` is not peeled off the URL, and an invalid TLD
   * suffix is not rejected (Astryx accepts any plausible TLD shape).
   */
  autolink?: 'gfm';
};

type ResolvedOptions = {
  readonly sourceIds: ReadonlySet<string> | undefined;
  readonly autolink: 'gfm' | undefined;
  /**
   * Link reference definitions (`[label]: url`) collected from the whole
   * document, keyed by normalized label. Internal only — populated by the
   * block parser, never by the public `ParseOptions`. Enables `parseInlineImpl`
   * to resolve full/collapsed/shortcut reference links and images.
   */
  readonly linkDefs?: ReadonlyMap<string, string>;
};

const EMPTY_OPTS: ResolvedOptions = {sourceIds: undefined, autolink: undefined};

function resolveOptions(
  arg: ReadonlySet<string> | ParseOptions | undefined,
): ResolvedOptions {
  if (arg == null) {
    return EMPTY_OPTS;
  }
  // Duck-type the legacy `ReadonlySet<string>` form: any object whose
  // `.has` is callable is treated as the legacy sourceIds set. This is
  // safer than `instanceof Set`, which would misclassify cross-realm
  // or polyfilled `ReadonlySet` implementations as a `ParseOptions` bag
  // and silently lose citation resolution.
  if (typeof (arg as {has?: unknown}).has === 'function') {
    return {sourceIds: arg as ReadonlySet<string>, autolink: undefined};
  }
  const opts = arg as ParseOptions;
  return {sourceIds: opts.sourceIds, autolink: opts.autolink};
}

// ---------------------------------------------------------------------------
// Link reference definitions
// ---------------------------------------------------------------------------

// A CommonMark link reference definition line: up to 3 leading spaces, a
// bracketed label, `:`, a destination (bare or `<...>`), and an optional
// same-line title (captured as group 4 so a title-less definition can absorb a
// title on the following line). `^`-leading labels (`[^1]:`) are footnote
// definitions — a separate, unsupported feature — and are excluded so they
// pass through verbatim.
const LINK_DEFINITION_RE =
  /^ {0,3}\[([^\]^](?:\\.|[^\]\\])*)\]:[ \t]*(?:<([^<>\n]*)>|(\S+))([ \t]+(?:"[^"\n]*"|'[^'\n]*'|\([^()\n]*\)))?[ \t]*$/;

// A line that is nothing but a title — the continuation form allowed when a
// definition's destination is followed by its title on the next line.
const LINK_TITLE_ONLY_RE = /^ {0,3}(?:"[^"\n]*"|'[^'\n]*'|\([^()\n]*\))[ \t]*$/;

// CommonMark matches reference labels case-insensitively with leading/trailing
// whitespace stripped and internal whitespace runs collapsed to one space.
function normalizeLinkLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLowerCase();
}

function matchLinkDefinition(
  line: string,
): {label: string; destination: string; hasTitle: boolean} | null {
  const match = LINK_DEFINITION_RE.exec(line);
  if (match == null) {
    return null;
  }
  const label = normalizeLinkLabel(match[1]);
  // `match[2]` is the `<...>` destination (present but possibly empty, e.g.
  // `<>` → empty href, valid per CommonMark); `match[3]` is the bare
  // destination (always non-empty). One of the two always matches.
  const destination = match[2] != null ? match[2] : match[3];
  if (label === '' || destination == null) {
    return null;
  }
  return {label, destination, hasTitle: match[4] != null};
}

/**
 * Collect link reference definitions from the whole document and return the
 * input with the definition lines removed. A definition is recognized at a
 * block boundary — document start, after a blank line, after another
 * definition, or after a self-contained block (heading / thematic break /
 * closed fenced code) — but never inside a fenced code block or as a lazy
 * continuation of a paragraph, honoring CommonMark's rule that a definition
 * cannot interrupt a paragraph. First definition wins, and definitions produce
 * no output so stripping unreferenced ones is correct.
 *
 * Scope limit: definitions are collected at the top level only, and a
 * definition directly following a list, blockquote, or table (with no blank
 * line between) is not recognized. A definition nested inside a blockquote or
 * list item resolves within that container (via the recursive parse) but is
 * not exposed to references elsewhere in the document, unlike full CommonMark
 * where every definition is global. Separating a footer definition block with
 * a blank line — the usual form — always works.
 */
function extractLinkDefinitions(input: string): {
  defs: ReadonlyMap<string, string>;
  cleaned: string;
} {
  const lines = input.split('\n');
  const defs = new Map<string, string>();
  const keep = new Array<boolean>(lines.length).fill(true);
  let atBoundary = true;
  let inFence = false;
  let fenceMarker = '';

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (inFence) {
      if (line.startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = '';
        // The line after a closed fence begins a new block.
        atBoundary = true;
      } else {
        atBoundary = false;
      }
      continue;
    }
    const fenceMatch = line.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      inFence = true;
      fenceMarker = fenceMatch[1];
      atBoundary = false;
      continue;
    }
    if (line.trim() === '') {
      atBoundary = true;
      continue;
    }
    if (atBoundary) {
      const def = matchLinkDefinition(line);
      if (def != null) {
        if (!defs.has(def.label)) {
          defs.set(def.label, def.destination);
        }
        keep[index] = false;
        // A title-less definition absorbs a title on the following line
        // (CommonMark), which then also produces no output.
        if (
          !def.hasTitle &&
          index + 1 < lines.length &&
          LINK_TITLE_ONLY_RE.test(lines[index + 1])
        ) {
          keep[index + 1] = false;
          index++;
        }
        // Consecutive definitions stay at a block boundary.
        continue;
      }
    }
    // A heading or thematic break is a self-contained single-line block, so
    // the next line begins a new block where a definition may appear.
    atBoundary = /^ {0,3}#{1,6}(?: |\t|$)/.test(line) || isHorizontalRule(line);
  }

  if (defs.size === 0) {
    return {defs, cleaned: input};
  }
  const cleaned = lines.filter((_, index) => keep[index]).join('\n');
  return {defs, cleaned};
}

/** Order-independent signature of a link-definition set, for cache checks. */
function linkDefsSignature(defs: ReadonlyMap<string, string>): string {
  if (defs.size === 0) {
    return '';
  }
  return [...defs]
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([label, dest]) => `${label}\u0000${dest}`)
    .join('\u0001');
}

/**
 * Resolve a full (`[text][label]`), collapsed (`[text][]`), or shortcut
 * (`[text]`) reference at `start` (which points at `[`) against `linkDefs`.
 * Returns the node plus the index just past the reference, or null when it is
 * not a resolvable reference (caller falls through to literal handling).
 */
function matchReferenceLink(
  text: string,
  start: number,
  linkDefs: ReadonlyMap<string, string>,
  opts: ResolvedOptions,
): {node: InlineNode; end: number} | null {
  const textClose = text.indexOf(']', start + 1);
  if (textClose === -1) {
    return null;
  }
  const linkText = text.slice(start + 1, textClose);
  // Full `[text][label]` / collapsed `[text][]` — a matching definition wins.
  if (text[textClose + 1] === '[') {
    const labelClose = text.indexOf(']', textClose + 2);
    if (labelClose !== -1) {
      const rawLabel = text.slice(textClose + 2, labelClose);
      // Only truly-empty brackets are the collapsed form; a whitespace-only
      // label (`[ ]`) is a full reference whose normalized label is empty and
      // matches nothing.
      const label = rawLabel === '' ? linkText : rawLabel;
      const href = linkDefs.get(normalizeLinkLabel(label));
      if (href != null) {
        return {
          node: {type: 'link', href, children: parseInlineImpl(linkText, opts)},
          end: labelClose + 1,
        };
      }
      // No match — fall back to a shortcut `[text]` (CommonMark back-off),
      // leaving the trailing `[label]` to be parsed separately.
    }
  }
  // Shortcut: `[text]`.
  if (linkText.trim() === '') {
    return null;
  }
  const href = linkDefs.get(normalizeLinkLabel(linkText));
  if (href == null) {
    return null;
  }
  return {
    node: {type: 'link', href, children: parseInlineImpl(linkText, opts)},
    end: textClose + 1,
  };
}

/** Reference-image equivalent of {@link matchReferenceLink} (`![alt][label]`). */
function matchReferenceImage(
  text: string,
  start: number,
  linkDefs: ReadonlyMap<string, string>,
): {node: InlineNode; end: number} | null {
  const altClose = text.indexOf(']', start + 2);
  if (altClose === -1) {
    return null;
  }
  const alt = text.slice(start + 2, altClose);
  if (text[altClose + 1] === '[') {
    const labelClose = text.indexOf(']', altClose + 2);
    if (labelClose !== -1) {
      const rawLabel = text.slice(altClose + 2, labelClose);
      const label = rawLabel === '' ? alt : rawLabel;
      const src = linkDefs.get(normalizeLinkLabel(label));
      if (src != null) {
        return {node: {type: 'image', src, alt}, end: labelClose + 1};
      }
      // No match — fall back to a shortcut `![alt]`.
    }
  }
  if (alt.trim() === '') {
    return null;
  }
  const src = linkDefs.get(normalizeLinkLabel(alt));
  if (src == null) {
    return null;
  }
  return {node: {type: 'image', src, alt}, end: altClose + 1};
}

// ---------------------------------------------------------------------------
// Inline parser helpers
// ---------------------------------------------------------------------------

/** Find closing ')' that balances nested parentheses. */
function findClosingParen(text: string, start: number): number {
  let depth = 1;
  for (let index = start; index < text.length; index++) {
    if (text[index] === '(') {
      depth++;
    } else if (text[index] === ')') {
      depth--;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

function isWordChar(ch: string | undefined): boolean {
  if (ch == null) {
    return false;
  }
  return /\w/.test(ch);
}

// ---------------------------------------------------------------------------
// Inline parser
// ---------------------------------------------------------------------------

/**
 * Match a fullwidth bracket citation 【id】 at position `i`.
 * Returns the sourceId and end index, or null if no match.
 */
function matchFullwidthCitation(
  text: string,
  i: number,
  opts: ResolvedOptions,
): {sourceId: string; end: number} | null {
  if (!opts.sourceIds || text[i] !== '\u3010') {
    return null;
  }
  const closeIndex = text.indexOf('\u3011', i + 1);
  if (closeIndex === -1) {
    return null;
  }
  const id = text.slice(i + 1, closeIndex);
  if (id.length === 0 || !opts.sourceIds.has(id)) {
    return null;
  }
  return {sourceId: id, end: closeIndex + 1};
}

/**
 * Match a bracket citation [id] at position `i`.
 * Only matches if the id exists in sourceIds and is NOT followed by `(` (link).
 */
function matchBracketCitation(
  text: string,
  i: number,
  opts: ResolvedOptions,
): {sourceId: string; end: number} | null {
  if (!opts.sourceIds || text[i] !== '[') {
    return null;
  }
  const closeIndex = text.indexOf(']', i + 1);
  if (closeIndex === -1) {
    return null;
  }
  if (text[closeIndex + 1] === '(') {
    return null;
  }
  const id = text.slice(i + 1, closeIndex);
  if (id.length === 0 || !opts.sourceIds.has(id)) {
    return null;
  }
  return {sourceId: id, end: closeIndex + 1};
}

export function parseInline(
  text: string,
  sourceIds?: ReadonlySet<string>,
): InlineNode[];
export function parseInline(text: string, options: ParseOptions): InlineNode[];
export function parseInline(
  text: string,
  arg?: ReadonlySet<string> | ParseOptions,
): InlineNode[] {
  return parseInlineEntry(text, resolveOptions(arg));
}

/**
 * Internal block-level inline entry point: parses, then applies the GFM
 * autolink transform when enabled. Recursive calls inside `parseInlineImpl`
 * (link labels, bold/italic/strikethrough bodies) intentionally bypass this
 * wrapper and call `parseInlineImpl` directly so the transform runs only on
 * the outermost block's inline tree — letting `transformAutolinks` decide
 * which subtrees to descend into (text, bold, italic, strikethrough) and
 * which to skip (link, code, image, citation, break).
 */
function parseInlineEntry(text: string, opts: ResolvedOptions): InlineNode[] {
  const nodes = parseInlineImpl(text, opts);
  return opts.autolink === 'gfm' ? transformAutolinks(nodes) : nodes;
}

function parseInlineImpl(text: string, opts: ResolvedOptions): InlineNode[] {
  const nodes: InlineNode[] = [];
  let i = 0;

  while (i < text.length) {
    // --- Escape ---
    if (text[i] === '\\' && i + 1 < text.length) {
      nodes.push({type: 'text', content: text[i + 1]});
      i += 2;
      continue;
    }

    // --- Inline code ---
    if (text[i] === '`') {
      const tickCount = text[i + 1] === '`' ? (text[i + 2] === '`' ? 3 : 2) : 1;
      const openIndex = i + tickCount;
      const closeIndex = text.indexOf('`'.repeat(tickCount), openIndex);
      if (closeIndex !== -1) {
        nodes.push({type: 'code', content: text.slice(openIndex, closeIndex)});
        i = closeIndex + tickCount;
        continue;
      }
    }

    // --- Citation: fullwidth 【id】 ---
    {
      const citation = matchFullwidthCitation(text, i, opts);
      if (citation) {
        nodes.push({type: 'citation', sourceId: citation.sourceId});
        i = citation.end;
        continue;
      }
    }

    // --- Image ![alt](src) ---
    if (text[i] === '!' && text[i + 1] === '[') {
      const altClose = text.indexOf(']', i + 2);
      if (altClose !== -1 && text[altClose + 1] === '(') {
        const srcClose = findClosingParen(text, altClose + 2);
        if (srcClose !== -1) {
          nodes.push({
            type: 'image',
            src: text.slice(altClose + 2, srcClose),
            alt: text.slice(i + 2, altClose),
          });
          i = srcClose + 1;
          continue;
        }
      }
    }

    // --- Reference image ![alt][label] / ![alt][] / ![alt] ---
    if (opts.linkDefs != null && text[i] === '!' && text[i + 1] === '[') {
      const ref = matchReferenceImage(text, i, opts.linkDefs);
      if (ref) {
        nodes.push(ref.node);
        i = ref.end;
        continue;
      }
    }

    // --- Citation: bracket [id] (before link — link requires `(` after `]`) ---
    {
      const citation = matchBracketCitation(text, i, opts);
      if (citation) {
        nodes.push({type: 'citation', sourceId: citation.sourceId});
        i = citation.end;
        continue;
      }
    }

    // --- Link [text](url) ---
    if (text[i] === '[') {
      const textClose = text.indexOf(']', i + 1);
      if (textClose !== -1 && text[textClose + 1] === '(') {
        const urlClose = findClosingParen(text, textClose + 2);
        if (urlClose !== -1) {
          nodes.push({
            type: 'link',
            href: text.slice(textClose + 2, urlClose),
            children: parseInlineImpl(text.slice(i + 1, textClose), opts),
          });
          i = urlClose + 1;
          continue;
        }
      }
    }

    // --- Reference link [text][label] / [text][] / [text] ---
    if (opts.linkDefs != null && text[i] === '[') {
      const ref = matchReferenceLink(text, i, opts.linkDefs, opts);
      if (ref) {
        nodes.push(ref.node);
        i = ref.end;
        continue;
      }
    }

    // --- Bold-italic: *** or ___ ---
    if (
      (text[i] === '*' && text[i + 1] === '*' && text[i + 2] === '*') ||
      (text[i] === '_' && text[i + 1] === '_' && text[i + 2] === '_')
    ) {
      const marker = text.slice(i, i + 3);
      const isUnderscore = text[i] === '_';
      if (isUnderscore && isWordChar(text[i - 1])) {
        // mid-word underscore — fall through
      } else {
        const closeIndex = text.indexOf(marker, i + 3);
        if (
          closeIndex !== -1 &&
          (!isUnderscore || !isWordChar(text[closeIndex + 3]))
        ) {
          nodes.push({
            type: 'bold',
            children: [
              {
                type: 'italic',
                children: parseInlineImpl(text.slice(i + 3, closeIndex), opts),
              },
            ],
          });
          i = closeIndex + 3;
          continue;
        }
      }
    }

    // --- Bold: ** or __ ---
    if (
      (text[i] === '*' && text[i + 1] === '*') ||
      (text[i] === '_' && text[i + 1] === '_')
    ) {
      const marker = text.slice(i, i + 2);
      const isUnderscore = text[i] === '_';
      if (isUnderscore && isWordChar(text[i - 1])) {
        // mid-word underscore — fall through
      } else {
        const closeIndex = text.indexOf(marker, i + 2);
        if (
          closeIndex !== -1 &&
          (!isUnderscore || !isWordChar(text[closeIndex + 2]))
        ) {
          nodes.push({
            type: 'bold',
            children: parseInlineImpl(text.slice(i + 2, closeIndex), opts),
          });
          i = closeIndex + 2;
          continue;
        }
      }
    }

    // --- Strikethrough: ~~ ---
    if (text[i] === '~' && text[i + 1] === '~') {
      const closeIndex = text.indexOf('~~', i + 2);
      if (closeIndex !== -1) {
        nodes.push({
          type: 'strikethrough',
          children: parseInlineImpl(text.slice(i + 2, closeIndex), opts),
        });
        i = closeIndex + 2;
        continue;
      }
    }

    // --- Italic: * or _ ---
    if (text[i] === '*' || text[i] === '_') {
      const isUnderscore = text[i] === '_';
      if (isUnderscore && isWordChar(text[i - 1])) {
        // mid-word underscore — fall through
      } else {
        const closeIndex = text.indexOf(text[i], i + 1);
        if (
          closeIndex !== -1 &&
          closeIndex > i + 1 &&
          (!isUnderscore || !isWordChar(text[closeIndex + 1]))
        ) {
          nodes.push({
            type: 'italic',
            children: parseInlineImpl(text.slice(i + 1, closeIndex), opts),
          });
          i = closeIndex + 1;
          continue;
        }
      }
    }

    // --- Plain text (with line-break detection) ---
    let end = i + 1;
    while (end < text.length && !'*_~`[!\\\n\u3010'.includes(text[end])) {
      end++;
    }

    const content = text.slice(i, end);

    // Detect trailing-space line break: 2+ spaces immediately before \n
    if (end < text.length && text[end] === '\n') {
      const trimmed = content.replace(/ +$/, '');
      if (content.length - trimmed.length >= 2) {
        if (trimmed.length > 0) {
          const last = nodes[nodes.length - 1];
          if (last?.type === 'text') {
            last.content += trimmed;
          } else {
            nodes.push({type: 'text', content: trimmed});
          }
        }
        nodes.push({type: 'break'});
        i = end + 1;
        continue;
      }
    }

    const last = nodes[nodes.length - 1];
    if (last?.type === 'text') {
      last.content += content;
    } else {
      nodes.push({type: 'text', content});
    }
    i = end;
  }
  return nodes;
}

// ---------------------------------------------------------------------------
// GFM autolink post-pass (opt-in via ParseOptions.autolink === 'gfm')
// ---------------------------------------------------------------------------

// Character classes used in autolink patterns.
const ANY_NON_WHITESPACE_OR_ANGLE = '[^\\s<]+';
const SCHEME = 'https?:\\/\\/';
const EMAIL_LOCAL_PART = '[A-Za-z0-9._%+-]+';
const DOMAIN_LABEL = '[A-Za-z0-9-]+';
const DOMAIN_WITH_DOT = `${DOMAIN_LABEL}(?:\\.${DOMAIN_LABEL})+`;
const ANGLE_SCHEME = '[a-zA-Z][a-zA-Z0-9+.-]*';
const ANGLE_URL_BODY = '[^<>\\s]*';

/** Bare http(s) URL up to whitespace or `<`. Trailing punctuation is peeled afterwards. */
const URL_LITERAL_RE = new RegExp(
  `${SCHEME}${ANY_NON_WHITESPACE_OR_ANGLE}`,
  'g',
);

/** Bare www. URL. Resulting href gets `http://` prepended. */
const WWW_LITERAL_RE = new RegExp(`www\\.${ANY_NON_WHITESPACE_OR_ANGLE}`, 'g');

/** Bare email: local-part@domain (at least one dot in domain). */
const EMAIL_LITERAL_RE = new RegExp(
  `${EMAIL_LOCAL_PART}@${DOMAIN_WITH_DOT}`,
  'g',
);

/** Angle-bracket autolink: `<scheme:url>` (CommonMark §6.5). */
const ANGLE_URL_RE = new RegExp(`<(${ANGLE_SCHEME}:${ANGLE_URL_BODY})>`, 'g');

/** Angle-bracket email: `<user@host.tld>`. */
const ANGLE_EMAIL_RE = new RegExp(
  `<(${EMAIL_LOCAL_PART}@${DOMAIN_WITH_DOT})>`,
  'g',
);

/** Characters treated as trailing sentence punctuation per GFM §6.9. */
const TRAILING_PUNCT_CHARS = new Set('?!.,:*_~');

/** Characters valid in an email local part (used for boundary detection). */
const EMAIL_LOCAL_CHARS = new Set(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._%+-@',
);

interface AutolinkMatch {
  start: number;
  end: number;
  href: string;
  display: string;
}

/**
 * Peel trailing sentence-end punctuation and unbalanced trailing `)` off a
 * bare URL. Mirrors GFM §6.9: `?!.,:*_~` immediately after the URL aren't
 * part of it; a trailing `)` is excluded if there are more `)` than `(` in
 * the candidate (so `(https://example.com)` ends at the second `)` but
 * `https://example.com/Foo_(bar)` keeps the inner pair).
 */
function peelTrailingPunctAndParens(url: string): string {
  let s = url;
  while (s.length > 0) {
    // Peel trailing punctuation characters in one pass.
    if (TRAILING_PUNCT_CHARS.has(s[s.length - 1])) {
      let end = s.length - 1;
      while (end > 0 && TRAILING_PUNCT_CHARS.has(s[end - 1])) {
        end--;
      }
      s = s.slice(0, end);
      continue;
    }
    if (s.endsWith(')')) {
      let open = 0;
      let close = 0;
      for (let idx = 0; idx < s.length; idx++) {
        if (s[idx] === '(') {
          open++;
        } else if (s[idx] === ')') {
          close++;
        }
      }
      if (close > open) {
        s = s.slice(0, -1);
        continue;
      }
    }
    break;
  }
  return s;
}

/** Characters that, when preceding a URL, indicate it's part of a larger token. */
const URL_CONTINUATION_CHARS = new Set(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/=',
);

/**
 * The character immediately before a bare-URL or bare-www match must not
 * make the URL look like the tail of a larger token (`xhttps`, `=https://`,
 * `/https://`). null means start-of-text — always allowed.
 */
function isUrlBoundaryChar(ch: string | undefined): boolean {
  if (ch == null) {
    return true;
  }
  return !URL_CONTINUATION_CHARS.has(ch);
}

function scanAutolinksInText(text: string): AutolinkMatch[] {
  const matches: AutolinkMatch[] = [];

  // <scheme:url> angle-bracket form
  {
    const re = new RegExp(ANGLE_URL_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const url = m[1];
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        href: url,
        display: url,
      });
    }
  }

  // <email> angle-bracket form
  {
    const re = new RegExp(ANGLE_EMAIL_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const email = m[1];
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        href: `mailto:${email}`,
        display: email,
      });
    }
  }

  // bare https?:// URL
  {
    const re = new RegExp(URL_LITERAL_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const prev = text[m.index - 1];
      if (!isUrlBoundaryChar(prev)) {
        continue;
      }
      if (text.slice(m.index - 2, m.index) === '](') {
        continue;
      }
      const cleaned = peelTrailingPunctAndParens(m[0]);
      if (cleaned.length === 0) {
        continue;
      }
      matches.push({
        start: m.index,
        end: m.index + cleaned.length,
        href: cleaned,
        display: cleaned,
      });
    }
  }

  // bare www. URL
  {
    const re = new RegExp(WWW_LITERAL_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const prev = text[m.index - 1];
      if (!isUrlBoundaryChar(prev)) {
        continue;
      }
      // Don't match inside an https://www… capture from the previous pattern
      if (text.slice(m.index - 3, m.index) === '://') {
        continue;
      }
      const cleaned = peelTrailingPunctAndParens(m[0]);
      if (cleaned.length === 0) {
        continue;
      }
      matches.push({
        start: m.index,
        end: m.index + cleaned.length,
        href: `http://${cleaned}`,
        display: cleaned,
      });
    }
  }

  // bare email
  {
    const re = new RegExp(EMAIL_LITERAL_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const prev = text[m.index - 1];
      // Reject if previous char could be part of the local part or sits in
      // a position that would make this match continuation of something
      // bigger (`name@x.y@host`, `foo+bar@x`, `mailto:user@host`).
      if (prev != null && EMAIL_LOCAL_CHARS.has(prev)) {
        continue;
      }
      if (text.slice(Math.max(0, m.index - 7), m.index) === 'mailto:') {
        continue;
      }
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        href: `mailto:${m[0]}`,
        display: m[0],
      });
    }
  }

  // Sort by start; first-match-wins on overlaps so e.g. an angle-bracket
  // <https://x> outranks the bare https://x inside it.
  matches.sort((a, b) => a.start - b.start);
  const resolved: AutolinkMatch[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      resolved.push(m);
      lastEnd = m.end;
    }
  }
  return resolved;
}

/**
 * Split a text-node `content` string into a sequence of text + link nodes
 * based on autolink matches.
 */
function splitTextOnAutolinks(content: string): InlineNode[] {
  const matches = scanAutolinksInText(content);
  if (matches.length === 0) {
    return [{type: 'text', content}];
  }
  const out: InlineNode[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) {
      out.push({type: 'text', content: content.slice(cursor, m.start)});
    }
    out.push({
      type: 'link',
      href: m.href,
      children: [{type: 'text', content: m.display}],
    });
    cursor = m.end;
  }
  if (cursor < content.length) {
    out.push({type: 'text', content: content.slice(cursor)});
  }
  return out;
}

/**
 * Walk an inline-node tree and replace bare URLs / emails inside `text`
 * nodes with `link` nodes. Recurses into emphasis containers
 * (`bold`/`italic`/`strikethrough`) so wrapped URLs link too, but never
 * descends into existing `link` children (no nested links), `code` content,
 * `image` alt text, `citation`, or `break`. Runs only on the outermost
 * block's inline tree (see `parseInlineEntry`).
 */
function transformAutolinks(nodes: InlineNode[]): InlineNode[] {
  const out: InlineNode[] = [];
  for (const node of nodes) {
    if (node.type === 'text') {
      const split = splitTextOnAutolinks(node.content);
      for (const seg of split) {
        const last = out[out.length - 1];
        if (seg.type === 'text' && last?.type === 'text') {
          last.content += seg.content;
        } else {
          out.push(seg);
        }
      }
    } else if (
      node.type === 'bold' ||
      node.type === 'italic' ||
      node.type === 'strikethrough'
    ) {
      out.push({...node, children: transformAutolinks(node.children)});
    } else {
      out.push(node);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Block parser helpers
// ---------------------------------------------------------------------------

function getIndent(line: string): number {
  let count = 0;
  while (count < line.length && line[count] === ' ') {
    count++;
  }
  return count;
}

/** HR: 3+ identical markers (-, *, _) optionally separated by spaces. */
function isHorizontalRule(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3) {
    return false;
  }
  const stripped = trimmed.replace(/ /g, '');
  if (stripped.length < 3) {
    return false;
  }
  const ch = stripped[0];
  if (ch !== '-' && ch !== '*' && ch !== '_') {
    return false;
  }
  for (let idx = 1; idx < stripped.length; idx++) {
    if (stripped[idx] !== ch) {
      return false;
    }
  }
  return true;
}

/** GFM separator row: cells contain only dashes/colons. */
function isTableSeparator(line: string): boolean {
  if (!line.includes('|')) {
    return false;
  }
  const cells = line.split('|').map(cell => cell.trim());
  const nonEmpty = cells.filter(cell => cell.length > 0);
  return nonEmpty.length > 0 && nonEmpty.every(cell => /^:?-+:?$/.test(cell));
}

/**
 * Returns true when a line could start a new block — used to stop paragraph
 * continuation.  Every regex here uses bounded or single-class quantifiers
 * to avoid ReDoS.
 */
function isBlockStart(line: string): boolean {
  if (/^#{1,6} /.test(line)) {
    return true;
  }
  if (/^(`{3,}|~{3,})/.test(line)) {
    return true;
  }
  if (isHorizontalRule(line)) {
    return true;
  }
  if (line.startsWith('> ') || line === '>') {
    return true;
  }
  if (/^ {0,9}[-*+] /.test(line)) {
    return true;
  }
  if (/^ {0,9}0*1[.)] /.test(line)) {
    return true;
  }
  if (line.includes('|')) {
    return true;
  }
  return false;
}

function splitTableRow(line: string): string[] {
  let start = 0;
  let end = line.length;
  if (line.startsWith('|')) {
    start = 1;
    while (start < end && line[start] === ' ') {
      start++;
    }
  }
  while (end > start && line[end - 1] === ' ') {
    end--;
  }
  if (end > start && line[end - 1] === '|') {
    end--;
  }
  // Split on unescaped pipes (not preceded by backslash)
  const content = line.slice(start, end);
  const cells: string[] = [];
  let current = '';
  for (let i = 0; i < content.length; i++) {
    if (
      content[i] === '\\' &&
      i + 1 < content.length &&
      content[i + 1] === '|'
    ) {
      // Escaped pipe — keep the backslash-pipe literal for parseInline to handle
      current += '\\|';
      i++;
    } else if (content[i] === '|') {
      cells.push(current.trim());
      current = '';
    } else {
      current += content[i];
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseTable(
  lines: string[],
  lineIndex: number,
  opts: ResolvedOptions,
): {node: BlockNode; nextIndex: number} {
  const headers: TableCellNode[] = splitTableRow(lines[lineIndex]).map(
    cell => ({children: parseInlineEntry(cell, opts)}),
  );
  const alignments: TableAlignment[] = splitTableRow(lines[lineIndex + 1]).map(
    cell => {
      const trimmed = cell.trim();
      const leftAligned = trimmed.startsWith(':');
      const rightAligned = trimmed.endsWith(':');
      return leftAligned && rightAligned
        ? 'center'
        : rightAligned
          ? 'right'
          : leftAligned
            ? 'left'
            : null;
    },
  );
  const rows: TableCellNode[][] = [];
  let rowIndex = lineIndex + 2;
  while (
    rowIndex < lines.length &&
    lines[rowIndex].includes('|') &&
    lines[rowIndex].trim() !== ''
  ) {
    rows.push(
      splitTableRow(lines[rowIndex]).map(cell => ({
        children: parseInlineEntry(cell, opts),
      })),
    );
    rowIndex++;
  }
  return {
    node: {type: 'table', headers, alignments, rows},
    nextIndex: rowIndex,
  };
}

function parseList(
  lines: string[],
  startIndex: number,
  ordered: boolean,
  opts: ResolvedOptions,
): {node: BlockNode; nextIndex: number} {
  const items: ListItemNode[] = [];
  const baseIndent = getIndent(lines[startIndex]);
  // Ordered lists may use either '.' or ')' as the marker delimiter
  // (CommonMark 5.2). Capture which one this list starts with so its items
  // must all share it — a change of delimiter starts a new list.
  const orderedStart = ordered
    ? lines[startIndex].match(/^ *(\d+)([.)]) /)
    : null;
  const delim = orderedStart ? orderedStart[2] : '.';
  const escDelim = `\\${delim}`;
  const itemPattern = ordered
    ? new RegExp(`^ {${baseIndent}}\\d+${escDelim} `)
    : new RegExp(`^ {${baseIndent}}[-*+] `);

  const start = orderedStart ? parseInt(orderedStart[1], 10) : undefined;

  let loose = false;
  let index = startIndex;
  while (index < lines.length && itemPattern.test(lines[index])) {
    const content = ordered
      ? lines[index].replace(new RegExp(`^ *\\d+${escDelim} `), '')
      : lines[index].replace(/^ *[-*+] /, '');

    const taskMatch = content.match(/^\[([ xX])\] (.*)/);
    let checked: boolean | undefined;
    let itemText: string;
    if (taskMatch) {
      checked = taskMatch[1].toLowerCase() === 'x';
      itemText = taskMatch[2];
    } else {
      itemText = content;
    }

    index++;

    // Collect sub-content (nested items or continuation lines)
    const subLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() !== '' &&
      getIndent(lines[index]) > baseIndent
    ) {
      subLines.push(lines[index]);
      index++;
    }

    if (subLines.length > 0) {
      const minSubIndent = Math.min(
        ...subLines.map(subLine => getIndent(subLine)),
      );
      const deindented = subLines.map(subLine => subLine.slice(minSubIndent));
      itemText += '\n' + deindented.join('\n');
    }

    items.push({checked, children: parseMarkdownImpl(itemText, opts)});

    // CommonMark loose list: blank line(s) between items of the same style
    // and indent still form one list. Skip the blanks and continue if the
    // next non-blank line matches the same item pattern.
    let lookahead = index;
    while (lookahead < lines.length && lines[lookahead].trim() === '') {
      lookahead++;
    }
    if (
      lookahead > index &&
      lookahead < lines.length &&
      itemPattern.test(lines[lookahead])
    ) {
      loose = true;
      index = lookahead;
    }
  }
  return {
    node: {
      type: 'list',
      ordered,
      start,
      delimiter: ordered ? (delim as '.' | ')') : undefined,
      loose: loose || undefined,
      items,
    },
    nextIndex: index,
  };
}

// ---------------------------------------------------------------------------
// Main block parser
// ---------------------------------------------------------------------------

export function parseMarkdown(
  input: string,
  sourceIds?: ReadonlySet<string>,
): BlockNode[];
export function parseMarkdown(
  input: string,
  options: ParseOptions,
): BlockNode[];
export function parseMarkdown(
  input: string,
  arg?: ReadonlySet<string> | ParseOptions,
): BlockNode[] {
  return parseMarkdownImpl(input, resolveOptions(arg));
}

function parseMarkdownImpl(
  input: string,
  baseOpts: ResolvedOptions,
): BlockNode[] {
  // Collect this input's link reference definitions and strip their lines,
  // then merge them with any definitions inherited from an enclosing parse
  // (the incremental parser passes the whole document's definitions in; a
  // recursive blockquote/list parse inherits the outer definitions). Inherited
  // definitions win on conflict, matching CommonMark's first-definition-wins
  // in document order; locally-nested definitions still resolve within this
  // parse.
  const {defs, cleaned} = extractLinkDefinitions(input);
  const inherited = baseOpts.linkDefs;
  let linkDefs: ReadonlyMap<string, string> | undefined;
  if (defs.size === 0) {
    linkDefs = inherited;
  } else if (inherited == null) {
    linkDefs = defs;
  } else {
    linkDefs = new Map<string, string>([...defs, ...inherited]);
  }
  const opts: ResolvedOptions =
    linkDefs != null ? {...baseOpts, linkDefs} : baseOpts;
  const lines = cleaned.split('\n');
  const blocks: BlockNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line.trim() === '') {
      index++;
      continue;
    }

    // --- Fenced code block ---
    const fenceMatch = line.match(/^(`{3,}|~{3,})(\w*)/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      const language = fenceMatch[2] || 'plaintext';
      const codeLines: string[] = [];
      index++;
      while (index < lines.length && !lines[index].startsWith(fence)) {
        codeLines.push(lines[index]);
        index++;
      }
      index++; // skip closing fence
      blocks.push({type: 'codeblock', language, content: codeLines.join('\n')});
      continue;
    }

    // --- Heading ---
    const headingMatch = line.match(/^(#{1,6}) +(.*)/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        children: parseInlineEntry(headingMatch[2], opts),
      });
      index++;
      continue;
    }

    // --- HR (must precede list check to handle `- - -`, `* * *`, `_ _ _`) ---
    if (isHorizontalRule(line)) {
      blocks.push({type: 'hr'});
      index++;
      continue;
    }

    // --- Standalone image ---
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch && line.trim() === imageMatch[0]) {
      blocks.push({type: 'image', alt: imageMatch[1], src: imageMatch[2]});
      index++;
      continue;
    }

    // --- Table (with or without leading pipe) ---
    if (
      index + 1 < lines.length &&
      line.includes('|') &&
      isTableSeparator(lines[index + 1])
    ) {
      const tableResult = parseTable(lines, index, opts);
      blocks.push(tableResult.node);
      index = tableResult.nextIndex;
      continue;
    }

    // --- Blockquote ---
    if (line.startsWith('> ') || line === '>') {
      const quoteLines: string[] = [];
      while (
        index < lines.length &&
        (lines[index].startsWith('> ') || lines[index] === '>')
      ) {
        quoteLines.push(lines[index].replace(/^> ?/, ''));
        index++;
      }
      blocks.push({
        type: 'blockquote',
        children: parseMarkdownImpl(quoteLines.join('\n'), opts),
      });
      continue;
    }

    // --- Unordered list ---
    if (/^ {0,9}[-*+] /.test(line)) {
      const listResult = parseList(lines, index, false, opts);
      blocks.push(listResult.node);
      index = listResult.nextIndex;
      continue;
    }

    // --- Ordered list ---
    if (/^ {0,9}\d+[.)] /.test(line)) {
      const listResult = parseList(lines, index, true, opts);
      blocks.push(listResult.node);
      index = listResult.nextIndex;
      continue;
    }

    // --- Paragraph ---
    const paraLines: string[] = [line];
    index++;
    while (
      index < lines.length &&
      !isBlockStart(lines[index]) &&
      lines[index].trim() !== ''
    ) {
      paraLines.push(lines[index]);
      index++;
    }
    blocks.push({
      type: 'paragraph',
      children: parseInlineEntry(paraLines.join('\n'), opts),
    });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Incremental parsing
// ---------------------------------------------------------------------------

export interface IncrementalState {
  prevInput: string;
  settledText: string;
  settledBlocks: BlockNode[];
  settledUpTo: number;
  /**
   * The `autolink` option the cached `settledBlocks` were parsed with.
   * `parseMarkdownIncremental` invalidates the cache when the caller flips
   * this option, so already-settled URLs flip between link/text along
   * with newly-arriving content.
   */
  autolink?: 'gfm';
  /**
   * Signature of the link reference definitions the cached `settledBlocks`
   * were parsed with. Definitions are document-global and typically arrive
   * (in a footer) after the references that use them, so when the set changes
   * the settled cache is invalidated to let earlier references resolve.
   */
  linkDefsKey?: string;
}

export function createIncrementalState(): IncrementalState {
  return {prevInput: '', settledText: '', settledBlocks: [], settledUpTo: 0};
}

/**
 * Find the line-index of the last blank line that is NOT inside a fenced code
 * block.  Returns -1 when nothing is settled (unclosed fence or no blank line).
 */
function findSettledBoundary(lines: string[]): number {
  let inFence = false;
  let fenceMarker = '';
  let lastBoundary = -1;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    // Fence open / close — match the specific marker character and length
    const fenceMatch = line.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fenceMatch[1];
      } else if (
        fenceMatch[1].startsWith(fenceMarker[0]) &&
        fenceMatch[1].length >= fenceMarker.length
      ) {
        inFence = false;
        fenceMarker = '';
      }
    }

    if (!inFence && line.trim() === '' && lineIndex > 0) {
      lastBoundary = lineIndex;
    }
  }

  return inFence ? -1 : lastBoundary;
}

/**
 * Strip trailing incomplete inline syntax that appears during streaming.
 * Only affects the tail of the last line — safe to apply to the full string.
 */
export function trimStreamingArtifacts(input: string): string {
  const lastNL = input.lastIndexOf('\n');
  const prefix = lastNL === -1 ? '' : input.slice(0, lastNL + 1);
  let tail = lastNL === -1 ? input : input.slice(lastNL + 1);

  // Scan backwards for unclosed syntax markers — no regex to avoid ReDoS
  // Find the last unclosed [ or ![ (link/image start)
  const lastBracket = tail.lastIndexOf('[');
  if (lastBracket !== -1) {
    const afterBracket = tail.slice(lastBracket);
    // A closed link/image has ](...)  somewhere after the [
    const hasClose = afterBracket.includes('](') && afterBracket.includes(')');
    if (!hasClose) {
      // Also trim a preceding `!` for images
      const trimTo =
        lastBracket > 0 && tail[lastBracket - 1] === '!'
          ? lastBracket - 1
          : lastBracket;
      tail = tail.slice(0, trimTo);
    }
  }

  // Find trailing unclosed backticks
  let end = tail.length;
  while (end > 0 && tail[end - 1] === '`') {
    end--;
  }
  if (end < tail.length && end > 0) {
    // There are trailing backticks — check if they opened inline code
    const ticks = tail.length - end;
    const opener = tail.lastIndexOf('`'.repeat(ticks), end - 1);
    if (opener === -1) {
      // Unclosed — trim from the backticks
      tail = tail.slice(0, end);
    }
  }

  // Find trailing unclosed bold/italic markers (*)
  // First check trailing stars (no content after them yet):
  end = tail.length;
  while (end > 0 && tail[end - 1] === '*') {
    end--;
  }
  if (end < tail.length && end > 0) {
    const stars = tail.length - end;
    if (stars <= 3) {
      const opener = tail.lastIndexOf('*'.repeat(stars), end - 1);
      if (opener === -1) {
        tail = tail.slice(0, end);
      }
    }
  }

  // Check for unclosed bold/italic mid-line: e.g. "Hello **bold" or "Hello *ital"
  // Instead of trimming (hiding content), auto-close the markers so the text
  // renders with formatting immediately as it streams in.
  {
    let searchFrom = 0;
    const markers: {pos: number; len: number}[] = [];
    while (searchFrom < tail.length) {
      const idx = tail.indexOf('*', searchFrom);
      if (idx === -1) {
        break;
      }
      // Determine marker length (* or ** or ***)
      let markerLen = 1;
      while (idx + markerLen < tail.length && tail[idx + markerLen] === '*') {
        markerLen++;
      }
      if (markerLen > 3) {
        // 4+ stars — not standard markdown emphasis, skip
        searchFrom = idx + markerLen;
        continue;
      }
      markers.push({pos: idx, len: markerLen});
      searchFrom = idx + markerLen;
    }
    // Pair markers greedily. Unpaired openers get auto-closed.
    const paired = new Set<number>();
    for (let i = 0; i < markers.length; i++) {
      if (paired.has(i)) {
        continue;
      }
      for (let j = i + 1; j < markers.length; j++) {
        if (paired.has(j)) {
          continue;
        }
        if (markers[j].len === markers[i].len) {
          paired.add(i);
          paired.add(j);
          break;
        }
      }
    }
    // Append closing markers for each unpaired opener (in reverse order)
    for (let i = markers.length - 1; i >= 0; i--) {
      if (!paired.has(i)) {
        const marker = markers[i];
        // Only close if there's actual content after the opener
        if (marker.pos + marker.len < tail.length) {
          tail = tail + '*'.repeat(marker.len);
        } else {
          // Trailing marker with no content — trim it
          tail = tail.slice(0, marker.pos);
        }
      }
    }
  }

  // Find trailing unclosed strikethrough (~~)
  if (tail.length >= 2 && tail.endsWith('~~')) {
    // Check if there's an opener before these closing ~~
    const opener = tail.lastIndexOf('~~', tail.length - 3);
    if (opener === -1) {
      tail = tail.slice(0, -2);
    }
  } else if (tail.endsWith('~')) {
    // Single trailing ~ after content — might be start of ~~
    const secondLast = tail.length - 2;
    if (secondLast >= 0 && tail[secondLast] !== '~') {
      tail = tail.slice(0, -1);
    }
  }

  // Check for unclosed ~~ mid-line: e.g. "Hello ~~struck"
  // Count ~~ occurrences — if odd, the last one is unclosed.
  {
    let count = 0;
    let searchFrom = 0;
    const positions: number[] = [];
    while (true) {
      const idx = tail.indexOf('~~', searchFrom);
      if (idx === -1) {
        break;
      }
      positions.push(idx);
      count++;
      searchFrom = idx + 2;
    }
    if (count % 2 === 1) {
      // Odd number of ~~ — the last one is unclosed, trim from it
      tail = tail.slice(0, positions[positions.length - 1]);
    }
  }

  return prefix + tail;
}

/**
 * Trim trailing lines from the unsettled zone that look like the start of
 * a structural block but aren't complete yet. This prevents flashes of
 * partial syntax like bare `-` bullets or incomplete table headers.
 *
 * Only trims the minimal set of clearly-incomplete patterns:
 * 1. Bare list markers (`- `, `1. `) with no content after them
 * 2. A lone table header line without its separator row
 * 3. Empty trailing lines
 *
 * Once a table is established (header + separator exist), new data rows
 * render immediately — no suppression.
 */
function trimUnsettledStructural(text: string): string {
  const lines = text.split('\n');

  // Walk backwards, but only trim clearly-incomplete trailing lines
  while (lines.length > 0) {
    const last = lines[lines.length - 1];
    const trimmed = last.trim();

    // Empty trailing lines — safe to drop
    if (trimmed === '') {
      lines.pop();
      continue;
    }

    // Bare list marker with no content: "- " or "1. " (just whitespace after marker)
    if (/^ {0,9}[-*+] $/.test(last) || /^ {0,9}\d+[.)] $/.test(last)) {
      lines.pop();
      continue;
    }

    // Table: only suppress if this is a lone header without a separator.
    // If the line has `|` and the line before it is NOT a separator,
    // and THIS line is not a separator, and there's no established table
    // above (header + separator pair), hold it back.
    if (trimmed.includes('|') && !isTableSeparator(last)) {
      // Is there a separator anywhere above that would make this part of
      // an established table? Walk up to find header+separator pair.
      let tableEstablished = false;
      for (let i = lines.length - 2; i >= 1; i--) {
        if (isTableSeparator(lines[i]) && lines[i - 1].includes('|')) {
          tableEstablished = true;
          break;
        }
      }
      if (!tableEstablished) {
        // Lone pipe line — could be a table header waiting for separator
        lines.pop();
        continue;
      }
    }

    // Separator line without a header above it
    if (isTableSeparator(last)) {
      if (lines.length < 2 || !lines[lines.length - 2].includes('|')) {
        lines.pop();
        continue;
      }
    }

    // This line looks complete — stop trimming
    break;
  }

  return lines.join('\n');
}

/**
 * Concatenate freshly-parsed delta blocks with previously-settled blocks,
 * merging adjacent same-style lists into a single loose list. The boundary
 * detector settles each pre-blank segment independently, so without this
 * merge an incrementally-streamed `1.\n\n1.\n\n1.` would land as N separate
 * lists even though the full-text parser joins them per CommonMark §5.3.
 */
function mergeSettledBlocks(
  prev: BlockNode[],
  delta: BlockNode[],
): BlockNode[] {
  if (prev.length === 0 || delta.length === 0) {
    return [...prev, ...delta];
  }
  const prevLast = prev[prev.length - 1];
  const deltaFirst = delta[0];
  if (
    prevLast.type === 'list' &&
    deltaFirst.type === 'list' &&
    prevLast.ordered === deltaFirst.ordered &&
    prevLast.delimiter === deltaFirst.delimiter
  ) {
    const merged: BlockNode = {
      type: 'list',
      ordered: prevLast.ordered,
      start: prevLast.start,
      delimiter: prevLast.delimiter,
      loose: true,
      items: [...prevLast.items, ...deltaFirst.items],
    };
    return [...prev.slice(0, -1), merged, ...delta.slice(1)];
  }
  return [...prev, ...delta];
}

export function parseMarkdownIncremental(
  input: string,
  state: IncrementalState,
  sourceIds?: ReadonlySet<string>,
): BlockNode[];
export function parseMarkdownIncremental(
  input: string,
  state: IncrementalState,
  options: ParseOptions,
): BlockNode[];
export function parseMarkdownIncremental(
  input: string,
  state: IncrementalState,
  arg?: ReadonlySet<string> | ParseOptions,
): BlockNode[] {
  const opts = resolveOptions(arg);
  // Invalidate cache when the autolink option flips — cached settled blocks
  // were parsed with the previous setting and would otherwise be reused
  // unchanged.
  if (state.autolink !== opts.autolink) {
    state.prevInput = '';
    state.settledText = '';
    state.settledBlocks = [];
    state.settledUpTo = 0;
    state.autolink = opts.autolink;
  }
  if (input === '') {
    state.prevInput = '';
    state.settledText = '';
    state.settledBlocks = [];
    state.settledUpTo = 0;
    state.linkDefsKey = undefined;
    return [];
  }

  // Link reference definitions are document-global and usually stream in
  // (as a footer) after the references that use them, so collect them from the
  // whole input and pass them into every slice parse. When the set changes,
  // invalidate the settled cache so already-settled references re-resolve.
  const {defs: linkDefs} = extractLinkDefinitions(input);
  const linkDefsKey = linkDefsSignature(linkDefs);
  if (state.linkDefsKey !== linkDefsKey) {
    state.prevInput = '';
    state.settledText = '';
    state.settledBlocks = [];
    state.settledUpTo = 0;
    state.linkDefsKey = linkDefsKey;
  }
  const parseOpts: ResolvedOptions =
    linkDefs.size > 0 ? {...opts, linkDefs} : opts;

  const lines = input.split('\n');
  const boundary = findSettledBoundary(lines);

  if (boundary < 0) {
    // Inside an unclosed fence or no blank-line boundary — full re-parse
    state.prevInput = input;
    return parseMarkdownImpl(input, parseOpts);
  }

  const settledText = lines.slice(0, boundary).join('\n');
  const unsettledRaw = lines.slice(boundary).join('\n').trim();
  const unsettledText = trimUnsettledStructural(unsettledRaw);

  let settledBlocks: BlockNode[];

  if (settledText === state.settledText) {
    // Settled portion unchanged — reuse cached blocks
    settledBlocks = state.settledBlocks;
  } else if (
    state.settledText.length > 0 &&
    settledText.startsWith(state.settledText)
  ) {
    // Settled portion grew — parse only the new delta
    const delta = settledText.slice(state.settledText.length);
    const deltaBlocks = parseMarkdownImpl(delta, parseOpts);
    settledBlocks = mergeSettledBlocks(state.settledBlocks, deltaBlocks);
  } else {
    // Content before the boundary changed — full re-parse of settled portion
    settledBlocks = parseMarkdownImpl(settledText, parseOpts);
  }

  const unsettledBlocks = unsettledText
    ? parseMarkdownImpl(unsettledText, parseOpts)
    : [];

  state.settledText = settledText;
  state.settledBlocks = settledBlocks;
  state.settledUpTo = boundary;
  state.prevInput = input;

  return mergeSettledBlocks(settledBlocks, unsettledBlocks);
}
