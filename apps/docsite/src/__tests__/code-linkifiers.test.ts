// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for the inline-code linkifiers.
 *
 * Run: pnpm -F @astryxdesign/docsite test
 */

import {describe, it, expect} from 'vitest';
import {linkifyCode} from '../components/codeLinkifiers';
import {docTopics} from '../generated/docsRegistry';
import {components} from '../generated/componentRegistry';
import type {ContentBlock} from '../generated/docsRegistry';

describe('doc topic linkifier', () => {
  it.each([
    ['astryx docs tokens', '/docs/tokens'],
    ['astryx docs styling-libraries', '/docs/styling-libraries'],
    ['npx astryx docs icons', '/docs/icons'],
    ['  astryx docs theme  ', '/docs/theme'],
    // The docs index, for a bare command.
    ['astryx docs', '/docs'],
    // A section argument and CLI-only flags still belong to the topic page.
    ['astryx docs tokens spacing', '/docs/tokens'],
    ['astryx docs styling --dense', '/docs/styling'],
    ['astryx docs styling --zh', '/docs/styling'],
  ])('links %s', (code, href) => {
    expect(linkifyCode(code)).toBe(href);
  });

  it('links every topic the site serves', () => {
    for (const {topic} of docTopics) {
      expect(linkifyCode(`astryx docs ${topic}`)).toBe(`/docs/${topic}`);
    }
  });

  it.each([
    // A renamed topic degrades to plain code rather than a 404.
    ['astryx docs nonexistent-topic'],
    // Other commands have no one-to-one page.
    ['astryx component Button'],
    ['astryx theme build'],
    ['astryx upgrade --apply'],
    // Ordinary backticked prose and identifiers.
    ['xstyle'],
    ['--color-text-primary'],
    ['See astryx docs tokens for the full reference'],
    ['other-cli docs tokens'],
    [''],
  ])('leaves %s as plain code', code => {
    expect(linkifyCode(code)).toBeNull();
  });
});

/** Inline code spans in a string of authored prose. */
function codeSpans(text: string): string[] {
  return [...text.matchAll(/`([^`]+)`/g)].map(m => m[1]);
}

/**
 * Spans from the blocks of a doc topic that render through
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
 * Guards the failure mode the linkifier cannot catch at runtime: if a topic is
 * renamed, an unresolvable reference silently degrades to plain code instead
 * of 404ing, so nobody notices the cross-reference went stale.
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

  // Both corpora render through the linkifiers, so both need covering. If a
  // scan stops finding anything the guard has quietly stopped guarding.
  it.each(['doc topic', 'component'])('scans %s prose', kind => {
    expect(references.filter(ref => ref.kind === kind).length).toBeGreaterThan(
      0,
    );
  });

  it('links every reference to a page the site serves', () => {
    const unresolved = references
      .filter(ref => linkifyCode(ref.span) == null)
      .map(ref => `${ref.kind} ${ref.source}: \`${ref.span}\``);

    expect(unresolved).toEqual([]);
  });
});
