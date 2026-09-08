// Copyright (c) Meta Platforms, Inc. and affiliates.

import {contrastRatio} from '../../packages/core/src/theme/contrast.ts';
import {parseColor} from '../../packages/core/src/utils/color.ts';

export const AA_TEXT = 4.5;
export const AA_NON_TEXT = 3;

export function splitCssArgs(input) {
  const parts = [];
  let current = '';
  let depth = 0;
  for (const character of input) {
    if (character === '(') depth++;
    if (character === ')') depth--;
    if (character === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += character;
    }
  }
  parts.push(current.trim());
  return parts;
}

export function createTokenResolver({tokens, defaults = {}}) {
  function resolve(value, modeIndex, local = {}, seen = new Set()) {
    if (typeof value !== 'string') {
      throw new TypeError(`Expected a color string, got ${String(value)}`);
    }
    const expression = value.trim();
    if (expression.startsWith('light-dark(')) {
      const choices = splitCssArgs(expression.slice('light-dark('.length, -1));
      return resolve(choices[modeIndex], modeIndex, local, seen);
    }
    if (expression.startsWith('var(')) {
      const [name, fallback] = splitCssArgs(
        expression.slice('var('.length, -1),
      );
      if (seen.has(name)) throw new Error(`Token cycle at ${name}`);
      const next = local[name] ?? tokens[name] ?? defaults[name] ?? fallback;
      if (next == null) throw new Error(`Could not resolve ${name}`);
      return resolve(next, modeIndex, local, new Set([...seen, name]));
    }
    if (parseColor(expression) == null) {
      throw new Error(`Unsupported rendered color: ${expression}`);
    }
    return expression;
  }
  return resolve;
}

function channelHex(value) {
  return Math.round(value).toString(16).padStart(2, '0');
}

export function compositeColor(foreground, background, opacity = 1) {
  const foregroundColor = parseColor(foreground);
  const backgroundColor = parseColor(background);
  if (foregroundColor == null || backgroundColor == null) {
    throw new Error(
      `Could not composite foreground ${foreground} over background ${background}`,
    );
  }
  if (backgroundColor.a < 1) {
    throw new Error(
      `Background ${background} must be composited over an opaque color first`,
    );
  }
  const alpha = foregroundColor.a * opacity;
  return `#${channelHex(
    foregroundColor.r * alpha + backgroundColor.r * (1 - alpha),
  )}${channelHex(
    foregroundColor.g * alpha + backgroundColor.g * (1 - alpha),
  )}${channelHex(foregroundColor.b * alpha + backgroundColor.b * (1 - alpha))}`;
}

export function renderBackground({value, parent, modeIndex, local, resolve}) {
  return value === 'transparent'
    ? parent
    : compositeColor(resolve(value, modeIndex, local), parent);
}

export function resolveSolidOverlay({
  backgroundImage,
  fallback,
  local,
  modeIndex,
  resolve,
}) {
  if (backgroundImage === 'none') return null;
  if (backgroundImage == null) {
    return fallback == null ? null : resolve(fallback, modeIndex, local);
  }
  const match = backgroundImage.match(/^linear-gradient\((.+),\s*\1\)$/);
  if (!match) {
    throw new Error(`Unsupported state overlay: ${backgroundImage}`);
  }
  return resolve(match[1], modeIndex, local);
}

export function localVariables(...styles) {
  return Object.fromEntries(
    styles
      .flatMap(style => Object.entries(style ?? {}))
      .filter(
        ([name, value]) => name.startsWith('--') && typeof value === 'string',
      ),
  );
}

export function measureContrast(foreground, background, detail) {
  return {
    ratio: contrastRatio(foreground, background),
    foreground,
    background,
    detail,
  };
}

export function lowest(results) {
  if (results.length === 0) throw new Error('Expected at least one result');
  return results.reduce((worst, result) =>
    result.ratio < worst.ratio ? result : worst,
  );
}

export function formatRatio(value) {
  return `${value.toFixed(2)}:1`;
}

export function documentedMeasurement(
  label,
  measurement,
  minimum,
  {applicability, detail} = {},
) {
  return {
    label,
    value: formatRatio(measurement.ratio),
    ...(detail ? {detail} : {}),
    ...(applicability ? {applicability} : {}),
    colorPair: {
      foreground: measurement.foreground,
      background: measurement.background,
    },
    ...(measurement.ratio < minimum && {status: 'Fail'}),
  };
}

export function resultStatus(measurements) {
  return measurements.some(
    measurement =>
      (measurement.applicability == null ||
        measurement.applicability === 'Required') &&
      measurement.status === 'Fail',
  )
    ? 'Fail'
    : 'Pass';
}

export function displayName(value) {
  return value[0].toUpperCase() + value.slice(1);
}
