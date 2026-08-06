// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for the `astryx docs <topic>` autolinker.
 *
 * Run: pnpm -F @astryxdesign/docsite test
 */

import {describe, it, expect} from 'vitest';
import {resolveCliDocHref} from '../components/cliDocLinks';
import {docTopics} from '../generated/docsRegistry';
import {components} from '../generated/componentRegistry';
import type {ContentBlock} from '../generated/docsRegistry';

describe('resolveCliDocHref', () => {
  it('links a topic reference to its page', () => {
    expect(resolveCliDocHref('astryx docs tokens')).toBe('/docs/tokens');
  });

  it('links a hyphenated topic', () => {
    expect(resolveCliDocHref('astryx docs styling-libraries')).toBe(
      '/docs/styling-libraries',
    );
  });

  it('links the bare command to the docs index', () => {
    expect(resolveCliDocHref('astryx docs')).toBe('/docs');
  });

  it('ignores surrounding whitespace', () => {
    expect(resolveCliDocHref('  astryx docs theme  ')).toBe('/docs/theme');
  });

  it('resolves every topic the site serves', () => {
    for (const {topic} of docTopics) {
      expect(resolveCliDocHref(`astryx docs ${topic}`)).toBe(`/docs/${topic}`);
    }
  });

  describe('runner prefixes', () => {
    it.each([
      ['npx astryx docs icons', '/docs/icons'],
      ['bunx astryx docs icons', '/docs/icons'],
      ['pnpm exec astryx docs icons', '/docs/icons'],
      ['pnpm dlx astryx docs icons', '/docs/icons'],
      ['yarn dlx astryx docs icons', '/docs/icons'],
      ['npx @astryxdesign/cli docs icons', '/docs/icons'],
    ])('resolves %s', (command, href) => {
      expect(resolveCliDocHref(command)).toBe(href);
    });
  });

  describe('flags', () => {
    // --dense and --zh change the CLI's output, not which page documents it.
    it.each(['--dense', '--zh', '--json', '--detail compact'])(
      'ignores %s',
      flag => {
        expect(resolveCliDocHref(`astryx docs styling ${flag}`)).toBe(
          '/docs/styling',
        );
      },
    );
  });

  describe('section arguments', () => {
    it('falls back to the topic page', () => {
      expect(resolveCliDocHref('astryx docs tokens spacing')).toBe(
        '/docs/tokens',
      );
    });
  });

  describe('spans that must stay plain code', () => {
    it.each([
      // A topic that no longer exists must not link to a 404.
      ['astryx docs nonexistent-topic'],
      // Other CLI commands have no one-to-one page.
      ['astryx component Button'],
      ['astryx template dashboard'],
      ['astryx theme build'],
      ['astryx upgrade --apply'],
      // Ordinary backticked prose that happens to contain the words.
      ['xstyle'],
      ['--color-text-primary'],
      ['See astryx docs tokens for the full reference'],
      // Not our binary.
      ['other-cli docs tokens'],
      [''],
    ])('leaves %s unlinked', command => {
      expect(resolveCliDocHref(command)).toBeNull();
    });
  });
});

/**
 * Extract the inline code spans from a string of authored doc prose.
 */
function codeSpans(text: string): string[] {
  return [...text.matchAll(/`([^`]+)`/g)].map(m => m[1]);
}

/**
 * Inline code spans from the blocks of a doc topic that render through
 * renderInlineMarkdown. Fenced code blocks are excluded — they are verbatim
 * terminal transcripts, and nothing linkifies them.
 */
function inlineSpansOf(block: ContentBlock): string[] {
  if (block.type === 'code') {
    return [];
  }
  const text = [
    block.text ?? '',
    ...(block.items ?? []),
    ...(block.rows ?? []).flat(),
  ].join('\n');
  return codeSpans(text);
}

function isDocReference(span: string): boolean {
  return /(^|\s)astryx docs(\s|$)/.test(span);
}

/**
 * Guards against the failure mode the autolinker cannot catch at runtime: if a
 * topic is renamed, an unresolvable reference silently degrades to plain code
 * instead of 404ing, so nobody notices the cross-reference went stale.
 */
describe('doc references in shipped content', () => {
  const references: Array<{kind: string; source: string; span: string}> = [];

  for (const topic of docTopics) {
    for (const section of topic.sections) {
      for (const block of section.content) {
        for (const span of inlineSpansOf(block)) {
          if (isDocReference(span)) {
            references.push({
              kind: 'doc topic',
              source: `${topic.topic} › ${section.title}`,
              span,
            });
          }
        }
      }
    }
  }

  for (const entries of Object.values(components)) {
    for (const comp of entries) {
      const prose = [
        comp.usage?.description ?? '',
        ...(comp.usage?.bestPractices ?? []).map(p => p.description ?? ''),
        ...(comp.props ?? []).map(p => p.description ?? ''),
      ].join('\n');
      for (const span of codeSpans(prose)) {
        if (isDocReference(span)) {
          references.push({kind: 'component', source: comp.name, span});
        }
      }
    }
  }

  // Both corpora render through the autolinker, so both need covering. If a
  // scan stops finding anything the guard has quietly stopped guarding.
  it.each(['doc topic', 'component'])('scans %s prose', kind => {
    expect(references.filter(ref => ref.kind === kind).length).toBeGreaterThan(
      0,
    );
  });

  it('resolves every reference to a page the site serves', () => {
    const unresolved = references
      .filter(ref => resolveCliDocHref(ref.span) == null)
      .map(ref => `${ref.kind} ${ref.source}: \`${ref.span}\``);

    expect(unresolved).toEqual([]);
  });
});
