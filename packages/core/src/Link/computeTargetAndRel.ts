// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file computeTargetAndRel.ts
 * @input Link target and rel values
 * @output Exports helper for normalizing target/rel link props
 * @position Internal utility; consumed by link-rendering components
 */

const BLANK_TARGET_REL_TOKENS = ['noopener', 'noreferrer'] as const;

export function computeTargetAndRel(
  target: string | undefined,
  rel: string | undefined,
): {rel: string | undefined; target: string | undefined} {
  if (target !== '_blank') {
    return {target, rel};
  }

  const tokens = rel?.split(/\s+/).filter(Boolean) ?? [];
  for (const token of BLANK_TARGET_REL_TOKENS) {
    if (!tokens.includes(token)) {
      tokens.push(token);
    }
  }

  return {
    target,
    rel: tokens.join(' '),
  };
}
