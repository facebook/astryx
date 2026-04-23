/**
 * @file series.ts
 * @output Series config types and helper constructors (bar, line, dot, area, etc.)
 * @position User-facing API — these are the building blocks passed to XDSChart's series prop
 *
 * Each helper returns a SeriesConfig object that bundles:
 *   1. Data binding (which keys to read)
 *   2. Visual encoding (color, opacity, radius, etc.)
 *   3. Layout hints (stack, group, dodge)
 *   4. Renderer reference (how to draw — resolved internally)
 */

// ─── Base Types ────────────────────────────────────────────────────────────

export type ColorAccessor =
  | string
  | ((datum: Record<string, unknown>, index: number) => string);

export interface SeriesBase {
  readonly type: string;
  /** Data key(s) this series reads from */
  readonly keys: string[];
}

// ─── Bar ───────────────────────────────────────────────────────────────────

export interface BarConfig extends SeriesBase {
  readonly type: 'bar';
  readonly dataKey: string;
  readonly keys: [string];
  readonly color: ColorAccessor;
  readonly opacity: number;
  readonly radius: number;
  readonly stack?: string;
  readonly group?: string;
}

export interface BarOptions {
  color?: ColorAccessor;
  opacity?: number;
  radius?: number;
  /** Stack group ID — bars with same stack accumulate */
  stack?: string;
  /** Group ID — bars with same group subdivide the band */
  group?: string;
}

export function bar(dataKey: string, options: BarOptions = {}): BarConfig {
  return {
    type: 'bar',
    dataKey,
    keys: [dataKey],
    color: options.color ?? 'var(--color-chart-1)',
    opacity: options.opacity ?? 1,
    radius: options.radius ?? 4,
    stack: options.stack,
    group: options.group,
  };
}

// ─── Line ──────────────────────────────────────────────────────────────────

export type CurveType = 'linear' | 'monotone' | 'natural' | 'step';

export interface LineConfig extends SeriesBase {
  readonly type: 'line';
  readonly dataKey: string;
  readonly keys: [string];
  readonly color: string;
  readonly curve: CurveType;
  readonly strokeWidth: number;
  readonly dots: boolean;
}

export interface LineOptions {
  color?: string;
  curve?: CurveType;
  strokeWidth?: number;
  dots?: boolean;
}

export function line(dataKey: string, options: LineOptions = {}): LineConfig {
  return {
    type: 'line',
    dataKey,
    keys: [dataKey],
    color: options.color ?? 'var(--color-chart-1)',
    curve: options.curve ?? 'monotone',
    strokeWidth: options.strokeWidth ?? 2,
    dots: options.dots ?? false,
  };
}

// ─── Dot ───────────────────────────────────────────────────────────────────

export interface DotConfig extends SeriesBase {
  readonly type: 'dot';
  readonly dataKey: string;
  readonly keys: [string];
  readonly color: ColorAccessor;
  readonly radius: number;
  readonly opacity: number;
  readonly dodge: boolean;
}

export interface DotOptions {
  color?: ColorAccessor;
  radius?: number;
  opacity?: number;
  /** Run dodge layout to avoid overlapping dots within bands */
  dodge?: boolean;
}

export function dot(dataKey: string, options: DotOptions = {}): DotConfig {
  return {
    type: 'dot',
    dataKey,
    keys: [dataKey],
    color: options.color ?? 'var(--color-chart-1)',
    radius: options.radius ?? 4,
    opacity: options.opacity ?? 0.8,
    dodge: options.dodge ?? false,
  };
}

// ─── Area ──────────────────────────────────────────────────────────────────

export interface AreaConfig extends SeriesBase {
  readonly type: 'area';
  readonly dataKey: string;
  readonly keys: [string];
  readonly color: string;
  readonly opacity: number;
  readonly curve: CurveType;
  readonly stack?: string;
  readonly gradient: boolean;
  readonly stroke: boolean;
}

export interface AreaOptions {
  color?: string;
  opacity?: number;
  curve?: CurveType;
  stack?: string;
  gradient?: boolean;
  stroke?: boolean;
}

export function area(dataKey: string, options: AreaOptions = {}): AreaConfig {
  return {
    type: 'area',
    dataKey,
    keys: [dataKey],
    color: options.color ?? 'var(--color-chart-1)',
    opacity: options.opacity ?? 0.3,
    curve: options.curve ?? 'monotone',
    stack: options.stack,
    gradient: options.gradient ?? false,
    stroke: options.stroke ?? true,
  };
}

// ─── Band (confidence interval) ────────────────────────────────────────────

export interface BandConfig extends SeriesBase {
  readonly type: 'band';
  readonly upper: string;
  readonly lower: string;
  readonly keys: [string, string];
  readonly color: string;
  readonly opacity: number;
}

export interface BandOptions {
  upper: string;
  lower: string;
  color?: string;
  opacity?: number;
}

export function band(options: BandOptions): BandConfig {
  return {
    type: 'band',
    upper: options.upper,
    lower: options.lower,
    keys: [options.upper, options.lower],
    color: options.color ?? 'var(--color-chart-1)',
    opacity: options.opacity ?? 0.15,
  };
}

// ─── Candlestick ───────────────────────────────────────────────────────────

export interface CandlestickConfig extends SeriesBase {
  readonly type: 'candlestick';
  readonly open: string;
  readonly high: string;
  readonly low: string;
  readonly close: string;
  readonly keys: [string, string, string, string];
  readonly upColor: string;
  readonly downColor: string;
}

export interface CandlestickOptions {
  open: string;
  high: string;
  low: string;
  close: string;
  upColor?: string;
  downColor?: string;
}

export function candlestick(options: CandlestickOptions): CandlestickConfig {
  return {
    type: 'candlestick',
    ...options,
    keys: [options.open, options.high, options.low, options.close],
    upColor: options.upColor ?? 'var(--color-positive)',
    downColor: options.downColor ?? 'var(--color-negative)',
  };
}

// ─── Union Type ────────────────────────────────────────────────────────────

export type SeriesConfig =
  | BarConfig
  | LineConfig
  | DotConfig
  | AreaConfig
  | BandConfig
  | CandlestickConfig;
