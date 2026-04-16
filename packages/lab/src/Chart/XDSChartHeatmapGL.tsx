/**
 * @file XDSChartHeatmapGL.tsx
 * @output WebGL heatmap — 2D grid of color-mapped cells
 * @position Child of XDSChart; manages its own row (y) band scale
 *
 * Renders a grid where x positions come from the chart's xScale (band)
 * and y positions come from a second categorical key. Each cell is colored
 * by interpolating a sequential palette based on the value key.
 */

import {useRef, useEffect, useMemo} from 'react';
import {scaleBand} from 'd3-scale';
import {useChart} from './ChartContext';
import type {ScaleBand} from 'd3-scale';

export interface XDSChartHeatmapGLProps {
  /** Data key for x-axis categories (columns) */
  xKey: string;
  /** Data key for y-axis categories (rows) */
  yKey: string;
  /** Data key containing the numeric intensity value */
  valueKey: string;
  /**
   * Color ramp — array of hex colors from low to high intensity.
   * Use useXDSChartColors().sequential.blue(5) or similar.
   */
  colorRange: string[];
  /** Explicit domain [min, max]. If omitted, computed from data. */
  domain?: [number, number];
  /** Gap between cells in pixels (default: 1) */
  cellGap?: number;
}

function isBandScale(scale: unknown): scale is ScaleBand<string> {
  return typeof scale === 'function' && 'bandwidth' in scale;
}

function hexToGL(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

const VERT = `
  attribute vec2 a_position;
  attribute vec3 a_color;
  uniform vec2 u_resolution;
  varying vec3 v_color;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    v_color = a_color;
  }
`;

const FRAG = `
  precision mediump float;
  varying vec3 v_color;
  void main() {
    gl_FragColor = vec4(v_color, 1.0);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vert = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vert || !frag) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function sampleRamp(
  ramp: [number, number, number][],
  t: number,
): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  if (ramp.length === 1) return ramp[0];
  const scaled = clamped * (ramp.length - 1);
  const lo = Math.floor(scaled);
  const hi = Math.min(lo + 1, ramp.length - 1);
  const frac = scaled - lo;
  return [
    ramp[lo][0] + frac * (ramp[hi][0] - ramp[lo][0]),
    ramp[lo][1] + frac * (ramp[hi][1] - ramp[lo][1]),
    ramp[lo][2] + frac * (ramp[hi][2] - ramp[lo][2]),
  ];
}

/**
 * WebGL heatmap grid. Two categorical axes (xKey × yKey) with cells colored by valueKey.
 *
 * @example
 * ```
 * <XDSChartHeatmapGL
 *   xKey="hour"
 *   yKey="day"
 *   valueKey="activity"
 *   colorRange={useXDSChartColors().sequential.blue(5)}
 * />
 * ```
 */
export function XDSChartHeatmapGL({
  xKey,
  yKey,
  valueKey,
  colorRange,
  domain: domainProp,
  cellGap = 1,
}: XDSChartHeatmapGLProps) {
  const {data, xScale, width, height} = useChart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  const ramp = useMemo(() => colorRange.map(hexToGL), [colorRange]);

  // Build row (y) band scale from unique yKey values
  const yBandScale = useMemo(() => {
    const yCategories = [...new Set(data.map(d => String(d[yKey])))];
    return scaleBand<string>()
      .domain(yCategories)
      .range([0, height])
      .padding(0.05);
  }, [data, yKey, height]);

  // Value domain
  const domain = useMemo((): [number, number] => {
    if (domainProp) return domainProp;
    let min = Infinity;
    let max = -Infinity;
    for (const d of data) {
      const v = d[valueKey];
      if (typeof v === 'number') {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    return [min, max];
  }, [data, valueKey, domainProp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0 || !isBandScale(xScale)) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    let gl = glRef.current;
    if (!gl) {
      gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
      });
      if (!gl) return;
      glRef.current = gl;
    }

    let program = programRef.current;
    if (!program) {
      program = createProgram(gl);
      if (!program) return;
      programRef.current = program;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    const positions: number[] = [];
    const colors: number[] = [];
    const [dMin, dMax] = domain;
    const range = dMax - dMin || 1;
    const gap = cellGap;

    const xBW = xScale.bandwidth();
    const yBW = yBandScale.bandwidth();

    for (const d of data) {
      const xVal = xScale(String(d[xKey]));
      const yVal = yBandScale(String(d[yKey]));
      if (xVal == null || yVal == null) continue;

      const v = typeof d[valueKey] === 'number' ? (d[valueKey] as number) : 0;
      const t = (v - dMin) / range;
      const [r, g, b] = sampleRamp(ramp, t);

      const x0 = xVal + gap / 2;
      const x1 = xVal + xBW - gap / 2;
      const y0 = yVal + gap / 2;
      const y1 = yVal + yBW - gap / 2;

      // Two triangles per cell
      positions.push(x0, y0, x1, y0, x0, y1);
      positions.push(x1, y0, x1, y1, x0, y1);
      for (let i = 0; i < 6; i++) colors.push(r, g, b);
    }

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const colBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    const aCol = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(aCol);
    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);

    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), width, height);
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);

    gl.deleteBuffer(posBuf);
    gl.deleteBuffer(colBuf);
  }, [
    data,
    xKey,
    yKey,
    valueKey,
    xScale,
    yBandScale,
    width,
    height,
    domain,
    ramp,
    cellGap,
  ]);

  if (width <= 0 || height <= 0) return null;

  return (
    <foreignObject x={0} y={0} width={width} height={height}>
      <canvas ref={canvasRef} style={{width, height, pointerEvents: 'none'}} />
    </foreignObject>
  );
}
