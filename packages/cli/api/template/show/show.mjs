// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `template.show` leaf — return a resolved template's source, exactly as
 * `template.copy` writes it, plus the components it composes.
 *
 * @position api/template/show — reads the resolved match's source file; the
 *   template dispatcher routes `show` (and the no-target-path default) here.
 */

import * as fs from 'node:fs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {
  extractComponents,
  pkgOf,
  replaceDemoMedia,
} from '../../../foundation/discovery/template-adapter.mjs';

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

  // The source template.copy writes (spec:AST-028 FR7): a template printed and
  // pasted must not keep a media path only Astryx's previews serve, and the
  // caller is told how many it replaced, the way the copy receipt tells it.
  const {source, demoMediaReplaced} = replaceDemoMedia(
    fs.readFileSync(match.filePath, 'utf-8'),
  );

  return {
    type: 'template.show',
    data: {
      template: match.dirName,
      description: match.description,
      type: match.type,
      package: pkgOf(match),
      components: extractComponents(match.filePath),
      source,
      demoMediaReplaced,
    },
  };
}
