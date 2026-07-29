// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `template.copy` leaf — scaffold a resolved template into the project
 * (side effect) and return a `template.copy` receipt.
 *
 * @position api/template/copy — the only side-effecting template leaf: resolves
 *   a path-safe destination, strips demo asset refs, writes the file, and
 *   returns the receipt. The template dispatcher routes the copy case here.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  assertWithin,
  isFilePathArg,
  PathSafetyError,
} from '../../../utils/path-safety.mjs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../lib/error-codes.mjs';
import {stripTemplateAssetRefs} from '../_adapter.mjs';

/**
 * Scaffold an already-resolved template to `targetPath` (relative to `cwd`) and
 * return the `template.copy` receipt.
 * @param {import('../_adapter.mjs').DiscoveredTemplate} match
 * @param {{targetPath: string, cwd: string}} ctx
 * @returns {import('../template.type.mjs').TemplateCopyResponse}
 */
export function templateCopy(match, {targetPath, cwd}) {
  if (!fs.existsSync(match.filePath)) {
    throw new AstryxError(
      `No source file found for template "${match.dirName}"`,
      undefined,
      ERROR_CODES.ERR_NO_SOURCE,
    );
  }

  // Path-safety: resolve the user-supplied targetPath relative to cwd,
  // rejecting absolute paths and any traversal that escapes the project
  // root. This guard runs BEFORE any mkdir/copyFile so we never create
  // directories outside the root just to fail on the file write.
  let resolvedTarget;
  try {
    resolvedTarget = assertWithin(targetPath, cwd, {
      label: 'template target path',
    });
  } catch (err) {
    if (err instanceof PathSafetyError) {
      throw new AstryxError(
        err.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw err;
  }

  // If targetPath looks like a file (e.g. `./foo.tsx`), write directly to
  // it. Previously this path was treated as a directory and the file was
  // written as `./foo.tsx/page.tsx`, which is wrong and surprising.
  let outputDir;
  let outputFileName;
  let outputFilePath;
  if (isFilePathArg(targetPath)) {
    outputDir = path.dirname(resolvedTarget);
    outputFileName = path.basename(resolvedTarget);
    outputFilePath = resolvedTarget;
  } else {
    outputDir = resolvedTarget;
    outputFileName =
      match.type === 'block' ? path.basename(match.filePath) : 'page.tsx';
    outputFilePath = path.join(outputDir, outputFileName);
  }

  fs.mkdirSync(outputDir, {recursive: true});

  // Strip demo image references so the scaffolded file renders without a
  // Meta-only network dependency.
  const source = fs.readFileSync(match.filePath, 'utf-8');
  const outputSource = stripTemplateAssetRefs(source);
  fs.writeFileSync(outputFilePath, outputSource);

  const relOutput = path.relative(cwd, outputDir) || '.';
  return {
    type: 'template.copy',
    data: {
      template: match.dirName,
      outputDir: relOutput,
      fileName: outputFileName,
      filesCopied: 1,
    },
  };
}
