// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Static template authoring API (public `@astryxdesign/cli/template`).
 *
 * The `createPageTemplate`/`createBlockTemplate` authoring helpers now live in
 * `@astryxdesign/core/authoring` and are re-exported here so existing
 * `@astryxdesign/cli/template` imports keep working. The Zod load-boundary
 * schemas live in `./schemas/template-schema.mjs` (core-free) and are
 * re-exported here for back-compat; internal hot-path code imports them from
 * the schema module directly so it never depends on core's built `dist/`.
 */

export {createPageTemplate, createBlockTemplate} from '@astryxdesign/core/authoring';
export {BaseTemplateSchema, TemplateEnvelopeSchema} from './schemas/template-schema.mjs';
