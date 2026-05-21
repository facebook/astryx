// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file webgl.ts
 * @output Shared WebGL utilities for chart components
 * @position Internal helpers; consumed by all GL mark components
 *
 * Provides:
 * - Canvas mounting outside SVG (avoids foreignObject DPR blur)
 * - Premultiplied alpha setup (correct compositing over page)
 * - Shader compilation helpers
 * - Smoothstep circle fragment for crisp point sprites
 */

/** Compile a WebGL shader, returns null on failure */
export function compileShader(
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

/** Link a vertex + fragment shader into a program */
export function createProgram(
  gl: WebGLRenderingContext,
  vertSrc: string,
  fragSrc: string,
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
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

/** Parse hex (#RRGGBB) to [r, g, b] floats 0-1 */
export function hexToGL(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

/** DPR with supersampling for crisp circles */
export function getCanvasDPR(): number {
  return (window.devicePixelRatio || 2) * 2;
}

/**
 * Create or get a WebGL context with correct alpha settings.
 * Uses premultiplied alpha for correct compositing over the page.
 */
export function getWebGLContext(
  canvas: HTMLCanvasElement,
): WebGLRenderingContext | null {
  return canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
  });
}

/**
 * Set up standard GL state for chart rendering:
 * - Clear with transparent
 * - Enable premultiplied alpha blending
 */
export function setupGLState(gl: WebGLRenderingContext): void {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
}

/**
 * Size a canvas for sharp rendering, accounting for DPR.
 * Returns the DPR used.
 */
export function sizeCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): number {
  const dpr = getCanvasDPR();
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  return dpr;
}

/**
 * Mount a canvas as an absolute-positioned sibling to an SVG element.
 * Automatically aligns with the SVG marker's position — no manual margin
 * offset needed. This is a Tier 1 guarantee: the canvas lands exactly
 * where the SVG content area is, regardless of chart margins or transforms.
 *
 * Call from a useEffect. Returns a cleanup function.
 */
export function mountCanvasOverSVG(
  svgMarker: SVGGraphicsElement,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): (() => void) | undefined {
  const svg = svgMarker.ownerSVGElement;
  if (!svg) {
    return;
  }
  const parent = svg.parentElement;
  if (!parent) {
    return;
  }

  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  canvas.style.position = 'absolute';
  canvas.style.pointerEvents = 'none';

  // Compute offset from the SVG marker's actual screen position.
  // The marker sits inside the chart's <g transform="translate(margin)">
  // so its bounding rect includes the margin offset automatically.
  // This is a Tier 1 guarantee — we derive position from the SVG, not from props.
  const parentRect = parent.getBoundingClientRect();
  const markerCTM = svgMarker.getScreenCTM();
  if (markerCTM) {
    canvas.style.left = `${markerCTM.e - parentRect.left}px`;
    canvas.style.top = `${markerCTM.f - parentRect.top}px`;
  } else {
    canvas.style.left = '0';
    canvas.style.top = '0';
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  parent.appendChild(canvas);

  return () => {
    if (canvas.parentElement === parent) {
      parent.removeChild(canvas);
    }
  };
}

/**
 * GLSL fragment for premultiplied-alpha circle with smoothstep AA.
 * Use in fragment shaders that render point sprites.
 *
 * Expects:
 * - varying float v_alpha (the final alpha before edge AA)
 * - uniform vec3 u_color
 *
 * Returns: gl_FragColor with premultiplied alpha
 */
export const CIRCLE_FRAG_BODY = `
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float edge = 1.0 - smoothstep(0.48, 0.5, dist);
    float a = v_alpha * edge;
    gl_FragColor = vec4(u_color * a, a);
`;

/**
 * Smoothstep compensation factor for gl_PointSize.
 * The visible circle radius is 0.48 of the point sprite (smoothstep starts there),
 * so we scale up by 1/0.96 to match SVG circle radius exactly.
 */
export const POINT_SIZE_COMPENSATION = 1.0 / 0.96;
