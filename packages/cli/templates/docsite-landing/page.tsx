'use client';

import {useState, useEffect, useRef, useCallback} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSGrid} from '@xds/core/Grid';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSSkeleton} from '@xds/core/Skeleton';
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

const DUMMY_IMAGE = '/templates/dummy-placeholder.png';

const TEMPLATE_IMAGES = [DUMMY_IMAGE, DUMMY_IMAGE, DUMMY_IMAGE, DUMMY_IMAGE];

// ---------------------------------------------------------------------------
// TemplateCard
// ---------------------------------------------------------------------------

function TemplateCard({
  src,
  name,
  isSelected,
  onSelect,
  isGenerating,
  onMoreLikeThis,
  onUse,
  simulation,
}: {
  src: string;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
  isGenerating: boolean;
  onMoreLikeThis: () => void;
  onUse: () => void;
  simulation: BoidsSimulation;
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
            aspectRatio: '1920 / 1200',
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
              style={{position: 'absolute', top: 8, left: 8, cursor: 'pointer'}}
              onClick={e => {
                e.stopPropagation();
                onSelect();
              }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  backgroundColor: isSelected ? '#fff' : 'transparent',
                  boxShadow: 'var(--shadow-med)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 150ms ease',
                }}>
                {isSelected && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-accent, #0066ff)',
                    }}
                  />
                )}
              </div>
            </div>
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

function ChatPanel({
  isGenerating,
  onSend,
}: {
  isGenerating: boolean;
  onSend?: () => void;
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
    {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none" />
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

import {XDSAppShell} from '@xds/core/AppShell';
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
    </XDSAppShell>
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
      }}>
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '0 16px 16px',
        }}>
        {/* Back button */}
        <div style={{padding: '8px 0'}}>
          <XDSButton
            label="Back"
            variant="ghost"
            icon={<ArrowLeftIcon />}
            onClick={onBack}
            isIconOnly
          />
        </div>

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
                borderBottom: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
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
  {
    id: 'explore',
    label: 'Explore Components',
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

function AppTopNav() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <XDSTopNav
        label="XDS navigation"
        heading={<XDSTopNavHeading heading="XDS" />}
        centerContent={
          <>
            <XDSTopNavItem
              label="Craft"
              href="#"
              isSelected
              style={{height: 'var(--size-element-md, 32px)'}}
            />
            <XDSTopNavItem
              label="Explore"
              href="#"
              style={{height: 'var(--size-element-md, 32px)'}}
            />
            <XDSTopNavItem
              label="Docs"
              href="#"
              style={{height: 'var(--size-element-md, 32px)'}}
            />
          </>
        }
        endContent={
          <>
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
              isIconOnly
            />
          </>
        }
      />
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

const templateNames = [
  'Integrations Dashboard',
  'Admin Console',
  'Developer Portal',
  'App Builder',
];

const REPEATED_IMAGES = Array.from({length: 5}, () => TEMPLATE_IMAGES).flat();

export default function DocsiteLandingTemplate() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
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
    const mql = window.matchMedia('(max-width: 768px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
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

  return (
    <XDSAppShell variant="surface" topNav={<AppTopNav />} contentPadding={0}>
      <div
        style={{
          display: 'flex',
          height: '100%',
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
              templateName={templateNames[useTarget % templateNames.length]}
              imageSrc={REPEATED_IMAGES[useTarget]}
              onBack={handleBackFromUse}
              isGenerating={previewGenerating}
              simulation={simRef.current!}
            />
          ) : (
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: 16,
              }}>
              <div style={{maxWidth: 2000, margin: '0 auto'}}>
                <XDSGrid columns={isMobile ? 1 : 2} gap={2}>
                  {REPEATED_IMAGES.map((src, i) => (
                    <TemplateCard
                      key={`${src}-${i}`}
                      src={src}
                      name={templateNames[i % templateNames.length]}
                      isSelected={selected.has(i)}
                      isGenerating={isGenerating && generatingSource !== i}
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
                  ))}
                </XDSGrid>
              </div>
            </div>
          )}
        </div>
      </div>

      {!chatOpen && <AIComposer />}
    </XDSAppShell>
  );
}
