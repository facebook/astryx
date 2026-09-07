// Copyright (c) Meta Platforms, Inc. and affiliates.

export type RtlAuditApplicability =
  {applicable: true; reason?: string} | {applicable: false; reason: string};

/** D1 applicability metadata for one Storybook meta or story. */
export type RtlAuditParameters = {
  D1?: RtlAuditApplicability;
};

/**
 * Typed Storybook parameters consumed by the rendered RTL audit marker.
 * Story-level values override component-meta values through Storybook's normal
 * resolved-parameter precedence.
 */
export function rtlAuditParameters(rtlAudit: RtlAuditParameters): {
  rtlAudit: RtlAuditParameters;
} {
  return {rtlAudit};
}
