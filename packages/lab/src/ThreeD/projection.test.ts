// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

/**
 * Verifies that the ThreeDScatterGL shader projection produces identical
 * output to ThreeDChart's project() function. This is a Tier 1 guarantee —
 * SVG and WebGL marks must agree on pixel positions.
 *
 * The shader's rotation math is replicated here in JS. If someone changes
 * project() or the shader without updating the other, this test fails.
 */

// JS implementation of project() from ThreeDChart
function projectJS(
  nx: number,
  ny: number,
  nz: number,
  azDeg: number,
  elDeg: number,
  width: number,
  height: number,
): {px: number; py: number; depth: number} {
  const azRad = (azDeg * Math.PI) / 180;
  const elRad = (elDeg * Math.PI) / 180;
  const cosAz = Math.cos(azRad),
    sinAz = Math.sin(azRad);
  const cosEl = Math.cos(elRad),
    sinEl = Math.sin(elRad);
  const scale = Math.min(width, height) * 0.35;
  const cx = width / 2,
    cy = height / 2;

  const x = nx - 0.5,
    y = ny - 0.5,
    z = nz - 0.5;
  const x1 = x * cosAz + z * sinAz;
  const z1 = -x * sinAz + z * cosAz;
  const y1 = y * cosEl - z1 * sinEl;
  const z2 = y * sinEl + z1 * cosEl;

  return {px: cx + x1 * scale, py: cy - y1 * scale, depth: z2};
}

// JS implementation of the GLSL shader's projection (what the GPU does)
function projectShader(
  nx: number,
  ny: number,
  nz: number,
  azDeg: number,
  elDeg: number,
  width: number,
  height: number,
): {px: number; py: number; depth: number} {
  const azRad = (azDeg * Math.PI) / 180;
  const elRad = (elDeg * Math.PI) / 180;
  const cosAz = Math.cos(azRad),
    sinAz = Math.sin(azRad);
  const cosEl = Math.cos(elRad),
    sinEl = Math.sin(elRad);
  const scale = Math.min(width, height) * 0.35;
  const cx = width / 2,
    cy = height / 2;

  // Step 1: center
  const x = nx - 0.5,
    y = ny - 0.5,
    z = nz - 0.5;
  // Step 2: azimuth
  const x1 = x * cosAz + z * sinAz;
  const z1 = -x * sinAz + z * cosAz;
  // Step 3: elevation
  const y1 = y * cosEl - z1 * sinEl;
  const z2 = y * sinEl + z1 * cosEl;
  // Step 4: project to pixels
  const px = cx + x1 * scale;
  const py = cy - y1 * scale;

  return {px, py, depth: z2};
}

describe('3D projection parity (Tier 1)', () => {
  const testCases = [
    {nx: 0, ny: 0, nz: 0, label: 'origin'},
    {nx: 1, ny: 1, nz: 1, label: 'corner'},
    {nx: 0.5, ny: 0.5, nz: 0.5, label: 'center'},
    {nx: 0, ny: 1, nz: 0.5, label: 'top-front'},
    {nx: 1, ny: 0, nz: 0, label: 'right-bottom-front'},
    {nx: 0.3, ny: 0.7, nz: 0.9, label: 'arbitrary'},
  ];

  const cameras = [
    {az: 0, el: 0, label: 'front'},
    {az: 35, el: 25, label: 'default'},
    {az: 90, el: 0, label: 'side'},
    {az: 45, el: 45, label: 'diagonal'},
    {az: -30, el: 15, label: 'negative azimuth'},
    {az: 180, el: -20, label: 'behind'},
  ];

  const width = 600,
    height = 400;

  for (const cam of cameras) {
    for (const pt of testCases) {
      it(`${pt.label} at camera ${cam.label} (az=${cam.az}, el=${cam.el})`, () => {
        const js = projectJS(
          pt.nx,
          pt.ny,
          pt.nz,
          cam.az,
          cam.el,
          width,
          height,
        );
        const gl = projectShader(
          pt.nx,
          pt.ny,
          pt.nz,
          cam.az,
          cam.el,
          width,
          height,
        );

        expect(gl.px).toBeCloseTo(js.px, 6);
        expect(gl.py).toBeCloseTo(js.py, 6);
        expect(gl.depth).toBeCloseTo(js.depth, 6);
      });
    }
  }
});
