/**
 * @xds/lab — Experimental XDS components
 *
 * Components here are functional but not yet hardened for production.
 * They're available in storybook and sandbox for testing and iteration.
 * Once vetted, components graduate to @xds/core.
 *
 * This package is never published to npm.
 */

export {
  XDSCommandPalette,
  type XDSCommandPaletteProps,
  XDSCommandPaletteInput,
  type XDSCommandPaletteInputProps,
  XDSCommandPaletteList,
  type XDSCommandPaletteListProps,
  XDSCommandPaletteItem,
  type XDSCommandPaletteItemProps,
  XDSCommandPaletteGroup,
  type XDSCommandPaletteGroupProps,
  XDSCommandPaletteFooter,
  type XDSCommandPaletteFooterProps,
  useCommandPaletteContext,
  type CommandPaletteContextValue,
  defaultFilter,
  type CommandPaletteFilterFn,
} from './CommandPalette';

// Code components — syntax highlighting domain
export {XDSCodeBlock, type XDSCodeBlockProps} from './CodeBlock';
export {XDSCodeEditor, type XDSCodeEditorProps} from './CodeEditor';
export {tokenize, type Token} from './CodeBlock/tokenizer';
export {syntaxColorDefaults} from './CodeBlock/tokens.stylex';
