// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file marks/streamGL.tsx
 * @output WebGL streaming time-series line — ring buffer, canvas outside SVG
 *
 * Data is pushed imperatively via the returned handle, not from the static dataset.
 * The chart's xScale/yScale map pushed values to pixel coordinates.
 */

import {
  useRef,
  useEffect,
  useImperativeHandle,
  useCallback,
  type MutableRefObject,
} from 'react';
import type {SeriesDef} from '../types';
import {useChartV2} from '../ChartV2Context';
import {
  hexToGL,
  getWebGLContext,
  setupGLState,
  sizeCanvas,
  mountCanvasOverSVG,
  createProgram,
} from '../../Chart/webgl';

export interface StreamGLHandle {
  push(x: number, y: number): void;
  clear(): void;
}

export interface StreamGLOptions {
  color: string;
  bufferSize?: number;
  lineWidth?: number;
  opacity?: number;
  /** Ref to receive the push/clear handle */
  handleRef?: MutableRefObject<StreamGLHandle | null>;
}

const VERT = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  }
`;

const FRAG = `
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  void main() {
    float a = u_opacity;
    gl_FragColor = vec4(u_color * a, a);
  }
`;

/**
 * Inline component — manages the ring buffer, canvas, and rAF draw loop.
 */
function StreamGLCanvas({
  color,
  bufferSize,
  lineWidth,
  opacity,
  width,
  height,
  handleRef,
}: {
  color: string;
  bufferSize: number;
  lineWidth: number;
  opacity: number;
  width: number;
  height: number;
  handleRef?: MutableRefObject<StreamGLHandle | null>;
}) {
  const {xScale, yScale} = useChartV2();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const bufRef = useRef<WebGLBuffer | null>(null);
  const markerRef = useRef<SVGGElement>(null);

  const ring = useRef({
    data: new Float32Array(bufferSize * 2),
    head: 0,
    count: 0,
  });

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

  // Size canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) {
      return;
    }
    sizeCanvas(canvas, width, height);
  }, [width, height]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
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

    if (!bufRef.current) {
      bufRef.current = gl.createBuffer();
    }

    const {data: ringData, head, count} = ring.current;
    if (count < 2) {
      return;
    }

    const linearX = xScale as (v: number) => number;
    const drawBuf = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const idx = ((head - count + i + bufferSize) % bufferSize) * 2;
      drawBuf[i * 2] = linearX(ringData[idx]);
      drawBuf[i * 2 + 1] = yScale(ringData[idx + 1]);
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    setupGLState(gl);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufRef.current);
    gl.bufferData(gl.ARRAY_BUFFER, drawBuf, gl.DYNAMIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const [r, g, b] = hexToGL(color);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), width, height);
    gl.uniform3f(gl.getUniformLocation(program, 'u_color'), r, g, b);
    gl.uniform1f(gl.getUniformLocation(program, 'u_opacity'), opacity);

    gl.lineWidth(lineWidth);
    gl.drawArrays(gl.LINE_STRIP, 0, count);
  }, [width, height, color, lineWidth, opacity, bufferSize, xScale, yScale]);

  // Expose push/clear handle via ref
  useImperativeHandle(
    handleRef as MutableRefObject<StreamGLHandle | null>,
    () => ({
      push(x: number, y: number) {
        const r = ring.current;
        const idx = r.head * 2;
        r.data[idx] = x;
        r.data[idx + 1] = y;
        r.head = (r.head + 1) % bufferSize;
        r.count = Math.min(r.count + 1, bufferSize);
        draw();
      },
      clear() {
        ring.current.head = 0;
        ring.current.count = 0;
        const gl = glRef.current;
        if (gl) {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      },
    }),
    [bufferSize, draw],
  );

  if (width <= 0 || height <= 0) {
    return null;
  }
  return <g ref={markerRef} />;
}

/**
 * WebGL streaming line. Data is pushed imperatively via handleRef,
 * not from the chart's static dataset. Internally uses a ring buffer.
 *
 * @example
 * ```
 * const streamRef = useRef<StreamGLHandle>(null);
 * // Push data points in a rAF loop or event handler:
 * streamRef.current?.push(Date.now(), value);
 *
 * <Chart series={[streamGL({color: '#10b981', handleRef: streamRef})]} />
 * ```
 */
export function streamGL(options: StreamGLOptions): SeriesDef {
  const {color} = options;
  const bufferSize = options.bufferSize ?? 500;
  const lineWidth = options.lineWidth ?? 2;
  const opacity = options.opacity ?? 1;
  const handleRef = options.handleRef;

  return {
    type: 'streamGL',
    key: 'stream',
    dataKeys: [],
    layout: {},

    // Streaming data is pushed, not in the static dataset
    resolve() {
      return [];
    },

    render(_resolved, ctx) {
      return (
        <StreamGLCanvas
          color={color}
          bufferSize={bufferSize}
          lineWidth={lineWidth}
          opacity={opacity}
          width={ctx.width}
          height={ctx.height}
          handleRef={handleRef}
        />
      );
    },
  };
}
