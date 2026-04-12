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
import {XDSToken} from '@xds/core/Token';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSBanner} from '@xds/core/Banner';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTooltip} from '@xds/core/Tooltip';
import {XDSTable} from '@xds/core/Table';
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
  onPreview,
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
  onPreview: () => void;
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
        onClick={onPreview}>
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
            {/* Top-right: Copy link, Bookmark, Heart+count */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              onClick={e => e.stopPropagation()}>
              <XDSButton
                label="Copy link"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={<LinkIcon />}
                style={{color: '#fff'}}
                onClick={() => {}}
              />
              <XDSButton
                label="Bookmark"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={<BookmarkIcon />}
                style={{color: '#fff'}}
                onClick={() => {}}
              />
              <XDSButton
                label="Like"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={<HeartIcon />}
                style={{color: '#fff'}}
                onClick={() => {}}
              />
              <XDSText type="supporting" style={{color: '#fff'}}>
                24
              </XDSText>
            </div>
            {/* Bottom-right: Customize + Use dropdown */}
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
            }}>
            <XDSText type="supporting">Template 01</XDSText>
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
                isIconOnly
                icon={<PlusIcon />}
              />
              <XDSButton
                label="Send"
                variant="primary"
                size="sm"
                isIconOnly
                icon={<SendIcon />}
                style={{borderRadius: 9999}}
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
  templateName,
  onBack,
}: {
  isGenerating: boolean;
  onSend?: () => void;
  activeView: 'craft' | 'library' | 'learn' | 'profile';
  setActiveView: (view: 'craft' | 'library' | 'learn' | 'profile') => void;
  templateName?: string;
  onBack?: () => void;
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
      {/* Header: logo or back+title */}
      {!templateName && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            flexShrink: 0,
          }}>
          <LogoNav activeView={activeView} setActiveView={setActiveView} />
          <XDSButton
            label="Toggle sidebar"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<SidebarIcon />}
          />
        </div>
      )}
      {templateName && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '16px 16px 0',
            flexShrink: 0,
          }}>
          {onBack && (
            <XDSButton
              label="Back"
              variant="ghost"
              size="sm"
              icon={<ArrowLeftIcon />}
              isIconOnly
              onClick={onBack}
              style={{flexShrink: 0}}
            />
          )}
          <XDSHeading level={1} style={{lineHeight: 1}}>
            {templateName}
          </XDSHeading>
        </div>
      )}

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
              marginBottom: 8,
            }}>
            <XDSText type="supporting">Template 01</XDSText>
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
      <div
        style={{
          padding: templateName ? 0 : 12,
          borderTop: templateName
            ? '1px solid var(--color-divider, #e0e0e0)'
            : 'none',
        }}>
        <div
          style={{
            borderRadius: templateName ? 0 : 20,
            backgroundColor: 'var(--color-background-card, white)',
            border: templateName ? 'none' : '1px solid var(--color-divider)',
            borderTop: templateName
              ? '1px solid var(--color-divider)'
              : undefined,
            boxShadow: templateName ? 'none' : 'var(--shadow-high)',
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
            }}>
            <XDSText type="supporting">Template 01</XDSText>
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
              isIconOnly
              icon={<PlusIcon />}
            />
            <XDSButton
              label="Send"
              variant="primary"
              size="sm"
              isIconOnly
              icon={<SendIcon />}
              style={{borderRadius: 9999}}
              onClick={onSend}
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
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    <path d="m13 13 6 6" />
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
    <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
  </svg>
);

const ContrastIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const SaveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const BookmarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const PaperPlaneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
    <path d="M6 12h16" />
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
              <XDSAvatar name="Jane Doe" size="medium" />
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
  const [editorView, setEditorView] = useState<'preview' | 'code'>('preview');
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
        paddingTop: 0,
      }}>
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: 0,
          display: 'flex',
          flexDirection: 'column' as const,
        }}>
        {/* Bordered container: toolbar + preview + code */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            flex: 1,
            overflow: 'hidden',
          }}>
          {/* Toolbar */}
          <div
            style={{backgroundColor: 'var(--color-background-body, #f5f5f5)'}}>
            <XDSToolbar
              label="Template actions"
              startContent={<></>}
              centerContent={
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
                    value="phone"
                    label="Phone"
                    isLabelHidden
                    icon={<PhoneIcon />}
                  />
                </XDSSegmentedControl>
              }
              endContent={
                <>
                  <XDSButton
                    label="Point"
                    variant="ghost"
                    isIconOnly
                    icon={<CursorIcon />}
                  />
                  <XDSDropdownMenu
                    button={{
                      label: 'Theme',
                      variant: 'ghost',
                      isIconOnly: true,
                      icon: <PaletteIcon />,
                    }}
                    hasChevron={false}
                    items={XDS_THEMES.map(t => ({
                      label: t.label,
                      onClick: () => {},
                    }))}
                  />
                  <XDSButton
                    label="Toggle theme"
                    variant="ghost"
                    isIconOnly
                    icon={<ContrastIcon />}
                  />
                  <XDSButton
                    label="Toggle code"
                    variant={editorView === 'code' ? 'secondary' : 'ghost'}
                    isIconOnly
                    icon={<CodeIcon />}
                    onClick={() =>
                      setEditorView(
                        editorView === 'preview' ? 'code' : 'preview',
                      )
                    }
                  />
                  <XDSButton
                    label="Save"
                    variant="ghost"
                    icon={<SaveIcon />}
                    isIconOnly
                    onClick={() => {}}
                  />
                  <XDSDropdownMenu
                    button={{
                      label: 'Share',
                      variant: 'ghost',
                      isIconOnly: true,
                      icon: <PaperPlaneIcon />,
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
                      {
                        label: 'Claude Code',
                        icon: ClaudeIcon,
                        onClick: () => {},
                      },
                      {label: 'VSCode', icon: VSCodeIcon, onClick: () => {}},
                      {label: 'Cursor', icon: CursorAIIcon, onClick: () => {}},
                    ]}
                  />
                </>
              }
            />
          </div>

          {/* Preview — browser frame + image */}
          <div
            style={{
              backgroundColor: 'var(--color-background-body, #f5f5f5)',
              borderRadius: 0,
              padding: '22px 22px 22px',
              margin: 0,
              display: editorView === 'preview' ? 'flex' : 'none',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flex: 1,
              overflow: 'hidden',
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
                backgroundColor: '#fff',
                borderRadius: viewportSize === 'phone' ? 36 : 12,
                border: viewportSize === 'phone' ? '10px solid #fff' : 'none',
                boxShadow:
                  viewportSize === 'phone'
                    ? '0 8px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)'
                    : '0 8px 40px rgba(0,0,0,0.12)',
                overflow: 'hidden',
              }}>
              {/* Browser chrome dots for desktop */}
              {viewportSize === 'desktop' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #f0f0f0',
                  }}>
                  <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                      }}
                    />
                  </div>
                </div>
              )}
              <img
                src={imageSrc}
                alt="Template preview"
                style={{
                  display: 'block',
                  width: '100%',
                  aspectRatio:
                    viewportSize === 'phone' ? '9 / 19.5' : '1920 / 1200',
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
              margin: '0 22px 22px',
              backgroundColor: 'var(--color-background-card, #fff)',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              overflow: 'auto',
              flex: 1,
              display: editorView === 'code' ? 'flex' : 'none',
              flexDirection: 'column' as const,
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
      </div>
    </div>
  );
}

function ClassicTemplatePreview({
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
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeftIcon />}
                  isIconOnly
                  onClick={onBack}
                  style={{marginLeft: -8}}
                />
                <XDSHeading level={3}>{templateName}</XDSHeading>
              </>
            }
            centerContent={
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
                  value="phone"
                  label="Phone"
                  isLabelHidden
                  icon={<PhoneIcon />}
                />
              </XDSSegmentedControl>
            }
            endContent={
              <>
                <XDSButton
                  label="Code"
                  variant="ghost"
                  isIconOnly
                  icon={<CodeIcon />}
                />
                <XDSButton
                  label="Point"
                  variant="ghost"
                  isIconOnly
                  icon={<CursorIcon />}
                />
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
                <XDSButton
                  label="Toggle theme"
                  variant="ghost"
                  isIconOnly
                  icon={<ContrastIcon />}
                />
                <XDSButton
                  label="Save"
                  variant="ghost"
                  isIconOnly
                  icon={<SaveIcon />}
                />
                <XDSDropdownMenu
                  button={{
                    label: 'Share',
                    variant: 'ghost',
                    icon: <PaperPlaneIcon />,
                    isIconOnly: true,
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
              </>
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
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
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

const NAV_ITEMS: Array<{key: 'craft' | 'library' | 'learn'; label: string}> = [
  {key: 'craft', label: 'Craft'},
  {key: 'library', label: 'Library'},
  {key: 'learn', label: 'Learn'},
];

function LogoNav({
  activeView,
  setActiveView,
  logo,
}: {
  activeView: 'craft' | 'library' | 'learn' | 'profile';
  setActiveView: (view: 'craft' | 'library' | 'learn' | 'profile') => void;
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
      <div style={{cursor: 'pointer'}}>{logo || XDS_LOGO_PLAIN}</div>
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
            {logo || XDS_LOGO_PLAIN}
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
                    backgroundColor:
                      isActive || isHovered
                        ? 'var(--color-background-body, #f1f4f7)'
                        : 'transparent',
                    transition: 'background-color 150ms ease',
                  }}>
                  <XDSText
                    type="body"
                    weight={isActive ? 'semibold' : 'normal'}>
                    {item.label}
                  </XDSText>
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
  scrollContainerRef,
}: {
  activeView: 'craft' | 'library' | 'learn' | 'profile';
  setActiveView: (view: 'craft' | 'library' | 'learn' | 'profile') => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = scrollContainerRef?.current
        ? scrollContainerRef.current.scrollTop
        : window.scrollY;
      setIsScrolled(scrollTop > 120);
    };
    const target = scrollContainerRef?.current ?? window;
    target.addEventListener('scroll', handleScroll, {passive: true});
    return () => target.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  return (
    <>
      {/* Top nav bar — becomes combined bar when scrolled */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 48,
          padding: '0 16px',
          backgroundColor: 'var(--color-background-surface, white)',
          position: 'sticky',
          top: 0,
          zIndex: 11,
          transition:
            'box-shadow 300ms var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
          boxShadow:
            isScrolled && !isFilterOpen ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        }}>
        {/* Left: logo nav */}
        <div style={{display: 'flex', alignItems: 'center', gap: 8, flex: 1}}>
          <LogoNav activeView={activeView} setActiveView={setActiveView} />
        </div>

        {/* Center: tabs (slide in when scrolled) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isScrolled ? 1 : 0,
            transform: isScrolled ? 'translateY(0)' : 'translateY(-8px)',
            transition:
              'opacity 300ms var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), transform 300ms var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
            pointerEvents: isScrolled ? ('auto' as const) : ('none' as const),
          }}>
          <XDSTabList value={activeTab} onChange={setActiveTab} size="sm">
            <XDSTab value="all" label="All" />
            <XDSTab value="templates" label="Templates" />
            <XDSTab value="theme" label="Theme" />
            <XDSTab value="components" label="Components" />
          </XDSTabList>
        </div>

        {/* Right: search + profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          {isScrolled && (
            <XDSButton
              label="Filter"
              variant="ghost"
              size="sm"
              isIconOnly
              icon={<FilterIcon />}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            />
          )}
          <XDSButton
            label="Search"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<SearchIcon />}
            onClick={() => setIsSearchOpen(true)}
          />
          <XDSButton
            label="Profile"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<ProfileIcon />}
            onClick={() => setActiveView('profile')}
          />
        </div>
      </nav>

      {/* Hero section — collapses when scrolled */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 16px 32px',
          maxHeight: isScrolled ? 0 : 200,
          overflow: 'hidden',
          opacity: isScrolled ? 0 : 1,
          transition:
            'max-height 300ms ease, opacity 200ms ease, padding 300ms ease',
          ...(isScrolled ? {padding: 0} : {}),
        }}>
        <div style={{textAlign: 'center'}}>
          <div style={{paddingBottom: 4}}>
            <XDSText type="display-3" color="primary">
              Explore the possibilities.
            </XDSText>
          </div>
          <XDSText type="display-2">Craft what you imagine.</XDSText>
        </div>
      </div>

      {/* Tabs row — collapses when scrolled (tabs move to nav bar) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 16px 8px',
          position: 'sticky',
          top: 48,
          zIndex: 10,
          backgroundColor: 'var(--color-background-card, white)',
          maxHeight: isScrolled ? 0 : 60,
          overflow: 'hidden',
          opacity: isScrolled ? 0 : 1,
          transition:
            'max-height 300ms ease, opacity 200ms ease, padding 300ms ease',
          ...(isScrolled ? {padding: 0} : {}),
        }}>
        <div />
        <XDSTabList value={activeTab} onChange={setActiveTab} size="sm">
          <XDSTab value="all" label="All" />
          <XDSTab value="templates" label="Templates" />
          <XDSTab value="theme" label="Theme" />
          <XDSTab value="components" label="Components" />
        </XDSTabList>
        <div style={{justifySelf: 'end'}}>
          <XDSButton
            label="Filter"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<FilterIcon />}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isFilterOpen
            ? '1fr 1fr 1fr 1fr'
            : '1fr 1fr 1fr 1fr',
          gap: isFilterOpen ? 24 : 0,
          boxShadow:
            isFilterOpen && isScrolled ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          padding: isFilterOpen ? '24px 40px' : '0 40px',
          maxHeight: isFilterOpen ? 400 : 0,
          overflow: 'hidden',
          opacity: isFilterOpen ? 1 : 0,
          transition:
            'max-height var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), opacity var(--duration-fast, 175ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), padding var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), gap var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
        }}>
        {[
          {
            heading: 'Categories',
            items: [
              'AI',
              'Health & Fitness',
              'Productivity',
              'Shopping',
              'Education',
            ],
          },
          {
            heading: 'Screens',
            items: [
              'My Account & Profile',
              'Charts',
              'Login',
              'Filter & Sort',
              'Signup',
            ],
          },
          {
            heading: 'UI Elements',
            items: [
              'Dropdown Menu',
              'Side Navigation',
              'Stepper',
              'Text Field',
              'Navigation Menu',
            ],
          },
          {
            heading: 'Flows',
            items: [
              'Reporting',
              'Resetting Password',
              'Onboarding',
              'Setting Up',
              'Filtering & Sorting',
            ],
          },
        ].map(col => (
          <div key={col.heading}>
            <XDSText
              type="supporting"
              color="secondary"
              style={{
                marginBottom: 12,
                display: 'block',
              }}>
              {col.heading}
            </XDSText>
            <div style={{marginLeft: -8, marginRight: -8}}>
              <XDSList density="compact">
                {col.items.map(item => (
                  <XDSListItem key={item} label={item} onClick={() => {}} />
                ))}
              </XDSList>
            </div>
          </div>
        ))}
      </div>

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
// Section Label Component (for DocsView sidebar)
// ---------------------------------------------------------------------------

function SectionLabel({label}: {label: string}) {
  return (
    <div
      style={{
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        padding: '12px 8px 4px',
        margin: 0,
      }}>
      <XDSText type="supporting" weight="semibold" color="secondary">
        {label}
      </XDSText>
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
// DialogPreview — stateful dialog preview for component previews
// ---------------------------------------------------------------------------

function DialogPreview() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <div style={{marginBottom: 16}}>
        <XDSHeading level={3}>Dialog</XDSHeading>
      </div>
      <XDSButton
        label="Open Dialog"
        variant="primary"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog isOpen={isOpen} onOpenChange={setIsOpen}>
        <XDSDialogHeader title="Example Dialog" onOpenChange={setIsOpen} />
        <div style={{padding: 16}}>
          <XDSText type="body">
            This is an example dialog. Dialogs are used to require user action
            or display important information that needs acknowledgment.
          </XDSText>
        </div>
      </XDSDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DocsView — embedded documentation view
// ---------------------------------------------------------------------------

function DocsView({
  activeView,
  setActiveView,
}: {
  activeView: 'craft' | 'library' | 'learn' | 'profile';
  setActiveView: (v: 'craft' | 'library' | 'learn' | 'profile') => void;
}) {
  const [activeNav, setActiveNav] = useState('button');
  const [showCode, setShowCode] = useState(true);
  const [activeRightNav, setActiveRightNav] = useState('usage');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null,
  );

  const COMPONENT_CATEGORIES = [
    {
      label: 'Core',
      items: [
        {
          key: 'appshell',
          name: 'AppShell',
          desc: 'AppShell provides a foundational page layout with header, sidebar, and content regions. Use it to establish consistent structure across your application.',
        },
        {
          key: 'avatar',
          name: 'Avatar',
          desc: 'Avatars represent a person or entity with an image, initials, or icon. They are commonly used in user profiles, comments, and contact lists.',
        },
        {
          key: 'badge',
          name: 'Badge',
          desc: 'Badges display small counts or status labels. They can be attached to icons, buttons, or list items to surface key information at a glance.',
        },
        {
          key: 'banner',
          name: 'Banner',
          desc: 'Banners show important, non-modal messages at the top of a page or section. They communicate status, warnings, or promotional information.',
        },
        {
          key: 'button',
          name: 'Button',
          desc: 'Buttons let people take action. They can be used in forms, dialogs, and toolbars, or as standalone links.',
        },
        {
          key: 'calendar',
          name: 'Calendar',
          desc: 'Calendar provides a date-picking grid for selecting single dates or date ranges. It integrates with form fields for date input.',
        },
        {
          key: 'dialog',
          name: 'Dialog',
          desc: 'Dialogs are modal overlays that require user attention or action before continuing. They are used for confirmations, forms, and critical decisions.',
        },
        {
          key: 'dropdownmenu',
          name: 'DropdownMenu',
          desc: 'DropdownMenu presents a list of actions or options in a floating overlay. It is triggered by a button and supports nested submenus.',
        },
        {
          key: 'emptystate',
          name: 'EmptyState',
          desc: 'EmptyState provides a placeholder when there is no content to display. It guides users with a message, illustration, and optional call-to-action.',
        },
        {
          key: 'hovercard',
          name: 'HoverCard',
          desc: 'HoverCard shows a rich preview of content when users hover over a trigger element. It is ideal for previewing profiles, links, or details.',
        },
        {
          key: 'icon',
          name: 'Icon',
          desc: 'Icons are small visual symbols that represent actions, objects, or concepts. They improve scannability and reinforce meaning alongside text.',
        },
        {
          key: 'kbd',
          name: 'Kbd',
          desc: 'Kbd renders keyboard shortcut hints in a styled inline element. Use it to show users which key combinations perform specific actions.',
        },
        {
          key: 'link',
          name: 'Link',
          desc: 'Links provide navigation between pages or to external resources. They follow accessible anchor semantics with visual affordance.',
        },
        {
          key: 'list',
          name: 'List',
          desc: 'List displays a vertical set of related items. It supports selection, icons, and metadata for building menus, nav lists, and more.',
        },
        {
          key: 'metadatalist',
          name: 'MetadataList',
          desc: 'MetadataList displays key-value pairs in a structured layout. Use it for detail panels, settings summaries, and record information.',
        },
        {
          key: 'moremenu',
          name: 'MoreMenu',
          desc: 'MoreMenu provides an overflow menu triggered by an icon button. It collects secondary actions that do not fit in the primary toolbar.',
        },
        {
          key: 'overflowlist',
          name: 'OverflowList',
          desc: 'OverflowList renders as many items as fit in the available space and collapses the rest into an overflow menu automatically.',
        },
        {
          key: 'pagination',
          name: 'Pagination',
          desc: 'Pagination lets users navigate through pages of content. It supports page numbers, previous/next controls, and page-size selection.',
        },
        {
          key: 'popover',
          name: 'Popover',
          desc: 'Popover displays rich content in a floating panel anchored to a trigger element. It is used for forms, filters, and contextual tools.',
        },
        {
          key: 'progressbar',
          name: 'ProgressBar',
          desc: 'ProgressBar shows the completion status of a task or process. It provides visual feedback for uploads, installations, and multi-step flows.',
        },
        {
          key: 'skeleton',
          name: 'Skeleton',
          desc: 'Skeleton renders placeholder shapes that mimic content layout while loading. It reduces perceived wait time and prevents layout shifts.',
        },
        {
          key: 'spinner',
          name: 'Spinner',
          desc: 'Spinner indicates that a process is in progress when the duration is unknown. It draws attention without blocking the interface.',
        },
        {
          key: 'statusdot',
          name: 'StatusDot',
          desc: 'StatusDot shows a small colored indicator for online, offline, busy, or custom statuses. It is often paired with avatars or list items.',
        },
        {
          key: 'table',
          name: 'Table',
          desc: 'Table displays structured data in rows and columns with support for sorting, selection, and custom cell rendering.',
        },
        {
          key: 'thumbnail',
          name: 'Thumbnail',
          desc: 'Thumbnail renders a small image preview with consistent sizing and optional rounded corners. It is used in media lists, cards, and galleries.',
        },
        {
          key: 'timestamp',
          name: 'Timestamp',
          desc: 'Timestamp formats and displays dates and times with relative or absolute labels. It updates automatically to stay current.',
        },
        {
          key: 'toast',
          name: 'Toast',
          desc: 'Toasts display brief, non-blocking notifications at the edge of the screen. They auto-dismiss and are used for success, error, or info messages.',
        },
        {
          key: 'togglebutton',
          name: 'ToggleButton',
          desc: 'ToggleButton is a button that switches between an on and off state. Use it for binary options like bookmarking, favoriting, or muting.',
        },
        {
          key: 'token',
          name: 'Token',
          desc: 'Tokens display compact metadata labels such as tags, categories, or filters. They can be dismissible and support selection state.',
        },
        {
          key: 'tooltip',
          name: 'Tooltip',
          desc: 'Tooltips show concise helper text when users hover over or focus an element. They clarify icons, truncated labels, and controls.',
        },
        {
          key: 'treelist',
          name: 'TreeList',
          desc: 'TreeList renders hierarchical data in an expandable tree structure. It supports multi-level nesting, selection, and lazy loading.',
        },
      ],
    },
    {
      label: 'Typography',
      items: [
        {
          key: 'heading',
          name: 'Heading',
          desc: 'Heading renders semantic section titles from h1 through h6. It establishes visual hierarchy and supports multiple weight and size options.',
        },
        {
          key: 'text',
          name: 'Text',
          desc: 'Text renders body copy, labels, and supporting content with consistent typography. It supports sizes from display down to caption.',
        },
      ],
    },
    {
      label: 'Layout',
      items: [
        {
          key: 'aspectratio',
          name: 'AspectRatio',
          desc: 'AspectRatio constrains its child to a specified width-to-height ratio. Use it for responsive images, videos, and embedded media.',
        },
        {
          key: 'card',
          name: 'Card',
          desc: 'Cards group related content and actions in a contained surface. They can include headers, media, body text, and action bars.',
        },
        {
          key: 'center',
          name: 'Center',
          desc: 'Center aligns its child horizontally and vertically within the available space. It is useful for empty states, loading screens, and hero sections.',
        },
        {
          key: 'divider',
          name: 'Divider',
          desc: 'Dividers separate content into distinct sections with a subtle or strong horizontal line. They can optionally include a label.',
        },
        {
          key: 'grid',
          name: 'Grid',
          desc: 'Grid provides a CSS grid-based layout container with configurable columns, rows, and gap. It simplifies responsive multi-column designs.',
        },
        {
          key: 'layout',
          name: 'Layout',
          desc: 'Layout provides foundational page-level primitives for header, sidebar, and content regions. It establishes consistent spacing and structure.',
        },
        {
          key: 'section',
          name: 'Section',
          desc: 'Section wraps a block of content with consistent vertical spacing and an optional heading. It structures pages into logical groups.',
        },
        {
          key: 'stack',
          name: 'Stack',
          desc: 'Stack arranges child elements in a row or column with consistent gap spacing. It is the primary tool for one-dimensional layout composition.',
        },
        {
          key: 'toolbar',
          name: 'Toolbar',
          desc: 'Toolbar arranges a row of action buttons and controls in a compact, aligned strip. It is used at the top of panels, editors, and cards.',
        },
      ],
    },
    {
      label: 'Navigation',
      items: [
        {
          key: 'breadcrumbs',
          name: 'Breadcrumbs',
          desc: "Breadcrumbs show the user's current location within a navigation hierarchy. They provide quick links back to parent pages.",
        },
        {
          key: 'mobilenav',
          name: 'MobileNav',
          desc: 'MobileNav provides a responsive navigation menu optimized for small screens. It typically slides in from the edge of the viewport.',
        },
        {
          key: 'sidenav',
          name: 'SideNav',
          desc: 'SideNav renders a vertical navigation panel with links, sections, and collapsible groups. It is used as the primary nav in dashboard layouts.',
        },
        {
          key: 'tablist',
          name: 'TabList',
          desc: 'TabList switches between content views using a horizontal row of tabs. Only one tab is active at a time, and content changes without a page reload.',
        },
        {
          key: 'topnav',
          name: 'TopNav',
          desc: 'TopNav provides an app-level navigation bar across the top of the page. It holds branding, primary links, search, and user actions.',
        },
      ],
    },
    {
      label: 'Form',
      items: [
        {
          key: 'checkboxinput',
          name: 'CheckboxInput',
          desc: 'CheckboxInput renders a single checkbox with a label. It is used for boolean opt-in choices like terms acceptance or feature toggles.',
        },
        {
          key: 'checkboxlist',
          name: 'CheckboxList',
          desc: 'CheckboxList displays a group of checkboxes for selecting multiple options. It manages shared state and supports select-all behavior.',
        },
        {
          key: 'dateinput',
          name: 'DateInput',
          desc: 'DateInput provides a text field with calendar picker for entering dates. It validates format and supports min/max date constraints.',
        },
        {
          key: 'field',
          name: 'Field',
          desc: 'Field wraps a form control with a label, helper text, and error message. It ensures consistent layout and accessibility across all form inputs.',
        },
        {
          key: 'formlayout',
          name: 'FormLayout',
          desc: 'FormLayout arranges form fields in a structured vertical or horizontal layout with consistent spacing and alignment.',
        },
        {
          key: 'multiselector',
          name: 'MultiSelector',
          desc: 'MultiSelector lets users pick multiple items from a searchable list with tokenized selections. It is ideal for assigning tags, teams, or categories.',
        },
        {
          key: 'numberinput',
          name: 'NumberInput',
          desc: 'NumberInput provides a text field for numeric values with optional increment/decrement controls. It supports min, max, and step constraints.',
        },
        {
          key: 'powersearch',
          name: 'PowerSearch',
          desc: 'PowerSearch provides an advanced search interface with filters, suggestions, and structured query support for complex data exploration.',
        },
        {
          key: 'radiolist',
          name: 'RadioList',
          desc: 'RadioList presents a group of mutually exclusive options. Only one option can be selected at a time, making it ideal for settings and preferences.',
        },
        {
          key: 'selector',
          name: 'Selector',
          desc: 'Selector lets users pick a single item from a dropdown list. It supports search, grouping, and custom option rendering.',
        },
        {
          key: 'slider',
          name: 'Slider',
          desc: 'Slider lets users select a value or range by dragging a handle along a track. It is used for volume, brightness, and numeric range inputs.',
        },
        {
          key: 'switch',
          name: 'Switch',
          desc: 'Switch toggles a setting between on and off states with immediate effect. It is used for preferences, feature flags, and real-time controls.',
        },
        {
          key: 'textarea',
          name: 'TextArea',
          desc: 'TextArea provides a multi-line text field for longer-form content like comments, descriptions, and messages. It supports auto-resize.',
        },
        {
          key: 'textinput',
          name: 'TextInput',
          desc: 'TextInput is a single-line text field for short user input like names, emails, and search queries. It supports icons, prefixes, and validation.',
        },
        {
          key: 'timeinput',
          name: 'TimeInput',
          desc: 'TimeInput provides a field for entering times with optional picker support. It validates format and supports 12- and 24-hour modes.',
        },
        {
          key: 'tokenizer',
          name: 'Tokenizer',
          desc: 'Tokenizer is a text input that converts entries into removable tokens. It is used for multi-value fields like email recipients and tags.',
        },
        {
          key: 'typeahead',
          name: 'Typeahead',
          desc: 'Typeahead provides an autocomplete search input that suggests results as the user types. It supports async data sources and custom rendering.',
        },
      ],
    },
    {
      label: 'Inputs',
      items: [
        {
          key: 'segmentedcontrol',
          name: 'SegmentedControl',
          desc: 'SegmentedControl lets users toggle between a small set of mutually exclusive options displayed as connected segments. It works like a visual radio group.',
        },
      ],
    },
    {
      label: 'Components',
      items: [
        {
          key: 'codeblock',
          name: 'CodeBlock',
          desc: 'CodeBlock displays formatted, syntax-highlighted source code. It supports line numbers, copy-to-clipboard, and language detection.',
        },
        {
          key: 'collapsible',
          name: 'Collapsible',
          desc: 'Collapsible wraps content that can be expanded or collapsed with a trigger. It is used for FAQs, advanced settings, and progressive disclosure.',
        },
        {
          key: 'markdown',
          name: 'Markdown',
          desc: 'Markdown renders markdown-formatted text into styled HTML. It supports headings, lists, links, code blocks, and inline formatting.',
        },
      ],
    },
    {
      label: 'Chat',
      items: [
        {
          key: 'chat',
          name: 'Chat',
          desc: 'Chat provides a conversational message interface with message bubbles, input, and thread support. It is used for AI assistants and messaging UIs.',
        },
      ],
    },
    {
      label: 'CommandPalette',
      items: [
        {
          key: 'commandpalette',
          name: 'CommandPalette',
          desc: 'CommandPalette is a keyboard-driven command menu for quick navigation and actions. It is opened with a hotkey and supports fuzzy search.',
        },
      ],
    },
  ];

  const COMPONENT_PREVIEWS: Record<string, React.ReactNode> = {
    button: (
      <div>
        <div style={{marginBottom: 16}}>
          <XDSHeading level={3}>Variants</XDSHeading>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap' as const,
            marginBottom: 32,
          }}>
          <XDSButton label="Primary" variant="primary" />
          <XDSButton label="Secondary" variant="secondary" />
          <XDSButton label="Ghost" variant="ghost" />
        </div>
        <div style={{marginBottom: 16}}>
          <XDSHeading level={3}>Sizes</XDSHeading>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap' as const,
          }}>
          <XDSButton label="Small" variant="primary" size="sm" />
          <XDSButton label="Medium" variant="primary" size="md" />
          <XDSButton label="Large" variant="primary" size="lg" />
        </div>
      </div>
    ),
    avatar: (
      <div>
        <div style={{marginBottom: 16}}>
          <XDSHeading level={3}>Sizes</XDSHeading>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap' as const,
          }}>
          <XDSAvatar name="Alice" size="small" />
          <XDSAvatar name="Bob" size="medium" />
          <XDSAvatar name="Charlie" size="large" />
        </div>
      </div>
    ),
    badge: (
      <div>
        <div style={{marginBottom: 16}}>
          <XDSHeading level={3}>Variants</XDSHeading>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap' as const,
          }}>
          <XDSBadge label="Default" />
          <XDSBadge label="Info" variant="info" />
          <XDSBadge label="Success" variant="success" />
          <XDSBadge label="Warning" variant="warning" />
          <XDSBadge label="Error" variant="error" />
        </div>
      </div>
    ),
    card: (
      <div>
        <div style={{marginBottom: 16}}>
          <XDSHeading level={3}>Card</XDSHeading>
        </div>
        <div style={{maxWidth: 400}}>
          <XDSCard>
            <div style={{padding: 16}}>
              <XDSHeading level={4}>Card Title</XDSHeading>
              <div style={{marginTop: 8}}>
                <XDSText type="body" color="secondary">
                  Cards are containers for grouping related content and actions.
                  They provide a flexible surface for displaying information.
                </XDSText>
              </div>
            </div>
          </XDSCard>
        </div>
      </div>
    ),
    banner: (
      <div>
        <div style={{marginBottom: 16}}>
          <XDSHeading level={3}>Status Variants</XDSHeading>
        </div>
        <div
          style={{display: 'flex', flexDirection: 'column' as const, gap: 12}}>
          <XDSBanner status="info" title="Information">
            <XDSText type="body">
              This is an informational banner message.
            </XDSText>
          </XDSBanner>
          <XDSBanner status="success" title="Success">
            <XDSText type="body">Operation completed successfully.</XDSText>
          </XDSBanner>
          <XDSBanner status="warning" title="Warning">
            <XDSText type="body">Please review before continuing.</XDSText>
          </XDSBanner>
        </div>
      </div>
    ),
    dialog: <DialogPreview />,
    text: (
      <div>
        <div style={{marginBottom: 16}}>
          <XDSHeading level={3}>Typography Scale</XDSHeading>
        </div>
        <div
          style={{display: 'flex', flexDirection: 'column' as const, gap: 12}}>
          <XDSText type="display-1">Display 1</XDSText>
          <XDSText type="display-2">Display 2</XDSText>
          <XDSText type="display-3">Display 3</XDSText>
          <XDSHeading level={1}>Heading 1</XDSHeading>
          <XDSHeading level={2}>Heading 2</XDSHeading>
          <XDSHeading level={3}>Heading 3</XDSHeading>
          <XDSHeading level={4}>Heading 4</XDSHeading>
          <XDSText type="body">Body text</XDSText>
          <XDSText type="supporting">Supporting text</XDSText>
        </div>
      </div>
    ),
    divider: (
      <div>
        <div style={{marginBottom: 16}}>
          <XDSHeading level={3}>Divider</XDSHeading>
        </div>
        <div
          style={{display: 'flex', flexDirection: 'column' as const, gap: 24}}>
          <div>
            <XDSText type="supporting" color="secondary">
              Subtle (default)
            </XDSText>
            <div style={{marginTop: 8}}>
              <XDSDivider />
            </div>
          </div>
          <div>
            <XDSText type="supporting" color="secondary">
              Strong
            </XDSText>
            <div style={{marginTop: 8}}>
              <XDSDivider variant="strong" />
            </div>
          </div>
          <div>
            <XDSText type="supporting" color="secondary">
              With label
            </XDSText>
            <div style={{marginTop: 8}}>
              <XDSDivider label="Section" />
            </div>
          </div>
        </div>
      </div>
    ),
    token: (
      <div>
        <div style={{marginBottom: 16}}>
          <XDSHeading level={3}>Tokens</XDSHeading>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap' as const,
          }}>
          <XDSToken label="Design" />
          <XDSToken label="Engineering" />
          <XDSToken label="Product" />
          <XDSToken label="Research" />
        </div>
      </div>
    ),
    tooltip: (
      <div>
        <div style={{marginBottom: 16}}>
          <XDSHeading level={3}>Tooltip</XDSHeading>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap' as const,
          }}>
          <XDSTooltip content="Primary action">
            <XDSButton label="Hover me" variant="primary" />
          </XDSTooltip>
          <XDSTooltip content="Secondary action">
            <XDSButton label="Or me" variant="secondary" />
          </XDSTooltip>
          <XDSTooltip content="Ghost action">
            <XDSButton label="Or me" variant="ghost" />
          </XDSTooltip>
        </div>
      </div>
    ),
  };

  // Helper to find the display name for a component key
  const getComponentName = (key: string): string => {
    for (const cat of COMPONENT_CATEGORIES) {
      const item = cat.items.find(i => i.key === key);
      if (item) return item.name;
    }
    return key;
  };

  const getComponentDesc = (key: string): string => {
    for (const cat of COMPONENT_CATEGORIES) {
      const item = cat.items.find(i => i.key === key);
      if (item) return item.desc;
    }
    return '';
  };

  const COMPONENT_DOCS: Record<
    string,
    {
      tagline: string;
      description: string;
      whenToUse: string[];
      whenNotToUse: string[];
      anatomy: {element: string; required: string; description: string}[];
    }
  > = {
    button: {
      tagline: 'Trigger actions and navigate',
      description:
        'Buttons communicate the action that will occur when the user touches them. They can be placed in dialogs, forms, cards, and toolbars. The primary variant is used for the most important action on a page, while secondary and ghost variants provide visual hierarchy.',
      whenToUse: [
        'To trigger an action such as submitting a form or opening a dialog',
        'As a call-to-action in marketing or onboarding surfaces',
        'In toolbars and action bars for contextual operations',
      ],
      whenNotToUse: [
        'For navigation to another page — use Link instead',
        'To toggle a state on/off — use ToggleButton or Switch instead',
        'When the action is part of a menu — use DropdownMenu instead',
      ],
      anatomy: [
        {
          element: 'Root',
          required: 'Yes',
          description:
            'The outer <button> element that handles click events and focus state',
        },
        {
          element: 'Label',
          required: 'Yes',
          description: 'Text content describing the action the button performs',
        },
        {
          element: 'Icon',
          required: 'No',
          description:
            'Optional leading or trailing icon for visual reinforcement',
        },
        {
          element: 'Spinner',
          required: 'No',
          description:
            'Shown when the button is in a loading state, replaces the icon slot',
        },
      ],
    },
  };

  const getComponentDocs = (key: string) => {
    if (COMPONENT_DOCS[key]) return COMPONENT_DOCS[key];
    const name = getComponentName(key);
    const desc = getComponentDesc(key);
    return {
      tagline: desc.split('.')[0] + '.',
      description: desc,
      whenToUse: [
        `Use ${name} when you need the functionality it provides`,
        'Integrate it into forms, pages, or panels as appropriate',
      ],
      whenNotToUse: [
        'When a simpler alternative achieves the same goal',
        'If the use case falls outside the intended scope of this component',
      ],
      anatomy: [
        {
          element: 'Root',
          required: 'Yes',
          description: `The outermost container element for ${name}`,
        },
        {
          element: 'Content',
          required: 'Yes',
          description: 'The primary content area',
        },
      ],
    };
  };

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
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto' as const,
            padding: '0 16px 16px 16px',
          }}>
          <XDSList density="balanced">
            <XDSListItem
              label="Overview"
              isSelected={selectedComponent === null}
              onClick={() => setSelectedComponent(null)}
            />
            <XDSListItem
              label="Getting started"
              isSelected={
                selectedComponent !== null && activeNav === 'getting-started'
              }
              onClick={() => setActiveNav('getting-started')}
            />
            <XDSListItem
              label="Quick start"
              isSelected={
                selectedComponent !== null && activeNav === 'quick-start'
              }
              onClick={() => setActiveNav('quick-start')}
            />
          </XDSList>

          {COMPONENT_CATEGORIES.map(category => (
            <div key={category.label}>
              <SectionLabel label={category.label.toUpperCase()} />
              <XDSList density="balanced">
                {category.items.map(item => (
                  <XDSListItem
                    key={item.key}
                    label={item.name}
                    isSelected={
                      selectedComponent !== null && activeNav === item.key
                    }
                    onClick={() => {
                      setSelectedComponent(item.key);
                      setActiveNav(item.key);
                    }}
                  />
                ))}
              </XDSList>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto' as const,
          padding: '32px 40px',
        }}>
        {selectedComponent === null ? (
          <div style={{maxWidth: 1200, margin: '0 auto'}}>
            {/* Page header — hero banner */}
            <div
              style={{
                marginBottom: 48,
                backgroundColor:
                  'var(--color-background-accent-muted, #e3f2fd)',
                borderRadius: 24,
                padding: 60,
                display: 'flex',
                alignItems: 'center',
                gap: 48,
                overflow: 'hidden',
                minHeight: 320,
              }}>
              {/* Left: text content */}
              <div style={{flex: 1, minWidth: 0}}>
                <XDSText type="supporting" color="secondary">
                  XDS Design System
                </XDSText>
                <div style={{marginTop: 8}}>
                  <XDSText type="display-1">Web overview</XDSText>
                </div>
                <div style={{marginTop: 16}}>
                  <XDSText type="large" color="secondary">
                    XDS Web React is an open-source UI library created by the
                    XDS Design Team to help developers quickly build beautiful,
                    accessible products.
                  </XDSText>
                </div>
                <div style={{marginTop: 24}}>
                  <XDSButton
                    label="Get started"
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setSelectedComponent('getting-started');
                      setActiveNav('getting-started');
                    }}
                  />
                </div>
              </div>
              {/* Right: blank space */}
              <div style={{flex: 1}} />
            </div>

            {/* Category sections */}
            {COMPONENT_CATEGORIES.map(category => (
              <div key={category.label} style={{marginBottom: 64}}>
                <div style={{marginBottom: 16}}>
                  <XDSText type="display-2">{category.label}</XDSText>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 32,
                  }}>
                  {category.items.map(item => (
                    <div
                      key={item.key}
                      onClick={() => {
                        setSelectedComponent(item.key);
                        setActiveNav(item.key);
                      }}
                      style={{cursor: 'pointer'}}>
                      <XDSCard
                        padding={0}
                        style={{
                          border: 'none',
                          boxShadow: 'none',
                          outline: 'none',
                        }}>
                        {/* Preview area */}
                        <div
                          style={{
                            height: 160,
                            backgroundColor:
                              'var(--color-background-muted, #c4cdd5)',
                            borderRadius: 12,
                          }}
                        />
                        {/* Card body */}
                        <div style={{padding: '12px 0 0'}}>
                          <XDSText type="body" style={{fontWeight: 700}}>
                            {item.name}
                          </XDSText>
                          <div style={{marginTop: 0}}>
                            <XDSText type="body" color="secondary">
                              {item.desc}
                            </XDSText>
                          </div>
                        </div>
                      </XDSCard>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{maxWidth: 840}}>
            {/* Header */}
            <div style={{marginBottom: 8}}>
              <XDSText type="display-1">{getComponentName(activeNav)}</XDSText>
            </div>
            <div style={{marginBottom: 32}}>
              <XDSText type="supporting" color="secondary">
                March 30, 2026 · Updated 5:40 p.m. PST
              </XDSText>
            </div>

            {/* Live Preview Card */}
            <div
              style={{
                border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 48,
              }}>
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
                <XDSText type="supporting" weight="semibold" color="secondary">
                  Live preview
                </XDSText>
                <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                  <XDSButton
                    label="Open in Craft"
                    variant="ghost"
                    size="sm"
                    icon={<ExternalLinkIcon />}
                    onClick={() => setActiveView('craft')}
                  />
                  <XDSDropdownMenu
                    button={{
                      label: 'Variants',
                      variant: 'ghost',
                      size: 'sm',
                    }}
                    hasChevron={false}
                    items={[
                      {label: 'Primary', onClick: () => {}},
                      {label: 'Secondary', onClick: () => {}},
                      {label: 'Ghost', onClick: () => {}},
                    ]}
                  />
                  <XDSButton
                    label="Toggle theme"
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    icon={<ContrastIcon />}
                  />
                  <XDSButton
                    label="Fullscreen"
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    icon={<FullscreenIcon />}
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 280,
                  backgroundColor: 'var(--color-background-muted, #f5f5f5)',
                }}>
                {COMPONENT_PREVIEWS[activeNav] ?? (
                  <XDSText type="supporting" color="secondary">
                    Preview coming soon
                  </XDSText>
                )}
              </div>
            </div>

            {/* Description */}
            {(() => {
              const docs = getComponentDocs(activeNav);
              return (
                <div style={{marginBottom: 48}}>
                  <XDSHeading level={3}>{docs.tagline}</XDSHeading>
                  <div style={{marginTop: 12}}>
                    <XDSText type="body">{docs.description}</XDSText>
                  </div>
                  <div style={{marginTop: 24}}>
                    <XDSHeading level={4}>When to use</XDSHeading>
                    <div style={{marginTop: 8}}>
                      <XDSList density="compact" listStyle="disc">
                        {docs.whenToUse.map((item, i) => (
                          <XDSListItem key={i} label={item} />
                        ))}
                      </XDSList>
                    </div>
                  </div>
                  <div style={{marginTop: 24}}>
                    <XDSHeading level={4}>When NOT to use</XDSHeading>
                    <div style={{marginTop: 8}}>
                      <XDSList density="compact" listStyle="disc">
                        {docs.whenNotToUse.map((item, i) => (
                          <XDSListItem key={i} label={item} />
                        ))}
                      </XDSList>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Anatomy */}
            {(() => {
              const docs = getComponentDocs(activeNav);
              return (
                <div style={{marginBottom: 48}}>
                  <XDSHeading level={2}>Anatomy</XDSHeading>
                  <div
                    style={{
                      marginTop: 16,
                      height: 320,
                      backgroundColor: 'var(--color-background-muted, #f5f5f5)',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <XDSText type="supporting" color="secondary">
                      Anatomy diagram
                    </XDSText>
                  </div>
                  <div style={{marginTop: 16}}>
                    <XDSText type="body">
                      The {getComponentName(activeNav)} is composed of the
                      following elements. Required elements must always be
                      present, while optional elements can be included as
                      needed.
                    </XDSText>
                  </div>
                  <div style={{marginTop: 16}}>
                    <XDSTable
                      data={docs.anatomy as Record<string, unknown>[]}
                      columns={[
                        {key: 'element', header: 'Element'},
                        {key: 'required', header: 'Required'},
                        {key: 'description', header: 'Description'},
                      ]}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}

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
  activeView: 'craft' | 'library' | 'learn' | 'profile';
  setActiveView: (v: 'craft' | 'library' | 'learn' | 'profile') => void;
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
            isIconOnly
            icon={<SearchIcon />}
          />
          <XDSButton
            label="Profile"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<ProfileIcon />}
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
                  icon={<PlusIcon />}>
                  New collection
                </XDSButton>
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
                  icon={<PlusIcon />}>
                  Create new
                </XDSButton>
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
// TemplateFullPreview — full-page preview (like Squarespace template demos)
// ---------------------------------------------------------------------------

const PREVIEW_COLOR_PALETTES = [
  {name: 'Warm', colors: ['#2D2926', '#D4A574', '#F5E6D3', '#FFFFFF']},
  {name: 'Cool', colors: ['#1B2838', '#4A90D9', '#B8D4E3', '#F0F4F8']},
  {name: 'Earth', colors: ['#3D2B1F', '#8B6914', '#C4A35A', '#F5F0E1']},
  {name: 'Mono', colors: ['#111111', '#555555', '#AAAAAA', '#F5F5F5']},
];

const PREVIEW_FONT_PACKS = [
  {heading: 'Georgia', paragraph: 'Helvetica Neue'},
  {heading: 'Playfair Display', paragraph: 'Source Sans Pro'},
  {heading: 'Montserrat', paragraph: 'Merriweather'},
  {heading: 'Futura', paragraph: 'Garamond'},
];

function TemplateFullPreview({
  templateName,
  imageSrc,
  onBack,
  onUse,
  onSelectTemplate,
  showChat = false,
  showEditor = false,
}: {
  templateName: string;
  imageSrc: string;
  onBack: () => void;
  onUse: () => void;
  onSelectTemplate?: (index: number) => void;
  showChat?: boolean;
  showEditor?: boolean;
}) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [editorView, setEditorView] = useState<'preview' | 'code'>('preview');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<string | null>(
    PREVIEW_COLOR_PALETTES[0].name,
  );
  const [selectedFontPack, setSelectedFontPack] = useState<string | null>(
    PREVIEW_FONT_PACKS[0].heading,
  );
  const [panelTab, setPanelTab] = useState<'properties' | 'chat'>('properties');
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-background-body, #f5f5f5)',
      }}>
      {/* LEFT PANEL — details sidebar */}
      <div
        style={{
          width: '30%',
          maxWidth: 380,
          minWidth: 300,
          padding: '16px 0 16px 16px',
          display: 'flex',
          backgroundColor: 'transparent',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(-60px)',
          transition:
            'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms',
        }}>
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--color-background-card, #fff)',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            padding: showChat ? '16px 32px 32px' : '24px 32px 32px',
            overflowY: 'auto' as const,
            display: 'flex',
            flexDirection: 'column' as const,
          }}>
          {/* Back button + tabs on same row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: showChat ? 32 : 8,
              paddingBottom: 0,
              borderBottom: showChat
                ? '1px solid var(--color-divider, #e0e0e0)'
                : 'none',
            }}>
            <XDSButton
              label="Craft"
              variant="ghost"
              size="sm"
              icon={<ArrowLeftIcon />}
              isIconOnly={!!showChat}
              onClick={onBack}
              style={{marginLeft: -8, flexShrink: 0}}
            />
            {showChat && (
              <div style={{display: 'flex', flex: 1}}>
                {(['properties', 'chat'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPanelTab(tab)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      background: 'none',
                      border: 'none',
                      borderBottom:
                        panelTab === tab
                          ? '2px solid var(--color-text-primary, #111)'
                          : '2px solid transparent',
                      marginBottom: -1,
                      cursor: 'pointer',
                      textAlign: 'center' as const,
                      transition: 'border-color 150ms ease',
                    }}>
                    <XDSText
                      type="body"
                      color={panelTab === tab ? 'primary' : 'secondary'}>
                      {tab === 'properties' ? 'Details' : 'Chat'}
                    </XDSText>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat tab content */}
          {showChat && panelTab === 'chat' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                flex: 1,
                minHeight: 0,
              }}>
              {/* Chat messages area */}
              <div style={{flex: 1, overflowY: 'auto' as const}}>
                {/* Welcome message bubble */}
                <div
                  style={{
                    backgroundColor: 'var(--color-background-body, #f1f4f7)',
                    borderRadius: 12,
                    padding: 12,
                  }}>
                  <XDSText type="body">
                    Hi! I can help you customize this template. Try asking me to
                    change colors, layout, or content.
                  </XDSText>
                </div>
              </div>

              {/* Composer pinned to bottom */}
              <div
                style={{
                  borderTop: '1px solid var(--color-divider, #e0e0e0)',
                  padding: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  margin: '0 -32px -32px -32px',
                  paddingInline: 32,
                  paddingBottom: 32,
                }}>
                <XDSButton
                  label="Attach"
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  icon={<PlusIcon />}
                />
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="What should we build?"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: 14,
                    color: 'inherit',
                  }}
                />
                <XDSButton
                  label="Send"
                  variant="primary"
                  size="sm"
                  isIconOnly
                  icon={<SendIcon />}
                  style={{borderRadius: 9999}}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Template name */}
              <XDSText type="display-2">{templateName}</XDSText>

              {/* Description */}
              <div style={{marginTop: 8}}>
                <XDSText type="body" color="secondary">
                  Buttons are clickable elements that are used to trigger
                  actions. They communicate calls to action to the user and
                  allow users to interact with pages in a variety of ways.
                  Button labels express what action will occur when the user
                  interacts with it.
                </XDSText>
              </div>

              {/* Author section */}
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  flexDirection: 'row' as const,
                  alignItems: 'center',
                  gap: 12,
                }}>
                <XDSAvatar
                  size={36}
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face"
                />
                <div style={{display: 'flex', flexDirection: 'column', gap: 0}}>
                  <XDSText type="supporting" color="secondary">
                    Crafted by
                  </XDSText>
                  <XDSText type="body" style={{fontWeight: 600, fontSize: 16}}>
                    Andrea Anderson
                  </XDSText>
                </div>
              </div>

              {/* Stats buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 16,
                  marginLeft: -8,
                  marginRight: -8,
                }}>
                <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                  <XDSButton
                    label="Link"
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    icon={<LinkIcon />}
                  />
                  <XDSDropdownMenu
                    button={{
                      label: 'Share',
                      variant: 'ghost',
                      size: 'sm',
                      isIconOnly: true,
                      icon: <PaperPlaneIcon />,
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
                      {
                        label: 'Claude Code',
                        icon: ClaudeIcon,
                        onClick: () => {},
                      },
                      {label: 'VSCode', icon: VSCodeIcon, onClick: () => {}},
                      {label: 'Cursor', icon: CursorAIIcon, onClick: () => {}},
                    ]}
                  />
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                  <XDSButton
                    label="1,645"
                    variant="ghost"
                    size="sm"
                    icon={<HeartIcon />}
                  />
                  <XDSButton
                    label="892"
                    variant="ghost"
                    size="sm"
                    icon={<BookmarkIcon />}
                  />
                </div>
              </div>

              {/* CTA button */}
              {!showEditor && (
                <div style={{marginTop: 16}}>
                  <XDSButton
                    variant="primary"
                    label="Start crafting"
                    onClick={onUse}
                    size="lg"
                    style={{width: '100%'}}
                  />
                </div>
              )}

              {/* Themes */}
              <div style={{marginTop: 32}}>
                <XDSHeading level={4}>Themes</XDSHeading>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    marginTop: 8,
                  }}>
                  {PREVIEW_COLOR_PALETTES.map(palette => (
                    <div
                      key={palette.name}
                      onClick={() => setSelectedPalette(palette.name)}
                      style={{
                        cursor: 'pointer',
                        border: `2px solid ${selectedPalette === palette.name ? 'var(--color-accent, #0066FF)' : 'transparent'}`,
                        borderRadius: 14,
                        overflow: 'hidden',
                        transition: 'border-color 0.15s ease',
                      }}>
                      <XDSCard padding={0}>
                        <div
                          style={{
                            display: 'flex',
                            overflow: 'hidden',
                            height: 48,
                          }}>
                          {palette.colors.map((color, i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                backgroundColor: color,
                              }}
                            />
                          ))}
                        </div>
                      </XDSCard>
                    </div>
                  ))}
                </div>
              </div>

              {/* Font packs — removed */}
              <div style={{marginTop: 32, display: 'none'}}>
                <XDSHeading level={4}>Font packs</XDSHeading>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    marginTop: 8,
                  }}>
                  {PREVIEW_FONT_PACKS.map(pack => (
                    <div
                      key={pack.heading}
                      onClick={() => setSelectedFontPack(pack.heading)}
                      style={{
                        cursor: 'pointer',
                        border: `2px solid ${selectedFontPack === pack.heading ? 'var(--color-accent, #0066FF)' : 'transparent'}`,
                        borderRadius: 14,
                        overflow: 'hidden',
                        transition: 'border-color 0.15s ease',
                      }}>
                      <XDSCard padding={2}>
                        <div style={{fontFamily: pack.heading}}>
                          <XDSText
                            type="body"
                            style={{fontWeight: 600, fontSize: 16}}>
                            Heading
                          </XDSText>
                        </div>
                        <div style={{fontFamily: pack.paragraph}}>
                          <XDSText type="supporting" color="secondary">
                            Paragraph text
                          </XDSText>
                        </div>
                      </XDSCard>
                    </div>
                  ))}
                </div>
              </div>

              {/* Component used */}
              <div style={{marginTop: 32}}>
                <XDSHeading level={3}>Component used</XDSHeading>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap' as const,
                    gap: 8,
                    marginTop: 8,
                  }}>
                  <XDSToken label="XDSAppShell" />
                  <XDSToken label="XDSTopNav" />
                  <XDSToken label="XDSVStack" />
                  <XDSToken label="XDSHStack" />
                  <XDSToken label="XDSHeading" />
                  <XDSToken label="XDSText" />
                  <XDSToken label="XDSButton" />
                  <XDSToken label="XDSCard" />
                  <XDSToken label="XDSBadge" />
                  <XDSToken label="XDSAvatar" />
                </div>
              </div>

              {/* Keywords */}
              <div style={{marginTop: 32}}>
                <XDSHeading level={3}>Keywords</XDSHeading>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap' as const,
                    gap: 4,
                    marginTop: 8,
                  }}>
                  <XDSToken label="Dashboard" size="sm" />
                  <XDSToken label="Admin" size="sm" />
                  <XDSToken label="Layout" size="sm" />
                  <XDSToken label="Navigation" size="sm" />
                  <XDSToken label="Settings" size="sm" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — preview area */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: 'var(--color-background-body, #f5f5f5)',
          display: 'flex',
          flexDirection: 'column' as const,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(40px)',
          transition:
            'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
        {/* Editor toolbar */}
        <div style={{backgroundColor: 'var(--color-background-body, #f5f5f5)'}}>
          {showEditor ? (
            <XDSToolbar
              label="Template actions"
              startContent={<></>}
              centerContent={
                <XDSSegmentedControl
                  value={viewMode}
                  onChange={(v: string) =>
                    setViewMode(v as 'desktop' | 'mobile')
                  }
                  label="Viewport size"
                  size="sm">
                  <XDSSegmentedControlItem
                    value="desktop"
                    label="Desktop"
                    isLabelHidden
                    icon={<DesktopIcon />}
                  />
                  <XDSSegmentedControlItem
                    value="mobile"
                    label="Mobile"
                    isLabelHidden
                    icon={<PhoneIcon />}
                  />
                </XDSSegmentedControl>
              }
              endContent={
                <>
                  <XDSButton
                    label="Point"
                    variant="ghost"
                    isIconOnly
                    icon={<CursorIcon />}
                  />
                  <XDSDropdownMenu
                    button={{
                      label: 'Theme',
                      variant: 'ghost',
                      isIconOnly: true,
                      icon: <PaletteIcon />,
                    }}
                    hasChevron={false}
                    items={XDS_THEMES.map(t => ({
                      label: t.label,
                      onClick: () => {},
                    }))}
                  />
                  <XDSButton
                    label="Toggle theme"
                    variant="ghost"
                    isIconOnly
                    icon={<ContrastIcon />}
                  />
                  <XDSButton
                    label="Toggle code"
                    variant={editorView === 'code' ? 'secondary' : 'ghost'}
                    isIconOnly
                    icon={<CodeIcon />}
                    onClick={() =>
                      setEditorView(
                        editorView === 'preview' ? 'code' : 'preview',
                      )
                    }
                  />
                  <XDSButton
                    label="Save"
                    variant="ghost"
                    icon={<SaveIcon />}
                    isIconOnly
                    onClick={() => {}}
                  />
                  <XDSDropdownMenu
                    button={{
                      label: 'Share',
                      variant: 'ghost',
                      isIconOnly: true,
                      icon: <PaperPlaneIcon />,
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
                      {
                        label: 'Claude Code',
                        icon: ClaudeIcon,
                        onClick: () => {},
                      },
                      {label: 'VSCode', icon: VSCodeIcon, onClick: () => {}},
                      {label: 'Cursor', icon: CursorAIIcon, onClick: () => {}},
                    ]}
                  />
                </>
              }
            />
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px 24px',
              }}>
              <XDSSegmentedControl
                value={viewMode}
                onChange={(v: string) => setViewMode(v as 'desktop' | 'mobile')}
                label="Viewport size"
                size="sm">
                <XDSSegmentedControlItem
                  value="desktop"
                  label="Desktop"
                  isLabelHidden
                  icon={<DesktopIcon />}
                />
                <XDSSegmentedControlItem
                  value="mobile"
                  label="Mobile"
                  isLabelHidden
                  icon={<PhoneIcon />}
                />
              </XDSSegmentedControl>
            </div>
          )}
        </div>

        {/* Preview — browser frame + image */}
        <div
          style={{
            backgroundColor: 'var(--color-background-body, #f5f5f5)',
            padding: '22px 22px 22px',
            display: !showEditor || editorView === 'preview' ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flex: 1,
            overflow: 'auto',
          }}>
          <div
            style={{
              width: viewMode === 'mobile' ? 375 : '100%',
              maxWidth: viewMode === 'mobile' ? 375 : 1200,
              aspectRatio: viewMode === 'mobile' ? '9 / 19.5' : '16 / 10',
              backgroundColor: '#fff',
              borderRadius: viewMode === 'mobile' ? 36 : 12,
              border: viewMode === 'mobile' ? '10px solid #fff' : 'none',
              boxShadow:
                viewMode === 'mobile'
                  ? '0 8px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)'
                  : '0 8px 40px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              transition:
                'width 0.3s ease, aspect-ratio 0.3s ease, border-radius 0.3s ease',
            }}>
            {/* Device chrome */}
            {viewMode === 'desktop' ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: '#fff',
                  borderBottom: '1px solid #f0f0f0',
                }}>
                <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#e0e0e0',
                    }}
                  />
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#e0e0e0',
                    }}
                  />
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#e0e0e0',
                    }}
                  />
                </div>
              </div>
            ) : null}
            <img
              src={imageSrc}
              alt={templateName}
              style={{
                width: '100%',
                display: 'block',
              }}
            />
          </div>
        </div>

        {/* Code block */}
        <div
          style={{
            margin: 0,
            border: 'none',
            borderRadius: 0,
            backgroundColor: 'var(--color-background-muted, rgba(0,0,0,0.03))',
            overflow: 'auto',
            flex: 1,
            display: showEditor && editorView === 'code' ? 'block' : 'none',
          }}>
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
          <div style={{display: 'flex'}}>
            <div
              style={{
                padding: '12px 12px 12px 16px',
                borderRight: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
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

        {/* Similar templates — only visible in preview mode */}
        {(!showEditor || editorView === 'preview') && (
          <div
            style={{
              width: '100%',
              padding: '24px 32px 32px',
              boxSizing: 'border-box' as const,
              marginTop: 'auto',
              textAlign: 'center' as const,
            }}>
            <XDSHeading level={3}>Similar templates</XDSHeading>
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 12,
                overflowX: 'auto' as const,
                justifyContent: 'center',
              }}>
              {TEMPLATES.slice(0, 4).map((t, i) => (
                <div
                  key={i}
                  onClick={() => onSelectTemplate?.(i)}
                  style={{
                    flex: '0 0 280px',
                    aspectRatio: '1920 / 1200',
                    border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                    backgroundColor: 'var(--color-background-card, #fff)',
                    borderRadius: 8,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}>
                  <img
                    src={t.src}
                    alt={t.name}
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
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TemplateCombinedView — preview + customization + chat in one view
// ---------------------------------------------------------------------------

function TemplateCombinedView({
  templateName,
  imageSrc,
  onBack,
  isGenerating: _isGenerating,
  simulation: _simulation,
}: {
  templateName: string;
  imageSrc: string;
  onBack: () => void;
  isGenerating: boolean;
  simulation: BoidsSimulation;
}) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedPalette, setSelectedPalette] = useState<string | null>(
    PREVIEW_COLOR_PALETTES[0].name,
  );
  const [selectedFontPack, setSelectedFontPack] = useState<string | null>(
    PREVIEW_FONT_PACKS[0].heading,
  );
  const [isVisible, setIsVisible] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [rightPanelTab, setRightPanelTab] = useState('properties');

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });
  }, []);

  return (
    <div style={{display: 'flex', height: '100vh', overflow: 'hidden'}}>
      {/* LEFT PANEL — preview area (~70%) */}
      <div
        style={{
          flex: 7,
          minWidth: 0,
          backgroundColor: 'var(--color-background-body, #f5f5f5)',
          display: 'flex',
          flexDirection: 'column' as const,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(40px)',
          transition:
            'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
        {/* Top bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: '12px 24px',
          }}>
          <div style={{justifySelf: 'start'}}>
            <XDSButton
              label="Templates"
              variant="ghost"
              size="sm"
              icon={<ArrowLeftIcon />}
              onClick={onBack}
            />
          </div>
          <XDSSegmentedControl
            value={viewMode}
            onChange={(v: string) => setViewMode(v as 'desktop' | 'mobile')}
            label="Viewport size"
            size="sm">
            <XDSSegmentedControlItem
              value="desktop"
              label="Desktop"
              isLabelHidden
              icon={<DesktopIcon />}
            />
            <XDSSegmentedControlItem
              value="mobile"
              label="Mobile"
              isLabelHidden
              icon={<PhoneIcon />}
            />
          </XDSSegmentedControl>
          <div style={{justifySelf: 'end'}}>
            <XDSDropdownMenu
              button={{
                label: 'Share',
                variant: 'ghost',
                size: 'sm',
                isIconOnly: true,
                icon: <PaperPlaneIcon />,
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
          </div>
        </div>

        {/* Browser frame with template image */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            padding: '24px 24px 24px',
            overflow: 'auto',
            position: 'relative',
          }}>
          <div
            style={{
              width: viewMode === 'mobile' ? 375 : '100%',
              maxWidth: viewMode === 'mobile' ? 375 : 1200,
              aspectRatio: viewMode === 'mobile' ? '9 / 19.5' : '16 / 10',
              backgroundColor: '#fff',
              borderRadius: viewMode === 'mobile' ? 36 : 12,
              border: viewMode === 'mobile' ? '10px solid #fff' : 'none',
              boxShadow:
                viewMode === 'mobile'
                  ? '0 8px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)'
                  : '0 8px 40px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              transition:
                'width 0.3s ease, aspect-ratio 0.3s ease, border-radius 0.3s ease',
            }}>
            {/* Device chrome */}
            {viewMode === 'desktop' ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: '#fff',
                  borderBottom: '1px solid #f0f0f0',
                }}>
                <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#e0e0e0',
                    }}
                  />
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#e0e0e0',
                    }}
                  />
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#e0e0e0',
                    }}
                  />
                </div>
              </div>
            ) : null}
            <img
              src={imageSrc}
              alt={templateName}
              style={{
                width: '100%',
                display: 'block',
              }}
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR (~30%, max 380px) */}
      <div
        style={{
          flex: 3,
          maxWidth: 380,
          minWidth: 300,
          backgroundColor: 'var(--color-background-card, #fff)',
          borderLeft: '1px solid var(--color-border-default, #e0e0e0)',
          display: 'flex',
          flexDirection: 'column' as const,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(60px)',
          transition:
            'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms',
        }}>
        {/* Tab navigation */}
        <div style={{padding: '0 32px', flexShrink: 0}}>
          <XDSTabList
            value={rightPanelTab}
            onChange={setRightPanelTab}
            size="sm"
            hasDivider>
            <XDSTab value="properties" label="Properties" />
            <XDSTab value="chat" label="Chat" />
          </XDSTabList>
        </div>

        {/* Scrollable content area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto' as const,
            padding: '32px 32px 16px',
            display: 'flex',
            flexDirection: 'column' as const,
          }}>
          {rightPanelTab === 'properties' ? (
            <>
              {/* Section 1 — Template info */}
              <div>
                <XDSHeading level={2}>{templateName}</XDSHeading>
                <div style={{marginTop: 4}}>
                  <XDSText type="body" color="secondary">
                    Continue to customize styles, add features, and more when
                    you start a trial.
                  </XDSText>
                </div>
              </div>

              {/* CTA button */}
              <div style={{marginTop: 16}}>
                <XDSButton
                  variant="primary"
                  label="Start crafting"
                  size="lg"
                  style={{width: '100%'}}
                />
              </div>

              {/* Stats buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 16,
                  marginLeft: -8,
                  marginRight: -8,
                }}>
                <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                  <XDSButton
                    label="Link"
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    icon={<LinkIcon />}
                  />
                  <XDSDropdownMenu
                    button={{
                      label: 'Share',
                      variant: 'ghost',
                      size: 'sm',
                      isIconOnly: true,
                      icon: <PaperPlaneIcon />,
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
                      {
                        label: 'Claude Code',
                        icon: ClaudeIcon,
                        onClick: () => {},
                      },
                      {label: 'VSCode', icon: VSCodeIcon, onClick: () => {}},
                      {label: 'Cursor', icon: CursorAIIcon, onClick: () => {}},
                    ]}
                  />
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                  <XDSButton
                    label="1,645"
                    variant="ghost"
                    size="sm"
                    icon={<HeartIcon />}
                  />
                  <XDSButton
                    label="892"
                    variant="ghost"
                    size="sm"
                    icon={<BookmarkIcon />}
                  />
                </div>
              </div>

              {/* Section 2 — Themes */}
              <div style={{marginTop: 32}}>
                <XDSHeading level={4}>Themes</XDSHeading>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    marginTop: 8,
                  }}>
                  {PREVIEW_COLOR_PALETTES.map(palette => (
                    <div
                      key={palette.name}
                      onClick={() => setSelectedPalette(palette.name)}
                      style={{
                        cursor: 'pointer',
                        border: `2px solid ${selectedPalette === palette.name ? 'var(--color-accent, #0066FF)' : 'transparent'}`,
                        borderRadius: 14,
                        overflow: 'hidden',
                        transition: 'border-color 0.15s ease',
                      }}>
                      <XDSCard padding={0}>
                        <div
                          style={{
                            display: 'flex',
                            overflow: 'hidden',
                            height: 48,
                          }}>
                          {palette.colors.map((color, i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                backgroundColor: color,
                              }}
                            />
                          ))}
                        </div>
                      </XDSCard>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3 — Font packs — removed */}
              <div style={{marginTop: 32, display: 'none'}}>
                <XDSHeading level={4}>Font packs</XDSHeading>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    marginTop: 8,
                  }}>
                  {PREVIEW_FONT_PACKS.map(pack => (
                    <div
                      key={pack.heading}
                      onClick={() => setSelectedFontPack(pack.heading)}
                      style={{
                        cursor: 'pointer',
                        border: `2px solid ${selectedFontPack === pack.heading ? 'var(--color-accent, #0066FF)' : 'transparent'}`,
                        borderRadius: 14,
                        overflow: 'hidden',
                        transition: 'border-color 0.15s ease',
                      }}>
                      <XDSCard padding={2}>
                        <div style={{fontFamily: pack.heading}}>
                          <XDSText
                            type="body"
                            style={{fontWeight: 600, fontSize: 16}}>
                            Heading
                          </XDSText>
                        </div>
                        <div style={{fontFamily: pack.paragraph}}>
                          <XDSText type="supporting" color="secondary">
                            Paragraph text
                          </XDSText>
                        </div>
                      </XDSCard>
                    </div>
                  ))}
                </div>
              </div>

              {/* Author section */}
              <div
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  flexDirection: 'row' as const,
                  alignItems: 'center',
                  gap: 12,
                }}>
                <XDSAvatar
                  size={36}
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face"
                />
                <div style={{display: 'flex', flexDirection: 'column', gap: 0}}>
                  <XDSText type="supporting" color="secondary">
                    Crafted by
                  </XDSText>
                  <XDSText type="body" style={{fontWeight: 600, fontSize: 16}}>
                    Andrea Anderson
                  </XDSText>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Chat welcome message */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: 12,
                  flex: 1,
                }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-background-body, #f5f5f5)',
                    borderRadius: 16,
                    padding: '12px 16px',
                    maxWidth: '85%',
                  }}>
                  <XDSText type="body">
                    Hi! I can help you customize this template. Try asking me to
                    change colors, layout, or content.
                  </XDSText>
                </div>
              </div>

              {/* AI chat composer */}
              <div style={{marginTop: 'auto'}}>
                <div
                  style={{
                    borderRadius: 16,
                    backgroundColor: 'var(--color-background-card, white)',
                    border: '1px solid var(--color-divider, #e0e0e0)',
                    boxShadow:
                      'var(--shadow-medium, 0 2px 8px rgba(0,0,0,0.08))',
                    padding: 8,
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: 4,
                  }}>
                  <div
                    style={{display: 'flex', alignItems: 'center', padding: 8}}>
                    <input
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        fontFamily: 'inherit',
                        fontSize: 14,
                      }}
                      placeholder="Describe your changes..."
                      value={chatPrompt}
                      onChange={e => setChatPrompt(e.target.value)}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      paddingInlineStart: 4,
                    }}>
                    <XDSButton
                      label="Attach"
                      variant="ghost"
                      size="sm"
                      isIconOnly
                      icon={<PlusIcon />}
                    />
                    <XDSButton
                      label="Send"
                      variant="primary"
                      size="sm"
                      isIconOnly
                      icon={<SendIcon />}
                      style={{borderRadius: 9999}}
                    />
                  </div>
                </div>
              </div>
            </>
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
    'craft' | 'library' | 'learn' | 'profile'
  >('craft');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [generatingSource, setGeneratingSource] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<number | null>(null);
  const [useTarget, setUseTarget] = useState<number | null>(null);
  const [previewGenerating, setPreviewGenerating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset preview/editor state when switching views
  useEffect(() => {
    setPreviewTarget(null);
    setUseTarget(null);
    setChatOpen(false);
  }, [activeView]);
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
    setPreviewTarget(null);
    setUseTarget(index);
    setChatOpen(true);
  }, []);

  const handleBackFromUse = useCallback(() => {
    setUseTarget(null);
    setChatOpen(false);
  }, []);

  const handlePreview = useCallback((index: number) => {
    setPreviewTarget(index);
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

  // Classic flat editor layout for 3rd card (index 2) — no floating cards
  if ((previewTarget === 2 || useTarget === 2) && activeView === 'craft') {
    const t = TEMPLATES[2 % TEMPLATES.length];
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
        }}>
        <div
          style={{
            width: 380,
            minWidth: 380,
          }}>
          <ChatPanel
            isGenerating={previewGenerating}
            onSend={handlePreviewSend}
            activeView={activeView}
            setActiveView={setActiveView}
          />
        </div>
        <div
          style={{flex: 1, display: 'flex', flexDirection: 'column' as const}}>
          <ClassicTemplatePreview
            templateName={t.name}
            imageSrc={t.src}
            onBack={() => {
              setPreviewTarget(null);
              setUseTarget(null);
              setChatOpen(false);
            }}
            isGenerating={previewGenerating}
            simulation={simRef.current!}
          />
        </div>
      </div>
    );
  }

  // Combined preview + editor view for 2nd card (index 1)
  if (previewTarget === 1 && activeView === 'craft') {
    const t = TEMPLATES[1];
    return (
      <TemplateFullPreview
        templateName={t.name}
        imageSrc={t.src}
        onBack={() => {
          setPreviewTarget(null);
        }}
        onUse={() => {}}
        onSelectTemplate={index => {
          setPreviewTarget(index);
        }}
        showChat
        showEditor
      />
    );
  }

  // Editor flow for non-2nd cards that went through preview → use
  if (useTarget !== null && useTarget !== 1 && activeView === 'craft') {
    const t = TEMPLATES[useTarget % TEMPLATES.length];
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: 'var(--color-background-body, #f5f5f5)',
        }}>
        <div
          style={{
            width: 380,
            minWidth: 380,
            padding: 16,
            display: 'flex',
            animation: 'slideInLeft 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
          <style>
            {
              '@keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }'
            }
          </style>
          <div
            style={{
              flex: 1,
              backgroundColor: 'var(--color-background-card, #fff)',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column' as const,
            }}>
            <ChatPanel
              isGenerating={previewGenerating}
              onSend={handlePreviewSend}
              activeView={activeView}
              setActiveView={setActiveView}
              templateName={t.name}
              onBack={handleBackFromUse}
            />
          </div>
        </div>
        <div
          style={{flex: 1, display: 'flex', flexDirection: 'column' as const}}>
          <TemplatePreview
            templateName={t.name}
            imageSrc={t.src}
            onBack={handleBackFromUse}
            isGenerating={previewGenerating}
            simulation={simRef.current!}
          />
        </div>
      </div>
    );
  }

  // Preview page for all other cards (two-step: preview → editor)
  if (previewTarget !== null && useTarget === null && activeView === 'craft') {
    const t = TEMPLATES[previewTarget % TEMPLATES.length];
    return (
      <TemplateFullPreview
        templateName={t.name}
        imageSrc={t.src}
        onBack={() => {
          setPreviewTarget(null);
        }}
        onUse={() => {
          setUseTarget(previewTarget);
          setPreviewTarget(null);
          setChatOpen(true);
        }}
        onSelectTemplate={index => {
          setPreviewTarget(index);
        }}
      />
    );
  }

  if (activeView === 'library') {
    return <DocsView activeView={activeView} setActiveView={setActiveView} />;
  }

  if (activeView === 'learn') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: 'var(--color-background-card, white)',
        }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            borderBottom: '1px solid var(--color-border-default, #e0e0e0)',
            backgroundColor: 'var(--color-background-card, white)',
          }}>
          <LogoNav activeView={activeView} setActiveView={setActiveView} />
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <div style={{textAlign: 'center', opacity: 0.5}}>
            <div style={{fontSize: 48, marginBottom: 16}}>📚</div>
            <div style={{marginBottom: 8}}>
              <XDSHeading level={3}>Learn</XDSHeading>
            </div>
            <XDSText type="body" color="secondary">
              Tutorials, guides, and resources — coming soon
            </XDSText>
          </div>
        </div>
      </div>
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
      <AppTopNav
        activeView={activeView}
        setActiveView={setActiveView}
        scrollContainerRef={scrollContainerRef}
      />
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
              onSend={undefined}
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
          <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
            {/* Masonry Grid */}
            <div
              ref={scrollContainerRef}
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
                  <div key={`${template.name}-${i}`}>
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
                      onPreview={() => handlePreview(i)}
                      simulation={simRef.current!}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!chatOpen && <AIComposer />}
    </div>
  );
}
