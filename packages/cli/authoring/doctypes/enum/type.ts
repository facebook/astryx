// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Enum doc types — a closed vocabulary (error codes, response-type
 * discriminants). Colocated next to the source of truth it documents.
 */

/** One member of an enumerated vocabulary. */
export interface EnumMemberDoc {
  /** The literal value, e.g. 'ERR_UNKNOWN_TOPIC' | 'component.list'. */
  value: string;
  /** What the value means / when it occurs. */
  description: string;
  /** Deprecation reason, if deprecated. */
  deprecated?: string;
}

/**
 * An enumeration documentation file (.doc.mjs).
 *
 *   /\*\* @type {import('@astryxdesign/cli/authoring').EnumDoc} \*\/
 *   export const doc = { type: 'enum', name: 'error-codes', ... };
 */
export interface EnumDoc {
  /** Doc-kind discriminant. */
  type?: 'enum';
  /** URL-safe identifier, used as the docs slug within its namespace. */
  name: string;
  /** Human-readable title. */
  displayName: string;
  /** One-line summary shown in listings. */
  description: string;
  /** Docs namespace path. Defaults to 'cli' when applied by the docs index. */
  namespace?: string;
  /** Alternate slugs that also resolve to this doc. */
  aliases?: string[];
  /** The enumerated members. */
  members: EnumMemberDoc[];
}
