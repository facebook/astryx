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

/** Return entry for the generalized function doc: `name` is optional so CLI/API
 *  functions can document their `{type, data}` envelope entries (which have no
 *  field name), while hooks keep listing named return fields. */
const FunctionReturnSchema = z
  .object({
    name: z.string().min(1).optional(),
    type: z.string().min(1, 'return type is required'),
    description: z.string(),
  })
  .passthrough();

/** New-format stamped function doc (`type: 'function'`) — hooks and CLI/API
 *  functions alike (the discriminant and schema are shared). */
export const FunctionDocKindSchema = z
  .object({
    ...BaseDocFields,
    type: z.literal('function'),
    params: z.array(ParamSchema),
    returns: z.array(FunctionReturnSchema),
  })
  .passthrough();

/** New-format stamped generic reference/topic doc (`type: 'generic'`). */
export const GenericDocKindSchema = z
  .object({
    ...BaseDocFields,
    type: z.literal('generic'),
    // Declared rather than left to the passthrough: these two are read by
    // docs discovery to resolve one topic against another, so a non-string
    // should fail at the load boundary, not halfway through resolution.
    replaces: z.string().optional(),
    extends: z.string().optional(),
  })
  .passthrough();

/** Recursive field descriptor for a SchemaDoc (objects nest via `fields`). The
 *  explicit cast breaks the self-referential type inference (TS7022) that the
 *  authoring-contract `checkJs` pass would otherwise flag. */
const SchemaFieldSchema =
  /** @type {import('zod').ZodType<import('./schema/type').SchemaFieldDoc>} */ (
    z.lazy(() =>
      z
        .object({
          name: z.string().min(1, 'field name is required'),
          // `{error}` covers a missing (undefined) type; `.min(1)` covers an
          // empty string — both give the same author-friendly message.
          type: z
            .string({error: 'field type is required'})
            .min(1, 'field type is required'),
          description: z.string(),
          required: z.boolean().optional(),
          default: z.string().optional(),
          example: z.string().optional(),
          deprecated: z.string().optional(),
          fields: z.array(SchemaFieldSchema).optional(),
        })
        .passthrough(),
    )
  );

/** New stamped schema doc (`type: 'schema'`) — documents an authored object. */
export const SchemaDocKindSchema = z
  .object({
    type: z.literal('schema'),
    name: z.string().min(1, 'name is required'),
    displayName: z.string().min(1, 'displayName is required'),
    description: z.string(),
    namespace: z.string().optional(),
    aliases: z.array(z.string()).optional(),
    appliesTo: z.string().optional(),
    fields: z.array(SchemaFieldSchema),
    examples: z
      .array(z.object({label: z.string().optional(), code: z.string()}).passthrough())
      .optional(),
    notes: z.array(z.unknown()).optional(),
  })
  .passthrough();

/** New stamped command doc (`type: 'command'`) — a function's terminal binding;
 *  references a FunctionDoc via `fn`. */
export const CommandDocKindSchema = z
  .object({
    type: z.literal('command'),
    name: z.string().min(1, 'name is required'),
    displayName: z.string().min(1, 'displayName is required'),
    summary: z.string(),
    description: z.string().optional(),
    namespace: z.string().optional(),
    aliases: z.array(z.string()).optional(),
    fn: z.string().optional(),
    args: z
      .array(
        z
          .object({
            name: z.string().min(1),
            param: z.string().optional(),
            description: z.string().optional(),
            required: z.boolean().optional(),
            variadic: z.boolean().optional(),
          })
          .passthrough(),
      )
      .optional(),
    options: z
      .array(
        z
          .object({
            flag: z.string().min(1),
            param: z.string().optional(),
            description: z.string().optional(),
            choices: z.array(z.string()).optional(),
            default: z
              .union([z.string(), z.boolean(), z.array(z.string())])
              .optional(),
            cliOnly: z.boolean().optional(),
          })
          .passthrough(),
      )
      .optional(),
    subcommands: z.array(z.string()).optional(),
    examples: z
      .array(
        z
          .object({
            label: z.string().optional(),
            cli: z.string(),
            output: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    exitCodes: z
      .array(z.object({code: z.number(), when: z.string()}).passthrough())
      .optional(),
    related: z.array(z.string()).optional(),
    notes: z.array(z.unknown()).optional(),
  })
  .passthrough();

/** New stamped enum doc (`type: 'enum'`) — a closed vocabulary (error codes,
 *  response-type discriminants). */
export const EnumDocKindSchema = z
  .object({
    type: z.literal('enum'),
    name: z.string().min(1, 'name is required'),
    displayName: z.string().min(1, 'displayName is required'),
    description: z.string(),
    namespace: z.string().optional(),
    aliases: z.array(z.string()).optional(),
    members: z.array(
      z
        .object({
          value: z.string().min(1, 'member value is required'),
          description: z.string(),
          deprecated: z.string().optional(),
        })
        .passthrough(),
    ),
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
