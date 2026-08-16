// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `template.show` leaf — return a resolved template's raw source plus the
 * components it composes.
 *
 * @position api/template/show — reads the resolved match's source file; the
 *   template dispatcher routes `show` (and the no-target-path default) here.
 */

import * as fs from 'node:fs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {extractComponentsFromSource} from '../../../foundation/discovery/template-adapter.mjs';
import {applyTransformContext} from '../transform/apply.mjs';

/**
 * Build the `template.show` envelope for an already-resolved template. When the
 * caller asked for the app shell, it is applied to the emitted source here (a
 * pure output-layer — the on-disk template is untouched) and the applied
 * package is reported via `transformedBy`.
 *
 * @param {import('../../../foundation/discovery/template-adapter.mjs').DiscoveredTemplate} match
 * @param {import('../transform/apply.mjs').TemplateTransformContext} [transformCtx]
 * @returns {import('../template.type.mjs').TemplateShowResponse}
 */
export function templateShow(match, transformCtx) {
  if (!fs.existsSync(match.filePath)) {
    throw new AstryxError(
      `No source file found for template "${match.dirName}"`,
      undefined,
      ERROR_CODES.ERR_NO_SOURCE,
    );
  }

  const raw = fs.readFileSync(match.filePath, 'utf-8');
  const {source, transformedBy} = applyTransformContext(
    raw,
    match.filePath,
    transformCtx,
  );

  return {
    type: 'template.show',
    data: {
      template: match.dirName,
      description: match.description,
      type: match.type,
      components: extractComponentsFromSource(source),
      source,
      ...(transformedBy.length > 0 ? {transformedBy} : {}),
    },
  };
}
