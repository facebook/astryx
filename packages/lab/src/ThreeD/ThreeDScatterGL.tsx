// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ThreeDScatterGL.tsx
 * @output WebGL 3D scatter — canvas overlaid outside SVG for sharp DPR rendering
 * @position Child of ThreeDChart; reads camera from context (Tier 1)
 *
 * SYNC: The vertex shader replicates ThreeDChart's project() math exactly.
 * Verified by projection.test.ts.
 *
 * The canvas renders as an absolute-positioned sibling to the SVG (not inside
 * foreignObject) to avoid the browser's 1x compositing of foreignObject content
 * on Retina displays.
 */

import {useRef, useEffect, useMemo} from 'react';
import {use3D} from './ThreeDContext';

export interface ThreeDScatterGLProps {
  color: string;
  size?: number;
  opacity?: number;
}

function hexToGL(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

// SYNC: Steps 1-5 match ThreeDChart.project() exactly.
const VERT = `
  attribute vec3 a_position;
  uniform vec2 u_resolution;
  uniform vec2 u_center;
  uniform float u_scale;
  uniform float u_cosAz;
  uniform float u_sinAz;
  uniform float u_cosEl;
  uniform float u_sinEl;
  uniform float u_size;
  varying float v_depth;
  void main() {
    vec3 p = a_position - 0.5;
    float x1 = p.x * u_cosAz + p.z * u_sinAz;
    float z1 = -p.x * u_sinAz + p.z * u_cosAz;
    float y1 = p.y * u_cosEl - z1 * u_sinEl;
    float z2 = p.y * u_sinEl + z1 * u_cosEl;
    float px = u_center.x + x1 * u_scale;
    float py = u_center.y - y1 * u_scale;
    vec2 clip = (vec2(px, py) / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, z2, 1.0);
    v_depth = z2;
    float depthFactor = 0.75 + (z2 + 0.5) * 0.25;
    // Compensate for smoothstep edge erosion (visible at r=0.48, not 0.5)
    // so visible circle matches SVG radius exactly
    gl_PointSize = (u_size * depthFactor) / 0.96;
  }
`;

const FRAG = `
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  varying float v_depth;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float edge = 1.0 - smoothstep(0.48, 0.5, dist);
    float depthFactor = 0.75 + (v_depth + 0.5) * 0.25;
    float a = u_opacity * depthFactor * edge;
    // Premultiplied alpha — required for correct compositing over page
    gl_FragColor = vec4(u_color * a, a);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) {
    return null;
  }
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) {
    return null;
  }
  const p = gl.createProgram();
  if (!p) {
    return null;
  }
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    gl.deleteProgram(p);
    return null;
  }
  return p;
}

export function ThreeDScatterGL({
  color,
  size = 4,
  opacity = 0.85,
}: ThreeDScatterGLProps) {
  const {
    data,
    xKey,
    yKey,
    zKey,
    xDomain,
    yDomain,
    zDomain,
    normalize,
    camera,
    width,
    height,
  } = use3D();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const markerRef = useRef<SVGGElement>(null);

  // Normalized 3D positions
  const positions = useMemo(() => {
    const buf = new Float32Array(data.length * 3);
    for (let i = 0; i < data.length; i++) {
      buf[i * 3] = normalize(data[i][xKey] as number, xDomain);
      buf[i * 3 + 1] = normalize(data[i][yKey] as number, yDomain);
      buf[i * 3 + 2] = normalize(data[i][zKey] as number, zDomain);
    }
    return buf;
  }, [data, xKey, yKey, zKey, xDomain, yDomain, zDomain, normalize]);

  // Mount canvas as sibling to SVG
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) {
      return;
    }
    const svg = marker.ownerSVGElement;
    if (!svg) {
      return;
    }
    const parent = svg.parentElement;
    if (!parent) {
      return;
    }

    // Ensure parent is positioned for absolute child
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    // Create canvas if not exists
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvasRef.current = canvas;
    }

    const canvas = canvasRef.current;
    parent.appendChild(canvas);
    containerRef.current = parent as HTMLDivElement;

    return () => {
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    };
  }, []);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) {
      return;
    }

    const dpr = (window.devicePixelRatio || 2) * 2; // 2x supersampling + smoothstep for crisp circles // supersampling for crisp circles
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (!glRef.current) {
      glRef.current = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
      });
    }
    const gl = glRef.current;
    if (!gl) {
      return;
    }

    if (!programRef.current) {
      programRef.current = createProgram(gl);
    }
    const program = programRef.current;
    if (!program) {
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(program);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    // All uniforms in logical pixels — viewport handles DPR
    const azRad = (camera.azimuth * Math.PI) / 180;
    const elRad = (camera.elevation * Math.PI) / 180;
    const scale = Math.min(width, height) * 0.35;
    const [r, g, b] = hexToGL(color);

    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), width, height);
    gl.uniform2f(
      gl.getUniformLocation(program, 'u_center'),
      width / 2,
      height / 2,
    );
    gl.uniform1f(gl.getUniformLocation(program, 'u_scale'), scale);
    gl.uniform1f(gl.getUniformLocation(program, 'u_cosAz'), Math.cos(azRad));
    gl.uniform1f(gl.getUniformLocation(program, 'u_sinAz'), Math.sin(azRad));
    gl.uniform1f(gl.getUniformLocation(program, 'u_cosEl'), Math.cos(elRad));
    gl.uniform1f(gl.getUniformLocation(program, 'u_sinEl'), Math.sin(elRad));
    gl.uniform3f(gl.getUniformLocation(program, 'u_color'), r, g, b);
    gl.uniform1f(gl.getUniformLocation(program, 'u_size'), size * dpr);
    gl.uniform1f(gl.getUniformLocation(program, 'u_opacity'), opacity);

    gl.drawArrays(gl.POINTS, 0, data.length);
    gl.deleteBuffer(buf);
  }, [positions, camera, color, size, opacity, width, height, data.length]);

  if (width <= 0 || height <= 0) {
    return null;
  }

  // Render an invisible SVG marker — the canvas is mounted imperatively as a sibling
  return <g ref={markerRef} />;
}
