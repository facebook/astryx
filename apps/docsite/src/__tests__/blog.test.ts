// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Blog tests for the docsite.
 *
 * Covers blog post discovery, frontmatter parsing, and validation — the
 * contract agents and authors rely on. The discovery/validation logic lives in
 * src/lib/blog/posts.mjs (shared with the build-time generator), so these tests
 * exercise the same code path that CI and `yarn generate` use.
 *
 * Run: yarn workspace @astryxdesign/docsite test
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {
  parseFrontmatter,
  parseYamlFrontmatter,
  validatePostFrontmatter,
  estimateReadingTime,
  discoverPosts,
  collectTypes,
  collectTags,
  POST_TYPES,
  MAX_TAGS,
} from '../lib/blog/posts.mjs';

const POSTS_DIR = path.resolve(__dirname, '../content/blog/posts');

const VALID_FM: Record<string, unknown> = {
  title: 'A title',
  description: 'A description',
  date: '2026-06-17',
  type: 'guide',
  authors: ['team'],
  tags: ['AI', 'Docs'],
};

// ── Frontmatter parsing ────────────────────────────────────────────────

describe('parseFrontmatter', () => {
  it('splits frontmatter from body', () => {
    const {data, body} = parseFrontmatter(
      '---\ntitle: "Hi"\n---\n\nHello world.',
    );
    expect(data.title).toBe('Hi');
    expect(body).toBe('Hello world.');
  });

  it('returns empty data when no frontmatter is present', () => {
    const {data, body} = parseFrontmatter('Just a body.');
    expect(data).toEqual({});
    expect(body).toBe('Just a body.');
  });

  it('parses inline string sequences', () => {
    const data = parseYamlFrontmatter('tags: ["AI", "Docs", "Theming"]');
    expect(data.tags).toEqual(['AI', 'Docs', 'Theming']);
  });

  it('parses block string sequences', () => {
    const data = parseYamlFrontmatter('authors:\n  - "team"\n  - "octocat"');
    expect(data.authors).toEqual(['team', 'octocat']);
  });

  it('parses block sequences of maps (relatedDocs)', () => {
    const data = parseYamlFrontmatter(
      'relatedDocs:\n  - title: "Button"\n    href: "/components/button"\n  - title: "Docs"\n    href: "/docs"',
    );
    expect(data.relatedDocs).toEqual([
      {title: 'Button', href: '/components/button'},
      {title: 'Docs', href: '/docs'},
    ]);
  });

  it('coerces booleans and ignores comments', () => {
    const data = parseYamlFrontmatter('draft: true\n# a comment\nx: false');
    expect(data.draft).toBe(true);
    expect(data.x).toBe(false);
  });
});

// ── Validation ─────────────────────────────────────────────────────────

describe('validatePostFrontmatter', () => {
  it('accepts a valid post and applies defaults', () => {
    const meta = validatePostFrontmatter('slug', {...VALID_FM});
    expect(meta.draft).toBe(false);
    expect(meta.coverImage).toBeNull();
    expect(meta.relatedDocs).toBeNull();
    expect(meta.updatedAt).toBeNull();
    expect(meta.dek).toBeNull();
  });

  it('accepts an optional article dek', () => {
    const meta = validatePostFrontmatter('slug', {
      ...VALID_FM,
      dek: '[Launch](/blog/introducing-astryx). One month in.',
    });
    expect(meta.dek).toBe('[Launch](/blog/introducing-astryx). One month in.');
  });

  it.each(['title', 'description', 'date', 'type'])('requires "%s"', field => {
    const fm = {...VALID_FM};
    delete fm[field];
    expect(() => validatePostFrontmatter('slug', fm)).toThrow();
  });

  it('rejects unknown post types', () => {
    expect(() =>
      validatePostFrontmatter('slug', {...VALID_FM, type: 'news'}),
    ).toThrow(/type/);
  });

  it('accepts every declared post type', () => {
    for (const type of POST_TYPES) {
      expect(() =>
        validatePostFrontmatter('slug', {...VALID_FM, type}),
      ).not.toThrow();
    }
  });

  it('rejects malformed dates', () => {
    expect(() =>
      validatePostFrontmatter('slug', {...VALID_FM, date: 'June 17 2026'}),
    ).toThrow(/date/);
  });

  it('rejects an empty authors list', () => {
    expect(() =>
      validatePostFrontmatter('slug', {...VALID_FM, authors: []}),
    ).toThrow(/authors/);
  });

  it('rejects an empty tags list', () => {
    expect(() =>
      validatePostFrontmatter('slug', {...VALID_FM, tags: []}),
    ).toThrow(/tags/);
  });

  it(`rejects more than ${MAX_TAGS} tags`, () => {
    expect(() =>
      validatePostFrontmatter('slug', {
        ...VALID_FM,
        tags: ['a', 'b', 'c', 'd', 'e'],
      }),
    ).toThrow(/tags/);
  });

  it('requires coverAlt when coverImage is set', () => {
    expect(() =>
      validatePostFrontmatter('slug', {
        ...VALID_FM,
        coverImage: '/blog/x/cover.png',
      }),
    ).toThrow(/coverAlt/);
  });

  it('accepts coverImage when coverAlt is provided', () => {
    const meta = validatePostFrontmatter('slug', {
      ...VALID_FM,
      coverImage: '/blog/x/cover.png',
      coverAlt: 'A cover',
    });
    expect(meta.coverImage).toBe('/blog/x/cover.png');
    expect(meta.coverAlt).toBe('A cover');
  });

  it('rejects relatedDocs entries missing title or href', () => {
    expect(() =>
      validatePostFrontmatter('slug', {
        ...VALID_FM,
        relatedDocs: [{title: 'No href'}],
      }),
    ).toThrow(/relatedDocs/);
  });
});

// ── Reading time ───────────────────────────────────────────────────────

describe('estimateReadingTime', () => {
  it('returns at least 1 minute', () => {
    expect(estimateReadingTime('a few words')).toBe(1);
  });

  it('scales with word count and ignores code fences', () => {
    const prose = Array(400).fill('word').join(' ');
    expect(estimateReadingTime(prose)).toBe(2);
    const withCode =
      prose + '\n```\n' + Array(1000).fill('x').join(' ') + '\n```';
    // Code is excluded, so the estimate stays ~2 minutes.
    expect(estimateReadingTime(withCode)).toBe(2);
  });
});

// ── Discovery against a temp directory ─────────────────────────────────

describe('discoverPosts (temp fixtures)', () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-blog-'));
  });

  afterEach(() => {
    fs.rmSync(dir, {recursive: true, force: true});
  });

  const write = (name: string, content: string) =>
    fs.writeFileSync(path.join(dir, name), content);

  const fm = (over: Record<string, string> = {}) => {
    const f = {
      title: 'T',
      description: 'D',
      date: '2026-01-01',
      type: 'guide',
      ...over,
    };
    return [
      '---',
      `title: "${f.title}"`,
      `description: "${f.description}"`,
      `date: "${f.date}"`,
      `type: "${f.type}"`,
      'authors:',
      '  - "team"',
      'tags: ["AI"]',
      '---',
      '',
      'Body content here.',
    ].join('\n');
  };

  it('returns an empty array for a missing directory', () => {
    expect(discoverPosts(path.join(dir, 'nope'))).toEqual([]);
  });

  it('discovers posts with CRLF line endings', () => {
    write('windows.md', fm({title: 'Windows'}).replace(/\n/g, '\r\n'));
    expect(discoverPosts(dir)).toEqual([
      expect.objectContaining({
        slug: 'windows',
        title: 'Windows',
        body: 'Body content here.',
      }),
    ]);
  });

  it('discovers posts and sorts latest-first', () => {
    write('older.md', fm({date: '2026-01-01', title: 'Older'}));
    write('newer.md', fm({date: '2026-06-01', title: 'Newer'}));
    const posts = discoverPosts(dir);
    expect(posts.map(p => p.slug)).toEqual(['newer', 'older']);
  });

  it('excludes drafts by default and includes them on request', () => {
    write('live.md', fm({title: 'Live'}));
    write(
      'wip.md',
      fm({title: 'WIP'}).replace('tags: ["AI"]', 'tags: ["AI"]\ndraft: true'),
    );
    expect(discoverPosts(dir).map(p => p.slug)).toEqual(['live']);
    expect(
      discoverPosts(dir, {includeDrafts: true})
        .map(p => p.slug)
        .sort(),
    ).toEqual(['live', 'wip']);
  });

  it('throws a clear error for an invalid post', () => {
    write('bad.md', fm({type: 'news'}));
    expect(() => discoverPosts(dir)).toThrow(/bad[\s\S]*type/);
  });

  it('throws when a post body is empty', () => {
    write('empty.md', fm().replace('Body content here.', ''));
    expect(() => discoverPosts(dir)).toThrow(/empty/);
  });

  it('collects present types and tags', () => {
    write('a.md', fm({type: 'guide'}));
    write(
      'b.md',
      fm({type: 'update'}).replace('tags: ["AI"]', 'tags: ["Release", "AI"]'),
    );
    const posts = discoverPosts(dir);
    expect(collectTypes(posts)).toEqual(['update', 'guide']); // canonical order
    expect(collectTags(posts)).toEqual(['AI', 'Release']); // alphabetical
  });
});

// ── The real content directory ─────────────────────────────────────────

describe('blog content', () => {
  it('discovers and validates all committed posts without throwing', () => {
    expect(() => discoverPosts(POSTS_DIR, {includeDrafts: true})).not.toThrow();
  });

  it('has at least one published example post', () => {
    const posts = discoverPosts(POSTS_DIR);
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });

  it('ships the Astryx launch announcement', () => {
    const posts = discoverPosts(POSTS_DIR);
    const post = posts.find(p => p.slug === 'introducing-astryx');
    expect(post).toBeDefined();
    expect(post?.type).toBe('update');
    expect(post?.authors).toContain('team');
  });
});
