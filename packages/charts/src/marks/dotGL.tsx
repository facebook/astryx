// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file marks/dotGL.tsx
 * @output WebGL scatter — canvas overlay, single draw call
 */

import {useRef, useEffect, useCallback} from 'react';
import type {SeriesDef, ResolvedPoint} from '../types';
import type {ScaleBand} from 'd3-scale';
import {useChart} from '../ChartContext';
import {
  hexToGL,
  getWebGLContext,
  setupGLState,
  sizeCanvas,
  mountCanvasOverSVG,
  createProgram,
  POINT_SIZE_COMPENSATION,
} from '../webgl';

export interface DotGLOptions {
  color: string;
  size?: number;
  opacity?: number;
}

const VERT = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform float u_size;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size * ${POINT_SIZE_COMPENSATION.toFixed(6)};
  }
`;

const FRAG = `
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float edge = 1.0 - smoothstep(0.48, 0.5, dist);
    float a = u_opacity * edge;
    gl_FragColor = vec4(u_color * a, a);
  }
`;

/**
 * Inline component returned by render() — manages the WebGL canvas lifecycle.
 * Needs access to svgRef from ChartContext to mount the canvas outside SVG.
 */
function DotGLCanvas({
  resolved,
  color,
  size,
  opacity,
  width,
  height,
}: {
  resolved: ResolvedPoint[];
  color: string;
  size: number;
  opacity: number;
  width: number;
  height: number;
}) {
  const {svgRef: _svgRef} = useChart();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const markerRef = useRef<SVGGElement>(null);

  const getPositions = useCallback((): Float32Array => {
    const positions: number[] = [];
    for (const p of resolved) {
      positions.push(p.px, p.py);
    }
    return new Float32Array(positions);
  }, [resolved]);

  // Mount canvas outside SVG
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
    if (!canvas || width <= 0 || height <= 0) {
      return;
    }

    const dpr = sizeCanvas(canvas, width, height);

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

    const positions = getPositions();
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const [r, g, b] = hexToGL(color);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), width, height);
    gl.uniform3f(gl.getUniformLocation(program, 'u_color'), r, g, b);
    gl.uniform1f(gl.getUniformLocation(program, 'u_size'), size * dpr);
    gl.uniform1f(gl.getUniformLocation(program, 'u_opacity'), opacity);

    gl.drawArrays(gl.POINTS, 0, positions.length / 2);
    gl.deleteBuffer(posBuffer);
  }, [width, height, color, size, opacity, getPositions]);

  if (width <= 0 || height <= 0) {
    return null;
  }
  return <g ref={markerRef} />;
}

/**
 * WebGL scatter plot. Canvas mounted outside SVG for sharp Retina rendering.
 *
 * @example
 * ```
 * series={[dotGL('value', {color: '#4f46e5'})]}
 * ```
 */
export function dotGL(dataKey: string, options: DotGLOptions): SeriesDef {
  const {color} = options;
  const size = options.size ?? 6;
  const opacity = options.opacity ?? 0.8;

  return {
    type: 'dotGL',
    key: dataKey,
    dataKeys: [dataKey],
    layout: {},

    resolve(ctx) {
      const {data, xKey, xScale, yScale} = ctx;
      const points: ResolvedPoint[] = [];
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        let px: number;
        if ('bandwidth' in xScale) {
          px =
            ((xScale as ScaleBand<string>)(String(d[xKey])) ?? 0) +
            (xScale as ScaleBand<string>).bandwidth() / 2;
        } else {
          px = xScale(d[xKey] as number);
        }
        const v = typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
        points.push({px, py: yScale(v), py0: yScale(0), dataIndex: i});
      }
      return points;
    },

    render(resolved, ctx) {
      return (
        <DotGLCanvas
          resolved={resolved}
          color={color}
          size={size}
          opacity={opacity}
          width={ctx.width}
          height={ctx.height}
        />
      );
    },
  };
}
