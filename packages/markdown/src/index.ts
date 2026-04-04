/**
 * @file index.ts
 * @output Exports all public components and types for @xds/markdown
 * @position Package entry point
 */

export {XDSMarkdown} from './XDSMarkdown';
export type {XDSMarkdownProps, XDSMarkdownComponents} from './XDSMarkdown';

// Re-export LinkifyPattern for convenience — consumers need it for the linkifyPatterns prop
export type {LinkifyPattern} from '@xds/core/Link';
