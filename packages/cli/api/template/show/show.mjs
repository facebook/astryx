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
import {extractComponents} from '../../../foundation/discovery/template-adapter.mjs';

/**
 * Build the `template.show` envelope for an already-resolved template.
 * @param {import('../../../foundation/discovery/template-adapter.mjs').DiscoveredTemplate} match
 * @returns {import('../template.type.mjs').TemplateShowResponse}
 */
export function templateShow(match) {
  if (!fs.existsSync(match.filePath)) {
    throw new AstryxError(
      `No source file found for template "${match.dirName}"`,
      undefined,
      ERROR_CODES.ERR_NO_SOURCE,
    );
  }

  return {
    type: 'template.show',
    data: {
      template: match.dirName,
      description: match.description,
      type: match.type,
      components: extractComponents(match.filePath),
      source: fs.readFileSync(match.filePath, 'utf-8'),
    },
  };
}
