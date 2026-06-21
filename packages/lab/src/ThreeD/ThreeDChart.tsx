// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ThreeDChart.tsx
 * @output Root 3D chart container — projected SVG with depth sorting
 * @position Parent component; all 3D marks read from its context
 */

import {
  type CSSProperties,
  type ReactNode,
  useMemo,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
import {ThreeDProvider} from './ThreeDContext';
import type {Camera, ProjectedPoint} from './types';

export interface ThreeDChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  zKey: string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  zDomain?: [number, number];
  height?: number;
  azimuth?: number;
  elevation?: number;
  interactive?: boolean;
  /** Auto-rotate speed in degrees per frame (default: 0 = off) */
  autoRotate?: number;
  children: ReactNode;
}

function computeDomain(
  data: Record<string, unknown>[],
  key: string,
): [number, number] {
  let min = Infinity,
    max = -Infinity;
  for (const d of data) {
    const v = d[key];
    if (typeof v === 'number') {
      if (v < min) {
        min = v;
      }
      if (v > max) {
        max = v;
      }
    }
  }
  return [min === Infinity ? 0 : min, max === -Infinity ? 1 : max];
}

export function ThreeDChart({
  data,
  xKey,
  yKey,
  zKey,
  xDomain: xDomainProp,
  yDomain: yDomainProp,
  zDomain: zDomainProp,
  height = 400,
  azimuth: azimuthProp = 35,
  elevation: elevationProp = 25,
  interactive = false,
  autoRotate = 0,
  children,
}: ThreeDChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [camera, setCamera] = useState<Camera>({
    azimuth: azimuthProp,
    elevation: elevationProp,
  });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startAz: number;
    startEl: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const obs = new ResizeObserver(e => {
      if (e[0]) {
        setContainerWidth(e[0].contentRect.width);
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const width = containerWidth;
  const xDomain = xDomainProp ?? computeDomain(data, xKey);
  const yDomain = yDomainProp ?? computeDomain(data, yKey);
  const zDomain = zDomainProp ?? computeDomain(data, zKey);

  const normalize = useCallback((value: number, domain: [number, number]) => {
    const range = domain[1] - domain[0];
    return range === 0 ? 0.5 : (value - domain[0]) / range;
  }, []);

  // Projection: normalized [0,1]^3 → 2D pixel coords
  // SYNC: This math is replicated in ThreeDScatterGL's vertex shader.
  // Both must produce identical output. Verified by projection.test.ts.
  // If you change this, update the shader and re-run the parity tests.
  const project = useMemo(() => {
    const azRad = (camera.azimuth * Math.PI) / 180;
    const elRad = (camera.elevation * Math.PI) / 180;
    const cosAz = Math.cos(azRad),
      sinAz = Math.sin(azRad);
    const cosEl = Math.cos(elRad),
      sinEl = Math.sin(elRad);
    const scale = Math.min(width, height) * 0.35;
    const cx = width / 2,
      cy = height / 2;

    return (nx: number, ny: number, nz: number): ProjectedPoint => {
      const x = nx - 0.5,
        y = ny - 0.5,
        z = nz - 0.5;
      const x1 = x * cosAz + z * sinAz;
      const z1 = -x * sinAz + z * cosAz;
      const y1 = y * cosEl - z1 * sinEl;
      const z2 = y * sinEl + z1 * cosEl;
      return {px: cx + x1 * scale, py: cy - y1 * scale, depth: z2};
    };
  }, [camera.azimuth, camera.elevation, width, height]);

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!interactive) {
        return;
      }
      dragRef.current = {
        startX: clientX,
        startY: clientY,
        startAz: camera.azimuth,
        startEl: camera.elevation,
      };
    },
    [interactive, camera],
  );

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!dragRef.current) {
      return;
    }
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    setCamera({
      azimuth: dragRef.current.startAz + dx * 0.5,
      elevation: Math.max(
        -89,
        Math.min(89, dragRef.current.startEl - dy * 0.5),
      ),
    });
  }, []);

  const handleEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  // Auto-rotation — throttled to ~20fps to avoid overwhelming React with re-renders
  useEffect(() => {
    if (autoRotate === 0) {
      return;
    }
    let raf: number;
    let lastUpdate = 0;
    const interval = 50; // ms between React updates (~20fps)
    const tick = (now: number) => {
      if (!dragRef.current && now - lastUpdate >= interval) {
        const elapsed = lastUpdate === 0 ? interval : now - lastUpdate;
        lastUpdate = now;
        const degrees = autoRotate * (elapsed / 16.67); // normalize to 60fps equivalent
        setCamera(prev => ({...prev, azimuth: prev.azimuth + degrees}));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoRotate]);

  const ctx = useMemo(
    () => ({
      width,
      height,
      data,
      xKey,
      yKey,
      zKey,
      project,
      xDomain,
      yDomain,
      zDomain,
      normalize,
      camera,
    }),
    [
      width,
      height,
      data,
      xKey,
      yKey,
      zKey,
      project,
      xDomain,
      yDomain,
      zDomain,
      normalize,
      camera,
    ],
  );

  const containerStyle: CSSProperties = {
    width: '100%',
    touchAction: interactive ? 'none' : undefined,
    userSelect: interactive ? 'none' : undefined,
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      {containerWidth > 0 && (
        <svg
          width={containerWidth}
          height={height}
          onMouseDown={e => handleStart(e.clientX, e.clientY)}
          onMouseMove={e => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={e => {
            const t = e.touches[0];
            if (t) {
              handleStart(t.clientX, t.clientY);
            }
          }}
          onTouchMove={e => {
            const t = e.touches[0];
            if (t) {
              e.preventDefault();
              handleMove(t.clientX, t.clientY);
            }
          }}
          onTouchEnd={handleEnd}
          style={{
            cursor: interactive ? 'grab' : undefined,
            touchAction: interactive ? 'none' : undefined,
          }}>
          <ThreeDProvider value={ctx}>{children}</ThreeDProvider>
        </svg>
      )}
    </div>
  );
}
