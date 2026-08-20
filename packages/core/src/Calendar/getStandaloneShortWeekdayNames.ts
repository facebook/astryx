// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file getStandaloneShortWeekdayNames.ts
 * @input Generated CLDR stand-alone-short weekday table
 * @output Private locale resolver for Calendar weekday headers
 * @position Calendar-internal pure utility; not exported from the package
 */

import {
  standaloneShortWeekdayNamesByLocale,
  type StandaloneShortWeekdayNames,
} from './standaloneShortWeekdayNames.generated';

const weekdayNamesByLocale: Readonly<
  Record<string, StandaloneShortWeekdayNames>
> = standaloneShortWeekdayNamesByLocale;
const englishWeekdayNames = weekdayNamesByLocale.en;

/**
 * Resolve generated weekday reference data as exact locale -> language -> English.
 * Unicode extensions are ignored through Intl.Locale.baseName. Invalid tags and
 * valid but unsupported languages safely use English.
 */
export function getStandaloneShortWeekdayNames(
  locale: string,
): StandaloneShortWeekdayNames {
  try {
    const parsed = new Intl.Locale(locale);
    return (
      weekdayNamesByLocale[parsed.baseName] ??
      weekdayNamesByLocale[parsed.language] ??
      englishWeekdayNames
    );
  } catch {
    return englishWeekdayNames;
  }
}
