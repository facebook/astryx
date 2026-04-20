/**
 * @file XDSSankeyLink.tsx
 * @output Renders flow ribbons with oklch gradient fills
 * @position Visual layer — the colorful flowing areas between nodes
 *
 * Each link is a filled shape bounded by two cubic beziers.
 * Gradients transition from source to target color through oklch space.
 */

import {useSankey} from './SankeyContext';

export interface XDSSankeyLinkProps {
  /** Opacity of the link fills (default: 0.7) */
  opacity?: number;
  /** Bezier tension — 0 is straight, 1 is maximum curve (default: 0.5) */
  tension?: number;
}

function oklch(color: [number, number, number], alpha: number): string {
  return `oklch(${color[0]} ${color[1]} ${color[2]} / ${alpha})`;
}

/**
 * Renders all link ribbons in the Sankey chart.
 *
 * Each ribbon is a filled path defined by two cubic bezier curves.
 * A 4-stop linear gradient smoothly interpolates oklch color from source to target.
 *
 * Place before XDSSankeyNode so nodes render on top.
 */
export function XDSSankeyLink({
  opacity = 0.7,
  tension = 0.5,
}: XDSSankeyLinkProps) {
  const {links} = useSankey();

  return (
    <g>
      <defs>
        {links.map((link, i) => {
          const sx = link.source.x + link.source.width;
          const tx = link.target.x;
          return (
            <linearGradient
              key={`grad-${i}`}
              id={`xds-sankey-grad-${i}`}
              x1={sx}
              x2={tx}
              y1={0}
              y2={0}
              gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={oklch(link.source.color, opacity)} />
              <stop
                offset="35%"
                stopColor={oklch(link.source.color, opacity * 0.85)}
              />
              <stop
                offset="65%"
                stopColor={oklch(link.target.color, opacity * 0.85)}
              />
              <stop
                offset="100%"
                stopColor={oklch(link.target.color, opacity)}
              />
            </linearGradient>
          );
        })}
      </defs>
      {links.map((link, i) => {
        const sx = link.source.x + link.source.width;
        const tx = link.target.x;
        const sy = link.sourceY;
        const ty = link.targetY;
        const lh = link.height;
        const dx = (tx - sx) * tension;

        const d = [
          `M${sx},${sy}`,
          `C${sx + dx},${sy} ${tx - dx},${ty} ${tx},${ty}`,
          `L${tx},${ty + lh}`,
          `C${tx - dx},${ty + lh} ${sx + dx},${sy + lh} ${sx},${sy + lh}`,
          'Z',
        ].join(' ');

        return <path key={i} d={d} fill={`url(#xds-sankey-grad-${i})`} />;
      })}
    </g>
  );
}

XDSSankeyLink.displayName = 'XDSSankeyLink';
