// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartDotGL.tsx
 * @output WebGL scatter — single draw call, canvas mounted outside SVG for sharp DPR
 * @position Child of Chart; reads scales from context
 */

import {useRef, useEffect, useCallback} from 'react';
import {useChart} from './ChartContext';
import {xPixel} from './utils';
import {
  hexToGL,
  getWebGLContext,
  setupGLState,
  sizeCanvas,
  mountCanvasOverSVG,
  createProgram,
  POINT_SIZE_COMPENSATION,
} from './webgl';

export interface ChartDotGLProps {
  dataKey: string;
  color: string;
  size?: number;
  opacity?: number;
}

const VERT = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform float u_size;
  varying float v_alpha;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size * ${POINT_SIZE_COMPENSATION.toFixed(6)};
    v_alpha = 1.0;
  }
`;

const FRAG = `
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  varying float v_alpha;
  void main() {
    float v_alpha_final = u_opacity;
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float edge = 1.0 - smoothstep(0.48, 0.5, dist);
    float a = v_alpha_final * edge;
    gl_FragColor = vec4(u_color * a, a);
  }
`;

/**
 * WebGL scatter plot. Canvas mounted outside SVG for sharp Retina rendering.
 *
 * @example
 * ```
 * <ChartDotGL dataKey="value" color={colors.categorical(1)[0]} />
 * ```
 */
export function ChartDotGL({
  dataKey,
  color,
  size = 6,
  opacity = 0.8,
}: ChartDotGLProps) {
  const {data, xKey, xScale, yScale, width, height} = useChart();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const markerRef = useRef<SVGGElement>(null);

  const getPositions = useCallback((): Float32Array => {
    const positions: number[] = [];
    for (const d of data) {
      const x = xPixel(d, xKey, xScale);
      const yVal = typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
      positions.push(x, yScale(yVal));
    }
    return new Float32Array(positions);
  }, [data, xKey, dataKey, xScale, yScale]);

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
