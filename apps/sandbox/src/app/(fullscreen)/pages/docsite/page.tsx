'use client';

import {useState, useEffect, useRef, useCallback} from 'react';
// TopNav no longer used — custom nav instead
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSToken} from '@xds/core/Token';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSTooltip} from '@xds/core/Tooltip';
import {createStaticSource} from '@xds/core/Typeahead';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 10-16 0" />
  </svg>
);
const HamburgerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <line x1="4" y1="8" x2="20" y2="8" />
    <line x1="4" y1="16" x2="20" y2="16" />
    <circle
      cx="10"
      cy="8"
      r="3"
      fill="var(--color-background-surface, white)"
    />
    <circle
      cx="14"
      cy="16"
      r="3"
      fill="var(--color-background-surface, white)"
    />
  </svg>
);

const MoreIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ThumbsUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SidebarCollapseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <polyline points="14 9 11 12 14 15" />
  </svg>
);

const AaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M3 18L8 6h1l5 12" />
    <line x1="5" y1="14" x2="12" y2="14" />
    <path d="M15 18c0-2.5 1.5-4 3.5-4s3.5 1.5 3.5 4" />
    <line x1="22" y1="18" x2="22" y2="13" />
  </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ExternalLinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const CodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const FullscreenIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

const GearIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Boids ASCII Canvas — generating state animation
// ---------------------------------------------------------------------------

const CELL_W = 7;
const CELL_H = 13;

const DENSITY_LEVELS: Array<{
  min: number;
  chars: string[];
  font: string;
  alpha: number;
  usePrimary: boolean;
}> = [
  {
    min: 0,
    chars: ['·'],
    font: `${CELL_H - 3}px monospace`,
    alpha: 0.25,
    usePrimary: false,
  },
  {
    min: 1,
    chars: ['∘'],
    font: `${CELL_H - 1}px monospace`,
    alpha: 0.4,
    usePrimary: false,
  },
  {
    min: 2,
    chars: ['○'],
    font: `${CELL_H}px monospace`,
    alpha: 0.5,
    usePrimary: false,
  },
  {
    min: 3,
    chars: ['◎'],
    font: `${CELL_H}px monospace`,
    alpha: 0.55,
    usePrimary: true,
  },
  {
    min: 4,
    chars: ['◉'],
    font: `bold ${CELL_H}px monospace`,
    alpha: 0.65,
    usePrimary: true,
  },
  {
    min: 5,
    chars: ['●'],
    font: `bold ${CELL_H + 1}px monospace`,
    alpha: 0.8,
    usePrimary: true,
  },
  {
    min: 7,
    chars: ['⬤'],
    font: `bold ${CELL_H + 2}px monospace`,
    alpha: 0.95,
    usePrimary: true,
  },
];

interface BoidState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function parseColor(color: string): [number, number, number] {
  const el = document.createElement('div');
  el.style.color = color;
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color;
  document.body.removeChild(el);
  const m = computed.match(/(\d+)/g);
  return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
}

// Simulation runs in normalized 0–1 coordinates
const SIM_COUNT = 350;

function createBoid(): BoidState {
  const a = Math.random() * Math.PI * 2;
  const s = 0.001 + Math.random() * 0.002;
  return {
    x: Math.random(),
    y: Math.random(),
    vx: Math.cos(a) * s,
    vy: Math.sin(a) * s,
  };
}

interface BoidsSimulation {
  boids: BoidState[];
  update: () => void;
}

function createSimulation(): BoidsSimulation {
  const boids: BoidState[] = [];
  for (let i = 0; i < SIM_COUNT; i++) boids.push(createBoid());
  let wax = 0.5,
    way = 0.5,
    wvx = 0.0005,
    wvy = 0.0003;

  function getNearestN(b: BoidState, n: number) {
    const d: Array<{o: BoidState; d2: number}> = [];
    for (const o of boids) {
      if (o === b) continue;
      const dx = o.x - b.x,
        dy = o.y - b.y;
      d.push({o, d2: dx * dx + dy * dy});
    }
    d.sort((a, c) => a.d2 - c.d2);
    return d.slice(0, n).map(x => x.o);
  }

  function update() {
    const maxSpd = 0.006;
    const cohW = 0.06;
    const swirlW = 0.03;
    const sepW = 0.4;
    const aliW = 0.08;
    const SEP_D = 0.025;

    wax += wvx;
    way += wvy;
    wvx += (Math.random() - 0.5) * 0.00015;
    wvy += (Math.random() - 0.5) * 0.00012;
    const ws = Math.sqrt(wvx * wvx + wvy * wvy);
    if (ws > 0.001) {
      wvx = (wvx / ws) * 0.001;
      wvy = (wvy / ws) * 0.001;
    }
    if (wax < 0.15 || wax > 0.85) wvx *= -1;
    if (way < 0.15 || way > 0.85) wvy *= -1;

    for (const b of boids) {
      const nb = getNearestN(b, 7);
      let cx = 0,
        cy = 0,
        ax = 0,
        ay = 0,
        sx = 0,
        sy = 0;
      for (const o of nb) {
        cx += o.x;
        cy += o.y;
        ax += o.vx;
        ay += o.vy;
        const dx = b.x - o.x,
          dy = b.y - o.y,
          dd = Math.sqrt(dx * dx + dy * dy) + 0.0001;
        if (dd < SEP_D) {
          sx += dx / dd;
          sy += dy / dd;
        }
      }
      const n = nb.length;
      if (n > 0) {
        cx /= n;
        cy /= n;
        const tx = cx - b.x,
          ty = cy - b.y;
        b.vx += tx * cohW;
        b.vy += ty * cohW;
        b.vx += -ty * swirlW;
        b.vy += tx * swirlW;
        ax /= n;
        ay /= n;
        b.vx += (ax - b.vx) * aliW;
        b.vy += (ay - b.vy) * aliW;
      }
      b.vx += sx * sepW;
      b.vy += sy * sepW;

      const wdx = wax - b.x,
        wdy = way - b.y,
        wd = Math.sqrt(wdx * wdx + wdy * wdy) + 0.001;
      b.vx += (wdx / wd) * 0.00002 * wd * 100;
      b.vy += (wdy / wd) * 0.00002 * wd * 100;

      const s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      const mn = maxSpd * 0.3;
      if (s > maxSpd) {
        b.vx = (b.vx / s) * maxSpd;
        b.vy = (b.vy / s) * maxSpd;
      }
      if (s < mn && s > 0) {
        b.vx = (b.vx / s) * mn;
        b.vy = (b.vy / s) * mn;
      }
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < 0) b.x += 1;
      if (b.x > 1) b.x -= 1;
      if (b.y < 0) b.y += 1;
      if (b.y > 1) b.y -= 1;
    }
  }

  return {boids, update};
}

function getDensityLevel(density: number) {
  let lvl = DENSITY_LEVELS[0];
  for (const l of DENSITY_LEVELS) {
    if (density >= l.min) lvl = l;
    else break;
  }
  return lvl;
}

function BoidsCanvas({
  width,
  height,
  simulation,
}: {
  width: number;
  height: number;
  simulation: BoidsSimulation;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef<{
    secondary: [number, number, number];
    primary: [number, number, number];
  } | null>(null);

  useEffect(() => {
    colorsRef.current = {
      secondary: parseColor('var(--color-icon-secondary, #666)'),
      primary: parseColor('var(--color-icon-primary, #111)'),
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = width;
    const H = height;
    const cols = Math.floor(W / CELL_W);
    const rows = Math.floor(H / CELL_H);

    let animId = 0;
    function render() {
      const colors = colorsRef.current;
      if (!colors) {
        animId = requestAnimationFrame(render);
        return;
      }
      ctx!.fillStyle = '#fff';
      ctx!.fillRect(0, 0, W, H);

      const densityGrid = new Float32Array(cols * rows);
      for (const b of simulation.boids) {
        const c = Math.floor(b.x * cols),
          r = Math.floor(b.y * rows);
        if (c >= 0 && c < cols && r >= 0 && r < rows)
          densityGrid[r * cols + c]++;
      }

      ctx!.textBaseline = 'top';
      for (const b of simulation.boids) {
        const col = Math.floor(b.x * cols),
          row = Math.floor(b.y * rows);
        if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
        const density = densityGrid[row * cols + col];
        const lvl = getDensityLevel(density);
        const rgb = lvl.usePrimary ? colors.primary : colors.secondary;
        ctx!.font = lvl.font;
        ctx!.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${lvl.alpha})`;
        ctx!.fillText(lvl.chars[0], col * CELL_W, row * CELL_H);
      }
      animId = requestAnimationFrame(render);
    }
    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [width, height, simulation]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        aspectRatio: '1920 / 1200',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Template data — real images from /public/templates/
// ---------------------------------------------------------------------------

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const DUMMY_IMAGE = `${basePath}/templates/dummy-placeholder.png`;
const FIRST_CARD_IMAGE = `${basePath}/templates/first-card.png`;
const SHOPPING_DETAILS_IMAGE = `${basePath}/templates/shopping-details.png`;
const SCREENSHOT_3_IMAGE = `${basePath}/templates/screenshot-3.png`;

const TEMPLATE_IMAGES = [DUMMY_IMAGE, DUMMY_IMAGE, DUMMY_IMAGE, DUMMY_IMAGE];

// ---------------------------------------------------------------------------
// TemplateCard
// ---------------------------------------------------------------------------

function TemplateCard({
  src,
  name,
  isSelected: _isSelected,
  onSelect: _onSelect,
  isGenerating,
  onMoreLikeThis: _onMoreLikeThis,
  onUse,
  simulation,
  cardSize: _cardSize = 'medium',
}: {
  src: string;
  name: string;
  isSelected?: boolean;
  onSelect?: () => void;
  isGenerating: boolean;
  onMoreLikeThis?: () => void;
  onUse: () => void;
  simulation: BoidsSimulation;
  cardSize?: 'xlarge' | 'large' | 'medium' | 'small';
}) {
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({w: 0, h: 0});
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    if (isGenerating && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSize({w: rect.width, h: rect.height});
      setShowCanvas(true);
    }
  }, [isGenerating]);

  // Keep canvas mounted briefly after generating ends for fade-out
  useEffect(() => {
    if (!isGenerating && showCanvas) {
      const id = setTimeout(() => setShowCanvas(false), 800);
      return () => clearTimeout(id);
    }
  }, [isGenerating, showCanvas]);

  return (
    <XDSCard padding={0}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onUse}>
        {/* Image layer — always present */}
        <img
          src={src}
          alt={name}
          style={{
            display: 'block',
            width: '100%',
            height: 400,
            objectFit: 'cover' as const,
            opacity: isGenerating ? 0 : 1,
            transition: 'opacity 600ms ease',
          }}
        />
        {/* Canvas layer — overlaid, fades in/out */}
        {showCanvas && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isGenerating ? 1 : 0,
              transition: 'opacity 600ms ease',
            }}>
            <BoidsCanvas
              width={size.w}
              height={size.h}
              simulation={simulation}
            />
          </div>
        )}
        {!isGenerating && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--color-overlay, rgba(0,0,0,0.5))',
              opacity: hovered ? 1 : 0,
              transition:
                'opacity var(--duration-fast, 175ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
            }}>
            <div
              style={{position: 'absolute', top: 2, right: 2}}
              onClick={e => e.stopPropagation()}>
              <XDSDropdownMenu
                button={{
                  label: 'More',
                  variant: 'ghost',
                  size: 'sm',
                  icon: <MoreIcon />,
                  style: {color: '#fff'},
                  isIconOnly: true,
                }}
                hasChevron={false}
                items={[
                  {label: 'Copy link', icon: LinkIcon, onClick: () => {}},
                  {label: 'Favorite', icon: HeartIcon, onClick: () => {}},
                  {label: 'Upvote', icon: ThumbsUpIcon, onClick: () => {}},
                ]}
              />
            </div>
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                display: 'flex',
                flexDirection: 'column' as const,
                gap: 4,
                alignItems: 'flex-end',
                transform: hovered ? 'translateY(0)' : 'translateY(16px)',
                opacity: hovered ? 1 : 0,
                transition:
                  'transform var(--duration-fast, 175ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), opacity var(--duration-fast, 175ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
              }}>
              <XDSDropdownMenu
                button={{
                  label: 'Use',
                  variant: 'secondary' as const,
                  size: 'sm' as const,
                  style: {backgroundColor: 'var(--color-background-surface)'},
                }}
                hasChevron={false}
                menuWidth={220}
                items={[
                  {
                    label: 'Copy CLI Command...',
                    icon: TerminalIcon,
                    onClick: () => {},
                  },
                  {type: 'divider' as const},
                  {label: 'Claude Code', icon: ClaudeIcon, onClick: () => {}},
                  {label: 'VSCode', icon: VSCodeIcon, onClick: () => {}},
                  {label: 'Cursor', icon: CursorAIIcon, onClick: () => {}},
                ]}
              />
              <XDSButton
                label="Customize"
                variant="secondary"
                size="sm"
                style={{backgroundColor: 'var(--color-background-surface)'}}
                onClick={onUse}
              />
            </div>
          </div>
        )}
      </div>
    </XDSCard>
  );
}

// ---------------------------------------------------------------------------
// AI Composer (floating, shown when not generating)
// ---------------------------------------------------------------------------

function AIComposer() {
  const [prompt, setPrompt] = useState('');

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background:
            'linear-gradient(to bottom, transparent, var(--color-background-surface, white))',
          pointerEvents: 'none',
          zIndex: 99,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 680,
          maxWidth: 'calc(100% - 48px)',
          zIndex: 100,
        }}>
        <div
          style={{
            borderRadius: 20,
            backgroundColor: 'var(--color-background-card)',
            border: '1px solid var(--color-divider)',
            boxShadow: 'var(--shadow-high)',
            overflow: 'hidden',
            padding: 8,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 8,
          }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              paddingInline: 12,
              paddingBlock: 6,
              borderRadius: 9999,
              backgroundColor: 'var(--color-background-body)',
              fontSize: 13,
            }}>
            Template 01
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'flex-end',
            }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: 8,
              }}>
              <input
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontFamily: 'inherit',
                  fontSize: 14,
                }}
                placeholder="What should we build?"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                paddingInlineStart: 4,
                paddingTop: 4,
              }}>
              <XDSButton
                label="Attach"
                variant="ghost"
                size="sm"
                icon={<PlusIcon />}
                isIconOnly
              />
              <XDSButton
                label="Send"
                variant="primary"
                size="sm"
                icon={<SendIcon />}
                style={{borderRadius: 9999}}
                isIconOnly
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Shimmer text for AI response
// ---------------------------------------------------------------------------

function ShimmerText({isActive}: {isActive: boolean}) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(id);
  }, [isActive]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 8,
        opacity: isActive ? 1 : 0,
        transition: 'opacity 600ms ease',
      }}>
      <XDSSkeleton width="90%" height={14} radius={3} index={0} />
      <XDSSkeleton width="75%" height={14} radius={3} index={1} />
      <XDSSkeleton width="60%" height={14} radius={3} index={2} />
      <XDSText type="supporting" color="secondary">
        {isActive ? `Generating templates${dots}` : 'Done'}
      </XDSText>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chat Panel (shown when generating)
// ---------------------------------------------------------------------------

const SidebarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
);

function ChatPanel({
  isGenerating,
  onSend,
  activeView,
  setActiveView,
}: {
  isGenerating: boolean;
  onSend?: () => void;
  activeView: 'craft' | 'docs' | 'explore' | 'profile';
  setActiveView: (view: 'craft' | 'docs' | 'explore' | 'profile') => void;
}) {
  const [prompt, setPrompt] = useState('');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        width: '100%',
      }}>
      {/* Header: hamburger + XDS | Craft */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          flexShrink: 0,
        }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <XDSDropdownMenu
            button={{
              label: 'Menu',
              variant: 'ghost',
              size: 'sm',
              icon: <HamburgerIcon />,
              isIconOnly: true,
            }}
            hasChevron={false}
            items={[
              {
                label: 'Craft',
                icon: activeView === 'craft' ? CheckIcon : undefined,
                onClick: () => setActiveView('craft'),
              },
              {
                label: 'Explore',
                icon: activeView === 'explore' ? CheckIcon : undefined,
                onClick: () => setActiveView('explore'),
              },
              {
                label: 'Docs',
                icon: activeView === 'docs' ? CheckIcon : undefined,
                onClick: () => setActiveView('docs'),
              },
            ]}
          />
          <svg
            width="46"
            height="24"
            viewBox="0 0 46 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.4239 15.8011C2.03945 16.3796 1.66972 16.9538 1.3147 17.524C0.707427 18.4992 1.42354 19.7348 2.57241 19.7348C3.13302 19.7348 3.64463 19.4209 3.91525 18.93C4.29391 18.243 4.71274 17.5352 5.17173 16.8066C5.38894 16.4618 5.60743 16.12 5.82721 15.7812C6.25251 15.1254 6.46516 14.7976 6.76252 14.68C6.99255 14.5891 7.27368 14.5899 7.50317 14.6822C7.79984 14.8014 8.00881 15.1278 8.42675 15.7804C8.64287 16.1179 8.85732 16.46 9.07008 16.8066C9.52175 17.534 9.93823 18.2339 10.3195 18.9063C10.6075 19.4141 11.1428 19.7348 11.7266 19.7348C12.9476 19.7348 13.7063 18.4203 13.0547 17.3877C12.7332 16.8781 12.3991 16.3639 12.0525 15.8453C11.3983 14.8527 10.7379 13.8906 10.0714 12.9592C9.81687 12.6036 9.68962 12.4258 9.64377 12.2384C9.60589 12.0836 9.60492 11.9307 9.64085 11.7754C9.68435 11.5874 9.80856 11.4091 10.057 11.0526C10.7093 10.1164 11.3596 9.15781 12.0078 8.1768C12.3869 7.60474 12.7521 7.03681 13.1035 6.47298C13.71 5.49987 12.9962 4.26519 11.8496 4.26519C11.2943 4.26519 10.7868 4.57405 10.5169 5.05923C10.1399 5.73688 9.72461 6.43721 9.27114 7.16022C9.06143 7.49458 8.8505 7.82569 8.63835 8.15358C8.21478 8.80819 8.003 9.1355 7.70554 9.25334C7.47561 9.34442 7.19397 9.34375 6.96448 9.25156C6.66759 9.13229 6.45853 8.80578 6.04043 8.15276C5.83116 7.82591 5.62351 7.49506 5.41747 7.16022C4.97918 6.44793 4.5738 5.76096 4.20132 5.0993C3.9136 4.58821 3.37617 4.26519 2.78967 4.26519C1.56624 4.26519 0.805692 5.58299 1.45419 6.62041C1.76588 7.11903 2.08912 7.6231 2.4239 8.1326C3.0752 9.10994 3.73263 10.059 4.3962 10.9796C4.65373 11.337 4.7825 11.5156 4.82882 11.7042C4.86709 11.86 4.86797 12.0139 4.83149 12.1702C4.78732 12.3593 4.66122 12.5385 4.40903 12.897C3.74526 13.8406 3.08355 14.8086 2.4239 15.8011Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M22.4734 4.26519C20.4471 4.26519 19.434 4.26519 18.6657 4.67201C18.0456 5.00031 17.5385 5.50739 17.2102 6.12744C16.8034 6.89579 16.8034 7.90892 16.8034 9.9352V14.0648C16.8034 16.0911 16.8034 17.1042 17.2102 17.8726C17.5385 18.4926 18.0456 18.9997 18.6657 19.328C19.434 19.7348 20.4471 19.7348 22.4734 19.7348H23.2039C24.8496 19.7348 26.2644 19.4033 27.4485 18.7403C28.6399 18.07 29.5559 17.1529 30.1963 15.989C30.8367 14.825 31.1569 13.4954 31.1569 12C31.1569 10.5046 30.8367 9.17495 30.1963 8.01105C29.5559 6.84714 28.6399 5.9337 27.4485 5.27072C26.2644 4.60037 24.8496 4.26519 23.2039 4.26519H22.4734ZM20.0092 8.74707C20.0092 8.16814 20.0092 7.87867 20.1255 7.65914C20.2193 7.48198 20.3641 7.33711 20.5413 7.24331C20.7608 7.12707 21.0503 7.12707 21.6292 7.12707H23.1927C24.6522 7.12707 25.7916 7.57274 26.6107 8.46409C27.4299 9.34807 27.8394 10.5267 27.8394 12C27.8394 13.4659 27.4299 14.6446 26.6107 15.5359C25.7916 16.4273 24.6522 16.8729 23.1927 16.8729H21.6292C21.0503 16.8729 20.7608 16.8729 20.5413 16.7567C20.3641 16.6629 20.2193 16.518 20.1255 16.3409C20.0092 16.1213 20.0092 15.8319 20.0092 15.2529V8.74707Z"
              fill="currentColor"
            />
            <path
              d="M35.4666 19.2376C36.6134 19.7459 37.9501 20 39.4767 20H39.8006C41.7144 20 43.2261 19.5801 44.3357 18.7403C45.4452 17.9006 46 16.7403 46 15.2597C46 14.3757 45.8213 13.6501 45.4638 13.0829C45.1064 12.5083 44.6559 12.0589 44.1123 11.7348C43.5761 11.4033 43.0325 11.1565 42.4814 10.9945C41.9304 10.8324 41.4575 10.7145 41.0628 10.6409L38.706 10.1878C38.0283 10.0552 37.4698 9.87477 37.0305 9.64641C36.5985 9.41068 36.3826 9.02762 36.3826 8.49724C36.3826 7.96685 36.6395 7.55064 37.1533 7.24862C37.6671 6.93923 38.3857 6.78453 39.3091 6.78453H39.6219C40.3964 6.78453 41.1224 6.93186 41.8001 7.22652C42.0982 7.35474 42.3899 7.5234 42.6754 7.73251C43.326 8.20923 44.2444 8.27802 44.8243 7.71734C45.34 7.21868 45.4053 6.39786 44.8761 5.91349C44.3498 5.43171 43.7638 5.03698 43.1181 4.72928C42.1054 4.24309 40.9511 4 39.6554 4H39.3315C38.0953 4 37.0156 4.19521 36.0922 4.58564C35.1762 4.97606 34.4613 5.52486 33.9475 6.23204C33.4411 6.93186 33.188 7.76059 33.188 8.71823C33.188 9.49171 33.3406 10.1436 33.6459 10.674C33.9587 11.2044 34.3571 11.6354 34.8411 11.9669C35.3326 12.2983 35.8539 12.5599 36.4049 12.7514C36.956 12.9355 37.4698 13.0718 37.9464 13.1602L40.3033 13.6243C40.6905 13.698 41.074 13.8011 41.4538 13.9337C41.841 14.0589 42.1612 14.2431 42.4144 14.4862C42.6676 14.7293 42.7942 15.0608 42.7942 15.4807C42.7942 16.6151 41.7814 17.1823 39.7559 17.1823H39.4432C38.49 17.1823 37.615 17.0055 36.8182 16.6519C36.4847 16.4994 36.1665 16.3134 35.8635 16.0938C35.17 15.5911 34.1857 15.5241 33.5784 16.1282C33.0651 16.6388 32.9912 17.4631 33.5198 17.9578C34.0797 18.4818 34.7287 18.9083 35.4666 19.2376Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <XDSButton
          label="Toggle sidebar"
          variant="ghost"
          size="sm"
          icon={<SidebarIcon />}
          isIconOnly
        />
      </div>
      {/* Chat thread */}
      <div style={{flex: 1, padding: 16, overflow: 'auto'}}>
        {/* User message */}
        <div
          style={{
            backgroundColor: 'var(--color-background-body, #f1f4f7)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingInline: 8,
              paddingBlock: 2,
              borderRadius: 9999,
              backgroundColor: 'var(--color-overlay-hover, rgba(0,0,0,0.05))',
              fontSize: 12,
              marginBottom: 8,
            }}>
            Template 01
          </div>
          <XDSText type="body">
            Can you customize this template by adding a divider line under the
            header and use a card for the lists
          </XDSText>
        </div>
        {/* AI shimmer response */}
        <div style={{padding: '0 4px'}}>
          <ShimmerText isActive={isGenerating} />
        </div>
      </div>
      {/* Composer pinned to bottom */}
      <div style={{padding: 12}}>
        <div
          style={{
            borderRadius: 20,
            backgroundColor: 'var(--color-background-card, white)',
            border: '1px solid var(--color-divider)',
            boxShadow: 'var(--shadow-high)',
            padding: 8,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 8,
          }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              paddingInline: 8,
              paddingBlock: 2,
              borderRadius: 9999,
              backgroundColor: 'var(--color-background-body, #f1f4f7)',
              fontSize: 12,
            }}>
            Template 01
          </div>
          <div style={{display: 'flex', alignItems: 'center', padding: 8}}>
            <input
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontFamily: 'inherit',
                fontSize: 14,
              }}
              placeholder="What would you like to customize?"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingInlineStart: 4,
              paddingTop: 4,
            }}>
            <XDSButton
              label="Attach"
              variant="ghost"
              size="sm"
              icon={<PlusIcon />}
              isIconOnly
            />
            <XDSButton
              label="Send"
              variant="primary"
              size="sm"
              icon={<SendIcon />}
              style={{borderRadius: 9999}}
              onClick={onSend}
              isIconOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar Icons
// ---------------------------------------------------------------------------

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const CursorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
  </svg>
);

const PaletteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.7 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.7 1.7-1.7H16c3.3 0 6-2.7 6-6 0-5-4.5-8.5-10-8.5z" />
    <circle cx="7.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="10.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const DesktopIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const TabletIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" />
  </svg>
);

const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" />
  </svg>
);

const TerminalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    {...props}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const ClaudeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 248 248" fill="none" {...props}>
    <path
      d="M52.4285 162.873L98.7844 136.879L99.5485 134.602L98.7844 133.334H96.4921L88.7237 132.862L62.2346 132.153L39.3113 131.207L17.0249 130.026L11.4214 128.844L6.2 121.873L6.7094 118.447L11.4214 115.257L18.171 115.847L33.0711 116.911L55.485 118.447L71.6586 119.392L95.728 121.873H99.5485L100.058 120.337L98.7844 119.392L97.7656 118.447L74.5877 102.732L49.4995 86.1905L36.3823 76.62L29.3779 71.7757L25.8121 67.2858L24.2839 57.3608L30.6515 50.2716L39.3113 50.8623L41.4763 51.4531L50.2636 58.1879L68.9842 72.7209L93.4357 90.6804L97.0015 93.6343L98.4374 92.6652L98.6571 91.9801L97.0015 89.2625L83.757 65.2772L69.621 40.8192L63.2534 30.6579L61.5978 24.632C60.9565 22.1032 60.579 20.0111 60.579 17.4246L67.8381 7.49965L71.9133 6.19995L81.7193 7.49965L85.7946 11.0443L91.9074 24.9865L101.714 46.8451L116.996 76.62L121.453 85.4816L123.873 93.6343L124.764 96.1155H126.292V94.6976L127.566 77.9197L129.858 57.3608L132.15 30.8942L132.915 23.4505L136.608 14.4708L143.994 9.62643L149.725 12.344L154.437 19.0788L153.8 23.4505L150.998 41.6463L145.522 70.1215L141.957 89.2625H143.994L146.414 86.7813L156.093 74.0206L172.266 53.698L179.398 45.6635L187.803 36.802L193.152 32.5484H203.34L210.726 43.6549L207.415 55.1159L196.972 68.3492L188.312 79.5739L175.896 96.2095L168.191 109.585L168.882 110.689L170.738 110.53L198.755 104.504L213.91 101.787L231.994 98.7149L240.144 102.496L241.036 106.395L237.852 114.311L218.495 119.037L195.826 123.645L162.07 131.592L161.696 131.893L162.137 132.547L177.36 133.925L183.855 134.279H199.774L229.447 136.524L237.215 141.605L241.8 147.867L241.036 152.711L229.065 158.737L213.019 154.956L175.45 145.977L162.587 142.787H160.805V143.85L171.502 154.366L191.242 172.089L215.82 195.011L217.094 200.682L213.91 205.172L210.599 204.699L188.949 188.394L180.544 181.069L161.696 165.118H160.422V166.772L164.752 173.152L187.803 207.771L188.949 218.405L187.294 221.832L181.308 223.959L174.813 222.777L161.187 203.754L147.305 182.486L136.098 163.345L134.745 164.2L128.075 235.42L125.019 239.082L117.887 241.8L111.902 237.31L108.718 229.984L111.902 215.452L115.722 196.547L118.779 181.541L121.58 162.873L123.291 156.636L123.14 156.219L121.773 156.449L107.699 175.752L86.304 204.699L69.3663 222.777L65.291 224.431L58.2867 220.768L58.9235 214.27L62.8713 208.48L86.304 178.705L100.44 160.155L109.551 149.507L109.462 147.967L108.959 147.924L46.6977 188.512L35.6182 189.93L30.7788 185.44L31.4156 178.115L33.7079 175.752L52.4285 162.873Z"
      fill="#D97757"
    />
  </svg>
);

const VSCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M70.9119 99.3171C72.4869 99.9307 74.2828 99.8914 75.8725 99.1264L96.4608 89.2197C98.6242 88.1787 100 85.9892 100 83.5872V16.4133C100 14.0113 98.6243 11.8218 96.4609 10.7808L75.8725 0.873756C73.7862 -0.130129 71.3446 0.11576 69.5135 1.44695C69.252 1.63711 69.0028 1.84943 68.769 2.08341L29.3551 38.0415L12.1872 25.0096C10.589 23.7965 8.35363 23.8959 6.86933 25.2461L1.36303 30.2549C-0.452552 31.9064 -0.454633 34.7627 1.35853 36.417L16.2471 50.0001L1.35853 63.5832C-0.454633 65.2374 -0.452552 68.0938 1.36303 69.7453L6.86933 74.7541C8.35363 76.1043 10.589 76.2037 12.1872 74.9905L29.3551 61.9587L68.769 97.9167C69.3925 98.5406 70.1246 99.0104 70.9119 99.3171ZM75.0152 27.2989L45.1091 50.0001L75.0152 72.7012V27.2989Z"
      fill="#007ACC"
    />
  </svg>
);

const CursorAIIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 512 512" fill="none" {...props}>
    <path
      d="M415.035 156.35l-151.503-87.4695c-4.865-2.8094-10.868-2.8094-15.733 0l-151.4969 87.4695c-4.0897 2.362-6.6146 6.729-6.6146 11.459v176.383c0 4.73 2.5249 9.097 6.6146 11.458l151.5039 87.47c4.865 2.809 10.868 2.809 15.733 0l151.504-87.47c4.089-2.361 6.614-6.728 6.614-11.458v-176.383c0-4.73-2.525-9.097-6.614-11.459zm-9.516 18.528l-146.255 253.32c-.988 1.707-3.599 1.01-3.599-.967v-165.872c0-3.314-1.771-6.379-4.644-8.044l-143.645-82.932c-1.707-.988-1.01-3.599.968-3.599h292.509c4.154 0 6.75 4.503 4.673 8.101h-.007z"
      fill="currentColor"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Mock code for the code block
// ---------------------------------------------------------------------------

const MOCK_CODE = `'use client';

import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAvatar} from '@xds/core/Avatar';

export default function DetailPage() {
  return (
    <XDSAppShell variant="surface">
      <XDSVStack gap={6}>
        <XDSHeading level={1}>Detail Page</XDSHeading>
        <XDSCard>
          <XDSVStack gap={4}>
            <XDSHStack gap={2} vAlign="center">
              <XDSAvatar name="Jane Doe" size="md" />
              <XDSText type="body" weight="bold">Jane Doe</XDSText>
              <XDSBadge label="Active" variant="success" />
            </XDSHStack>
            <XDSText type="body">
              This is a detail page template with structured
              content sections, metadata, and action buttons.
            </XDSText>
            <XDSHStack gap={2}>
              <XDSButton label="Edit" variant="secondary" />
              <XDSButton label="Share" variant="ghost" />
            </XDSHStack>
          </XDSVStack>
        </XDSCard>
      </XDSVStack>
    </div>
  );
}`;

// ---------------------------------------------------------------------------
// Template Preview (Use mode)
// ---------------------------------------------------------------------------

const VIEWPORT_WIDTHS: Record<string, number | '100%'> = {
  desktop: 1600,
  tablet: 768,
  phone: 375,
};

const XDS_THEMES = [
  {label: 'Default', value: 'default'},
  {label: 'Neutral', value: 'neutral'},
  {label: 'Dark', value: 'dark'},
];

function TemplatePreview({
  templateName,
  imageSrc,
  onBack,
  isGenerating,
  simulation,
}: {
  templateName: string;
  imageSrc: string;
  onBack: () => void;
  isGenerating: boolean;
  simulation: BoidsSimulation;
}) {
  const [viewportSize, setViewportSize] = useState('desktop');
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewSize, setPreviewSize] = useState({w: 0, h: 0});
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    if (isGenerating && previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      setPreviewSize({w: rect.width, h: rect.height});
      setShowCanvas(true);
    }
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating && showCanvas) {
      const id = setTimeout(() => setShowCanvas(false), 800);
      return () => clearTimeout(id);
    }
  }, [isGenerating, showCanvas]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        overflow: 'hidden',
        paddingTop: 16,
      }}>
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '0 16px 16px 0',
        }}>
        {/* Bordered container: toolbar + preview + code */}
        <div
          style={{
            border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
            borderRadius: 12,
            paddingBottom: 8,
            display: 'flex',
            flexDirection: 'column' as const,
          }}>
          {/* Toolbar */}
          <XDSToolbar
            label="Template actions"
            startContent={
              <>
                <XDSButton
                  label="Back"
                  variant="secondary"
                  size="sm"
                  icon={<ArrowLeftIcon />}
                  onClick={onBack}
                  style={{marginLeft: -8}}
                  isIconOnly
                />
                <XDSTooltip content="Point" placement="below">
                  <XDSButton
                    label="Point"
                    variant="ghost"
                    icon={<CursorIcon />}
                    isIconOnly
                  />
                </XDSTooltip>
                <XDSDropdownMenu
                  button={{
                    label: 'Theme',
                    variant: 'ghost',
                    icon: <PaletteIcon />,
                    isIconOnly: true,
                  }}
                  hasChevron={false}
                  items={XDS_THEMES.map(t => ({
                    label: t.label,
                    onClick: () => {},
                  }))}
                />
                <XDSSegmentedControl
                  value={viewportSize}
                  onChange={setViewportSize}
                  label="Viewport size"
                  size="sm">
                  <XDSSegmentedControlItem
                    value="desktop"
                    label="Desktop"
                    isLabelHidden
                    icon={<DesktopIcon />}
                  />
                  <XDSSegmentedControlItem
                    value="tablet"
                    label="Tablet"
                    isLabelHidden
                    icon={<TabletIcon />}
                  />
                  <XDSSegmentedControlItem
                    value="phone"
                    label="Phone"
                    isLabelHidden
                    icon={<PhoneIcon />}
                  />
                </XDSSegmentedControl>
              </>
            }
            centerContent={<XDSButton label={templateName} variant="ghost" />}
            endContent={
              <XDSDropdownMenu
                button={{label: 'Use in...', variant: 'ghost'}}
                hasChevron={false}
                menuWidth={220}
                items={[
                  {
                    label: 'Copy CLI Command...',
                    icon: TerminalIcon,
                    onClick: () => {},
                  },
                  {type: 'divider' as const},
                  {label: 'Claude Code', icon: ClaudeIcon, onClick: () => {}},
                  {label: 'VSCode', icon: VSCodeIcon, onClick: () => {}},
                  {label: 'Cursor', icon: CursorAIIcon, onClick: () => {}},
                ]}
              />
            }
          />

          {/* Preview image in muted container with grid dots */}
          <div
            style={{
              backgroundColor:
                'var(--color-background-muted, rgba(0,0,0,0.03))',
              backgroundImage:
                'radial-gradient(circle, var(--color-divider, rgba(0,0,0,0.1)) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              borderRadius: 8,
              padding: 22,
              margin: '0 8px',
              display: 'flex',
              justifyContent: 'center',
            }}>
            <div
              ref={previewRef}
              style={{
                position: 'relative',
                width:
                  VIEWPORT_WIDTHS[viewportSize] === '100%'
                    ? '100%'
                    : VIEWPORT_WIDTHS[viewportSize],
                maxWidth: '100%',
                border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                borderRadius: 8,
                overflow: 'hidden',
                transition:
                  'width var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
              }}>
              <img
                src={imageSrc}
                alt="Template preview"
                style={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '1920 / 1200',
                  objectFit: 'cover',
                  opacity: isGenerating ? 0 : 1,
                  transition: 'opacity 600ms ease',
                }}
              />
              {showCanvas && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: isGenerating ? 1 : 0,
                    transition: 'opacity 600ms ease',
                  }}>
                  <BoidsCanvas
                    width={previewSize.w}
                    height={previewSize.h}
                    simulation={simulation}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Code block */}
          <div
            style={{
              margin: '8px 8px 0',
              border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
              borderRadius: 8,
              backgroundColor:
                'var(--color-background-muted, rgba(0,0,0,0.03))',
              overflow: 'hidden',
            }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px 8px 16px',
              }}>
              <span
                style={{
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--color-text-secondary, #4e606f)',
                }}>
                typescript — useUser.ts
              </span>
            </div>
            {/* Code */}
            <div style={{display: 'flex'}}>
              {/* Line numbers */}
              <div
                style={{
                  padding: '12px 12px 12px 16px',
                  borderRight:
                    '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: 14,
                  lineHeight: '20px',
                  color: 'var(--color-text-disabled, #a4b0bc)',
                  textAlign: 'right',
                  userSelect: 'none',
                  minWidth: 45,
                }}>
                {MOCK_CODE.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              {/* Code content */}
              <pre
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: 14,
                  lineHeight: '20px',
                  margin: 0,
                  overflow: 'auto',
                  color: 'var(--color-text-primary, #0a1317)',
                }}>
                {MOCK_CODE}
              </pre>
            </div>
          </div>
        </div>

        {/* Title & metadata */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 16,
            marginTop: 16,
          }}>
          <div style={{maxWidth: 540}}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                gap: 4,
              }}>
              <XDSHeading level={1}>{templateName}</XDSHeading>
              <XDSText type="supporting" color="secondary">
                XDS · 541 usages
              </XDSText>
            </div>
            <XDSText type="body" style={{marginTop: 16}}>
              Buttons are clickable elements that are used to trigger actions.
              They communicate calls to action to the user and allow users to
              interact with pages in a variety of ways. Button labels express
              what action will occur when the user interacts with it.
            </XDSText>
          </div>
        </div>

        {/* Similar templates */}
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 16,
          }}>
          <XDSHeading level={2}>Similar templates</XDSHeading>
          <div style={{display: 'flex', gap: 16}}>
            {TEMPLATE_IMAGES.slice(0, 3).map((src, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: '1920 / 1200',
                  border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}>
                <img
                  src={src}
                  alt={`Similar template ${i + 1}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Component used */}
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 16,
          }}>
          <XDSHeading level={2}>Component used</XDSHeading>
          <XDSText type="body">
            XDSAppShell, XDSTopNav, XDSVStack, XDSHStack, XDSHeading, XDSText,
            XDSButton, XDSCard, XDSBadge, XDSAvatar
          </XDSText>
        </div>

        {/* Keywords */}
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 16,
            paddingBottom: 24,
          }}>
          <XDSHeading level={2}>Keywords</XDSHeading>
          <div style={{display: 'flex', flexWrap: 'wrap' as const, gap: 4}}>
            <XDSToken label="Dashboard" size="sm" />
            <XDSToken label="Admin" size="sm" />
            <XDSToken label="Layout" size="sm" />
            <XDSToken label="Navigation" size="sm" />
            <XDSToken label="Settings" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top Nav
// ---------------------------------------------------------------------------

const SEARCH_COMMANDS = createStaticSource([
  {
    id: 'templates',
    label: 'Browse Templates',
    auxiliaryData: {group: 'Navigation'},
  },
  {id: 'docs', label: 'Documentation', auxiliaryData: {group: 'Navigation'}},
  {id: 'button', label: 'XDSButton', auxiliaryData: {group: 'Components'}},
  {id: 'card', label: 'XDSCard', auxiliaryData: {group: 'Components'}},
  {id: 'dialog', label: 'XDSDialog', auxiliaryData: {group: 'Components'}},
  {id: 'table', label: 'XDSTable', auxiliaryData: {group: 'Components'}},
  {id: 'topnav', label: 'XDSTopNav', auxiliaryData: {group: 'Components'}},
  {
    id: 'theme-default',
    label: 'Switch to Default Theme',
    auxiliaryData: {group: 'Settings'},
  },
  {
    id: 'theme-dark',
    label: 'Switch to Dark Theme',
    auxiliaryData: {group: 'Settings'},
  },
]);

// ---------------------------------------------------------------------------
// LogoNav — hover-based logo navigation dropdown
// ---------------------------------------------------------------------------

const XDS_LOGO_SVG = (
  <svg
    width="101"
    height="24"
    viewBox="0 0 101 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.4239 15.8011C2.03945 16.3796 1.66972 16.9538 1.3147 17.524C0.707427 18.4992 1.42354 19.7348 2.57241 19.7348C3.13302 19.7348 3.64463 19.4209 3.91525 18.93C4.29391 18.243 4.71274 17.5352 5.17173 16.8066C5.38894 16.4618 5.60743 16.12 5.82721 15.7812C6.25251 15.1254 6.46516 14.7976 6.76252 14.68C6.99255 14.5891 7.27368 14.5899 7.50317 14.6822C7.79984 14.8014 8.00881 15.1278 8.42675 15.7804C8.64287 16.1179 8.85732 16.46 9.07008 16.8066C9.52175 17.534 9.93823 18.2339 10.3195 18.9063C10.6075 19.4141 11.1428 19.7348 11.7266 19.7348C12.9476 19.7348 13.7063 18.4203 13.0547 17.3877C12.7332 16.8781 12.3991 16.3639 12.0525 15.8453C11.3983 14.8527 10.7379 13.8906 10.0714 12.9592C9.81687 12.6036 9.68962 12.4258 9.64377 12.2384C9.60589 12.0836 9.60492 11.9307 9.64085 11.7754C9.68435 11.5874 9.80856 11.4091 10.057 11.0526C10.7093 10.1164 11.3596 9.15781 12.0078 8.1768C12.3869 7.60474 12.7521 7.03681 13.1035 6.47298C13.71 5.49987 12.9962 4.26519 11.8496 4.26519C11.2943 4.26519 10.7868 4.57405 10.5169 5.05923C10.1399 5.73688 9.72461 6.43721 9.27114 7.16022C9.06143 7.49458 8.8505 7.82569 8.63835 8.15358C8.21478 8.80819 8.003 9.1355 7.70554 9.25334C7.47561 9.34442 7.19397 9.34375 6.96448 9.25156C6.66759 9.13229 6.45853 8.80578 6.04043 8.15276C5.83116 7.82591 5.62351 7.49506 5.41747 7.16022C4.97918 6.44793 4.5738 5.76096 4.20132 5.0993C3.9136 4.58821 3.37618 4.26519 2.78967 4.26519C1.56624 4.26519 0.805692 5.58299 1.45419 6.62041C1.76588 7.11903 2.08912 7.6231 2.4239 8.1326C3.0752 9.10994 3.73263 10.059 4.3962 10.9796C4.65373 11.337 4.7825 11.5156 4.82882 11.7042C4.86709 11.86 4.86797 12.0139 4.83149 12.1702C4.78732 12.3593 4.66122 12.5385 4.40903 12.897C3.74526 13.8406 3.08355 14.8086 2.4239 15.8011Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.4734 4.26519C20.4471 4.26519 19.434 4.26519 18.6657 4.67201C18.0456 5.00031 17.5385 5.50739 17.2102 6.12744C16.8034 6.89579 16.8034 7.90892 16.8034 9.9352V14.0648C16.8034 16.0911 16.8034 17.1042 17.2102 17.8726C17.5385 18.4926 18.0456 18.9997 18.6657 19.328C19.434 19.7348 20.4471 19.7348 22.4734 19.7348H23.2039C24.8496 19.7348 26.2644 19.4033 27.4485 18.7403C28.6399 18.07 29.5559 17.1529 30.1963 15.989C30.8367 14.825 31.1569 13.4954 31.1569 12C31.1569 10.5046 30.8367 9.17495 30.1963 8.01105C29.5559 6.84714 28.6399 5.9337 27.4485 5.27072C26.2644 4.60037 24.8496 4.26519 23.2039 4.26519H22.4734ZM20.0092 8.74707C20.0092 8.16814 20.0092 7.87867 20.1255 7.65914C20.2193 7.48198 20.3641 7.33711 20.5413 7.24331C20.7608 7.12707 21.0503 7.12707 21.6292 7.12707H23.1927C24.6522 7.12707 25.7916 7.57274 26.6107 8.46409C27.4299 9.34807 27.8394 10.5267 27.8394 12C27.8394 13.4659 27.4299 14.6446 26.6107 15.5359C25.7916 16.4273 24.6522 16.8729 23.1927 16.8729H21.6292C21.0503 16.8729 20.7608 16.8729 20.5413 16.7567C20.3641 16.6629 20.2193 16.518 20.1255 16.3409C20.0092 16.1213 20.0092 15.8319 20.0092 15.2529V8.74707Z"
      fill="currentColor"
    />
    <path
      d="M35.4666 19.2376C36.6134 19.7459 37.9501 20 39.4767 20H39.8006C41.7144 20 43.2261 19.5801 44.3357 18.7403C45.4452 17.9006 46 16.7403 46 15.2597C46 14.3757 45.8213 13.6501 45.4638 13.0829C45.1064 12.5083 44.6559 12.0589 44.1123 11.7348C43.5761 11.4033 43.0325 11.1565 42.4814 10.9945C41.9304 10.8324 41.4575 10.7145 41.0628 10.6409L38.706 10.1878C38.0283 10.0552 37.4698 9.87477 37.0305 9.64641C36.5985 9.41068 36.3826 9.02762 36.3826 8.49724C36.3826 7.96685 36.6395 7.55064 37.1533 7.24862C37.6671 6.93923 38.3858 6.78453 39.3091 6.78453H39.6219C40.3964 6.78453 41.1224 6.93186 41.8001 7.22652C42.0982 7.35474 42.3899 7.5234 42.6754 7.73251C43.326 8.20923 44.2444 8.27802 44.8243 7.71734C45.34 7.21868 45.4053 6.39786 44.8761 5.91349C44.3498 5.43171 43.7638 5.03698 43.1181 4.72928C42.1054 4.24309 40.9511 4 39.6554 4H39.3315C38.0953 4 37.0156 4.19521 36.0922 4.58564C35.1762 4.97606 34.4613 5.52486 33.9475 6.23205C33.4411 6.93186 33.188 7.76059 33.188 8.71823C33.188 9.49171 33.3406 10.1436 33.6459 10.674C33.9587 11.2044 34.3571 11.6354 34.8411 11.9669C35.3326 12.2983 35.8539 12.5599 36.4049 12.7514C36.956 12.9355 37.4698 13.0718 37.9464 13.1602L40.3033 13.6243C40.6905 13.698 41.074 13.8011 41.4538 13.9337C41.841 14.0589 42.1612 14.2431 42.4144 14.4862C42.6676 14.7293 42.7942 15.0608 42.7942 15.4807C42.7942 16.6151 41.7814 17.1823 39.7559 17.1823H39.4432C38.49 17.1823 37.615 17.0055 36.8182 16.6519C36.4847 16.4994 36.1665 16.3134 35.8635 16.0938C35.17 15.5911 34.1857 15.5241 33.5784 16.1282C33.0651 16.6388 32.9912 17.4631 33.5198 17.9578C34.0797 18.4818 34.7287 18.9083 35.4666 19.2376Z"
      fill="currentColor"
    />
    <path
      d="M59.8471 19.26C58.5271 19.26 57.4004 18.96 56.4671 18.36C55.5338 17.7467 54.8538 16.9067 54.4271 15.84C54.0138 14.7733 53.9004 13.5467 54.0871 12.16C54.2471 11.0933 54.5538 10.1133 55.0071 9.21999C55.4604 8.32666 56.0404 7.54666 56.7471 6.87999C57.4538 6.21332 58.2538 5.69999 59.1471 5.33999C60.0404 4.96666 60.9871 4.77999 61.9871 4.77999C62.8538 4.77999 63.6538 4.93332 64.3871 5.23999C65.1204 5.54666 65.7538 5.97999 66.2871 6.53999C66.8204 7.08666 67.1938 7.70666 67.4071 8.39999L65.8671 9.03999C65.6938 8.49332 65.4071 8.01999 65.0071 7.61999C64.6204 7.20666 64.1671 6.88666 63.6471 6.65999C63.1271 6.43332 62.5671 6.31999 61.9671 6.31999C61.1938 6.31999 60.4604 6.46666 59.7671 6.75999C59.0738 7.05332 58.4471 7.47332 57.8871 8.01999C57.3404 8.55332 56.8804 9.17999 56.5071 9.89999C56.1471 10.62 55.9004 11.4067 55.7671 12.26C55.6071 13.34 55.6738 14.2933 55.9671 15.12C56.2604 15.9467 56.7471 16.5933 57.4271 17.06C58.1071 17.5267 58.9338 17.76 59.9071 17.76C60.5471 17.76 61.1804 17.6267 61.8071 17.36C62.4471 17.0933 63.0338 16.7333 63.5671 16.28C64.1138 15.8133 64.5671 15.2867 64.9271 14.7L66.3271 15.54C65.8471 16.2733 65.2604 16.92 64.5671 17.48C63.8738 18.04 63.1138 18.48 62.2871 18.8C61.4738 19.1067 60.6604 19.26 59.8471 19.26Z"
      fill="currentColor"
    />
    <path
      d="M67.8407 19.02L69.5207 9.01999H71.1207L70.8407 10.76C71.3474 10.1333 71.934 9.67999 72.6007 9.39999C73.2674 9.11999 73.9407 8.97999 74.6207 8.97999L74.4407 10.48C73.854 10.48 73.274 10.58 72.7007 10.78C72.1274 10.98 71.6274 11.3067 71.2007 11.76C70.7874 12.2 70.5074 12.7933 70.3607 13.54L69.4407 19.02H67.8407Z"
      fill="currentColor"
    />
    <path
      d="M82.0576 19.02L82.2976 17.16L83.6576 9.01999H85.2576L83.5776 19.02H82.0576ZM78.6776 19.26C77.8909 19.26 77.2042 19.0733 76.6176 18.7C76.0309 18.3267 75.5776 17.8133 75.2576 17.16C74.9509 16.4933 74.8109 15.7267 74.8376 14.86C74.8642 14.0733 75.0042 13.32 75.2576 12.6C75.5242 11.8667 75.8909 11.2133 76.3576 10.64C76.8376 10.0667 77.3976 9.61332 78.0376 9.27999C78.6776 8.94666 79.3909 8.77999 80.1776 8.77999C80.9642 8.77999 81.6242 8.96666 82.1576 9.33999C82.6909 9.69999 83.0909 10.2067 83.3576 10.86C83.6242 11.5 83.7376 12.2533 83.6976 13.12C83.6842 14.1333 83.5309 15.0267 83.2376 15.8C82.9442 16.56 82.5576 17.2 82.0776 17.72C81.6109 18.2267 81.0842 18.6133 80.4976 18.88C79.9109 19.1333 79.3042 19.26 78.6776 19.26ZM79.1176 17.8C79.7042 17.8 80.2242 17.6667 80.6776 17.4C81.1442 17.1333 81.5376 16.7733 81.8576 16.32C82.1909 15.8667 82.4442 15.3667 82.6176 14.82C82.7909 14.2733 82.8842 13.72 82.8976 13.16C82.9109 12.28 82.6976 11.5733 82.2576 11.04C81.8176 10.5067 81.2176 10.24 80.4576 10.24C79.8576 10.24 79.3176 10.3733 78.8376 10.64C78.3576 10.9067 77.9376 11.26 77.5776 11.7C77.2176 12.14 76.9442 12.6333 76.7576 13.18C76.5709 13.7133 76.4709 14.26 76.4576 14.82C76.4442 15.7 76.6776 16.42 77.1576 16.98C77.6509 17.5267 78.3042 17.8 79.1176 17.8Z"
      fill="currentColor"
    />
    <path
      d="M87.3759 19.02L89.2359 7.83999C89.4225 6.79999 89.7892 6.02666 90.3359 5.51999C90.8959 4.99999 91.6692 4.73999 92.6559 4.73999C92.9359 4.73999 93.2359 4.79332 93.5559 4.89999C93.8759 4.99332 94.2159 5.12666 94.5759 5.29999L93.8359 6.51999C93.5425 6.39999 93.2892 6.31332 93.0759 6.25999C92.8759 6.19332 92.7159 6.15999 92.5959 6.15999C92.1025 6.15999 91.7092 6.31999 91.4159 6.63999C91.1225 6.94666 90.9292 7.41332 90.8359 8.03999L88.9759 19.02H87.3759ZM86.9959 10.4L87.2159 9.01999H93.5559L93.3159 10.4H86.9959Z"
      fill="currentColor"
    />
    <path
      d="M97.5991 19.26C96.6391 19.26 95.9391 19.0067 95.4991 18.5C95.0725 17.98 94.9391 17.2533 95.0991 16.32L96.0791 10.44H94.3591L94.5791 9.01999H96.3191L96.8391 5.89999H98.4391L97.9191 9.01999H100.919L100.679 10.44H97.6791L96.6991 16.22C96.6191 16.7267 96.6791 17.1133 96.8791 17.38C97.0925 17.6467 97.4391 17.78 97.9191 17.78C98.0791 17.78 98.2458 17.7467 98.4191 17.68C98.6058 17.6133 98.8458 17.5067 99.1391 17.36L99.5991 18.68C99.1725 18.9067 98.7991 19.06 98.4791 19.14C98.1725 19.22 97.8791 19.26 97.5991 19.26Z"
      fill="currentColor"
    />
  </svg>
);

const XDS_LOGO_PLAIN = (
  <svg
    width="46"
    height="24"
    viewBox="0 0 46 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.4239 15.8011C2.03945 16.3796 1.66972 16.9538 1.3147 17.524C0.707427 18.4992 1.42354 19.7348 2.57241 19.7348C3.13302 19.7348 3.64463 19.4209 3.91525 18.93C4.29391 18.243 4.71274 17.5352 5.17173 16.8066C5.38894 16.4618 5.60743 16.12 5.82721 15.7812C6.25251 15.1254 6.46516 14.7976 6.76252 14.68C6.99255 14.5891 7.27368 14.5899 7.50317 14.6822C7.79984 14.8014 8.00881 15.1278 8.42675 15.7804C8.64287 16.1179 8.85732 16.46 9.07008 16.8066C9.52175 17.534 9.93823 18.2339 10.3195 18.9063C10.6075 19.4141 11.1428 19.7348 11.7266 19.7348C12.9476 19.7348 13.7063 18.4203 13.0547 17.3877C12.7332 16.8781 12.3991 16.3639 12.0525 15.8453C11.3983 14.8527 10.7379 13.8906 10.0714 12.9592C9.81687 12.6036 9.68962 12.4258 9.64377 12.2384C9.60589 12.0836 9.60492 11.9307 9.64085 11.7754C9.68435 11.5874 9.80856 11.4091 10.057 11.0526C10.7093 10.1164 11.3596 9.15781 12.0078 8.1768C12.3869 7.60474 12.7521 7.03681 13.1035 6.47298C13.71 5.49987 12.9962 4.26519 11.8496 4.26519C11.2943 4.26519 10.7868 4.57405 10.5169 5.05923C10.1399 5.73688 9.72461 6.43721 9.27114 7.16022C9.06143 7.49458 8.8505 7.82569 8.63835 8.15358C8.21478 8.80819 8.003 9.1355 7.70554 9.25334C7.47561 9.34442 7.19397 9.34375 6.96448 9.25156C6.66759 9.13229 6.45853 8.80578 6.04043 8.15276C5.83116 7.82591 5.62351 7.49506 5.41747 7.16022C4.97918 6.44793 4.5738 5.76096 4.20132 5.0993C3.9136 4.58821 3.37617 4.26519 2.78967 4.26519C1.56624 4.26519 0.805692 5.58299 1.45419 6.62041C1.76588 7.11903 2.08912 7.6231 2.4239 8.1326C3.0752 9.10994 3.73263 10.059 4.3962 10.9796C4.65373 11.337 4.7825 11.5156 4.82882 11.7042C4.86709 11.86 4.86797 12.0139 4.83149 12.1702C4.78732 12.3593 4.66122 12.5385 4.40903 12.897C3.74526 13.8406 3.08355 14.8086 2.4239 15.8011Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.4734 4.26519C20.4471 4.26519 19.434 4.26519 18.6657 4.67201C18.0456 5.00031 17.5385 5.50739 17.2102 6.12744C16.8034 6.89579 16.8034 7.90892 16.8034 9.9352V14.0648C16.8034 16.0911 16.8034 17.1042 17.2102 17.8726C17.5385 18.4926 18.0456 18.9997 18.6657 19.328C19.434 19.7348 20.4471 19.7348 22.4734 19.7348H23.2039C24.8496 19.7348 26.2644 19.4033 27.4485 18.7403C28.6399 18.07 29.5559 17.1529 30.1963 15.989C30.8367 14.825 31.1569 13.4954 31.1569 12C31.1569 10.5046 30.8367 9.17495 30.1963 8.01105C29.5559 6.84714 28.6399 5.9337 27.4485 5.27072C26.2644 4.60037 24.8496 4.26519 23.2039 4.26519H22.4734ZM20.0092 8.74707C20.0092 8.16814 20.0092 7.87867 20.1255 7.65914C20.2193 7.48198 20.3641 7.33711 20.5413 7.24331C20.7608 7.12707 21.0503 7.12707 21.6292 7.12707H23.1927C24.6522 7.12707 25.7916 7.57274 26.6107 8.46409C27.4299 9.34807 27.8394 10.5267 27.8394 12C27.8394 13.4659 27.4299 14.6446 26.6107 15.5359C25.7916 16.4273 24.6522 16.8729 23.1927 16.8729H21.6292C21.0503 16.8729 20.7608 16.8729 20.5413 16.7567C20.3641 16.6629 20.2193 16.518 20.1255 16.3409C20.0092 16.1213 20.0092 15.8319 20.0092 15.2529V8.74707Z"
      fill="currentColor"
    />
    <path
      d="M35.4666 19.2376C36.6134 19.7459 37.9501 20 39.4767 20H39.8006C41.7144 20 43.2261 19.5801 44.3357 18.7403C45.4452 17.9006 46 16.7403 46 15.2597C46 14.3757 45.8213 13.6501 45.4638 13.0829C45.1064 12.5083 44.6559 12.0589 44.1123 11.7348C43.5761 11.4033 43.0325 11.1565 42.4814 10.9945C41.9304 10.8324 41.4575 10.7145 41.0628 10.6409L38.706 10.1878C38.0283 10.0552 37.4698 9.87477 37.0305 9.64641C36.5985 9.41068 36.3826 9.02762 36.3826 8.49724C36.3826 7.96685 36.6395 7.55064 37.1533 7.24862C37.6671 6.93923 38.3857 6.78453 39.3091 6.78453H39.6219C40.3964 6.78453 41.1224 6.93186 41.8001 7.22652C42.0982 7.35474 42.3899 7.5234 42.6754 7.73251C43.326 8.20923 44.2444 8.27802 44.8243 7.71734C45.34 7.21868 45.4053 6.39786 44.8761 5.91349C44.3498 5.43171 43.7638 5.03698 43.1181 4.72928C42.1054 4.24309 40.9511 4 39.6554 4H39.3315C38.0953 4 37.0156 4.19521 36.0922 4.58564C35.1762 4.97606 34.4613 5.52486 33.9475 6.23204C33.4411 6.93186 33.188 7.76059 33.188 8.71823C33.188 9.49171 33.3406 10.1436 33.6459 10.674C33.9587 11.2044 34.3571 11.6354 34.8411 11.9669C35.3326 12.2983 35.8539 12.5599 36.4049 12.7514C36.956 12.9355 37.4698 13.0718 37.9464 13.1602L40.3033 13.6243C40.6905 13.698 41.074 13.8011 41.4538 13.9337C41.841 14.0589 42.1612 14.2431 42.4144 14.4862C42.6676 14.7293 42.7942 15.0608 42.7942 15.4807C42.7942 16.6151 41.7814 17.1823 39.7559 17.1823H39.4432C38.49 17.1823 37.615 17.0055 36.8182 16.6519C36.4847 16.4994 36.1665 16.3134 35.8635 16.0938C35.17 15.5911 34.1857 15.5241 33.5784 16.1282C33.0651 16.6388 32.9912 17.4631 33.5198 17.9578C34.0797 18.4818 34.7287 18.9083 35.4666 19.2376Z"
      fill="currentColor"
    />
  </svg>
);

const NAV_ITEMS: Array<{key: 'craft' | 'explore' | 'docs'; label: string}> = [
  {key: 'craft', label: 'Craft'},
  {key: 'explore', label: 'Explore'},
  {key: 'docs', label: 'Docs'},
];

function LogoNav({
  activeView,
  setActiveView,
  logo,
}: {
  activeView: 'craft' | 'docs' | 'explore' | 'profile';
  setActiveView: (view: 'craft' | 'docs' | 'explore' | 'profile') => void;
  logo?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div
      style={{position: 'relative'}}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => {
        setIsOpen(false);
        setHoveredItem(null);
      }}>
      <div style={{cursor: 'pointer'}}>{logo || XDS_LOGO_SVG}</div>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: -16,
            backgroundColor: 'var(--color-background-card, white)',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            padding: 8,
            minWidth: 200,
            zIndex: 100,
          }}>
          <div style={{marginBottom: 12, paddingLeft: 8, paddingRight: 8}}>
            {logo || XDS_LOGO_SVG}
          </div>
          <div
            style={{display: 'flex', flexDirection: 'column' as const, gap: 2}}>
            {NAV_ITEMS.map(item => {
              const isActive = activeView === item.key;
              const isHovered = hoveredItem === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  onMouseEnter={() => setHoveredItem(item.key)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 14,
                    color: 'var(--color-text-primary, #1a1a1a)',
                    backgroundColor:
                      isActive || isHovered
                        ? 'var(--color-background-body, #f1f4f7)'
                        : 'transparent',
                    transition: 'background-color 150ms ease',
                  }}>
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AppTopNav({
  activeView,
  setActiveView,
}: {
  activeView: 'craft' | 'docs' | 'explore' | 'profile';
  setActiveView: (view: 'craft' | 'docs' | 'explore' | 'profile') => void;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('newest');

  return (
    <>
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 48,
          padding: '0 16px',
          backgroundColor: 'var(--color-background-surface, white)',
        }}>
        {/* Left: logo nav */}
        <div style={{display: 'flex', alignItems: 'center', gap: 8, flex: 1}}>
          <LogoNav activeView={activeView} setActiveView={setActiveView} />
        </div>

        {/* Center: tabs */}
        <div style={{display: 'flex', alignItems: 'center', gap: 0}}>
          <XDSTabList value={activeTab} onChange={setActiveTab} size="sm">
            <XDSTab value="newest" label="Newest" />
            <XDSTab value="templates" label="Templates" />
            <XDSTab value="theme" label="Theme" />
          </XDSTabList>
        </div>

        {/* Right: filter + search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <XDSButton
            label="Filter"
            variant="ghost"
            size="sm"
            icon={<FilterIcon />}
            isIconOnly
          />
          <XDSButton
            label="Search"
            variant="ghost"
            size="sm"
            icon={<SearchIcon />}
            onClick={() => setIsSearchOpen(true)}
            isIconOnly
          />
          <XDSButton
            label="Profile"
            variant="ghost"
            size="sm"
            icon={<ProfileIcon />}
            onClick={() => setActiveView('profile')}
            isIconOnly
          />
        </div>
      </nav>
      <XDSCommandPalette
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        searchSource={SEARCH_COMMANDS}
        label="Search templates and components"
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const TEMPLATES: Array<{
  name: string;
  src: string;
  size: 'xlarge' | 'large' | 'medium' | 'small';
}> = [
  {name: 'Contact Form', src: FIRST_CARD_IMAGE, size: 'large'},
  {name: 'Shopping Details', src: SHOPPING_DETAILS_IMAGE, size: 'small'},
  {name: 'Button Component', src: SCREENSHOT_3_IMAGE, size: 'small'},
  {name: 'Settings Page', src: DUMMY_IMAGE, size: 'small'},
  {name: 'Login Form', src: DUMMY_IMAGE, size: 'xlarge'},
  {name: 'Dashboard', src: DUMMY_IMAGE, size: 'large'},
  {name: 'Data Table', src: DUMMY_IMAGE, size: 'small'},
  {name: 'File Explorer', src: DUMMY_IMAGE, size: 'small'},
  {name: 'Contact Form', src: DUMMY_IMAGE, size: 'small'},
  {name: 'Editor', src: DUMMY_IMAGE, size: 'xlarge'},
  {name: 'Analytics', src: DUMMY_IMAGE, size: 'large'},
  {name: 'User Profile', src: DUMMY_IMAGE, size: 'small'},
  {name: 'Notifications', src: DUMMY_IMAGE, size: 'small'},
  {name: 'Calendar', src: DUMMY_IMAGE, size: 'small'},
  {name: 'Onboarding', src: DUMMY_IMAGE, size: 'xlarge'},
];

// ---------------------------------------------------------------------------
// Nav Item Component (for DocsView sidebar)
// ---------------------------------------------------------------------------

function NavItem({
  label,
  isActive,
  onClick,
  hasIcon = true,
  indent = 0,
  hasChevron = false,
  isExpanded = false,
  onToggle,
}: {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  hasIcon?: boolean;
  indent?: number;
  hasChevron?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={hasChevron ? onToggle : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 12px',
        paddingLeft: 12 + indent * 16,
        cursor: 'pointer',
        borderRadius: 6,
        margin: '1px 8px',
        backgroundColor: isActive
          ? 'rgba(0, 102, 255, 0.08)'
          : hovered
            ? 'rgba(0, 0, 0, 0.04)'
            : 'transparent',
        color: isActive ? '#0066FF' : 'var(--color-text-primary, #1a1a1a)',
        fontSize: 14,
        fontWeight: isActive ? 600 : 400,
        transition: 'background-color 150ms ease',
        userSelect: 'none' as const,
      }}>
      {hasIcon && (
        <AaIcon
          width={16}
          height={16}
          style={{
            flexShrink: 0,
            opacity: isActive ? 1 : 0.55,
            color: isActive ? '#0066FF' : 'currentColor',
          }}
        />
      )}
      <span style={{flex: 1}}>{label}</span>
      {hasChevron && (
        <span
          style={{
            display: 'flex',
            transition: 'transform 200ms ease',
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}>
          <ChevronDownIcon width={14} height={14} style={{opacity: 0.5}} />
        </span>
      )}
    </div>
  );
}

function SectionLabel({label, indent = 0}: {label: string; indent?: number}) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--color-text-secondary, #6b7785)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        padding: '12px 12px 4px',
        paddingLeft: 12 + indent * 16,
        margin: '0 8px',
      }}>
      {label}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Code Preview with syntax highlighting (for DocsView)
// ---------------------------------------------------------------------------

const BUTTON_CODE_LINES: Array<{spans: Array<{text: string; color: string}>}> =
  [
    {
      spans: [
        {text: 'import ', color: '#c678dd'},
        {text: '{', color: '#abb2bf'},
        {text: 'XDSButton', color: '#e5c07b'},
        {text: '}', color: '#abb2bf'},
        {text: ' from ', color: '#c678dd'},
        {text: "'@xds/core/Button'", color: '#98c379'},
        {text: ';', color: '#abb2bf'},
      ],
    },
    {spans: [{text: '', color: '#abb2bf'}]},
    {
      spans: [
        {text: 'export default ', color: '#c678dd'},
        {text: 'function ', color: '#c678dd'},
        {text: 'Example', color: '#61afef'},
        {text: '() {', color: '#abb2bf'},
      ],
    },
    {
      spans: [
        {text: '  return ', color: '#c678dd'},
        {text: '(', color: '#abb2bf'},
      ],
    },
    {
      spans: [
        {text: '    <', color: '#abb2bf'},
        {text: 'XDSButton', color: '#e5c07b'},
      ],
    },
    {
      spans: [
        {text: '      label', color: '#d19a66'},
        {text: '=', color: '#abb2bf'},
        {text: '"Button"', color: '#98c379'},
      ],
    },
    {
      spans: [
        {text: '      variant', color: '#d19a66'},
        {text: '=', color: '#abb2bf'},
        {text: '"primary"', color: '#98c379'},
      ],
    },
    {
      spans: [
        {text: '      icon', color: '#d19a66'},
        {text: '={<', color: '#abb2bf'},
        {text: 'PlusIcon', color: '#e5c07b'},
        {text: ' />}', color: '#abb2bf'},
      ],
    },
    {spans: [{text: '    />', color: '#abb2bf'}]},
    {spans: [{text: '  );', color: '#abb2bf'}]},
    {spans: [{text: '}', color: '#abb2bf'}]},
  ];

// ---------------------------------------------------------------------------
// DocsView — embedded documentation view
// ---------------------------------------------------------------------------

function DocsView({
  activeView,
  setActiveView,
}: {
  activeView: 'craft' | 'docs' | 'explore' | 'profile';
  setActiveView: (v: 'craft' | 'docs' | 'explore' | 'profile') => void;
}) {
  const [activeNav, setActiveNav] = useState('button');
  const [inputsExpanded, setInputsExpanded] = useState(true);
  const [showCode, setShowCode] = useState(true);
  const [activeRightNav, setActiveRightNav] = useState('usage');

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--color-background-surface, #ffffff)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
      {/* LEFT SIDEBAR */}
      <aside
        style={{
          width: 240,
          minWidth: 240,
          height: '100vh',
          borderRight: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
          display: 'flex',
          flexDirection: 'column' as const,
          backgroundColor: 'var(--color-background-surface, #ffffff)',
          overflow: 'hidden',
        }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 8px 10px 8px',
            flexShrink: 0,
          }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <div style={{paddingLeft: 16}}>
              <LogoNav
                activeView={activeView}
                setActiveView={setActiveView}
                logo={XDS_LOGO_PLAIN}
              />
            </div>
          </div>
          <XDSButton
            label="Collapse sidebar"
            variant="ghost"
            size="sm"
            icon={<SidebarCollapseIcon />}
            isIconOnly
          />
        </div>

        {/* Nav */}
        <nav style={{flex: 1, overflowY: 'auto' as const, paddingBottom: 16}}>
          <NavItem
            label="Getting started"
            isActive={activeNav === 'getting-started'}
            onClick={() => setActiveNav('getting-started')}
          />
          <NavItem
            label="Quick start"
            isActive={activeNav === 'quick-start'}
            onClick={() => setActiveNav('quick-start')}
          />

          <SectionLabel label="Components" />

          <NavItem
            label="Button"
            isActive={activeNav === 'button'}
            onClick={() => setActiveNav('button')}
          />
          <NavItem
            label="Stepper"
            isActive={activeNav === 'stepper'}
            onClick={() => setActiveNav('stepper')}
          />
          <NavItem
            label="Inputs"
            hasChevron
            isExpanded={inputsExpanded}
            onToggle={() => setInputsExpanded(!inputsExpanded)}
          />

          {inputsExpanded && (
            <>
              <SectionLabel label="Text & Number" indent={1} />
              <NavItem
                label="Text input"
                indent={1}
                isActive={activeNav === 'text-input'}
                onClick={() => setActiveNav('text-input')}
              />
              <NavItem
                label="Number input"
                indent={1}
                isActive={activeNav === 'number-input'}
                onClick={() => setActiveNav('number-input')}
              />
              <NavItem
                label="Text area"
                indent={1}
                isActive={activeNav === 'text-area'}
                onClick={() => setActiveNav('text-area')}
              />

              <SectionLabel label="Date" indent={1} />
              <NavItem
                label="Date picker"
                indent={1}
                isActive={activeNav === 'date-picker'}
                onClick={() => setActiveNav('date-picker')}
              />
              <NavItem
                label="Date input"
                indent={1}
                isActive={activeNav === 'date-input'}
                onClick={() => setActiveNav('date-input')}
              />
              <NavItem
                label="Time range picker"
                indent={1}
                isActive={activeNav === 'time-range-picker'}
                onClick={() => setActiveNav('time-range-picker')}
              />
            </>
          )}
        </nav>
      </aside>
      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto' as const,
          padding: '32px 40px',
        }}>
        <div style={{maxWidth: 840}}>
          {/* Title */}
          <h1
            style={{
              fontSize: 48,
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary, #0a1317)',
              lineHeight: 1.1,
            }}>
            Button
          </h1>

          {/* Date line */}
          <p
            style={{
              fontSize: 14,
              color: 'var(--color-text-secondary, #6b7785)',
              margin: '8px 0 32px',
            }}>
            March 30, 2026 · Updated 5:40 p.m. PST
          </p>

          {/* Live Preview Panel */}
          <div
            style={{
              border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 40,
            }}>
            {/* Preview Header Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderBottom:
                  '1px solid var(--color-divider, rgba(0,0,0,0.08))',
                backgroundColor: 'var(--color-background-surface, #ffffff)',
              }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text-secondary, #6b7785)',
                }}>
                Live preview
              </span>
              <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                <XDSButton
                  label="Open in Craft"
                  variant="ghost"
                  size="sm"
                  icon={<ExternalLinkIcon />}
                  isIconOnly
                />
                <XDSDropdownMenu
                  button={{
                    label: 'Variant',
                    variant: 'ghost',
                    size: 'sm',
                  }}
                  hasChevron
                  items={[
                    {label: 'Primary', onClick: () => {}},
                    {label: 'Secondary', onClick: () => {}},
                    {label: 'Ghost', onClick: () => {}},
                  ]}
                />
                <XDSDropdownMenu
                  button={{
                    label: 'Light',
                    variant: 'ghost',
                    size: 'sm',
                  }}
                  hasChevron
                  items={[
                    {label: 'Light', onClick: () => {}},
                    {label: 'Dark', onClick: () => {}},
                  ]}
                />
                <XDSButton
                  label="Toggle code"
                  variant={showCode ? 'secondary' : 'ghost'}
                  size="sm"
                  icon={<CodeIcon />}
                  onClick={() => setShowCode(!showCode)}
                  isIconOnly
                />
                <XDSButton
                  label="Fullscreen"
                  variant="ghost"
                  size="sm"
                  icon={<FullscreenIcon />}
                  isIconOnly
                />
              </div>
            </div>

            {/* Preview + Code Split */}
            <div
              style={{
                display: 'flex',
                minHeight: 280,
              }}>
              {/* Preview Area */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-background-body, #f5f6f7)',
                  padding: 32,
                }}>
                <XDSButton
                  label="Button"
                  variant="primary"
                  icon={<PlusIcon />}
                  endContent={<XDSBadge label="New" variant="info" />}
                />
              </div>

              {/* Code Panel */}
              {showCode && (
                <div
                  style={{
                    width: 360,
                    backgroundColor: '#282c34',
                    padding: '20px 0',
                    overflowX: 'auto' as const,
                    borderLeft:
                      '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                  }}>
                  <pre
                    style={{
                      margin: 0,
                      fontFamily:
                        '"SF Mono", "Roboto Mono", "Fira Code", monospace',
                      fontSize: 13,
                      lineHeight: '22px',
                    }}>
                    {BUTTON_CODE_LINES.map((line, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          paddingLeft: 20,
                          paddingRight: 20,
                        }}>
                        <span
                          style={{
                            width: 32,
                            textAlign: 'right' as const,
                            color: '#636d83',
                            marginRight: 16,
                            userSelect: 'none' as const,
                            flexShrink: 0,
                          }}>
                          {i + 1}
                        </span>
                        <span>
                          {line.spans.map((s, j) => (
                            <span key={j} style={{color: s.color}}>
                              {s.text}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Documentation Content */}
          <div style={{marginBottom: 32}}>
            <XDSHeading level={2}>
              A button initiates an instantaneous action.
            </XDSHeading>
          </div>

          <div style={{marginBottom: 32}}>
            <XDSText type="body">
              Buttons are clickable elements used to trigger actions. They
              communicate calls to action to the user and allow users to
              interact with pages in a variety of ways. Button labels express
              what action will occur when the user interacts with it. Buttons
              can contain a combination of a clear label and an icon, while
              standalone icon buttons are reserved for recurring, universally
              understood actions.
            </XDSText>
          </div>

          <div style={{marginBottom: 16}}>
            <XDSHeading level={3}>When to use</XDSHeading>
          </div>

          <ul
            style={{
              margin: 0,
              padding: '0 0 0 20px',
              color: 'var(--color-text-primary, #0a1317)',
              fontSize: 15,
              lineHeight: 1.7,
            }}>
            <li>Triggering form submissions or confirming a dialog</li>
            <li>Navigating to a new page or view within the application</li>
            <li>
              Starting a new process or workflow (e.g., &quot;Create new&quot;)
            </li>
            <li>Toggling a UI element or performing an inline action</li>
            <li>
              Performing destructive actions such as deleting items — use the
              danger variant for these
            </li>
          </ul>
        </div>
      </main>
      {/* RIGHT SIDEBAR */}
      <aside
        style={{
          width: 200,
          minWidth: 200,
          padding: '32px 20px',
          position: 'sticky' as const,
          top: 0,
          height: '100vh',
          boxSizing: 'border-box' as const,
        }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--color-text-secondary, #6b7785)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            marginBottom: 12,
          }}>
          On this page
        </div>
        {[
          {id: 'usage', label: 'Usage'},
          {id: 'code', label: 'Code'},
          {id: 'tokens', label: 'Tokens'},
          {id: 'accessibility', label: 'Accessibility'},
        ].map(item => (
          <div
            key={item.id}
            onClick={() => setActiveRightNav(item.id)}
            style={{
              fontSize: 13,
              padding: '6px 0',
              cursor: 'pointer',
              color:
                activeRightNav === item.id
                  ? '#0066FF'
                  : 'var(--color-text-secondary, #6b7785)',
              fontWeight: activeRightNav === item.id ? 600 : 400,
              borderLeft:
                activeRightNav === item.id
                  ? '2px solid #0066FF'
                  : '2px solid transparent',
              paddingLeft: 12,
              transition: 'color 150ms ease',
            }}>
            {item.label}
          </div>
        ))}
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Explore Icons
// ---------------------------------------------------------------------------

const CompassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const LayoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const PackageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const GridIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const VerifiedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ---------------------------------------------------------------------------
// ExploreView
// ---------------------------------------------------------------------------

function ExploreView({
  activeView,
  setActiveView,
}: {
  activeView: 'craft' | 'docs' | 'explore' | 'profile';
  setActiveView: (v: 'craft' | 'docs' | 'explore' | 'profile') => void;
}) {
  const [featuredTab, setFeaturedTab] = useState('trending');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100vh',
        backgroundColor: 'var(--color-background-surface, #ffffff)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
      {/* Top Nav Bar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 48,
          padding: '0 16px',
          flexShrink: 0,
        }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <LogoNav activeView={activeView} setActiveView={setActiveView} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
          <XDSButton
            label="Search"
            variant="ghost"
            size="sm"
            icon={<SearchIcon />}
            isIconOnly
          />
          <XDSButton
            label="Create new"
            variant="secondary"
            size="sm"
            icon={<PlusIcon />}
          />
          <XDSButton
            label="Profile"
            variant="ghost"
            size="sm"
            icon={<ProfileIcon />}
            onClick={() => setActiveView('profile')}
            isIconOnly
          />
        </div>
      </nav>
      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto' as const,
          padding: '40px 48px 64px',
        }}>
        <div style={{maxWidth: 1200, margin: '0 auto'}}>
          {/* a. Hero */}
          <div style={{marginBottom: 48}}>
            <XDSHeading
              level={1}
              style={{fontSize: 40, letterSpacing: '-0.02em', marginBottom: 8}}>
              Discover templates, themes &amp; components
            </XDSHeading>
            <XDSText
              type="body"
              color="secondary"
              style={{marginBottom: 24, maxWidth: 600}}>
              Browse curated resources to kickstart your next project. Find
              templates, themes, and components built by XDS and the community.
            </XDSText>
            <XDSTextInput
              label="Search"
              isLabelHidden
              value=""
              onChange={() => {}}
              startIcon={SearchIcon}
              size="lg"
              placeholder="Search..."
              style={{marginBottom: 16, maxWidth: 600}}
            />
            <div style={{display: 'flex', flexWrap: 'wrap' as const, gap: 6}}>
              <XDSToken label="Dashboard" size="sm" />
              <XDSToken label="Admin Panel" size="sm" />
              <XDSToken label="E-commerce" size="sm" />
              <XDSToken label="Landing Page" size="sm" />
              <XDSToken label="Settings" size="sm" />
              <XDSToken label="Auth" size="sm" />
              <XDSToken label="Data Table" size="sm" />
            </div>
          </div>

          {/* b. Featured */}
          <div style={{marginBottom: 48}}>
            <XDSHeading level={2} style={{marginBottom: 16}}>
              Featured
            </XDSHeading>
            <XDSSegmentedControl
              value={featuredTab}
              onChange={setFeaturedTab}
              label="Featured filter"
              size="sm"
              style={{marginBottom: 16}}>
              <XDSSegmentedControlItem value="trending" label="Trending" />
              <XDSSegmentedControlItem value="popular" label="Most popular" />
              <XDSSegmentedControlItem value="newest" label="Newest" />
            </XDSSegmentedControl>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
              }}>
              {[
                {
                  title: 'Product detail',
                  desc: 'Description',
                  users: '1.5K',
                  hearts: 5,
                  img: FIRST_CARD_IMAGE,
                },
                {
                  title: 'Meta Theme',
                  desc: 'Description',
                  users: '1.5K',
                  hearts: 5,
                  img: SHOPPING_DETAILS_IMAGE,
                },
                {
                  title: 'Daiily',
                  desc: 'Description',
                  users: '1.5K',
                  hearts: 5,
                  img: SCREENSHOT_3_IMAGE,
                },
              ].map((item, i) => (
                <XDSCard key={i} padding={0}>
                  <div style={{position: 'relative'}}>
                    <img
                      src={item.img}
                      alt={item.title}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: 180,
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <div style={{padding: '12px 16px'}}>
                    <XDSHeading level={2}>{item.title}</XDSHeading>
                    <XDSText type="supporting" color="secondary">
                      {item.desc}
                    </XDSText>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginTop: 8,
                      }}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{flexShrink: 0}}>
                        <path
                          d="M9 12l2 2 4-4"
                          stroke="#0866ff"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="#0866ff"
                          strokeWidth={2}
                        />
                      </svg>
                      <XDSText type="supporting" color="secondary">
                        {item.users}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        ♡ {item.hearts}
                      </XDSText>
                    </div>
                  </div>
                </XDSCard>
              ))}
            </div>
          </div>

          {/* c. Designed by XDS */}
          <div style={{marginBottom: 48}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}>
              <XDSHeading level={2}>Designed by XDS</XDSHeading>
              <VerifiedIcon width={20} height={20} style={{color: '#0066FF'}} />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
              }}>
              {[
                {name: 'Admin Console', desc: 'Full-featured admin panel'},
                {name: 'Data Explorer', desc: 'Interactive data visualization'},
                {name: 'Onboarding Flow', desc: 'Multi-step onboarding wizard'},
              ].map((item, i) => (
                <XDSCard key={i}>
                  <div
                    style={{
                      height: 140,
                      backgroundColor: 'var(--color-background-body, #f5f6f7)',
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: 4,
                    }}>
                    <XDSText type="body" weight="bold">
                      {item.name}
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      {item.desc}
                    </XDSText>
                  </div>
                </XDSCard>
              ))}
            </div>
          </div>

          {/* d. From the community */}
          <div style={{marginBottom: 48}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
              <XDSHeading level={2}>From the community</XDSHeading>
              <XDSButton label="View all" variant="ghost" size="sm" />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
              }}>
              {[
                {name: 'CRM Dashboard', author: 'Alex Chen'},
                {name: 'Social Feed', author: 'Maria Lopez'},
                {name: 'Task Board', author: 'James Wilson'},
                {name: 'Chat Interface', author: 'Sarah Kim'},
              ].map((item, i) => (
                <XDSCard key={i}>
                  <div
                    style={{
                      height: 120,
                      backgroundColor: 'var(--color-background-body, #f5f6f7)',
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  />
                  <XDSText type="body" weight="bold">
                    {item.name}
                  </XDSText>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 8,
                    }}>
                    <XDSAvatar name={item.author} size="xsmall" />
                    <XDSText type="supporting" color="secondary">
                      {item.author}
                    </XDSText>
                  </div>
                </XDSCard>
              ))}
            </div>
          </div>

          {/* e. Starter kits */}
          <div style={{marginBottom: 48}}>
            <XDSHeading level={2} style={{marginBottom: 16}}>
              Starter kits
            </XDSHeading>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
              }}>
              {[
                {
                  name: 'SaaS Starter',
                  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                },
                {
                  name: 'Internal Tool Kit',
                  gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                },
                {
                  name: 'Data Platform',
                  gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                },
              ].map((item, i) => (
                <XDSCard key={i} padding={0}>
                  <div
                    style={{
                      height: 160,
                      background: item.gradient,
                      borderRadius: '8px 8px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <PackageIcon
                      width={40}
                      height={40}
                      style={{color: '#fff'}}
                    />
                  </div>
                  <div style={{padding: 16}}>
                    <XDSText type="body" weight="bold">
                      {item.name}
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      Complete starter template
                    </XDSText>
                  </div>
                </XDSCard>
              ))}
            </div>
          </div>

          {/* f. Popular themes */}
          <div style={{marginBottom: 48}}>
            <XDSHeading level={2} style={{marginBottom: 16}}>
              Popular themes
            </XDSHeading>
            <div
              style={{
                display: 'flex',
                gap: 16,
                overflowX: 'auto' as const,
                paddingBottom: 8,
              }}>
              {[
                {name: 'Ocean', colors: ['#0066FF', '#00BFFF', '#E0F4FF']},
                {name: 'Forest', colors: ['#228B22', '#90EE90', '#F0FFF0']},
                {name: 'Sunset', colors: ['#FF6347', '#FFA07A', '#FFF5EE']},
                {name: 'Midnight', colors: ['#191970', '#4169E1', '#E8EAF6']},
                {name: 'Rose', colors: ['#E91E63', '#F48FB1', '#FCE4EC']},
                {name: 'Amber', colors: ['#FF8F00', '#FFB74D', '#FFF8E1']},
              ].map((theme, i) => (
                <XDSCard key={i} style={{minWidth: 180, flexShrink: 0}}>
                  <div style={{display: 'flex', gap: 6, marginBottom: 12}}>
                    {theme.colors.map((color, j) => (
                      <div
                        key={j}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: color,
                          border:
                            '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                        }}
                      />
                    ))}
                  </div>
                  <XDSText type="body" weight="bold">
                    {theme.name}
                  </XDSText>
                </XDSCard>
              ))}
            </div>
          </div>

          {/* g. Browse by use case */}
          <div style={{marginBottom: 48}}>
            <XDSHeading level={2} style={{marginBottom: 16}}>
              Browse by use case
            </XDSHeading>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
              }}>
              {[
                {label: 'Dashboards', icon: LayoutIcon},
                {label: 'Forms', icon: AaIcon},
                {label: 'Data Tables', icon: GridIcon},
                {label: 'Navigation', icon: CompassIcon},
                {label: 'Authentication', icon: FilterIcon},
                {label: 'Settings', icon: PackageIcon},
                {label: 'Onboarding', icon: ZapIcon},
                {label: 'E-commerce', icon: StarIcon},
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-background-surface, #fff)',
                  }}>
                  <item.icon
                    width={20}
                    height={20}
                    style={{flexShrink: 0, opacity: 0.7}}
                  />
                  <XDSText type="body" weight="bold">
                    {item.label}
                  </XDSText>
                </div>
              ))}
            </div>
          </div>

          {/* h. All templates and themes */}
          <div style={{marginBottom: 48}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
              <XDSHeading level={2}>All templates and themes</XDSHeading>
              <div style={{display: 'flex', gap: 8}}>
                <XDSDropdownMenu
                  button={{label: 'Category', variant: 'secondary', size: 'sm'}}
                  hasChevron
                  items={[
                    {label: 'All', onClick: () => {}},
                    {label: 'Templates', onClick: () => {}},
                    {label: 'Themes', onClick: () => {}},
                    {label: 'Components', onClick: () => {}},
                  ]}
                />
                <XDSDropdownMenu
                  button={{label: 'Sort by', variant: 'secondary', size: 'sm'}}
                  hasChevron
                  items={[
                    {label: 'Most popular', onClick: () => {}},
                    {label: 'Newest', onClick: () => {}},
                    {label: 'Most downloads', onClick: () => {}},
                  ]}
                />
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
              }}>
              {[
                {
                  name: 'Admin Dashboard Pro',
                  category: 'Template',
                  downloads: '2.4k',
                  stars: 186,
                  isOfficial: true,
                  img: FIRST_CARD_IMAGE,
                },
                {
                  name: 'Dark Mode Theme',
                  category: 'Theme',
                  downloads: '5.1k',
                  stars: 342,
                  isOfficial: true,
                  img: DUMMY_IMAGE,
                },
                {
                  name: 'Login Page Bundle',
                  category: 'Template',
                  downloads: '3.2k',
                  stars: 210,
                  isOfficial: false,
                  img: SHOPPING_DETAILS_IMAGE,
                },
                {
                  name: 'Brutalist Theme',
                  category: 'Theme',
                  downloads: '1.8k',
                  stars: 95,
                  isOfficial: true,
                  img: DUMMY_IMAGE,
                },
                {
                  name: 'E-commerce Kit',
                  category: 'Template',
                  downloads: '4.7k',
                  stars: 289,
                  isOfficial: false,
                  img: SCREENSHOT_3_IMAGE,
                },
                {
                  name: 'Neutral Theme',
                  category: 'Theme',
                  downloads: '2.1k',
                  stars: 134,
                  isOfficial: true,
                  img: DUMMY_IMAGE,
                },
                {
                  name: 'Settings Panel',
                  category: 'Template',
                  downloads: '1.9k',
                  stars: 112,
                  isOfficial: true,
                  img: DUMMY_IMAGE,
                },
                {
                  name: 'WhatsApp Theme',
                  category: 'Theme',
                  downloads: '1.4k',
                  stars: 78,
                  isOfficial: true,
                  img: DUMMY_IMAGE,
                },
              ].map((item, i) => (
                <XDSCard key={i} padding={0}>
                  <div style={{position: 'relative'}}>
                    <img
                      src={item.img}
                      alt={item.name}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: 160,
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <div style={{padding: '12px 16px'}}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}>
                      <XDSText type="body" weight="bold">
                        {item.name}
                      </XDSText>
                      {item.isOfficial && (
                        <XDSBadge label="Official" variant="info" />
                      )}
                    </div>
                    <XDSText type="supporting" color="secondary">
                      {item.category}
                    </XDSText>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginTop: 8,
                      }}>
                      <div
                        style={{display: 'flex', alignItems: 'center', gap: 4}}>
                        <DownloadIcon
                          width={14}
                          height={14}
                          style={{opacity: 0.4}}
                        />
                        <XDSText type="supporting" color="secondary">
                          {item.downloads}
                        </XDSText>
                      </div>
                      <div
                        style={{display: 'flex', alignItems: 'center', gap: 4}}>
                        <StarIcon
                          width={14}
                          height={14}
                          style={{opacity: 0.4}}
                        />
                        <XDSText type="supporting" color="secondary">
                          {item.stars}
                        </XDSText>
                      </div>
                    </div>
                  </div>
                </XDSCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfileView
// ---------------------------------------------------------------------------

const PROFILE_USED_ITEMS = [
  {name: 'Dashboard Pro', lastUsed: 'Last used 2 days ago'},
  {name: 'Login Form', lastUsed: 'Last used 2 days ago'},
  {name: 'Settings Panel', lastUsed: 'Last used 2 days ago'},
  {name: 'E-commerce Kit', lastUsed: 'Last used 2 days ago'},
  {name: 'Data Table', lastUsed: 'Last used 2 days ago'},
  {name: 'Contact Form', lastUsed: 'Last used 2 days ago'},
];

const PROFILE_LIKED_ITEMS = [
  {name: 'Meta Theme', lastUsed: 'Last used 2 days ago'},
  {name: 'Brutalist Theme', lastUsed: 'Last used 2 days ago'},
  {name: 'Admin Dashboard', lastUsed: 'Last used 2 days ago'},
  {name: 'Product Detail', lastUsed: 'Last used 2 days ago'},
];

const PROFILE_COLLECTIONS = [
  {name: 'Work Projects', count: 4},
  {name: 'Design Inspiration', count: 6},
  {name: 'Client Templates', count: 3},
];

function ProfileView({
  activeView,
  setActiveView,
}: {
  activeView: 'craft' | 'docs' | 'explore' | 'profile';
  setActiveView: (v: 'craft' | 'docs' | 'explore' | 'profile') => void;
}) {
  const [profileTab, setProfileTab] = useState('used');
  const [expandedCollection, setExpandedCollection] = useState<string | null>(
    null,
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100vh',
        backgroundColor: 'var(--color-background-surface, #ffffff)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
      {/* Top Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 48,
          padding: '0 16px',
          flexShrink: 0,
        }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <LogoNav activeView={activeView} setActiveView={setActiveView} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
          <XDSButton
            label="Search"
            variant="ghost"
            size="sm"
            icon={<SearchIcon />}
            isIconOnly
          />
          <XDSButton
            label="Profile"
            variant="ghost"
            size="sm"
            icon={<ProfileIcon />}
            isIconOnly
          />
        </div>
      </nav>
      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto' as const,
          padding: '40px 48px 64px',
        }}>
        <div style={{maxWidth: 800, margin: '0 auto'}}>
          {/* Profile Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginBottom: 24,
            }}>
            <XDSAvatar name="Ruby Cheung" size="large" />
            <div>
              <XDSHeading level={1}>Ruby Cheung</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Design Systems Engineer
              </XDSText>
              <XDSText type="supporting" color="secondary">
                Joined March 2026
              </XDSText>
              <div style={{marginTop: 8}}>
                <XDSText type="supporting" color="secondary">
                  12 used · 8 liked · 3 collections
                </XDSText>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{marginBottom: 24}}>
            <XDSTabList value={profileTab} onChange={setProfileTab} size="sm">
              <XDSTab value="used" label="Used" />
              <XDSTab value="liked" label="Liked" />
              <XDSTab value="bookmarks" label="Bookmarks" />
              <XDSTab value="created" label="Created" />
            </XDSTabList>
          </div>

          {/* Tab Content: Used */}
          {profileTab === 'used' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
              }}>
              {PROFILE_USED_ITEMS.map(item => (
                <XDSCard key={item.name}>
                  <div style={{padding: 0}}>
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '4/3',
                        backgroundColor:
                          'var(--color-background-body, #f1f4f7)',
                        borderRadius: '8px 8px 0 0',
                      }}
                    />
                    <div style={{padding: 12}}>
                      <XDSText type="body">{item.name}</XDSText>
                      <XDSText type="supporting" color="secondary">
                        {item.lastUsed}
                      </XDSText>
                    </div>
                  </div>
                </XDSCard>
              ))}
            </div>
          )}

          {/* Tab Content: Liked */}
          {profileTab === 'liked' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
              }}>
              {PROFILE_LIKED_ITEMS.map(item => (
                <XDSCard key={item.name}>
                  <div style={{padding: 0}}>
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '4/3',
                        backgroundColor:
                          'var(--color-background-body, #f1f4f7)',
                        borderRadius: '8px 8px 0 0',
                      }}
                    />
                    <div style={{padding: 12}}>
                      <XDSText type="body">{item.name}</XDSText>
                      <XDSText type="supporting" color="secondary">
                        {item.lastUsed}
                      </XDSText>
                    </div>
                  </div>
                </XDSCard>
              ))}
            </div>
          )}

          {/* Tab Content: Bookmarks */}
          {profileTab === 'bookmarks' && (
            <div>
              <div style={{marginBottom: 16}}>
                <XDSButton
                  label="New collection"
                  variant="secondary"
                  icon={<PlusIcon />}
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                  marginBottom: 24,
                }}>
                {PROFILE_COLLECTIONS.map(collection => (
                  <XDSCard key={collection.name}>
                    <div style={{padding: 16}}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 8,
                        }}>
                        <FolderIcon width={20} height={20} />
                        <XDSText type="body">{collection.name}</XDSText>
                      </div>
                      <XDSText type="supporting" color="secondary">
                        {collection.count} items
                      </XDSText>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 4,
                          marginTop: 12,
                        }}>
                        {[0, 1, 2, 3].map(i => (
                          <div
                            key={i}
                            style={{
                              aspectRatio: '1',
                              backgroundColor:
                                'var(--color-background-body, #f1f4f7)',
                              borderRadius: 4,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </XDSCard>
                ))}
              </div>

              {/* Expandable list */}
              {PROFILE_COLLECTIONS.map(collection => (
                <div key={collection.name} style={{marginBottom: 8}}>
                  <XDSButton
                    label={collection.name}
                    variant="ghost"
                    size="sm"
                    icon={
                      <ChevronDownIcon
                        style={{
                          transform:
                            expandedCollection === collection.name
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                          transition: 'transform 200ms',
                        }}
                      />
                    }
                    onClick={() =>
                      setExpandedCollection(
                        expandedCollection === collection.name
                          ? null
                          : collection.name,
                      )
                    }>
                    {collection.name} ({collection.count})
                  </XDSButton>
                  {expandedCollection === collection.name && (
                    <div style={{paddingLeft: 32, paddingTop: 8}}>
                      {Array.from({length: collection.count}, (_, i) => (
                        <div key={i} style={{padding: '4px 0'}}>
                          <XDSText type="supporting" color="secondary">
                            Item {i + 1}
                          </XDSText>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab Content: Created */}
          {profileTab === 'created' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 16,
                }}>
                <XDSButton
                  label="Create new"
                  variant="secondary"
                  size="sm"
                  icon={<PlusIcon />}
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 16,
                }}>
                {[
                  {
                    name: 'My Dashboard Theme',
                    type: 'Theme',
                    status: 'Published',
                    downloads: '342',
                    img: DUMMY_IMAGE,
                  },
                  {
                    name: 'Custom Login Template',
                    type: 'Template',
                    status: 'Published',
                    downloads: '128',
                    img: DUMMY_IMAGE,
                  },
                  {
                    name: 'Internal Tools Kit',
                    type: 'Template',
                    status: 'Draft',
                    downloads: '0',
                    img: DUMMY_IMAGE,
                  },
                ].map((item, i) => (
                  <XDSCard key={i} padding={0}>
                    <img
                      src={item.img}
                      alt={item.name}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: 140,
                        objectFit: 'cover',
                      }}
                    />
                    <div style={{padding: '12px 16px'}}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 4,
                        }}>
                        <XDSText type="body" weight="bold">
                          {item.name}
                        </XDSText>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 4,
                        }}>
                        <XDSBadge
                          label={item.status}
                          variant={
                            item.status === 'Published' ? 'success' : 'neutral'
                          }
                        />
                        <XDSText type="supporting" color="secondary">
                          {item.type}
                        </XDSText>
                      </div>
                      {item.status === 'Published' && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginTop: 4,
                          }}>
                          <DownloadIcon
                            width={14}
                            height={14}
                            style={{opacity: 0.4}}
                          />
                          <XDSText type="supporting" color="secondary">
                            {item.downloads} downloads
                          </XDSText>
                        </div>
                      )}
                    </div>
                  </XDSCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocsiteLandingTemplate() {
  const [activeView, setActiveView] = useState<
    'craft' | 'docs' | 'explore' | 'profile'
  >('craft');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [generatingSource, setGeneratingSource] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [useTarget, setUseTarget] = useState<number | null>(null);
  const [previewGenerating, setPreviewGenerating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const simRef = useRef<BoidsSimulation | null>(null);
  const simAnimRef = useRef<number>(0);

  if (!simRef.current) {
    simRef.current = createSimulation();
  }

  // Single update loop for the shared simulation
  const simRunning = generatingSource !== null || previewGenerating;
  useEffect(() => {
    if (!simRunning) {
      cancelAnimationFrame(simAnimRef.current);
      return;
    }
    function tick() {
      simRef.current!.update();
      simAnimRef.current = requestAnimationFrame(tick);
    }
    simAnimRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(simAnimRef.current);
  }, [simRunning]);

  useEffect(() => {
    const mobileMql = window.matchMedia('(max-width: 768px)');
    const tabletMql = window.matchMedia(
      '(min-width: 769px) and (max-width: 1024px)',
    );
    setIsMobile(mobileMql.matches);
    setIsTablet(tabletMql.matches);

    const mobileHandler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    const tabletHandler = (e: MediaQueryListEvent) => setIsTablet(e.matches);
    mobileMql.addEventListener('change', mobileHandler);
    tabletMql.addEventListener('change', tabletHandler);
    return () => {
      mobileMql.removeEventListener('change', mobileHandler);
      tabletMql.removeEventListener('change', tabletHandler);
    };
  }, []);

  const handleMoreLikeThis = useCallback(
    (index: number) => {
      if (generatingSource !== null) return;
      setGeneratingSource(index);
      setChatOpen(true);
      timerRef.current = setTimeout(() => {
        setGeneratingSource(null);
        timerRef.current = null;
      }, 5000);
    },
    [generatingSource],
  );

  const handleUse = useCallback((index: number) => {
    setUseTarget(index);
    setChatOpen(true);
  }, []);

  const handleBackFromUse = useCallback(() => {
    setUseTarget(null);
    setChatOpen(false);
  }, []);

  const handlePreviewSend = useCallback(() => {
    if (previewGenerating) return;
    setPreviewGenerating(true);
    previewTimerRef.current = setTimeout(() => {
      setPreviewGenerating(false);
      previewTimerRef.current = null;
    }, 5000);
  }, [previewGenerating]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  const isGenerating = generatingSource !== null;

  if (activeView === 'docs') {
    return <DocsView activeView={activeView} setActiveView={setActiveView} />;
  }

  if (activeView === 'explore') {
    return (
      <ExploreView activeView={activeView} setActiveView={setActiveView} />
    );
  }

  if (activeView === 'profile') {
    return (
      <ProfileView activeView={activeView} setActiveView={setActiveView} />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100vh',
        backgroundColor: 'var(--color-background-surface, white)',
      }}>
      {useTarget === null && (
        <AppTopNav activeView={activeView} setActiveView={setActiveView} />
      )}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}>
        {/* Chat panel */}
        <div
          style={{
            width: chatOpen ? 400 : 0,
            minWidth: chatOpen ? 400 : 0,
            overflow: 'hidden',
            transition:
              'width var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), min-width var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
            borderRight: 'none',
            backgroundColor: 'var(--color-background-surface, white)',
          }}>
          {chatOpen && (
            <ChatPanel
              isGenerating={isGenerating || previewGenerating}
              onSend={useTarget !== null ? handlePreviewSend : undefined}
              activeView={activeView}
              setActiveView={setActiveView}
            />
          )}
        </div>

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column' as const,
          }}>
          {useTarget !== null ? (
            <TemplatePreview
              templateName={TEMPLATES[useTarget % TEMPLATES.length].name}
              imageSrc={TEMPLATES[useTarget % TEMPLATES.length].src}
              onBack={handleBackFromUse}
              isGenerating={previewGenerating}
              simulation={simRef.current!}
            />
          ) : (
            <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
              {/* Masonry Grid */}
              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: 16,
                }}>
                <div
                  style={{
                    maxWidth: 2000,
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? '1fr'
                      : isTablet
                        ? 'repeat(2, 1fr)'
                        : 'repeat(4, 1fr)',
                    gap: 16,
                    gridAutoRows: '1fr',
                  }}>
                  {TEMPLATES.map((template, i) => (
                    <div
                      key={`${template.name}-${i}`}
                      style={{
                        gridColumn:
                          template.size === 'xlarge'
                            ? 'span 3'
                            : template.size === 'large'
                              ? 'span 2'
                              : 'span 1',
                      }}>
                      <TemplateCard
                        src={template.src}
                        name={template.name}
                        isSelected={selected.has(i)}
                        isGenerating={isGenerating && generatingSource !== i}
                        cardSize={template.size}
                        onSelect={() =>
                          setSelected(prev => {
                            const next = new Set(prev);
                            if (next.has(i)) {
                              next.delete(i);
                            } else {
                              next.add(i);
                            }
                            return next;
                          })
                        }
                        onMoreLikeThis={() => handleMoreLikeThis(i)}
                        onUse={() => handleUse(i)}
                        simulation={simRef.current!}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!chatOpen && <AIComposer />}
    </div>
  );
}
