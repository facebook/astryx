// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @astryxdesign/lab — Experimental Astryx components
 *
 * Components here are functional but not yet hardened for production.
 * They're available in storybook and sandbox for testing and iteration.
 * Once vetted, components graduate to @astryxdesign/core.
 *
 * This package is published to npm ONLY under the @canary dist-tag
 * (npm install @astryxdesign/lab@canary). It is never released as a
 * stable (latest) version.
 */

// Code components — syntax highlighting domain
export {CodeBlock, type CodeBlockProps} from './CodeBlock';
export {CodeEditor, type CodeEditorProps} from './CodeEditor';
export {
  tokenize,
  tokenizeAsync,
  SYNC_TOKENIZE_THRESHOLD,
  type SyntaxToken,
} from '@astryxdesign/core/CodeBlock';

// InfoTip — accessible info-icon help affordance (RFC facebook/astryx#3349)
export {InfoTip, type InfoTipProps, type InfoTipSize} from './InfoTip';

// Chat — experimental reasoning display
export {
  ChatReasoning,
  type ChatReasoningProps,
} from './ChatReasoning/ChatReasoning';
export * from './Chat';

// Drawer — experimental overlay panel
export {Drawer, type DrawerProps} from './Drawer';

// Stat — experimental KPI/metric display
export {
  Stat,
  type StatProps,
  type StatDelta,
  type StatDeltaDirection,
  type StatDeltaSentiment,
  type StatSize,
} from './Stat';

// Schedule — experimental full-calendar views
export * from './Schedule';

// SVG Icon system — CSS-variable-driven multi-variation icons
export {
  SVGIcon,
  type SVGIconProps,
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
  Chart,
  type ChartProps,
  type YBaseline,
  ChartAxis,
  type ChartAxisProps,
  ChartGrid,
  type ChartGridProps,
  ChartBar,
  type ChartBarProps,
  ChartLine,
  type ChartLineProps,
  ChartArea,
  type ChartAreaProps,
  ChartErrorBar,
  type ChartErrorBarProps,
  ChartCandlestick,
  type ChartCandlestickProps,
  ChartDot,
  type ChartDotProps,
  ChartDotGL,
  type ChartDotGLProps,
  ChartDotGLInteractive,
  type ChartDotGLInteractiveProps,
  ChartHeatmapGL,
  type ChartHeatmapGLProps,
  ChartStreamGL,
  type ChartStreamGLProps,
  type ChartStreamGLHandle,
  ChartTooltip,
  type ChartTooltipProps,
  type ChartCrosshairMode,
  ChartLegend,
  type ChartLegendProps,
  type ChartLegendItem,
  useChart,
  type ChartContext,
  type ChartMargin,
  type ChartScale,
  m4Reduce,
  type M4Point,
  useChartColors,
  useChartRange,
  type UseChartRangeOptions,
  type UseChartRangeReturn,
  getChartColors,
  getChartColorsFromResolver,
  type ChartColorsAPI,
  type SequentialHue,
  type TokenResolver,
  compactNumber,
  currency,
  percent,
  shortDate,
  monthYear,
} from './Chart';

// Radial charts — spider, pie, donut
export {
  RadialChart,
  type RadialChartProps,
  RadialGrid,
  type RadialGridProps,
  RadialArea,
  type RadialAreaProps,
  RadialAxis,
  type RadialAxisProps,
  RadialSlice,
  type RadialSliceProps,
  RadialTooltip,
  type RadialTooltipProps,
  type RadialTooltipDatum,
  useRadial,
  type RadialContext,
  type RadialMode,
} from './Radial';

// 3D charts — projected SVG with interactive rotation
export {
  ThreeDChart,
  type ThreeDChartProps,
  ThreeDScatter,
  ThreeDScatterGL,
  type ThreeDScatterProps,
  type ThreeDScatterGLProps,
  ThreeDBar,
  type ThreeDBarProps,
  ThreeDGrid,
  type ThreeDGridProps,
  ThreeDAxis,
  type ThreeDAxisProps,
  ThreeDSurface,
  type ThreeDSurfaceProps,
  use3D,
  type ThreeDContext,
  type Camera,
  type Point3D,
  type ProjectedPoint,
} from './ThreeD';

// Chart interactions
export {
  ChartBrush,
  type ChartBrushProps,
  type BrushMode,
  type BrushRange,
  ChartZoom,
  type ChartZoomProps,
  ChartSelect,
  type ChartSelectProps,
  ChartReferenceLine,
  type ChartReferenceLineProps,
} from './Chart';

// Sankey / flow diagrams — ribbon-based flow visualization
export {
  SankeyChart,
  type SankeyChartProps,
  SankeyLink,
  type SankeyLinkProps,
  SankeyNode,
  type SankeyNodeProps,
  SankeyLabel,
  type SankeyLabelProps,
  useSankey,
  type SankeyNodeDatum,
  type SankeyLinkDatum,
  type SankeyColumn,
  type SankeyColumnDef,
  type SankeyNodeLayout,
  type SankeyLinkLayout,
  type SankeyColumnLayout,
  SankeyGrid,
  type SankeyGridProps,
  type SankeyContext,
} from './Sankey';

// Chart v2 (config model) moved to its own package: @astryxdesign/charts.
// It is no longer re-exported from @astryxdesign/lab.
export * from './Stepper';
export * from './CircularProgress';

// LogStream — experimental streaming log viewer
export {
  LogStream,
  type LogStreamProps,
  type LogEntry,
  type LogStreamLevel,
} from './LogStream';
