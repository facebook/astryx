// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file marks/dotGLInteractive.tsx
 * @output WebGL scatter with GPU color-picking for O(1) nearest-point hover
 *
 * Each point gets a unique color encoding its index. On hover, readPixels
 * from an offscreen framebuffer decodes the hovered index — no JS iteration.
 */

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
  type ReactNode,
} from 'react';
import type {SeriesDef, ResolvedPoint} from '../types';
import type {ScaleBand} from 'd3-scale';
import {hexToGL} from '../webgl';

export interface DotGLInteractiveOptions {
  color: string;
  size?: number;
  opacity?: number;
  /** Custom tooltip renderer. Receives datum and index. */
  renderTooltip?: (datum: Record<string, unknown>, index: number) => ReactNode;
}

/** Encode a point index as an RGB color (supports up to 16.7M points) */
function indexToColor(i: number): [number, number, number] {
  const id = i + 1;
  return [
    ((id >> 16) & 0xff) / 255,
    ((id >> 8) & 0xff) / 255,
    (id & 0xff) / 255,
  ];
}

/** Decode an RGB pixel back to a point index. Returns -1 for background. */
function colorToIndex(r: number, g: number, b: number): number {
  if (r === 0 && g === 0 && b === 0) {
    return -1;
  }
  return ((r << 16) | (g << 8) | b) - 1;
}

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

function linkProgram(
  gl: WebGLRenderingContext,
  vert: string,
  frag: string,
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vert);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, frag);
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

// Visible pass
const VERT_VIS = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform float u_size;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size;
  }
`;

const FRAG_VIS = `
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (dot(coord, coord) > 0.25) discard;
    gl_FragColor = vec4(u_color, u_opacity);
  }
`;

// Pick pass — encode index as color
const VERT_PICK = `
  attribute vec2 a_position;
  attribute vec3 a_pickColor;
  uniform vec2 u_resolution;
  uniform float u_size;
  varying vec3 v_pickColor;
  void main() {
    vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = u_size + 4.0;
    v_pickColor = a_pickColor;
  }
`;

const FRAG_PICK = `
  precision mediump float;
  varying vec3 v_pickColor;
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (dot(coord, coord) > 0.25) discard;
    gl_FragColor = vec4(v_pickColor, 1.0);
  }
`;

/**
 * Inline component — manages visible + pick canvases and hover state.
 */
function DotGLInteractiveCanvas({
  resolved,
  color,
  size,
  opacity,
  width,
  height,
  data,
  renderTooltip,
}: {
  resolved: ResolvedPoint[];
  color: string;
  size: number;
  opacity: number;
  width: number;
  height: number;
  data: Record<string, unknown>[];
  renderTooltip?: (datum: Record<string, unknown>, index: number) => ReactNode;
}) {
  const visCanvasRef = useRef<HTMLCanvasElement>(null);
  const pickCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number>(-1);
  const [mousePos, setMousePos] = useState<{x: number; y: number} | null>(null);

  const visGLRef = useRef<{
    gl: WebGLRenderingContext;
    prog: WebGLProgram;
  } | null>(null);
  const pickGLRef = useRef<{
    gl: WebGLRenderingContext;
    prog: WebGLProgram;
    fb: WebGLFramebuffer;
    tex: WebGLTexture;
  } | null>(null);

  const positions = useMemo(() => {
    const pos: number[] = [];
    for (const p of resolved) {
      pos.push(p.px, p.py);
    }
    return new Float32Array(pos);
  }, [resolved]);

  const pickColors = useMemo(() => {
    const colors: number[] = [];
    for (let i = 0; i < resolved.length; i++) {
      const [r, g, b] = indexToColor(i);
      colors.push(r, g, b);
    }
    return new Float32Array(colors);
  }, [resolved.length]);

  // Render both passes
  useEffect(() => {
    if (width <= 0 || height <= 0) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;

    // Visible canvas
    const visCanvas = visCanvasRef.current;
    if (visCanvas) {
      visCanvas.width = width * dpr;
      visCanvas.height = height * dpr;

      if (!visGLRef.current) {
        const gl = visCanvas.getContext('webgl', {
          alpha: true,
          premultipliedAlpha: false,
          antialias: true,
        });
        const prog = gl ? linkProgram(gl, VERT_VIS, FRAG_VIS) : null;
        if (gl && prog) {
          visGLRef.current = {gl, prog};
        }
      }

      const vis = visGLRef.current;
      if (vis) {
        const {gl, prog} = vis;
        gl.viewport(0, 0, visCanvas.width, visCanvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(prog, 'a_position');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const [r, g, b] = hexToGL(color);
        gl.uniform2f(
          gl.getUniformLocation(prog, 'u_resolution'),
          width,
          height,
        );
        gl.uniform3f(gl.getUniformLocation(prog, 'u_color'), r, g, b);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_size'), size * dpr);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_opacity'), opacity);

        gl.drawArrays(gl.POINTS, 0, positions.length / 2);
        gl.deleteBuffer(buf);
      }
    }

    // Pick canvas (offscreen)
    const pickCanvas = pickCanvasRef.current;
    if (pickCanvas) {
      pickCanvas.width = width * dpr;
      pickCanvas.height = height * dpr;

      if (!pickGLRef.current) {
        const gl = pickCanvas.getContext('webgl', {
          alpha: false,
          premultipliedAlpha: false,
          antialias: false,
          preserveDrawingBuffer: true,
        });
        if (gl) {
          const prog = linkProgram(gl, VERT_PICK, FRAG_PICK);
          const fb = gl.createFramebuffer();
          const tex = gl.createTexture();
          if (prog && fb && tex) {
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGBA,
              pickCanvas.width,
              pickCanvas.height,
              0,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              null,
            );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(
              gl.FRAMEBUFFER,
              gl.COLOR_ATTACHMENT0,
              gl.TEXTURE_2D,
              tex,
              0,
            );
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            pickGLRef.current = {gl, prog, fb, tex};
          }
        }
      }

      const pick = pickGLRef.current;
      if (pick) {
        const {gl, prog, fb, tex} = pick;

        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          pickCanvas.width,
          pickCanvas.height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null,
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.viewport(0, 0, pickCanvas.width, pickCanvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.disable(gl.BLEND);
        gl.useProgram(prog);

        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(prog, 'a_position');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const colBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
        gl.bufferData(gl.ARRAY_BUFFER, pickColors, gl.STATIC_DRAW);
        const aCol = gl.getAttribLocation(prog, 'a_pickColor');
        gl.enableVertexAttribArray(aCol);
        gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);

        gl.uniform2f(
          gl.getUniformLocation(prog, 'u_resolution'),
          width,
          height,
        );
        gl.uniform1f(gl.getUniformLocation(prog, 'u_size'), (size + 4) * dpr);

        gl.drawArrays(gl.POINTS, 0, positions.length / 2);
        gl.deleteBuffer(posBuf);
        gl.deleteBuffer(colBuf);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }
  }, [width, height, positions, pickColors, color, size, opacity]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGRectElement>) => {
    const pick = pickGLRef.current;
    if (!pick) {
      return;
    }

    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) {
      return;
    }
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const local = pt.matrixTransform(e.currentTarget.getScreenCTM()?.inverse());

    const dpr = window.devicePixelRatio || 1;
    const px = Math.floor(local.x * dpr);
    const py = Math.floor(local.y * dpr);

    const {gl, fb} = pick;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    const pixel = new Uint8Array(4);
    gl.readPixels(
      px,
      gl.canvas.height - py,
      1,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixel,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const idx = colorToIndex(pixel[0], pixel[1], pixel[2]);
    setHoverIndex(idx);
    setMousePos(idx >= 0 ? {x: local.x, y: local.y} : null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverIndex(-1);
    setMousePos(null);
  }, []);

  const datum =
    hoverIndex >= 0 && hoverIndex < data.length ? data[hoverIndex] : null;

  const defaultTooltip = (d: Record<string, unknown>, i: number) => (
    <div
      style={{display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12}}>
      <div style={{fontWeight: 600, color: 'var(--color-text-primary)'}}>
        Point {i}
      </div>
      {Object.entries(d).map(([k, v]) => (
        <div key={k}>
          <span style={{color: 'var(--color-text-secondary)'}}>{k}:</span>{' '}
          <span style={{fontWeight: 500}}>{String(v)}</span>
        </div>
      ))}
    </div>
  );

  return (
    <g>
      <foreignObject
        x={0}
        y={0}
        width={width}
        height={height}
        style={{overflow: 'hidden'}}>
        <canvas
          ref={visCanvasRef}
          style={{width, height, pointerEvents: 'none'}}
        />
      </foreignObject>

      <foreignObject
        x={0}
        y={0}
        width={0}
        height={0}
        style={{overflow: 'hidden'}}>
        <canvas ref={pickCanvasRef} style={{display: 'none'}} />
      </foreignObject>

      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {datum && hoverIndex >= 0 && (
        <circle
          cx={positions[hoverIndex * 2]}
          cy={positions[hoverIndex * 2 + 1]}
          r={size / 2 + 3}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeOpacity={0.8}
          pointerEvents="none"
        />
      )}

      {datum && mousePos && (
        <foreignObject
          x={mousePos.x + 12}
          y={Math.max(0, mousePos.y - 40)}
          width={200}
          height={120}
          pointerEvents="none"
          style={{overflow: 'visible'}}>
          <div
            style={{
              background: 'var(--color-background-popover)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '8px 12px',
              boxShadow: 'var(--shadow-med)',
              whiteSpace: 'nowrap',
              width: 'fit-content',
            }}>
            {renderTooltip
              ? renderTooltip(datum, hoverIndex)
              : defaultTooltip(datum, hoverIndex)}
          </div>
        </foreignObject>
      )}
    </g>
  );
}

/**
 * WebGL scatter with GPU color-picking hover. O(1) hit detection via offscreen
 * framebuffer — no JS iteration regardless of point count.
 *
 * @example
 * ```
 * series={[dotGLInteractive('value', {
 *   color: '#4f46e5',
 *   renderTooltip: (d, i) => <span>{d.name}: {d.value}</span>,
 * })]}
 * ```
 */
export function dotGLInteractive(
  dataKey: string,
  options: DotGLInteractiveOptions,
): SeriesDef {
  const {color} = options;
  const size = options.size ?? 6;
  const opacity = options.opacity ?? 0.8;
  const renderTooltip = options.renderTooltip;

  return {
    type: 'dotGLInteractive',
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
        <DotGLInteractiveCanvas
          resolved={resolved}
          color={color}
          size={size}
          opacity={opacity}
          width={ctx.width}
          height={ctx.height}
          data={ctx.data}
          renderTooltip={renderTooltip}
        />
      );
    },
  };
}
