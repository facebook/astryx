// Copyright (c) Meta Platforms, Inc. and affiliates.

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
export {CodeBlock, type CodeBlockProps} from './CodeBlock';
export {CodeEditor, type CodeEditorProps} from './CodeEditor';
export {
  tokenize,
  tokenizeAsync,
  SYNC_TOKENIZE_THRESHOLD,
  type SyntaxToken,
} from '@xds/core/CodeBlock';

// Chat — experimental reasoning display
export {
  ChatReasoning,
  type ChatReasoningProps,
} from './ChatReasoning/ChatReasoning';

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

// Chart v2 — config model
export {
  Chart as ChartV2,
  type ChartProps as ChartV2Props,
  ChartLegend as ChartV2Legend,
  type ChartLegendProps as ChartV2LegendProps,
  type LegendItem as ChartV2LegendItem,
  ChartAxis as ChartV2Axis,
  type ChartAxisProps as ChartV2AxisProps,
  ChartGrid as ChartV2Grid,
  type ChartGridProps as ChartV2GridProps,
  ChartSwatch as ChartV2Swatch,
  swatchVariantForType as xdsChartV2SwatchVariantForType,
  type ChartSwatchProps as ChartV2SwatchProps,
  type ChartSwatchVariant as ChartV2SwatchVariant,
  ChartTooltip as ChartV2Tooltip,
  type ChartTooltipProps as ChartV2TooltipProps,
  type ChartTooltipPlacement as ChartV2TooltipPlacement,
  type TooltipSeriesValue as ChartV2TooltipSeriesValue,
  bar,
  line,
  dot,
  area,
  band,
  candlestick,
  errorBar,
  referenceLine,
  dotGL,
  dotGLInteractive,
  heatmapGL,
  streamGL,
  useChartV2,
  type SeriesDef,
  type ChartV2Context,
  type ChartPointerEvent,
  type ResolvedPoint,
  type ResolvedPositions,
  type SeriesContext,
  type ErrorBarOptions,
  type ReferenceLineOptions,
  type DotGLOptions,
  type DotGLInteractiveOptions,
  type HeatmapGLOptions,
  type StreamGLOptions,
  type StreamGLHandle,
} from './ChartV2';
export * from './Stepper';
export * from './CircularProgress';
