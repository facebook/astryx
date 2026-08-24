// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {
  getGeneratedLocales,
  getGeneratedLocaleSources,
  renderGeneratedFile,
  resolveCldrSourceLocale,
} from './generate-cldr-weekdays.mjs';
import {standaloneShortWeekdayNamesByLocale} from '../packages/core/src/Calendar/standaloneShortWeekdayNames.generated';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLDR_ROOT = path.dirname(require.resolve('cldr-dates-full/package.json'));
const OUTPUT_FILE = path.join(
  ROOT,
  'packages/core/src/Calendar/standaloneShortWeekdayNames.generated.ts',
);
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function readRawCldr(locale) {
  const document = JSON.parse(
    fs.readFileSync(
      path.join(CLDR_ROOT, 'main', locale, 'ca-gregorian.json'),
      'utf8',
    ),
  );
  const days =
    document.main[locale].dates.calendars.gregorian.days['stand-alone'].short;
  return DAY_KEYS.map(day => days[day]);
}

describe('generate-cldr-weekdays', () => {
  it('matches checked-in generated output deterministically', async () => {
    const first = await renderGeneratedFile();
    const second = await renderGeneratedFile();

    expect(first).toBe(second);
    expect(first).toBe(fs.readFileSync(OUTPUT_FILE, 'utf8'));
  });

  it('resolves exact, base-language, and script-parent CLDR sources', () => {
    expect(resolveCldrSourceLocale('en', new Set(['en']))).toBe('en');
    expect(resolveCldrSourceLocale('es-MX', new Set(['es']))).toBe('es');
    expect(resolveCldrSourceLocale('zh-TW', new Set(['zh', 'zh-Hant']))).toBe(
      'zh-Hant',
    );
  });

  it('matches every generated locale to its pinned raw CLDR source', () => {
    const generatedLocales = getGeneratedLocales();
    const sources = getGeneratedLocaleSources();
    const checkedInLocales = Object.keys(standaloneShortWeekdayNamesByLocale);

    expect(checkedInLocales.toSorted()).toEqual(generatedLocales.toSorted());

    for (const locale of generatedLocales) {
      const source = sources[locale];
      const weekdays = standaloneShortWeekdayNamesByLocale[locale];

      expect(source).toBeDefined();
      expect(weekdays).toEqual(readRawCldr(source));
      expect(weekdays).toHaveLength(7);
      for (const weekday of weekdays) {
        expect(typeof weekday).toBe('string');
        expect(weekday.length).toBeGreaterThan(0);
      }
      expect(new Set(weekdays).size).toBe(7);
    }
  });
});
