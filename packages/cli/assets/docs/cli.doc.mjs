// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli`: every command, API function, output schema, and
 * enum the CLI documents, one section each.
 *
 * Built from the docs whose `namespace` is `cli/commands` or `cli/api`, so it
 * cannot drift from the commands and functions it describes. `astryx doctor`
 * names a CLI doc with no namespace, or one no topic reads.
 */

import {buildCliTopic} from '../../foundation/discovery/cli-self-docs.mjs';

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = await buildCliTopic();
