/**
 * @xds/lab — Experimental XDS components
 *
 * Components here are functional but not yet hardened for production.
 * They're available in storybook and sandbox for testing and iteration.
 * Once vetted, components graduate to @xds/core.
 *
 * This package is never published to npm.
 */

// Code components — syntax highlighting domain
export {XDSCodeBlock, type XDSCodeBlockProps} from './CodeBlock';
export {XDSCodeEditor, type XDSCodeEditorProps} from './CodeEditor';
export {
  tokenize,
  tokenizeAsync,
  SYNC_TOKENIZE_THRESHOLD,
  type Token,
} from '@xds/core/CodeBlock';

// Chat — experimental reasoning display
export {
  XDSChatReasoning,
  type XDSChatReasoningProps,
} from './ChatReasoning/XDSChatReasoning';

// SVG Icon system — CSS-variable-driven multi-variation icons
export {
  XDSSVGIcon,
  type XDSSVGIconProps,
  type SVGIconVariation,
  type SVGIconSize,
  type SVGIconColor,
  type SVGIconDef,
  type IconShape,
  iconVars,
  variations,
  opticalSize,
  convertSVG,
  iconDefToTSX,
  iconDefToSVG,
  xIcon,
  checkIcon,
  bellIcon,
  homeIcon,
  settingsIcon,
  calendarIcon,
  starterIcons,
} from './SVGIcon';
