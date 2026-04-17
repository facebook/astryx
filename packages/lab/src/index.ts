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
  type IconShapeRole,
  iconVars,
  variations,
  opticalSize,
  xIcon,
  checkIcon,
  bellIcon,
  homeIcon,
  settingsIcon,
  calendarIcon,
  menuIcon,
  heartIcon,
  eyeIcon,
  starIcon,
  folderIcon,
  shieldIcon,
  searchIcon,
  mailIcon,
  lockIcon,
  starterIcons,
} from './SVGIcon';

// Chart components — composable d3-based data visualization
export {
  XDSChart,
  type XDSChartProps,
  type YBaseline,
  XDSChartAxis,
  type XDSChartAxisProps,
  XDSChartGrid,
  type XDSChartGridProps,
  XDSChartBar,
  type XDSChartBarProps,
  XDSChartLine,
  type XDSChartLineProps,
  XDSChartArea,
  type XDSChartAreaProps,
  XDSChartErrorBar,
  type XDSChartErrorBarProps,
  XDSChartCandlestick,
  type XDSChartCandlestickProps,
  XDSChartDot,
  type XDSChartDotProps,
  XDSChartDotGL,
  type XDSChartDotGLProps,
  XDSChartDotGLInteractive,
  type XDSChartDotGLInteractiveProps,
  XDSChartHeatmapGL,
  type XDSChartHeatmapGLProps,
  XDSChartStreamGL,
  type XDSChartStreamGLProps,
  type XDSChartStreamGLHandle,
  XDSChartTooltip,
  type XDSChartTooltipProps,
  XDSChartLegend,
  type XDSChartLegendProps,
  type XDSChartLegendItem,
  useChart,
  type ChartContext,
  type ChartMargin,
  type ChartScale,
  m4Reduce,
  type M4Point,
  useXDSChartColors,
  useXDSChartRange,
  type UseXDSChartRangeOptions,
  type UseXDSChartRangeReturn,
  getXDSChartColors,
  getXDSChartColorsFromResolver,
  type XDSChartColorsAPI,
  type SequentialHue,
  type TokenResolver,
} from './Chart';

// Radial charts — spider, pie, donut
export {
  XDSRadialChart,
  type XDSRadialChartProps,
  XDSRadialGrid,
  type XDSRadialGridProps,
  XDSRadialArea,
  type XDSRadialAreaProps,
  XDSRadialAxis,
  type XDSRadialAxisProps,
  XDSRadialSlice,
  type XDSRadialSliceProps,
  useRadial,
  type RadialContext,
  type RadialMode,
} from './Radial';

// 3D charts — projected SVG with interactive rotation
export {
  XDS3DChart,
  type XDS3DChartProps,
  XDS3DScatter,
  type XDS3DScatterProps,
  XDS3DBar,
  type XDS3DBarProps,
  XDS3DGrid,
  type XDS3DGridProps,
  XDS3DAxis,
  type XDS3DAxisProps,
  XDS3DSurface,
  type XDS3DSurfaceProps,
  use3D,
  type ThreeDContext,
  type Camera,
  type Point3D,
  type ProjectedPoint,
} from './ThreeD';
