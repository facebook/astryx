// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartHeatmapGL.tsx
 * @output WebGL heatmap — 2D grid, canvas mounted outside SVG
 * @position Child of Chart; manages its own y band scale for rows
 */

import {useRef, useEffect, useMemo} from 'react';
import {scaleBand} from 'd3-scale';
import {useChart} from './ChartContext';
import {isBandScale} from './utils';
import {
  hexToGL,
  getWebGLContext,
  setupGLState,
  sizeCanvas,
  mountCanvasOverSVG,
  createProgram,
} from './webgl';

export interface ChartHeatmapGLProps {
  xKey: string;
  yKey: string;
  valueKey: string;
  colorRange: string[];
  domain?: [number, number];
  cellGap?: number;
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

function sampleRamp(
  ramp: [number, number, number][],
  t: number,
): [number, number, number] {
  const c = Math.max(0, Math.min(1, t));
  if (ramp.length === 1) {
    return ramp[0];
  }
  const s = c * (ramp.length - 1);
  const lo = Math.floor(s);
  const hi = Math.min(lo + 1, ramp.length - 1);
  const f = s - lo;
  return [
    ramp[lo][0] + f * (ramp[hi][0] - ramp[lo][0]),
    ramp[lo][1] + f * (ramp[hi][1] - ramp[lo][1]),
    ramp[lo][2] + f * (ramp[hi][2] - ramp[lo][2]),
  ];
}

export function ChartHeatmapGL({
  xKey,
  yKey,
  valueKey,
  colorRange,
  domain: domainProp,
  cellGap = 1,
}: ChartHeatmapGLProps) {
  const {data, xScale, width, height} = useChart();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const markerRef = useRef<SVGGElement>(null);

  const ramp = useMemo(() => colorRange.map(hexToGL), [colorRange]);

  const yBandScale = useMemo(() => {
    const cats = [...new Set(data.map(d => String(d[yKey])))];
    return scaleBand<string>().domain(cats).range([0, height]).padding(0.05);
  }, [data, yKey, height]);

  const domain = useMemo((): [number, number] => {
    if (domainProp) {
      return domainProp;
    }
    let min = Infinity,
      max = -Infinity;
    for (const d of data) {
      const v = d[valueKey];
      if (typeof v === 'number') {
        if (v < min) {
          min = v;
        }
        if (v > max) {
          max = v;
        }
      }
    }
    return [min, max];
  }, [data, valueKey, domainProp]);

  // Mount canvas
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) {
      return;
    }
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    return mountCanvasOverSVG(marker, canvasRef.current, width, height);
  }, [width, height]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0 || !isBandScale(xScale)) {
      return;
    }

    sizeCanvas(canvas, width, height);

    if (!glRef.current) {
      glRef.current = getWebGLContext(canvas);
    }
    const gl = glRef.current;
    if (!gl) {
      return;
    }

    if (!programRef.current) {
      programRef.current = createProgram(gl, VERT, FRAG);
    }
    const program = programRef.current;
    if (!program) {
      return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    setupGLState(gl);
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
      if (xVal == null || yVal == null) {
        continue;
      }

      const v = typeof d[valueKey] === 'number' ? (d[valueKey] as number) : 0;
      const t = (v - dMin) / range;
      const [r, g, b] = sampleRamp(ramp, t);

      const x0 = xVal + gap / 2;
      const x1 = xVal + xBW - gap / 2;
      const y0 = yVal + gap / 2;
      const y1 = yVal + yBW - gap / 2;

      positions.push(x0, y0, x1, y0, x0, y1, x1, y0, x1, y1, x0, y1);
      for (let i = 0; i < 6; i++) {
        colors.push(r, g, b);
      }
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

  if (width <= 0 || height <= 0) {
    return null;
  }
  return <g ref={markerRef} />;
}
