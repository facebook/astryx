// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Schema doc types — documentation for an authored/received OBJECT shape
 * (astryx.config, astryx.integration, a codemod, the doc-types themselves, the
 * response envelope). Colocated as a `.doc.mjs` next to the schema it describes.
 */

import type {ReferenceContentBlock} from '../reference/type';

/**
 * One documented field of a schema. Object fields nest via `fields`, so a whole
 * shape (including `hooks.postCodemod` or `experimental.xle`) is one tree.
 */
export interface SchemaFieldDoc {
  /** Field name, or a dotted path for a nested field (e.g. 'hooks.postCodemod'). */
  name: string;
  /** TypeScript type signature as a string, e.g. 'string[]' | "'a' | 'b'". */
  type: string;
  /** What the field is for, in 1-2 sentences. */
  description: string;
  /** True if the field must be provided. Omit (don't set false) if optional. */
  required?: boolean;
  /** Default value as a string, if any. */
  default?: string;
  /** A short inline example value. */
  example?: string;
  /** Deprecation reason, if the field is deprecated. */
  deprecated?: string;
  /** Nested object fields, for object-typed fields. */
  fields?: SchemaFieldDoc[];
}

/**
 * A schema/object documentation file (.doc.mjs), colocated with the schema.
 *
 *   /\*\* @type {import('@astryxdesign/cli/authoring').SchemaDoc} \*\/
 *   export const doc = { type: 'schema', name: 'config', ... };
 */
export interface SchemaDoc {
  /** Doc-kind discriminant. */
  type?: 'schema';
  /** URL-safe identifier, used as the docs slug within its namespace. */
  name: string;
  /** Human-readable title, e.g. 'Astryx Config'. */
  displayName: string;
  /** One-line summary shown in listings. */
  description: string;
  /** Docs namespace path (e.g. 'cli' | 'authoring'). Defaults are applied by
   *  the docs index; set explicitly to place the schema. */
  namespace?: string;
  /** Alternate slugs that also resolve to this doc (back-compat). */
  aliases?: string[];
  /** What this schema applies to, e.g. 'astryx.config.{ts,mjs,js}' | 'AstryxConfig'. */
  appliesTo?: string;
  /** The fields that make up the shape. */
  fields: SchemaFieldDoc[];
  /** Full example objects/snippets. */
  examples?: {label?: string; code: string}[];
  /** Freeform prose/notes rendered after the field table. */
  notes?: ReferenceContentBlock[];
}
