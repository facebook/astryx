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
  type ChartCrosshairMode,
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
  XDSRadialTooltip,
  type XDSRadialTooltipProps,
  type RadialTooltipDatum,
  useRadial,
  type RadialContext,
  type RadialMode,
} from './Radial';

// 3D charts — projected SVG with interactive rotation
export {
  XDS3DChart,
  type XDS3DChartProps,
  XDS3DScatter,
  XDS3DScatterGL,
  type XDS3DScatterProps,
  type XDS3DScatterGLProps,
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

// Chart interactions
export {
  XDSChartBrush,
  type XDSChartBrushProps,
  type BrushMode,
  type BrushRange,
  XDSChartZoom,
  type XDSChartZoomProps,
  XDSChartSelect,
  type XDSChartSelectProps,
  XDSChartReferenceLine,
  type XDSChartReferenceLineProps,
} from './Chart';

// Sankey / flow diagrams — ribbon-based flow visualization
export {
  XDSSankeyChart,
  type XDSSankeyChartProps,
  XDSSankeyLink,
  type XDSSankeyLinkProps,
  XDSSankeyNode,
  type XDSSankeyNodeProps,
  XDSSankeyLabel,
  type XDSSankeyLabelProps,
  useSankey,
  type SankeyNode,
  type SankeyLink,
  type SankeyColumn,
  type SankeyColumnDef,
  type SankeyNodeLayout,
  type SankeyLinkLayout,
  type SankeyColumnLayout,
  XDSSankeyGrid,
  type XDSSankeyGridProps,
  type SankeyContext,
} from './Sankey';

// Chart v2 — config model
export {
  XDSChart as XDSChartV2,
  type XDSChartProps as XDSChartV2Props,
  bar,
  line,
  dot,
  area,
  band,
  candlestick,
  useChartV2,
  type SeriesDef,
  type ChartV2Context,
  type ChartPointerEvent,
  type ResolvedPoint,
  type ResolvedPositions,
  type SeriesContext,
} from './ChartV2';
