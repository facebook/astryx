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
} from '../../../foundation/fs/path-safety.mjs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {stripTemplateAssetRefs} from '../../../foundation/discovery/template-adapter.mjs';

/**
 * Scaffold an already-resolved template to `targetPath` (relative to `cwd`) and
 * return the `template.copy` receipt.
 * @param {import('../../../foundation/discovery/template-adapter.mjs').DiscoveredTemplate} match
 * @param {{targetPath: string, cwd: string, overwrite?: boolean}} ctx
 * @returns {import('../template.type.mjs').TemplateCopyResponse}
 */
export function templateCopy(match, {targetPath, cwd, overwrite = false}) {
  if (!fs.existsSync(match.filePath)) {
    throw new AstryxError(
      `No source file found for template "${match.dirName}"`,
      undefined,
      ERROR_CODES.ERR_NO_SOURCE,
    );
  }

  // If targetPath looks like a file (e.g. `./foo.tsx`), write directly to
  // it. Previously this path was treated as a directory and the file was
  // written as `./foo.tsx/page.tsx`, which is wrong and surprising.
  const fileTarget = isFilePathArg(targetPath)
    ? targetPath
    : path.join(
        targetPath,
        match.type === 'block' ? path.basename(match.filePath) : 'page.tsx',
      );

  // Path-safety: the guard sees the file that will be written, not only its
  // directory — a symlink at that name would otherwise carry the write
  // outside the project root. Runs BEFORE any mkdir/write.
  let outputFilePath;
  try {
    outputFilePath = assertWithin(fileTarget, cwd, {
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
  const outputDir = path.dirname(outputFilePath);
  const outputFileName = path.basename(outputFilePath);

  // Refuse to clobber an existing file unless the caller opts in. The CLI has
  // its own pre-flight collision message, but the API is a public surface
  // (@astryxdesign/cli/api) and must enforce this itself — same guard the peer
  // theme/add write-leaf applies.
  if (!overwrite && fs.existsSync(outputFilePath)) {
    const rel = path.relative(cwd, outputFilePath) || outputFilePath;
    throw new AstryxError(
      `Refusing to overwrite existing file ${rel}. Re-run with overwrite to replace it.`,
      undefined,
      ERROR_CODES.ERR_FILE_EXISTS,
    );
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
