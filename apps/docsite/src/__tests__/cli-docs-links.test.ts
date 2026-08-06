// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for the `astryx docs <topic>` code-span linkifier.
 *
 * Run: pnpm -F @astryxdesign/docsite test
 */

import {describe, it, expect} from 'vitest';
import {getDocsCommandHref} from '../components/docs/cliDocsLinks';
import {docTopicSlugs} from '../generated/docTopicSlugs';
import {docTopics} from '../generated/docsRegistry';

const TOPICS = new Set(['tokens', 'layout', 'styling', 'styling-libraries']);

describe('getDocsCommandHref', () => {
  it('links a docs command with a known topic', () => {
    expect(getDocsCommandHref('astryx docs tokens', TOPICS)).toBe(
      '/docs/tokens',
    );
    expect(getDocsCommandHref('astryx docs layout', TOPICS)).toBe(
      '/docs/layout',
    );
  });

  it('links hyphenated topics', () => {
    expect(getDocsCommandHref('astryx docs styling-libraries', TOPICS)).toBe(
      '/docs/styling-libraries',
    );
  });

  it('links commands carrying long-form flags to the topic page', () => {
    expect(getDocsCommandHref('astryx docs tokens --dense', TOPICS)).toBe(
      '/docs/tokens',
    );
    expect(getDocsCommandHref('astryx docs tokens --zh', TOPICS)).toBe(
      '/docs/tokens',
    );
    expect(
      getDocsCommandHref('astryx docs layout --detail compact', TOPICS),
    ).toBe('/docs/layout');
  });

  it('tolerates surrounding whitespace', () => {
    expect(getDocsCommandHref(' astryx docs tokens ', TOPICS)).toBe(
      '/docs/tokens',
    );
  });

  it('leaves unknown topics as plain code', () => {
    expect(getDocsCommandHref('astryx docs nonexistent', TOPICS)).toBeNull();
  });

  it('leaves other CLI commands as plain code', () => {
    expect(getDocsCommandHref('astryx component Button', TOPICS)).toBeNull();
    expect(getDocsCommandHref('astryx docs', TOPICS)).toBeNull();
    expect(getDocsCommandHref('npx astryx docs tokens', TOPICS)).toBeNull();
  });

  it('leaves prose that merely starts with a docs command as plain code', () => {
    expect(
      getDocsCommandHref('astryx docs tokens for details', TOPICS),
    ).toBeNull();
  });
});

describe('generated docTopicSlugs', () => {
  it('stays in sync with the full docs registry', () => {
    expect(docTopicSlugs).toEqual(docTopics.map(d => d.topic));
  });

  it('contains the topics referenced from Principles → Rules (#4739)', () => {
    const slugs = new Set(docTopicSlugs);
    expect(slugs.has('layout')).toBe(true);
    expect(slugs.has('styling')).toBe(true);
    expect(slugs.has('tokens')).toBe(true);
  });

  it('resolves every `astryx docs <topic>` span in doc prose to a real page', () => {
    // Every docs command mentioned inline in authored prose must point at a
    // registered topic — a rename in packages/cli/assets/docs would otherwise
    // silently downgrade the span back to a dead code chip.
    const slugs = new Set(docTopicSlugs);
    const commands = new Set<string>();
    for (const doc of docTopics) {
      for (const section of doc.sections) {
        for (const block of section.content) {
          const texts = [block.text, ...(block.items ?? [])];
          for (const text of texts) {
            for (const match of (text ?? '').matchAll(/`([^`]+)`/g)) {
              if (/^astryx docs /.test(match[1])) {
                commands.add(match[1]);
              }
            }
          }
        }
      }
    }
    expect(commands.size).toBeGreaterThan(0);
    for (const command of commands) {
      expect(getDocsCommandHref(command, slugs), command).not.toBeNull();
    }
  });
});
