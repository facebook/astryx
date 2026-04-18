/**
 * @file XDS3DBackdropScatterGL.tsx
 * @output 3D scatter over any background — dot colors auto-adapt via theme
 * @position Child of XDS3DChart; reads projection from context
 *
 * Renders a backdrop and overlays a 3D scatter. Each dot's color adapts
 * based on the luminance of the backdrop at its projected position.
 * Light/dark dot colors resolve from the active theme's tokens.
 */

import {useRef, useEffect, useMemo, useState} from 'react';
import {use3D} from './ThreeDContext';
import {useXDSTheme} from '@xds/core/theme';
import {
  hexToGL,
  getWebGLContext,
  setupGLState,
  sizeCanvas,
  mountCanvasOverSVG,
  createProgram,
  POINT_SIZE_COMPENSATION,
} from '../Chart/webgl';

export interface BackgroundImage {
  src: string;
  fit?: 'cover' | 'contain' | 'fill';
  position?: string;
}

export interface XDS3DBackdropScatterGLProps {
  /**
   * Background — CSS color or gradient string, or a structured image object.
   *
   * @example
   * ```
   * background="#0064E0"
   * background="linear-gradient(135deg, #0A1317, #F1F4F7)"
   * background={{src: 'photo.jpg', fit: 'cover'}}
   * ```
   */
  background: string | BackgroundImage;
  /**
   * Override the dot color used over dark backdrop regions.
   * Defaults to the theme's --color-on-dark token.
   */
  lightColor?: string;
  /**
   * Override the dot color used over light backdrop regions.
   * Defaults to the theme's --color-on-light token.
   */
  darkColor?: string;
  /** Luminance threshold for light/dark switch (default: 0.5) */
  threshold?: number;
  /** Point size */
  size?: number;
  /** Base opacity */
  opacity?: number;
}

const VERT = `
  attribute vec3 a_position;
  attribute vec3 a_color;
  uniform vec2 u_resolution;
  uniform vec2 u_center;
  uniform float u_scale;
  uniform float u_cosAz;
  uniform float u_sinAz;
  uniform float u_cosEl;
  uniform float u_sinEl;
  uniform float u_size;
  varying float v_depth;
  varying vec3 v_color;
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
    v_color = a_color;
    float depthFactor = 0.75 + (z2 + 0.5) * 0.25;
    gl_PointSize = (u_size * depthFactor) * ${POINT_SIZE_COMPENSATION.toFixed(6)};
  }
`;

const FRAG = `
  precision mediump float;
  uniform float u_opacity;
  varying float v_depth;
  varying vec3 v_color;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float edge = 1.0 - smoothstep(0.48, 0.5, dist);
    float depthFactor = 0.75 + (v_depth + 0.5) * 0.25;
    float a = u_opacity * depthFactor * edge;
    gl_FragColor = vec4(v_color * a, a);
  }
`;

/** Resolve background prop to a CSS string */
function bgToCSS(bg: string | BackgroundImage): string {
  if (typeof bg === 'string') return bg;
  const fit = bg.fit ?? 'cover';
  const pos = bg.position ?? 'center';
  return `url(${bg.src}) ${pos}/${fit} no-repeat`;
}

/** Parse a hex color to [r, g, b] in 0-255 */
function parseHex(hex: string): [number, number, number] | null {
  const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) {
    const m3 = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (!m3) return null;
    return [
      parseInt(m3[1] + m3[1], 16),
      parseInt(m3[2] + m3[2], 16),
      parseInt(m3[3] + m3[3], 16),
    ];
  }
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/** Compute luminance 0-1 from [r,g,b] 0-255 */
function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

interface GradientStop {
  color: [number, number, number];
  pos: number;
}

/** Parse a linear-gradient into stops + angle, or return null for solid colors */
function parseGradient(
  css: string,
): {angle: number; stops: GradientStop[]} | null {
  const m = css.match(/linear-gradient\(([^)]+)\)/);
  if (!m) return null;
  const inner = m[1];

  let angle = 180;
  if (inner.includes('to right')) angle = 90;
  else if (inner.includes('to left')) angle = 270;
  else if (inner.includes('to bottom')) angle = 180;
  else if (inner.includes('to top')) angle = 0;
  else {
    const dm = inner.match(/(\d+)deg/);
    if (dm) angle = parseInt(dm[1]);
  }

  const stops: GradientStop[] = [];
  const re = /(#[0-9A-Fa-f]{3,8})(?:\s+(\d+)%)?/g;
  let match;
  while ((match = re.exec(inner)) !== null) {
    const rgb = parseHex(match[1]);
    if (rgb) {
      stops.push({
        color: rgb,
        pos: match[2] != null ? parseInt(match[2]) / 100 : -1,
      });
    }
  }
  if (stops.length < 2) return null;

  // Auto-fill positions
  if (stops[0].pos < 0) stops[0].pos = 0;
  if (stops[stops.length - 1].pos < 0) stops[stops.length - 1].pos = 1;
  for (let i = 1; i < stops.length - 1; i++) {
    if (stops[i].pos < 0) stops[i].pos = i / (stops.length - 1);
  }
  return {angle, stops};
}

/**
 * Analytical luminance sampler — computes luminance at (x, y) from the
 * parsed background without rendering to canvas. Works for solid colors
 * and linear gradients.
 */
function useBackgroundLuminance(
  background: string | BackgroundImage,
  width: number,
  height: number,
): ((x: number, y: number) => number) | null {
  const css = bgToCSS(background);

  return useMemo(() => {
    if (width <= 0 || height <= 0) return null;

    // Image backgrounds — can't sample analytically
    if (typeof background === 'object') return null;

    // Try gradient
    const grad = parseGradient(css);
    if (grad) {
      const {angle, stops} = grad;
      const rad = (angle * Math.PI) / 180;
      // Gradient axis: project (x, y) onto the gradient direction
      const dx = Math.sin(rad);
      const dy = -Math.cos(rad);
      // Normalize so t goes 0→1 across the full gradient extent
      const extent = Math.abs(dx) * width + Math.abs(dy) * height;

      return (x: number, y: number): number => {
        // Project point onto gradient axis
        const cx = x - width / 2;
        const cy = y - height / 2;
        const proj = (cx * dx + cy * dy) / (extent / 2);
        const t = Math.max(0, Math.min(1, (proj + 1) / 2));

        // Find surrounding stops
        let lo = stops[0],
          hi = stops[stops.length - 1];
        for (let i = 0; i < stops.length - 1; i++) {
          if (t >= stops[i].pos && t <= stops[i + 1].pos) {
            lo = stops[i];
            hi = stops[i + 1];
            break;
          }
        }
        const segT = hi.pos > lo.pos ? (t - lo.pos) / (hi.pos - lo.pos) : 0;
        const r = lo.color[0] + (hi.color[0] - lo.color[0]) * segT;
        const g = lo.color[1] + (hi.color[1] - lo.color[1]) * segT;
        const b = lo.color[2] + (hi.color[2] - lo.color[2]) * segT;
        return luminance(r, g, b);
      };
    }

    // Solid color
    const rgb = parseHex(css);
    if (rgb) {
      const lum = luminance(rgb[0], rgb[1], rgb[2]);
      return () => lum;
    }

    return null;
  }, [css, background, width, height]);
}

export function XDS3DBackdropScatterGL({
  background,
  lightColor: lightColorProp,
  darkColor: darkColorProp,
  threshold = 0.5,
  size = 2,
  opacity = 0.85,
}: XDS3DBackdropScatterGLProps) {
  const {
    data,
    xKey,
    yKey,
    zKey,
    xDomain,
    yDomain,
    zDomain,
    normalize,
    project,
    camera,
    width,
    height,
  } = use3D();
  const {token} = useXDSTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const markerRef = useRef<SVGGElement>(null);

  const lumSampler = useBackgroundLuminance(background, width, height);

  // Resolve dot colors from theme tokens.
  // token() may return light-dark() strings — extract the hex for the current mode.
  const resolveColor = (
    prop: string | undefined,
    tokenName: string,
    fallback: string,
  ): string => {
    if (prop) return prop;
    const raw = token(tokenName) ?? '';
    // Already a hex
    if (raw.startsWith('#')) return raw;
    // light-dark(#xxx, #yyy) — parse first value (light mode)
    const m = raw.match(/#[0-9A-Fa-f]{3,8}/);
    return m ? m[0] : fallback;
  };

  const lightRGB = useMemo(
    () => hexToGL(resolveColor(lightColorProp, '--color-on-dark', '#FFFFFF')),
    [lightColorProp, token],
  );
  const darkRGB = useMemo(
    () => hexToGL(resolveColor(darkColorProp, '--color-on-light', '#000000')),
    [darkColorProp, token],
  );

  const positions = useMemo(() => {
    const buf = new Float32Array(data.length * 3);
    for (let i = 0; i < data.length; i++) {
      buf[i * 3] = normalize(data[i][xKey] as number, xDomain);
      buf[i * 3 + 1] = normalize(data[i][yKey] as number, yDomain);
      buf[i * 3 + 2] = normalize(data[i][zKey] as number, zDomain);
    }
    return buf;
  }, [data, xKey, yKey, zKey, xDomain, yDomain, zDomain, normalize]);

  const colors = useMemo(() => {
    const buf = new Float32Array(data.length * 3);
    for (let i = 0; i < data.length; i++) {
      const {px, py} = project(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
      );
      const lum = lumSampler ? lumSampler(px, py) : px > width / 2 ? 0.9 : 0.1;
      const [r, g, b] = lum > threshold ? darkRGB : lightRGB;

      buf[i * 3] = r;
      buf[i * 3 + 1] = g;
      buf[i * 3 + 2] = b;
    }
    return buf;
  }, [
    data.length,
    positions,
    project,
    lumSampler,
    threshold,
    lightRGB,
    darkRGB,
  ]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    if (!canvasRef.current)
      canvasRef.current = document.createElement('canvas');
    return mountCanvasOverSVG(marker, canvasRef.current, width, height);
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;
    const dpr = sizeCanvas(canvas, width, height);
    if (!glRef.current) glRef.current = getWebGLContext(canvas);
    const gl = glRef.current;
    if (!gl) return;
    if (!programRef.current) programRef.current = createProgram(gl, VERT, FRAG);
    const program = programRef.current;
    if (!program) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    setupGLState(gl);
    gl.useProgram(program);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    const colBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    const aCol = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(aCol);
    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);

    const azRad = (camera.azimuth * Math.PI) / 180;
    const elRad = (camera.elevation * Math.PI) / 180;
    const scale = Math.min(width, height) * 0.35;
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
    gl.uniform1f(gl.getUniformLocation(program, 'u_size'), size * dpr);
    gl.uniform1f(gl.getUniformLocation(program, 'u_opacity'), opacity);

    gl.drawArrays(gl.POINTS, 0, data.length);
    gl.deleteBuffer(posBuf);
    gl.deleteBuffer(colBuf);
  }, [positions, colors, camera, size, opacity, width, height, data.length]);

  if (width <= 0 || height <= 0) return null;

  return (
    <g ref={markerRef}>
      <foreignObject x={0} y={0} width={width} height={height}>
        <div style={{width, height, background: bgToCSS(background)}} />
      </foreignObject>
    </g>
  );
}
