// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chartColors.ts
 * @input Persisted chart color intent and a caller-owned resolved-token function
 * @output Curated picker projection, validation, and renderer-ready solid colors
 * @position Renderer- and React-free chart color contract for editors, Canvas, SVG, export, workers, and GPU adapters
 *
 * Automatic is represented by an absent override and remains host-owned. Theme
 * choices persist a stable chart-color token identity; custom choices persist a
 * canonical opaque #RRGGBB value. This module does not import Theme, React,
 * StyleX, or a chart renderer. React callers pass useTheme().token; detached
 * callers pass a resolver over their explicit resolved theme payload.
 */

import {formatHex, parseColor} from '../utils/color';

/**
 * Closed inventory of token identities that may be persisted as chart colors.
 * Adding, renaming, or removing an entry is an explicit chart-contract change.
 */
export const supportedChartColorTokens = [
  '--color-data-categorical-blue',
  '--color-data-categorical-orange',
  '--color-data-categorical-purple',
  '--color-data-categorical-green',
  '--color-data-categorical-pink',
  '--color-data-categorical-cyan',
  '--color-data-categorical-red',
  '--color-data-categorical-teal',
  '--color-data-categorical-brown',
  '--color-data-categorical-indigo',
] as const;

/** Stable identity for a persisted theme-aware chart color. */
export type ChartColorToken = (typeof supportedChartColorTokens)[number];

/** Stable categorical order offered by the default picker projection. */
export const categoricalChartColorTokens = [
  '--color-data-categorical-blue',
  '--color-data-categorical-orange',
  '--color-data-categorical-purple',
  '--color-data-categorical-green',
  '--color-data-categorical-pink',
  '--color-data-categorical-cyan',
  '--color-data-categorical-red',
  '--color-data-categorical-teal',
  '--color-data-categorical-brown',
  '--color-data-categorical-indigo',
] as const satisfies ReadonlyArray<ChartColorToken>;

declare const canonicalOpaqueHexBrand: unique symbol;

/** Uppercase opaque #RRGGBB accepted by the persisted chart-color contract. */
export type CanonicalOpaqueHex = `#${string}` & {
  readonly [canonicalOpaqueHexBrand]: true;
};

/** Persisted chart-local color intent. Absence represents Automatic. */
export type ChartColorChoice =
  | {kind: 'theme'; token: ChartColorToken}
  | {kind: 'custom'; color: CanonicalOpaqueHex};

export type ChartColorDiagnosticCode =
  | 'invalid-choice'
  | 'unsupported-token'
  | 'invalid-custom-color'
  | 'unsupported-resolved-color';

/** Machine-readable failure detail. Messages are for developers, not picker labels. */
export interface ChartColorDiagnostic {
  code: ChartColorDiagnosticCode;
  message: string;
  token?: ChartColorToken;
}

/** Explicit success/failure result; hosts own reporting and Automatic fallback. */
export type ChartColorResult<T> =
  {ok: true; value: T} | {ok: false; diagnostic: ChartColorDiagnostic};

/** Resolve one supported token to the active theme's concrete value. */
export type ChartColorTokenResolver = (token: ChartColorToken) => string;

/** One theme-aware swatch in a product-owned picker UI. */
export interface ChartColorOption {
  /** Stable persisted identity. */
  id: ChartColorToken;
  /** Opaque concrete preview for the caller's resolved theme and mode. */
  preview: CanonicalOpaqueHex;
}

/** Explicit concrete outputs for JavaScript/Canvas/export and GPU adapters. */
export type ResolvedChartColor =
  | {
      source: 'theme';
      token: ChartColorToken;
      /** Canonical opaque sRGB for options, Canvas, serialization, and export. */
      srgb: CanonicalOpaqueHex;
      /** Normalized RGBA channels for GPU adapters. */
      rgba01: readonly [number, number, number, 1];
    }
  | {
      source: 'custom';
      srgb: CanonicalOpaqueHex;
      rgba01: readonly [number, number, number, 1];
    };

const CUSTOM_COLOR_INPUT_PATTERN = /^#[0-9a-fA-F]{6}$/;
const CANONICAL_CUSTOM_COLOR_PATTERN = /^#[0-9A-F]{6}$/;
const supportedTokenSet: ReadonlySet<string> = new Set(
  supportedChartColorTokens,
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expected: ReadonlyArray<string>,
): boolean {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return (
    actual.length === sortedExpected.length &&
    actual.every((key, index) => key === sortedExpected[index])
  );
}

function isChartColorToken(value: unknown): value is ChartColorToken {
  return typeof value === 'string' && supportedTokenSet.has(value);
}

function invalidCustomColor(): ChartColorResult<never> {
  return {
    ok: false,
    diagnostic: {
      code: 'invalid-custom-color',
      message:
        'Custom chart colors must use canonical uppercase #RRGGBB syntax.',
    },
  };
}

/**
 * Normalize a product color-input value before persistence. Persisted validation
 * remains strict and does not normalize historical or ambiguous shapes.
 */
export function normalizeChartCustomColor(
  input: string,
): ChartColorResult<CanonicalOpaqueHex> {
  if (!CUSTOM_COLOR_INPUT_PATTERN.test(input)) {
    return invalidCustomColor();
  }
  return {ok: true, value: input.toUpperCase() as CanonicalOpaqueHex};
}

/**
 * Validate persisted chart-color input independently from the current picker
 * projection. Only the exact closed shape and already-canonical values pass.
 */
export function validateChartColorChoice(
  input: unknown,
): ChartColorResult<ChartColorChoice> {
  if (!isRecord(input) || typeof input.kind !== 'string') {
    return {
      ok: false,
      diagnostic: {
        code: 'invalid-choice',
        message: 'Chart color choices must be theme or custom objects.',
      },
    };
  }

  if (input.kind === 'theme') {
    if (!hasExactKeys(input, ['kind', 'token'])) {
      return {
        ok: false,
        diagnostic: {
          code: 'invalid-choice',
          message:
            'Theme chart color choices must contain only kind and token.',
        },
      };
    }
    if (!isChartColorToken(input.token)) {
      return {
        ok: false,
        diagnostic: {
          code: 'unsupported-token',
          message: 'The stored chart color token is not supported.',
        },
      };
    }
    return {ok: true, value: {kind: 'theme', token: input.token}};
  }

  if (input.kind === 'custom') {
    if (!hasExactKeys(input, ['kind', 'color'])) {
      return {
        ok: false,
        diagnostic: {
          code: 'invalid-choice',
          message:
            'Custom chart color choices must contain only kind and color.',
        },
      };
    }
    if (
      typeof input.color !== 'string' ||
      !CANONICAL_CUSTOM_COLOR_PATTERN.test(input.color)
    ) {
      return invalidCustomColor();
    }
    return {
      ok: true,
      value: {kind: 'custom', color: input.color as CanonicalOpaqueHex},
    };
  }

  return {
    ok: false,
    diagnostic: {
      code: 'invalid-choice',
      message: 'The stored chart color choice kind is not supported.',
    },
  };
}

function parseResolvedColor(
  value: string,
  token?: ChartColorToken,
): ChartColorResult<{
  srgb: CanonicalOpaqueHex;
  rgba01: readonly [number, number, number, 1];
}> {
  const parsed = parseColor(value);
  if (parsed === null || parsed.a !== 1) {
    return {
      ok: false,
      diagnostic: {
        code: 'unsupported-resolved-color',
        message: token
          ? `The active value for ${token} is not an opaque concrete sRGB color.`
          : 'The custom chart color is not an opaque concrete sRGB color.',
        ...(token ? {token} : {}),
      },
    };
  }

  const r = Math.round(parsed.r);
  const g = Math.round(parsed.g);
  const b = Math.round(parsed.b);

  return {
    ok: true,
    value: {
      srgb: formatHex(r, g, b) as CanonicalOpaqueHex,
      rgba01: [r / 255, g / 255, b / 255, 1],
    },
  };
}

/**
 * Project product-owned picker choices from a caller-owned active-theme
 * resolver. Labels and grouping stay with the product so they can be localized.
 */
export function projectChartColorOptions(
  resolveToken: ChartColorTokenResolver,
  tokens: ReadonlyArray<ChartColorToken> = categoricalChartColorTokens,
): ChartColorResult<ReadonlyArray<ChartColorOption>> {
  const options: ChartColorOption[] = [];
  for (const id of tokens) {
    const color = parseResolvedColor(resolveToken(id), id);
    if (!color.ok) {
      return color;
    }
    options.push({id, preview: color.value.srgb});
  }
  return {ok: true, value: options};
}

/**
 * Resolve already-validated theme or custom intent to explicit renderer-ready
 * formats. Automatic selection and invalid-input fallback remain host-owned.
 *
 * This module does not retain StyleX variable declarations. A verified live
 * CSS/SVG path must separately retain `dataVars` or provide its own explicit
 * data-token availability guarantee.
 */
export function resolveChartColorChoice(
  choice: ChartColorChoice,
  resolveToken: ChartColorTokenResolver,
): ChartColorResult<ResolvedChartColor> {
  if (choice.kind === 'custom') {
    const color = parseResolvedColor(choice.color);
    if (!color.ok) {
      return color;
    }
    return {
      ok: true,
      value: {source: 'custom', ...color.value},
    };
  }

  const color = parseResolvedColor(resolveToken(choice.token), choice.token);
  if (!color.ok) {
    return color;
  }
  return {
    ok: true,
    value: {
      source: 'theme',
      token: choice.token,
      ...color.value,
    },
  };
}
