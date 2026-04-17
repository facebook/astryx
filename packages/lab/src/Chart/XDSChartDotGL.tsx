/**
 * @file XDSChartDotGL.tsx
 * @output WebGL scatter renderer — canvas overlay aligned with SVG chart space
 * @position Child of XDSChart; reads scales from context, renders to a canvas via foreignObject
 */

import {useRef, useEffect, useCallback} from 'react';
import {useChart} from './ChartContext';
import {xPixel} from './utils';

export interface XDSChartDotGLProps {
  /** Which data key for the y values */
  dataKey: string;
  /** Dot fill color (hex string) */
  color: string;
  /** Point size in pixels */
  size?: number;
  /** Opacity 0-1 */
  opacity?: number;
}

/** Parse hex color to [r, g, b] floats 0-1 */
function hexToGL(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

const VERT = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform float u_size;
  void main() {
    // Convert pixel coords to clip space (-1 to 1)
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    // Flip y — canvas y goes down, clip y goes up
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size;
  }
`;

const FRAG = `
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  void main() {
    // Circle mask — discard outside radius
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (dot(coord, coord) > 0.25) discard;
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
 * WebGL scatter plot. Renders points on a canvas overlay aligned with the SVG chart.
 * Use for large datasets (1k+ points) where SVG circles would be slow.
 *
 * @example
 * ```
 * <XDSChartDotGL dataKey="value" color={useXDSChartColors().categorical(1)[0]} />
 * <XDSChartDotGL dataKey="value" color="#0171E3" size={4} opacity={0.6} />
 * ```
 */
export function XDSChartDotGL({
  dataKey,
  color,
  size = 6,
  opacity = 0.8,
}: XDSChartDotGLProps) {
  const {data, xKey, xScale, yScale, width, height} = useChart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  // Compute pixel positions from scales
  const getPositions = useCallback((): Float32Array => {
    const positions: number[] = [];
    for (const d of data) {
      const x = xPixel(d, xKey, xScale);
      const yVal = typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
      positions.push(x, yScale(yVal));
    }
    return new Float32Array(positions);
  }, [data, xKey, dataKey, xScale, yScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    // Set canvas size (account for device pixel ratio for sharp rendering)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Init WebGL
    let gl = glRef.current;
    if (!gl) {
      gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
      });
      if (!gl) return;
      glRef.current = gl;
    }

    // Init program
    let program = programRef.current;
    if (!program) {
      program = createProgram(gl);
      if (!program) return;
      programRef.current = program;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(program);

    // Upload positions
    const positions = getPositions();
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const [r, g, b] = hexToGL(color);
    // Resolution in logical pixels — positions from xPixel/yScale are logical.
    // The viewport is set to physical pixels (width*dpr) for sharp rendering,
    // but the shader maps logical positions → clip space via u_resolution.
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), width, height);
    gl.uniform3f(gl.getUniformLocation(program, 'u_color'), r, g, b);
    gl.uniform1f(gl.getUniformLocation(program, 'u_size'), size * dpr);
    gl.uniform1f(gl.getUniformLocation(program, 'u_opacity'), opacity);

    // Draw
    gl.drawArrays(gl.POINTS, 0, positions.length / 2);

    // Cleanup buffer
    gl.deleteBuffer(posBuffer);
  }, [width, height, color, size, opacity, getPositions]);

  if (width <= 0 || height <= 0) return null;

  return (
    <foreignObject
      x={0}
      y={0}
      width={width}
      height={height}
      style={{overflow: 'hidden'}}>
      <canvas
        ref={canvasRef}
        style={{
          width,
          height,
          pointerEvents: 'none',
        }}
      />
    </foreignObject>
  );
}
