// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {
  getGeneratedLocales,
  getGeneratedLocaleSources,
  getShippedLocales,
  renderGeneratedFile,
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

  it('derives only needed exact and base-language locale entries', () => {
    const locales = getGeneratedLocales();

    expect(locales.length).toBeLessThanOrEqual(getShippedLocales().length * 2);
    expect(locales).toContain('en');
    expect(locales).toContain('es');
    expect(locales).toContain('ar-SA');
    expect(locales).toContain('zh-TW');
    expect(locales).not.toContain('es-ES');
    expect(getGeneratedLocaleSources()['zh-TW']).toBe('zh-Hant');
  });

  it('copies regional, base-language, and script-parent values from raw CLDR', () => {
    expect(standaloneShortWeekdayNamesByLocale.es).toEqual(readRawCldr('es'));
    expect(standaloneShortWeekdayNamesByLocale['ar-SA']).toEqual(
      readRawCldr('ar-SA'),
    );
    expect(standaloneShortWeekdayNamesByLocale['zh-TW']).toEqual(
      readRawCldr('zh-Hant'),
    );
  });
});
