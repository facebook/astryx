// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  SECTION_KEY_RE,
  SECTION_SUMMARY_MAX,
  buildDocsIndexData,
  findDocSection,
  sectionKey,
  sectionKeyProblems,
  sectionSummary,
  sectionTitleKey,
  sourceTitle,
  withSectionKeys,
  withSourceTitle,
} from './docs-section-key.mjs';

/** @param {string} title @param {object} [fields] */
const section = (title, fields = {}) => ({title, content: [], ...fields});

describe('sectionTitleKey', () => {
  it.each([
    ['Quick Start', 'quick-start'],
    ['Light/Dark Mode', 'light-dark-mode'],
    ["Do & Don't", 'do-and-don-t'],
    ['  Café Crème  ', 'cafe-creme'],
    ['useTheme()', 'usetheme'],
    ['--- Tokens ---', 'tokens'],
    ['亮/暗模式', ''],
    ['', ''],
  ])('%j derives %j', (title, key) => {
    expect(sectionTitleKey(title)).toBe(key);
  });

  it('derives only stable keys', () => {
    for (const title of ['A  B', 'x__y', 'Élan 2.0', 'a-b-', '-a']) {
      expect(sectionTitleKey(title)).toMatch(SECTION_KEY_RE);
    }
  });

  it('derives nothing from a non-string', () => {
    expect(sectionTitleKey(undefined)).toBe('');
    expect(sectionTitleKey(42)).toBe('');
  });
});

describe('sectionKey', () => {
  it('prefers the authored id', () => {
    expect(sectionKey(section('Quick Start', {id: 'start'}))).toBe('start');
  });

  it('derives from the authored title, not a translated one', () => {
    const translated = withSourceTitle(section('快速开始'), 'Quick Start');
    expect(sectionKey(translated)).toBe('quick-start');
  });
});

describe('sectionKeyProblems', () => {
  it('accepts distinct keys', () => {
    expect(
      sectionKeyProblems([section('Install'), section('Usage', {id: 'use'})]),
    ).toEqual([]);
  });

  it('rejects two sections that share a key', () => {
    const problems = sectionKeyProblems([
      section('Quick Start'),
      section('Quick-start'),
    ]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('"quick-start" is already used by sections[0]');
  });

  it('rejects an authored id that collides with a derived key', () => {
    expect(
      sectionKeyProblems([section('Install'), section('Setup', {id: 'install'})]),
    ).toHaveLength(1);
  });

  it('rejects an unsafe id and never suffixes one', () => {
    for (const id of ['Quick Start', 'a_b', 'a--b', '-a', '', 7]) {
      expect(sectionKeyProblems([section('Install', {id})])[0]).toContain(
        'is not a stable key',
      );
    }
  });

  it('rejects a title no key derives from', () => {
    expect(sectionKeyProblems([section('亮/暗模式')])[0]).toContain(
      'Give the section an id',
    );
    expect(sectionKeyProblems([section('亮/暗模式', {id: 'light-dark'})])).toEqual(
      [],
    );
  });

  it('leaves a missing title to the title check', () => {
    expect(sectionKeyProblems([{content: []}, section('')])).toEqual([]);
  });
});

describe('withSectionKeys', () => {
  it('stamps derived keys and keeps authored ones', () => {
    const doc = withSectionKeys({
      sections: [section('Quick Start'), section('Usage', {id: 'use'})],
    });
    expect(doc.sections.map(s => s.id)).toEqual(['quick-start', 'use']);
  });

  it('keeps the authored title of a translated section', () => {
    const doc = withSectionKeys({
      sections: [withSourceTitle(section('快速开始'), 'Quick Start')],
    });
    expect(doc.sections[0].id).toBe('quick-start');
    expect(sourceTitle(doc.sections[0])).toBe('Quick Start');
  });
});

describe('findDocSection', () => {
  const sections = withSectionKeys({
    sections: [
      section('Quick Start'),
      section('Theme Props'),
      section('Theme Tokens', {id: 'tokens'}),
      section('Overview', {id: 'overview-a'}),
      section('Overview', {id: 'overview-b'}),
    ],
  }).sections;

  it('finds a section by key first', () => {
    expect(findDocSection(sections, 'tokens').section.title).toBe(
      'Theme Tokens',
    );
  });

  it('finds a section by exact title, case-insensitively', () => {
    expect(findDocSection(sections, 'quick start').section.id).toBe(
      'quick-start',
    );
  });

  it('finds a section by the key its query derives', () => {
    expect(findDocSection(sections, 'Quick-Start!').section.id).toBe(
      'quick-start',
    );
  });

  it('finds a section by a unique part of its title', () => {
    expect(findDocSection(sections, 'props').section.id).toBe('theme-props');
  });

  it('refuses an ambiguous exact title and lists the candidates', () => {
    const {section: match, candidates} = findDocSection(sections, 'Overview');
    expect(match).toBeNull();
    expect(candidates.map(s => s.id)).toEqual(['overview-a', 'overview-b']);
  });

  it('refuses an ambiguous partial title', () => {
    const {section: match, candidates} = findDocSection(sections, 'theme');
    expect(match).toBeNull();
    expect(candidates.map(s => s.id)).toEqual(['theme-props', 'tokens']);
  });

  it('returns nothing for no match', () => {
    expect(findDocSection(sections, 'zzz')).toEqual({
      section: null,
      candidates: [],
    });
  });
});

describe('sectionSummary', () => {
  it('uses the first prose or list text, whitespace collapsed', () => {
    expect(
      sectionSummary({
        content: [
          {type: 'code', lang: 'ts', code: 'x'},
          {type: 'prose', text: 'Line one.\n\n  Line two.'},
        ],
      }),
    ).toBe('Line one. Line two.');
    expect(
      sectionSummary({content: [{type: 'list', items: ['First', 'Second']}]}),
    ).toBe('First');
  });

  it('is empty when the section has no text', () => {
    expect(sectionSummary({content: [{type: 'table', headers: [], rows: []}]})).toBe(
      '',
    );
  });

  it('cuts a long summary at a word boundary', () => {
    const summary = sectionSummary({
      content: [{type: 'prose', text: 'word '.repeat(200)}],
    });
    expect(summary.length).toBeLessThanOrEqual(SECTION_SUMMARY_MAX);
    expect(summary.endsWith('word…')).toBe(true);
  });
});

describe('buildDocsIndexData', () => {
  it('lists each section by key, title, and summary', () => {
    expect(
      buildDocsIndexData({
        name: 'theme',
        title: 'Theme',
        description: 'Theming.',
        sections: [
          section('Quick Start', {content: [{type: 'prose', text: 'Start.'}]}),
          section('Usage', {id: 'use'}),
        ],
      }),
    ).toEqual({
      topic: 'theme',
      title: 'Theme',
      description: 'Theming.',
      sections: [
        {id: 'quick-start', title: 'Quick Start', summary: 'Start.'},
        {id: 'use', title: 'Usage', summary: ''},
      ],
    });
  });
});
