// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useEffect, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {Button, Card, Stack, Text} from '@astryxdesign/core';
import {Theme, defineTheme, useTheme} from '@astryxdesign/core/theme';
import {
  resolveChartColorChoice,
  type ChartColorChoice,
} from '@astryxdesign/core/theme/chartColors';
import {radiusVars} from '@astryxdesign/core/theme/tokens.stylex';
import {Heading} from '@astryxdesign/core/Text';

const meta: Meta = {
  title: 'Lab/ChartTheming/WebGL',
  parameters: {
    docs: {
      description: {
        component:
          'GPU transport evidence: normalized Astryx RGBA channels update an existing WebGL uniform and context when mode changes.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const styles = stylex.create({
  canvas: {
    borderRadius: radiusVars['--radius-container'],
    display: 'block',
    height: 180,
    maxWidth: '100%',
    width: 320,
  },
});

const webglTheme = defineTheme({
  name: 'chart-theming-webgl',
  tokens: {
    '--color-data-categorical-blue': ['#005A4E', '#72E1C1'],
  },
});

const choice = {
  kind: 'theme',
  token: '--color-data-categorical-blue',
} as const satisfies ChartColorChoice;

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}`;

let nextContextInstance = 1;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('WebGL shader allocation failed.');
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message =
      gl.getShaderInfoLog(shader) ?? 'WebGL shader compile failed.';
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function WebGLSeries() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformRef = useRef<WebGLUniformLocation | null>(null);
  const contextInstance = useRef(nextContextInstance++);
  const drawCount = useRef(0);
  const {token} = useTheme();
  const resolved = resolveChartColorChoice(choice, token);

  if (!resolved.ok) {
    throw new Error(resolved.diagnostic.message);
  }
  const rgba = resolved.value.rgba01;

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', {antialias: false});
    if (!canvas || !gl) {
      throw new Error('WebGL is unavailable.');
    }

    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!program) {
      throw new Error('WebGL program allocation failed.');
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'WebGL link failed.');
    }

    const buffer = gl.createBuffer();
    if (!buffer) {
      throw new Error('WebGL buffer allocation failed.');
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // Q1
        -0.8, -0.8, -0.5, -0.8, -0.8, -0.2, -0.8, -0.2, -0.5, -0.8, -0.5, -0.2,
        // Q2
        -0.2, -0.8, 0.1, -0.8, -0.2, 0.4, -0.2, 0.4, 0.1, -0.8, 0.1, 0.4,
        // Q3
        0.4, -0.8, 0.7, -0.8, 0.4, 0.8, 0.4, 0.8, 0.7, -0.8, 0.7, 0.8,
      ]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, canvas.width, canvas.height);

    glRef.current = gl;
    programRef.current = program;
    uniformRef.current = gl.getUniformLocation(program, 'u_color');
    canvas.dataset.contextInstance = String(contextInstance.current);

    return () => {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      glRef.current = null;
      programRef.current = null;
      uniformRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    const program = programRef.current;
    const uniform = uniformRef.current;
    if (!canvas || !gl || !program || !uniform) {
      return;
    }

    gl.useProgram(program);
    gl.uniform4f(uniform, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 18);
    gl.finish();

    const centerPixel = new Uint8Array(4);
    gl.readPixels(
      Math.floor(canvas.width / 2),
      Math.floor(canvas.height / 2),
      1,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      centerPixel,
    );

    drawCount.current += 1;
    canvas.dataset.centerPixel = Array.from(centerPixel).join(',');
    canvas.dataset.drawCount = String(drawCount.current);
    canvas.dataset.rgba = rgba.join(',');
  }, [rgba]);

  return (
    <Stack direction="vertical" gap={2}>
      <canvas
        {...stylex.props(styles.canvas)}
        aria-label="Three WebGL bars: Q1 30, Q2 60, Q3 90"
        data-srgb={resolved.value.srgb}
        height={180}
        ref={canvasRef}
        role="img"
        width={320}
      />
      <Text type="supporting" color="secondary">
        <span data-webgl-transport>
          Theme token → {resolved.value.srgb} → GPU [
          {rgba.map(channel => channel.toFixed(3)).join(', ')}] . Context{' '}
          {contextInstance.current} stays mounted.
        </span>
      </Text>
    </Stack>
  );
}

function RuntimeWebGLThemeSwitch() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  return (
    <Theme theme={webglTheme} mode={mode}>
      <Card>
        <Stack direction="vertical" gap={4}>
          <Stack direction="vertical" gap={1}>
            <Heading level={3}>WebGL bar chart</Heading>
            <Text type="supporting" color="secondary">
              Astryx resolves the token to hex and normalized RGBA channels. The
              shader uniform changes; the WebGL context does not.
            </Text>
          </Stack>
          <Button
            label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
            onClick={() =>
              setMode(current => (current === 'light' ? 'dark' : 'light'))
            }
          />
          <WebGLSeries />
        </Stack>
      </Card>
    </Theme>
  );
}

function readCenterPixel(canvas: HTMLCanvasElement): number[] {
  const value = canvas.dataset.centerPixel;
  return value ? value.split(',').map(Number) : [];
}

export const RuntimeUniformUpdate: Story = {
  render: () => <RuntimeWebGLThemeSwitch />,
  play: async ({canvasElement}) => {
    const canvas = canvasElement.querySelector('canvas');
    expect(canvas).not.toBeNull();
    if (!canvas) {
      return;
    }

    let initialDrawCount = 0;
    await waitFor(() => {
      initialDrawCount = Number(canvas.dataset.drawCount);
      expect(initialDrawCount).toBeGreaterThan(0);
      expect(readCenterPixel(canvas)).toEqual([0, 90, 78, 255]);
    });
    const contextInstance = canvas.dataset.contextInstance;

    const modeButton = within(canvasElement).getByRole('button', {
      name: 'Switch to dark mode',
    });
    await userEvent.click(modeButton);

    await waitFor(() => {
      expect(canvasElement.querySelector('canvas')).toBe(canvas);
      expect(canvas.dataset.contextInstance).toBe(contextInstance);
      expect(Number(canvas.dataset.drawCount)).toBeGreaterThan(
        initialDrawCount,
      );
      expect(readCenterPixel(canvas)).toEqual([114, 225, 193, 255]);
    });
  },
};
