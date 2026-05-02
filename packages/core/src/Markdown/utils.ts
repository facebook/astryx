/**
 * @file utils.ts
 * @output Server-safe re-exports of pure Markdown parser functions
 * @position Subpath entry point: `@xds/core/Markdown/utils`
 */

export {
  parseMarkdown,
  parseInline,
  parseMarkdownIncremental,
  createIncrementalState,
  trimStreamingArtifacts,
} from './parser';

export type {
  InlineNode,
  BlockNode,
  ListItemNode,
  TableCellNode,
  TableAlignment,
  IncrementalState,
} from './parser';
