// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contentTypeDetector.ts
 * @input URL search params and/or code string
 * @output Content type classification
 */

export type ContentType = 'component' | 'template' | 'theme';

const THEME_PATTERNS = [
  /\bXDSTheme\b/,
  /\bdefineTheme\b/,
  /\bdefineColorScheme\b/,
  /\bgenerateThemeCSSFlat\b/,
];

const TEMPLATE_PATTERNS = [
  /\bXDSAppShell\b/,
  /\bXDSTopNav\b/,
  /\bXDSNavItem\b/,
  /<main[\s>]/,
  /<header[\s>]/,
];

const COMPONENT_PATTERN = /<XDS(\w+)[\s/>]/;

/**
 * Detect the content type from URL params and code heuristics.
 *
 * Priority:
 * 1. Explicit `?type=` URL param
 * 2. Code pattern analysis
 * 3. Default to 'component'
 */
export function detectContentType(
  code: string,
  searchParams?: URLSearchParams | null,
): ContentType {
  // 1. Explicit URL param takes priority
  const typeParam = searchParams?.get('type');
  if (
    typeParam === 'component' ||
    typeParam === 'template' ||
    typeParam === 'theme'
  ) {
    return typeParam;
  }

  // 2. Theme heuristics
  const themeScore = THEME_PATTERNS.reduce(
    (score, pattern) => score + (pattern.test(code) ? 1 : 0),
    0,
  );
  if (themeScore >= 1) {
    return 'theme';
  }

  // 3. Template heuristics (page-level patterns)
  const templateScore = TEMPLATE_PATTERNS.reduce(
    (score, pattern) => score + (pattern.test(code) ? 1 : 0),
    0,
  );
  if (templateScore >= 2) {
    return 'template';
  }

  // 4. Default to component
  return 'component';
}

/**
 * Extract the primary XDS component name from code.
 * Returns the name without the "XDS" prefix (e.g. "Button" not "XDSButton").
 */
export function detectComponentName(code: string): string | null {
  const match = code.match(COMPONENT_PATTERN);
  return match ? match[1] : null;
}

/**
 * Get the content name from URL params.
 */
export function getContentName(
  searchParams?: URLSearchParams | null,
): string | null {
  return searchParams?.get('name') ?? null;
}
