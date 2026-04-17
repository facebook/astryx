/**
 * @file XDSChartStreamGL.tsx
 * @output WebGL streaming time-series renderer — ring buffer drawn as a line strip
 * @position Child of XDSChart; uses the chart's yScale for y-mapping
 *
 * The y-axis domain is controlled by XDSChart (via yDomain/yBaseline).
 * The x-axis domain is controlled by XDSChart (via xDomain).
 * Both axes, grid, and stream data map through the same scales.
 * For streaming, the parent should update xDomain as new data arrives.
 */

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import {useChart} from './ChartContext';

export interface XDSChartStreamGLProps {
  /** Line stroke color (hex) */
  color: string;
  /** Max number of points in the buffer (default: 500) */
  bufferSize?: number;
  /** Line width in pixels (default: 2) */
  lineWidth?: number;
  /** Opacity 0-1 */
  opacity?: number;
}

export interface XDSChartStreamGLHandle {
  /** Push a new [x, y] point into the ring buffer and redraw */
  push(x: number, y: number): void;
  /** Clear the buffer */
  clear(): void;
}

function hexToGL(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
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
    gl_FragColor = vec4(u_color, u_opacity);
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

/**
 * WebGL streaming time-series line. Ring buffer — push new points without
 * React re-renders.
 *
 * Y-axis is controlled by the parent XDSChart's yDomain/yBaseline.
 * X-axis is a sliding window (oldest point at left, newest at right).
 *
 * @example
 * ```
 * const [xDomain, setXDomain] = useState<[number, number]>([0, 100]);
 *
 * <XDSChart data={[]} xKey="t" yKeys={[]} yDomain={[0, 100]} xDomain={xDomain} height={200}>
 *   <XDSChartGrid horizontal />
 *   <XDSChartAxis position="bottom" />
 *   <XDSChartAxis position="left" />
 *   <XDSChartStreamGL ref={streamRef} color="#0171E3" />
 * </XDSChart>
 * ```
 */
export const XDSChartStreamGL = forwardRef<
  XDSChartStreamGLHandle,
  XDSChartStreamGLProps
>(function XDSChartStreamGL(
  {color, bufferSize = 500, lineWidth = 2, opacity = 1},
  ref,
) {
  const {width, height, xScale, yScale} = useChart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const bufRef = useRef<WebGLBuffer | null>(null);

  // Ring buffer — raw data only, no domain tracking
  const ring = useRef({
    data: new Float32Array(bufferSize * 2),
    head: 0,
    count: 0,
  });

  const draw = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const buffer = bufRef.current;
    if (!gl || !program || !buffer) return;

    const {data: ringData, head, count} = ring.current;
    if (count < 2) return;

    // Map to pixel space: both x and y from chart's scales
    const linearX = xScale as (v: number) => number;
    const drawBuf = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const idx = ((head - count + i + bufferSize) % bufferSize) * 2;
      drawBuf[i * 2] = linearX(ringData[idx]);
      drawBuf[i * 2 + 1] = yScale(ringData[idx + 1]);
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawBuf, gl.DYNAMIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const [r, g, b] = hexToGL(color);
    // Logical pixels — positions are in logical space, viewport handles DPR
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), width, height);
    gl.uniform3f(gl.getUniformLocation(program, 'u_color'), r, g, b);
    gl.uniform1f(gl.getUniformLocation(program, 'u_opacity'), opacity);

    gl.lineWidth(lineWidth);
    gl.drawArrays(gl.LINE_STRIP, 0, count);
  }, [width, height, color, lineWidth, opacity, bufferSize, xScale, yScale]);

  useImperativeHandle(
    ref,
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (!glRef.current) {
      const gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
      });
      if (!gl) return;
      glRef.current = gl;
    }

    if (!programRef.current) {
      programRef.current = createProgram(glRef.current);
    }

    if (!bufRef.current) {
      bufRef.current = glRef.current.createBuffer();
    }
  }, [width, height]);

  if (width <= 0 || height <= 0) return null;

  return (
    <foreignObject
      x={0}
      y={0}
      width={width}
      height={height}
      style={{overflow: 'hidden'}}>
      <canvas ref={canvasRef} style={{width, height, pointerEvents: 'none'}} />
    </foreignObject>
  );
});
