// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Sealed doc load-boundary schemas (doctypes-internal).
 *
 * These zod schemas are the implementation detail behind the doctypes parsers.
 * They are NOT part of the public authoring surface: nothing outside
 * `authoring/doctypes/**` imports them, and they never appear in a public type.
 * They accept BOTH the stamped formats (`type: 'component' | 'function' |
 * 'generic'`) and the legacy loose `export const docs = {...}` shape, so the
 * ~600+ existing docs keep validating unchanged.
 */

import {z} from 'zod';

const PropSchema = z
  .object({
    name: z.string().min(1, 'prop name is required'),
    type: z.string().min(1, 'prop type is required'),
    description: z.string(),
    default: z.string().optional(),
    required: z.boolean().optional(),
  })
  .passthrough();

const ParamSchema = z
  .object({
    name: z.string().min(1, 'param name is required'),
    type: z.string().min(1, 'param type is required'),
    description: z.string(),
    default: z.string().optional(),
    required: z.boolean().optional(),
  })
  .passthrough();

const ReturnSchema = z
  .object({
    name: z.string().min(1, 'return name is required'),
    type: z.string().min(1, 'return type is required'),
    description: z.string(),
  })
  .passthrough();

const BaseDocFields = {
  name: z.string().min(1, 'name is required'),
  displayName: z.string().optional(),
  description: z.string().optional(),
  usage: z.unknown().optional(),
  group: z.string().optional(),
  category: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  parent: z.string().optional(),
  relatedDocs: z.array(z.string()).optional(),
  hidden: z.boolean().optional(),
  isHiddenFromOverview: z.boolean().optional(),
};

/** New-format stamped component doc (`type: 'component'`). */
export const ComponentDocKindSchema = z
  .object({
    ...BaseDocFields,
    type: z.literal('component'),
    props: z.array(PropSchema),
    theming: z.unknown().optional(),
    playground: z.unknown().optional(),
    examples: z.array(z.unknown()).optional(),
  })
  .passthrough();

/** New-format stamped function/hook doc (`type: 'function'`). */
export const FunctionDocKindSchema = z
  .object({
    ...BaseDocFields,
    type: z.literal('function'),
    params: z.array(ParamSchema),
    returns: z.array(ReturnSchema),
  })
  .passthrough();

/** New-format stamped generic reference/topic doc (`type: 'generic'`). */
export const GenericDocKindSchema = z
  .object({
    ...BaseDocFields,
    type: z.literal('generic'),
  })
  .passthrough();

// ── Legacy loose format (unchanged, kept for back-compat) ─────────────
const LegacyBaseDocSchema = z.object({
  name: z.string().min(1, 'name is required'),
  displayName: z.string().optional(),
  description: z.string().optional(),
  group: z.string().optional(),
  category: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  isHiddenFromOverview: z.boolean().optional(),
  hidden: z.boolean().optional(),
  hiddenComponents: z.array(z.string()).optional(),
  usage: z.unknown().optional(),
  playground: z.unknown().optional(),
  theming: z.unknown().optional(),
  examples: z.array(z.unknown()).optional(),
  showcase: z.unknown().optional(),
  parent: z.string().optional(),
  relatedDocs: z.array(z.string()).optional(),
  relatedComponents: z.array(z.string()).optional(),
  relatedHooks: z.array(z.string()).optional(),
});

const LegacySingleComponentDocSchema = LegacyBaseDocSchema.extend({
  props: z.array(PropSchema),
}).passthrough();

const LegacyMultiComponentDocSchema = LegacyBaseDocSchema.extend({
  components: z.array(z.unknown()),
}).passthrough();

const LegacyHookDocSchema = LegacyBaseDocSchema.extend({
  params: z.array(ParamSchema),
  returns: z.array(ReturnSchema),
}).passthrough();

const LegacySubComponentDocSchema = LegacyBaseDocSchema.extend({
  subComponentOf: z.string().min(1, 'subComponentOf is required'),
  description: z.string(),
  props: z.array(PropSchema),
}).passthrough();

/** The permissive legacy union (sub-component first, then hook, multi, single). */
export const LegacyDocSchema = z.union([
  LegacySubComponentDocSchema,
  LegacyHookDocSchema,
  LegacyMultiComponentDocSchema,
  LegacySingleComponentDocSchema,
]);
