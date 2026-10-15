// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports from parseUnifiedDiff.ts and diffTypes.ts
 * @output Exports the structured diff model and the unified-diff parser
 * @position Entry point for the DiffViewer folder; re-exported by
 *   /packages/lab/src/index.ts
 */

export {parseUnifiedDiff} from './parseUnifiedDiff';
export type {
  DiffViewerFile,
  DiffViewerFileStatus,
  DiffViewerHunk,
  DiffViewerLine,
  DiffViewerLineKind,
  DiffViewerLineRef,
  DiffViewerSide,
} from './diffTypes';
