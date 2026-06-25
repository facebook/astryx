// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Theme Audit Drawer.
 *
 * Mirrors the docsite Theme Editor layout (`apps/sandbox/src/app/
 * (fullscreen)/pages/docsite/ThemeEditorView.tsx`): one flat scroll of
 * color tokens grouped by `COLOR_CATEGORIES` ("Core Semantic", "Text",
 * "Surface Variants", "Palette: Blue", …). Each row shows the pretty
 * token label, a swatch, and an inline ramp + tone editor for the
 * current mode.
 *
 * Pending edits accumulate into a sticky footer; Export opens a modal
 * with a paste-able TS snippet plus an "Apply to source" button that
 * POSTs to `/api/theme-audit/apply` and rewrites the right
 * `defineTheme()` block on disk.
 *
 * Diff-vs-default and free-form filtering UI from the previous version
 * was dropped — the docsite-style category list IS the navigation, and
 * the snap verdict shows up as a subtle pill on each row.
 */

import {useEffect, useMemo, useReducer, useRef, useState} from 'react';
import type {DefinedTheme} from '@astryxdesign/core/theme';

// Astryx components — used in the editor popover, export dialog, and the
// row trigger so the audit drawer's interactive surfaces stay
// consistent with the rest of Astryx instead of a hand-rolled clone of
// each one.
import {Popover} from '@astryxdesign/core/Popover';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

import {TONE_STEPS, type Mode, type RampSeed, type ToneStep} from './colorMath';
import {
  auditSnapToRamps,
  buildTonalUsageMap,
  diffThemeTokens,
  parseTokenColor,
  type SnapAuditEntry,
  type TokenDiff,
  type TokenDiffEntry,
  type TonalUsageMap,
} from './themeAudit';
import {
  buildCustomOverride,
  buildModeOverride,
  composeAlphaHex,
  countOverrides,
  formatHexWithAlpha,
  isValidHex,
  normalizeHex,
  overridesReducer,
  parseHexWithAlpha,
  resolveOverrideHex,
  serializeAsTokensBlock,
  type ModeOverride,
  type OverridesMap,
  type SerializeContext,
} from './themeOverrides';
import {getCategorizedColorTokens, getTokenLabel} from './colorCategories';

// =============================================================================
// Types & exports
// =============================================================================

export interface ThemeAuditData {
  diff: TokenDiff;
  snap: SnapAuditEntry[];
  /** Index by token name for fast lookup in the per-row renderer. */
  snapByToken: Record<string, SnapAuditEntry>;
  /** Diff entry index by token name — drives the "original" swatch on each row. */
  diffByToken: Record<string, TokenDiffEntry>;
  /** Tonal usage map — drives the markers in ThemePalettePreview's Tonal section. */
  usage: TonalUsageMap;
  /** Ramp seeds drive the ramp-name dropdown options. */
  rampSeeds: RampSeed[];
}

/**
 * Compute audit data once per (theme, seeds) pair.
 * Returned to ThemePalettePreview so the tonal markers can read the same
 * usage map the drawer renders, without re-running the snap math.
 */
export function useThemeAudit(
  theme: DefinedTheme,
  rampSeeds: RampSeed[],
): ThemeAuditData {
  return useMemo(() => {
    const diff = diffThemeTokens(theme);
    const snap = auditSnapToRamps(theme, rampSeeds);
    const snapByToken: Record<string, SnapAuditEntry> = {};
    for (const e of snap) {
      snapByToken[e.name] = e;
    }
    const diffByToken: Record<string, TokenDiffEntry> = {};
    for (const e of diff.entries) {
      diffByToken[e.name] = e;
    }
    const usage = buildTonalUsageMap(snap);
    return {diff, snap, snapByToken, diffByToken, usage, rampSeeds};
  }, [theme, rampSeeds]);
}

// =============================================================================
// Style sheet
// =============================================================================

const MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";
const drawerWidth = 520;

const S = {
  toggle: (open: boolean): React.CSSProperties => ({
    position: 'fixed',
    top: 24,
    right: open ? drawerWidth + 16 : 16,
    zIndex: 1001,
    appearance: 'none',
    border: '1px solid var(--color-border-emphasized)',
    background: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-body)',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.02em',
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: 'var(--shadow-med)',
    transition: 'right 200ms ease',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }),
  toggleBadge: (count: number): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    height: 18,
    padding: '0 5px',
    borderRadius: 9,
    background:
      count > 0 ? 'var(--color-accent)' : 'var(--color-background-muted)',
    color: count > 0 ? 'var(--color-on-accent)' : 'var(--color-text-secondary)',
    fontSize: 10,
    fontWeight: 700,
    fontFamily: MONO,
  }),
  drawer: (open: boolean): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: drawerWidth,
    background: 'var(--color-background-surface)',
    color: 'var(--color-text-primary)',
    borderLeft: '1px solid var(--color-border)',
    boxShadow: open ? 'var(--shadow-high)' : 'none',
    transform: open ? 'translateX(0)' : `translateX(${drawerWidth + 16}px)`,
    transition: 'transform 220ms ease',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-family-body)',
  }),
  header: {
    padding: '16px 20px 12px',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  } satisfies React.CSSProperties,
  headerTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  } satisfies React.CSSProperties,
  title: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'var(--font-family-heading)',
  } satisfies React.CSSProperties,
  subtitle: {
    margin: 0,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
  } satisfies React.CSSProperties,
  modeRow: {
    display: 'flex',
    gap: 4,
    padding: '8px 16px',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-background-surface)',
    alignItems: 'center',
  } satisfies React.CSSProperties,
  modeButton: (active: boolean): React.CSSProperties => ({
    appearance: 'none',
    border: '1px solid transparent',
    background: active ? 'var(--color-background-muted)' : 'transparent',
    color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: 'var(--font-family-body)',
  }),
  body: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '4px 20px 24px',
  } satisfies React.CSSProperties,
  // Category header — small uppercase secondary text, intentionally
  // restrained so the rows beneath read as the primary content (matches
  // the docsite editor exactly).
  categoryHeader: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    margin: 0,
    padding: '14px 0 4px',
  } satisfies React.CSSProperties,
  // Each row is a 3-column grid: label · status · editor cluster. We use
  // a CSS grid (not flex) with `minmax(0, 1fr)` on the label column so
  // long token labels truncate cleanly when the drawer is narrow.
  row: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    columnGap: 10,
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--color-border)',
  } satisfies React.CSSProperties,
  labelCell: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  } satisfies React.CSSProperties,
  labelText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } satisfies React.CSSProperties,
  tokenName: {
    fontSize: 10,
    fontFamily: MONO,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } satisfies React.CSSProperties,
  // Right-side editor cluster — fixed grid so the original swatch
  // column, trigger button, and reset link always land in the same
  // horizontal positions across every row regardless of label length
  // or token state. Width tracks: 28px (original swatch) · 1fr (trigger
  // button stretches to fill) · auto (reset link, only when edited).
  editorCell: {
    display: 'grid',
    gridTemplateColumns: '28px minmax(0, 1fr) auto',
    columnGap: 8,
    alignItems: 'center',
    width: 240,
    flexShrink: 0,
  } satisfies React.CSSProperties,
  // Combined swatch + value-label button. The swatch sits flush with
  // the button's left edge (no inset padding) so it visually aligns
  // with the standalone original swatch on its left. Vertical padding
  // matches the swatch border so the button height equals 30px (28px
  // swatch + 2px border = same height as the standalone original).
  triggerButton: {
    appearance: 'none' as const,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 0,
    paddingRight: 10,
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-body)',
    fontSize: 11,
    cursor: 'pointer',
    minWidth: 0,
    width: '100%',
    height: 30,
  } satisfies React.CSSProperties,
  triggerButtonEdited: {
    appearance: 'none' as const,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 0,
    paddingRight: 10,
    borderRadius: 6,
    border: '1px solid var(--color-text-accent)',
    background: 'var(--color-background-body)',
    color: 'var(--color-text-accent)',
    fontFamily: 'var(--font-family-body)',
    fontSize: 11,
    cursor: 'pointer',
    minWidth: 0,
    width: '100%',
    height: 30,
  } satisfies React.CSSProperties,
  // Inline swatch sits flush against the trigger button's left edge.
  // Same 28×28 footprint as the standalone original swatch on the
  // outside, with the same radius matched to the button's inner radius
  // so the swatch corner tucks into the button's corner cleanly.
  swatchInline: {
    width: 28,
    height: 28,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderRight: '1px solid var(--color-border)',
    flexShrink: 0,
  } satisfies React.CSSProperties,
  triggerLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    minWidth: 0,
    flex: 1,
    textAlign: 'left' as const,
    paddingLeft: 8,
  } satisfies React.CSSProperties,
  // "Original" swatch rendered to the left of the active swatch. Always
  // present (even when default === current) so the row geometry is
  // consistent and you can sanity-check the original value at a glance.
  //
  // When the token has no Astryx default (theme-only addition), the caller
  // passes `transparent` and we lay a faint diagonal-stripe pattern on
  // top so the empty slot reads as "no default exists" rather than a
  // glitched render.
  originalSwatch: (color: string): React.CSSProperties => ({
    width: 28,
    height: 28,
    borderRadius: 6,
    background: color,
    border: '1px solid var(--color-border-emphasized)',
    flexShrink: 0,
    backgroundImage:
      color === 'transparent'
        ? 'repeating-linear-gradient(45deg, transparent 0 4px, var(--color-background-muted) 4px 5px)'
        : undefined,
  }),
  // Native <select> used inside the popover's Palette tab for ramp+tone
  // — `DropdownMenu` is heavier than needed for a small list and the
  // native control gives us free keyboard navigation.
  select: {
    appearance: 'none',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
    fontFamily: MONO,
    fontSize: 11,
    padding: '4px 6px',
    borderRadius: 4,
    cursor: 'pointer',
    maxWidth: 90,
  } satisfies React.CSSProperties,
  indirectNote: {
    fontSize: 9.5,
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic' as const,
  } satisfies React.CSSProperties,
  applyFooter: {
    borderTop: '1px solid var(--color-border)',
    padding: '12px 20px',
    background: 'var(--color-background-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  } satisfies React.CSSProperties,
};

// =============================================================================
// Drawer
// =============================================================================

export interface ThemeAuditDrawerProps {
  audit: ThemeAuditData;
  themeName: string;
  /**
   * Controlled pending-overrides state. When provided, the drawer becomes
   * a controlled component: it reads from `overrides` and routes every
   * edit through `dispatchOverrides`. Use this to wire the drawer's
   * edits into a live preview elsewhere on the page
   * (`ThemePalettePreview` does this so pending edits hot-update the
   * rendered components via CSS custom properties).
   *
   * When omitted, the drawer keeps its own internal overrides state.
   * Both `overrides` and `dispatchOverrides` must be provided together
   * or both omitted.
   */
  overrides?: OverridesMap;
  dispatchOverrides?: React.Dispatch<Parameters<typeof overridesReducer>[1]>;
}

export function ThemeAuditDrawer({
  audit,
  themeName,
  overrides: overridesProp,
  dispatchOverrides: dispatchProp,
}: ThemeAuditDrawerProps) {
  const [open, setOpen] = useState(false);
  // Mode toggle drives which side of light-dark() the swatches reflect.
  // We intentionally only show one mode at a time — the docsite editor
  // does the same and it keeps each row to a single editable hex.
  const [mode, setMode] = useState<Mode>('light');
  // Controlled or uncontrolled: if the parent passed both `overrides` and
  // `dispatchOverrides`, use them; otherwise keep our own reducer.
  const emptyOverrides = {};
  const [internalOverrides, dispatchInternal] = useReducer(
    overridesReducer,
    emptyOverrides as OverridesMap,
  );
  const overrides = overridesProp ?? internalOverrides;
  const dispatchOverrides = dispatchProp ?? dispatchInternal;
  // Brief "Copied" confirmation in the footer after a successful copy.
  const [justCopied, setJustCopied] = useState(false);

  const overrideCount = countOverrides(overrides);

  // Build current-value context so the export formatter knows what to fill
  // in for the side of a tuple the user didn't reassign.
  const serializeCtx: SerializeContext = useMemo(() => {
    const map: SerializeContext['currentTokenValues'] = {};
    for (const e of audit.snap) {
      map[e.name] = {light: e.light, dark: e.dark};
    }
    return {currentTokenValues: map};
  }, [audit.snap]);

  // LLM-friendly snippet — bare `tokens: { ... }` block prefixed with an
  // instruction prompt naming the target file path and the apply rule.
  // Pasting into Cursor / Claude / any other coding agent gives the model
  // enough context to apply the edits without further instruction.
  const promptSnippet = useMemo(() => {
    if (overrideCount === 0) {
      return '';
    }
    const inner = serializeAsTokensBlock(overrides, serializeCtx);
    const filePath = `packages/themes/${themeName}/src/${themeName}Theme.ts`;
    return [
      `Apply the following ${overrideCount} token override${overrideCount === 1 ? '' : 's'} to ${filePath}.`,
      '',
      'Rules:',
      `- Locate the \`defineTheme(...)\` call and find the existing \`tokens: { ... }\` block inside it.`,
      `- For each entry below, find a line whose key matches the token name and replace its value with the value below. Preserve indentation, quote style, and trailing comma. Replace any existing trailing inline comment with the annotation comment provided.`,
      `- If a token is not present, insert a new line at the bottom of the \`tokens\` block (just before the closing \`}\`) using the same indentation and quote style as sibling entries.`,
      `- For \`--color-syntax-*\` entries: prefer to update the \`defineSyntaxTheme({ tokens: { ... } })\` block instead. Strip the \`--color-syntax-\` prefix to get the key name (e.g. \`--color-syntax-keyword\` → \`keyword\`). Only fall back to inserting them as direct \`--color-syntax-*\` tokens inside \`defineTheme.tokens\` if no \`defineSyntaxTheme\` block exists.`,
      `- Do not modify any other tokens, comments, or surrounding code.`,
      '',
      inner,
    ].join('\n');
  }, [overrides, serializeCtx, themeName, overrideCount]);

  const handleCopySnippet = async () => {
    if (!promptSnippet) {
      return;
    }
    try {
      await navigator.clipboard.writeText(promptSnippet);
      setJustCopied(true);
      // Auto-clear the confirmation after a beat so the footer text
      // doesn't permanently say "Copied" — it should fade back to the
      // pending count.
      setTimeout(() => setJustCopied(false), 1800);
    } catch {
      // Clipboard permission denied (rare; some browsers when not
      // focused). Surface no UI fallback in this direct-copy flow —
      // the user can re-trigger after focusing the page. A future
      // version could re-introduce a preview modal as the fallback.
    }
  };

  // Pre-bucket tokens into the docsite categories. We pass the *union*
  // of every color token the audit knows about (theme-defined + Astryx
  // defaults) so anything not covered by the curated categories falls
  // into the trailing "Other Colors" / "Syntax Highlighting" buckets
  // instead of being silently hidden.
  const categorized = useMemo(() => {
    const known = new Set<string>();
    for (const e of audit.snap) {
      known.add(e.name);
    }
    for (const e of audit.diff.entries) {
      known.add(e.name);
    }
    return getCategorizedColorTokens(known);
  }, [audit.snap, audit.diff.entries]);

  return (
    <>
      <button
        type="button"
        style={S.toggle(open)}
        onClick={() => setOpen(o => !o)}>
        Tokens
        {overrideCount > 0 && (
          <span style={S.toggleBadge(overrideCount)} title="Pending edits">
            {overrideCount}
          </span>
        )}
      </button>
      <aside style={S.drawer(open)} aria-hidden={!open}>
        <div style={S.header}>
          <div style={S.headerTopRow}>
            <h2 style={S.title}>Tokens · {themeName}</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close audit panel"
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
                padding: 4,
              }}>
              ×
            </button>
          </div>
          <p style={S.subtitle}>
            Reassign any token to a tonal-ramp step. Pending edits collect
            below; Export to copy or Apply to write back to source.
          </p>
        </div>
        <div style={S.modeRow}>
          <button
            type="button"
            style={S.modeButton(mode === 'light')}
            onClick={() => setMode('light')}>
            Light
          </button>
          <button
            type="button"
            style={S.modeButton(mode === 'dark')}
            onClick={() => setMode('dark')}>
            Dark
          </button>
        </div>
        <div style={S.body}>
          {categorized.map(({category, tokens}) => {
            // Skip categories whose tokens have no audit entries at all
            // (the theme doesn't define any of them) so we don't render
            // empty headers.
            const visibleTokens = tokens.filter(t => audit.snapByToken[t]);
            if (visibleTokens.length === 0) {
              return null;
            }
            return (
              <div key={category}>
                <h3 style={S.categoryHeader}>{category}</h3>
                {visibleTokens.map(tokenName => (
                  <ColorRow
                    key={tokenName}
                    tokenName={tokenName}
                    snap={audit.snapByToken[tokenName]}
                    diff={audit.diffByToken[tokenName]}
                    rampSeeds={audit.rampSeeds}
                    mode={mode}
                    override={overrides[tokenName]?.[mode]}
                    onPickPalette={(rampName, tone, alpha) => {
                      const seed = audit.rampSeeds.find(
                        s => s.name === rampName,
                      );
                      if (!seed) {
                        return;
                      }
                      dispatchOverrides({
                        type: 'set',
                        token: tokenName,
                        mode,
                        override: buildModeOverride(seed, tone, mode, alpha),
                      });
                    }}
                    onPickCustom={hex =>
                      dispatchOverrides({
                        type: 'set',
                        token: tokenName,
                        mode,
                        // buildCustomOverride parses alpha out of the hex
                        // input itself (#aabbccdd / '#aabbcc 10%' both work).
                        override: buildCustomOverride(hex),
                      })
                    }
                    onReset={() =>
                      dispatchOverrides({
                        type: 'clearMode',
                        token: tokenName,
                        mode,
                      })
                    }
                  />
                ))}
              </div>
            );
          })}
        </div>
        {overrideCount > 0 && (
          <div style={S.applyFooter}>
            <Text type="supporting" color="secondary">
              {justCopied
                ? 'Copied to clipboard'
                : `${overrideCount} token${overrideCount === 1 ? '' : 's'} pending`}
            </Text>
            <HStack gap={2}>
              <Button
                label="Discard"
                variant="ghost"
                size="sm"
                onClick={() => dispatchOverrides({type: 'reset'})}
              />
              <Button
                label={`Copy snippet (${overrideCount})`}
                variant="primary"
                size="sm"
                onClick={handleCopySnippet}
              />
            </HStack>
          </div>
        )}
      </aside>
    </>
  );
}

// =============================================================================
// ColorRow
// =============================================================================

interface ColorRowProps {
  tokenName: string;
  snap: SnapAuditEntry;
  diff: TokenDiffEntry | undefined;
  rampSeeds: RampSeed[];
  mode: Mode;
  override: ModeOverride | undefined;
  /**
   * Commit a palette pick. `alpha` is the original token's alpha
   * (0-1, default 1) — passed through so a snap on a 10%-alpha overlay
   * commits the ramp swatch with the alpha layered back on.
   */
  onPickPalette: (rampName: string, tone: ToneStep, alpha?: number) => void;
  /**
   * Commit a custom hex pick. The hex string may include alpha
   * (8-digit `#aabbccdd` or `'#aabbcc 10%'`); `buildCustomOverride`
   * parses it and embeds the alpha on the override.
   */
  onPickCustom: (hex: string) => void;
  onReset: () => void;
}

function ColorRow({
  tokenName,
  snap,
  diff,
  rampSeeds,
  mode,
  override,
  onPickPalette,
  onPickCustom,
  onReset,
}: ColorRowProps) {
  const sourceHex = mode === 'light' ? snap.light : snap.dark;
  const match = mode === 'light' ? snap.lightMatch : snap.darkMatch;
  // Per-mode alpha — preserved end-to-end so a snap on a 10%-alpha
  // overlay token commits the ramp swatch with `1A` (10%) appended.
  const sourceAlpha = mode === 'light' ? snap.alphaLight : snap.alphaDark;
  const activeAlpha = override?.alpha ?? sourceAlpha;
  // Active hex — base 6-digit (no alpha). `activeHexWithAlpha` is the
  // 8-digit form used for the visible swatch + the popover preview so
  // transparency is honored everywhere it matters visually.
  const activeHexBase = override?.hex
    ? normalizeHex(override.hex)
    : (sourceHex ?? '');
  const activeHexWithAlpha = activeHexBase
    ? composeAlphaHex(activeHexBase, activeAlpha)
    : '';

  // Resolve the Astryx-default value for this token in the active mode.
  // Always rendered as the leftmost square so the row geometry is
  // consistent across the table, even when default === current. The
  // default's own alpha is layered back on so the comparison swatch
  // reads accurately for transparent tokens (overlay, shadow, etc.).
  const defaultParsed = diff?.defaultValue
    ? parseTokenColor(diff.defaultValue)
    : null;
  const defaultHexBase =
    mode === 'light'
      ? (defaultParsed?.light ?? null)
      : (defaultParsed?.dark ?? null);
  const defaultAlpha =
    mode === 'light'
      ? (defaultParsed?.alphaLight ?? 1)
      : (defaultParsed?.alphaDark ?? 1);
  const defaultHexWithAlpha = defaultHexBase
    ? composeAlphaHex(defaultHexBase, defaultAlpha)
    : null;

  // Single-source label rendered inside the trigger button:
  //   - On-ramp (auto-detected exact/snapped, or edited via palette) → "Blue T35"
  //   - Off-ramp (auto-detected near/off, or edited via custom hex)  → "#28282a"
  // Alpha < 1 appends ` · 10%` so transparency is visible at a scan.
  // All editing happens in the popover — the trigger is read-only.
  const inputDisplay = (() => {
    let label: string;
    if (override?.kind === 'palette') {
      label = `${override.rampName} T${override.tone}`;
    } else if (
      !override &&
      match &&
      (match.verdict === 'exact' || match.verdict === 'snapped')
    ) {
      label = `${match.rampName} T${match.tone}`;
    } else {
      label = activeHexBase;
    }
    return activeAlpha < 1
      ? `${label} · ${Math.round(activeAlpha * 100)}%`
      : label;
  })();
  // Edited rows wear the accent color on the input so pending changes
  // are immediately scannable; unedited rows use the default border.
  const inputEdited = !!override;

  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div style={S.row}>
      <div style={S.labelCell}>
        <span style={S.labelText} title={tokenName}>
          {getTokenLabel(tokenName)}
        </span>
        <span style={S.tokenName}>{tokenName}</span>
        {snap.indirect && (
          <span style={S.indirectNote}>indirect (var() reference)</span>
        )}
      </div>
      <div style={S.editorCell}>
        <div
          style={S.originalSwatch(defaultHexWithAlpha ?? 'transparent')}
          title={
            defaultHexWithAlpha
              ? `Original (Astryx default): ${formatHexWithAlpha(defaultHexBase ?? '#000000', defaultAlpha)}`
              : 'No Astryx default — token added by theme'
          }
          aria-label={
            defaultHexWithAlpha
              ? `Original default value: ${defaultHexWithAlpha}`
              : 'No default value'
          }
        />
        {/* Trigger lives inside Popover — it auto-locates the
            <button>, manages anchor positioning via CSS anchor
            positioning, handles outside-click + Esc + focus
            management, and stacks correctly above sibling content
            without needing a manual z-index. */}
        <Popover
          isOpen={popoverOpen}
          onOpenChange={setPopoverOpen}
          isEnabled={!snap.indirect}
          placement="below"
          alignment="end"
          width={300}
          hasCloseButton={false}
          content={
            <EditorPopoverContent
              mode={mode}
              tokenName={tokenName}
              currentHex={activeHexBase || '#000000'}
              currentAlpha={activeAlpha}
              override={override}
              // Smart default: open Palette tab when the current value
              // sits cleanly on a ramp (exact / snapped / edited via
              // palette); open Custom tab otherwise so the immediate
              // affordance matches the value's actual nature.
              initialTab={
                override?.kind === 'palette' ||
                (!override &&
                  (match?.verdict === 'exact' || match?.verdict === 'snapped'))
                  ? 'palette'
                  : 'custom'
              }
              rampSeeds={rampSeeds}
              // Pre-select the closest auto-detected ramp+tone so the
              // palette tab opens in a useful position even when the
              // current value is off-ramp.
              paletteHint={
                override?.kind === 'palette'
                  ? {rampName: override.rampName, tone: override.tone}
                  : match
                    ? {rampName: match.rampName, tone: match.tone as ToneStep}
                    : null
              }
              onPickPalette={(rampName, tone, alpha) => {
                onPickPalette(rampName, tone, alpha);
                setPopoverOpen(false);
              }}
              onPickCustom={hex => {
                onPickCustom(hex);
                setPopoverOpen(false);
              }}
            />
          }>
          <button
            type="button"
            style={inputEdited ? S.triggerButtonEdited : S.triggerButton}
            disabled={snap.indirect}
            aria-label={`Edit ${getTokenLabel(tokenName)} (${mode}) — current value: ${activeHexWithAlpha}`}>
            <span
              style={{
                ...S.swatchInline,
                background: activeHexWithAlpha || '#000000',
              }}
              aria-hidden="true"
            />
            <span style={S.triggerLabel}>{inputDisplay}</span>
          </button>
        </Popover>
        {override ? (
          <Button
            label="reset"
            variant="ghost"
            size="sm"
            onClick={onReset}
          />
        ) : match && (match.verdict === 'near' || match.verdict === 'off') ? (
          // "Snap to nearest ramp step" — surfaces the auto-detected
          // closest match as a one-click action so the user doesn't
          // have to open the popover and pick the dropdowns manually
          // when they just want to round the row to its closest ramp.
          // Only shown for `near` / `off` rows since `exact` / `snapped`
          // rows are already on-ramp and `edited` rows show `reset`
          // instead.
          //
          // Original alpha is preserved through the snap — committing
          // a snap on a 10%-alpha overlay token writes the ramp
          // swatch with `1A` (10%) appended, not the bare 6-digit hex.
          <Button
            label="snap"
            variant="ghost"
            size="sm"
            tooltip={
              activeAlpha < 1
                ? `Snap to ${match.rampName} T${match.tone} · ${Math.round(activeAlpha * 100)}% (ΔE ${match.deltaE.toFixed(1)})`
                : `Snap to ${match.rampName} T${match.tone} (ΔE ${match.deltaE.toFixed(1)})`
            }
            onClick={() =>
              onPickPalette(match.rampName, match.tone as ToneStep, activeAlpha)
            }
          />
        ) : null}
      </div>
    </div>
  );
}

// =============================================================================
// Editor popover content — rendered inside <Popover> as the `content` prop
// =============================================================================

interface EditorPopoverContentProps {
  mode: Mode;
  tokenName: string;
  /** Base 6-digit hex, no alpha. Alpha is supplied separately via
   *  `currentAlpha` so we can mix and match. */
  currentHex: string;
  /** Original alpha (0-1, default 1). Pre-fills the alpha control on
   *  open so transparency round-trips through the popover. */
  currentAlpha: number;
  override: ModeOverride | undefined;
  initialTab: 'custom' | 'palette';
  rampSeeds: RampSeed[];
  paletteHint: {rampName: string; tone: ToneStep} | null;
  onPickPalette: (rampName: string, tone: ToneStep, alpha?: number) => void;
  onPickCustom: (hex: string) => void;
}

/**
 * Body of the editor popover. The popover chrome (positioning, outside-
 * click, Esc, focus management) is provided by `Popover`; this is just
 * the content that renders inside.
 *
 * Both tabs commit edits live — picking a new tone or dragging the color
 * picker fires the appropriate `onPick*` callback immediately, and the
 * parent row closes the popover after a successful pick.
 */
function EditorPopoverContent({
  mode,
  tokenName,
  currentHex,
  currentAlpha,
  override,
  initialTab,
  rampSeeds,
  paletteHint,
  onPickPalette,
  onPickCustom,
}: EditorPopoverContentProps) {
  const [tab, setTab] = useState<'custom' | 'palette'>(initialTab);

  // Lift the in-progress selections out of the tabs so the preview
  // swatch can reflect "what would this commit produce?" rather than
  // the row's current value. Without this, opening the popover on a
  // near/off row shows the auto-detected ramp+tone in the dropdowns
  // (which the user sees as a *suggestion*) but the preview shows the
  // current source color — the two get visually out of sync.
  const initialPaletteRamp =
    override?.kind === 'palette'
      ? override.rampName
      : (paletteHint?.rampName ?? rampSeeds[0]?.name ?? '');
  const initialPaletteTone = (
    override?.kind === 'palette' ? override.tone : (paletteHint?.tone ?? 50)
  ) as ToneStep;
  const [paletteRamp, setPaletteRamp] = useState<string>(initialPaletteRamp);
  const [paletteTone, setPaletteTone] = useState<ToneStep>(initialPaletteTone);
  // Editable alpha lives at the popover level so both tabs can mutate
  // it independently of the underlying base hex / ramp+tone selection.
  // Initialised to the row's current alpha so the percent input opens
  // pre-filled with the existing transparency. Stored as a 0-100
  // integer (matches the input's units) and converted to 0-1 only
  // when emitted to onPick callbacks / preview composition.
  const [palettePct, setPalettePct] = useState<number>(
    Math.round(currentAlpha * 100),
  );
  // Custom tab draft starts in pretty form (`'#hex N%'`) so the input
  // shows the alpha suffix on open — keeps the round-trip consistent
  // with what the row's trigger label displays.
  const [customDraft, setCustomDraft] = useState<string>(
    formatHexWithAlpha(currentHex, currentAlpha),
  );
  const [customPct, setCustomPct] = useState<number>(
    Math.round(currentAlpha * 100),
  );

  // Resolved hex for the swatch — computed from whichever tab is
  // active and always carries the active alpha so the preview swatch
  // shows transparency accurately. Palette tab → ramp+tone resolved via
  // the canonical generator + palettePct. Custom tab → user's typed
  // draft + customPct (the input may also embed alpha via the `'#hex N%'`
  // syntax; we honour that when present, otherwise apply customPct).
  const seedForRamp = rampSeeds.find(s => s.name === paletteRamp);
  const previewHex = (() => {
    if (tab === 'palette' && seedForRamp) {
      const baseHex = resolveOverrideHex(seedForRamp, paletteTone, mode);
      return composeAlphaHex(baseHex, palettePct / 100);
    }
    if (isValidHex(customDraft)) {
      const parsed = parseHexWithAlpha(customDraft);
      // The input's embedded alpha (if any) wins over the stepper —
      // typing `'#hex 25%'` is a more direct gesture than spinning the
      // separate Opacity input. They're kept in sync via setCustomPct
      // when the input string includes a percent.
      return composeAlphaHex(parsed.hex, parsed.alpha);
    }
    return composeAlphaHex(currentHex, customPct / 100);
  })();

  return (
    <VStack gap={3} style={{padding: 4, minWidth: 0}}>
      <TabList
        value={tab}
        onChange={v => setTab(v as 'custom' | 'palette')}
        layout="fill"
        size="sm"
        hasDivider>
        <Tab value="custom" label="Custom" />
        <Tab value="palette" label="Palette" />
      </TabList>
      {/* Live preview reflects the in-progress selection, NOT the row's
          current value. So when the user adjusts a dropdown, the swatch
          updates to show what committing would produce — even before
          they actually pick. */}
      <div
        style={{
          width: '100%',
          height: 48,
          borderRadius: 8,
          border: '1px solid var(--color-border-emphasized)',
          background: previewHex,
        }}
        aria-label={`Preview: ${previewHex}`}
      />
      {tab === 'custom' ? (
        <CustomTab
          currentHex={composeAlphaHex(currentHex, currentAlpha)}
          draft={customDraft}
          setDraft={(next: string) => {
            setCustomDraft(next);
            // Keep the Opacity stepper in sync when the user types a
            // value that embeds alpha — otherwise the two affordances
            // could fall out of agreement and confuse the preview.
            if (isValidHex(next)) {
              const parsed = parseHexWithAlpha(next);
              setCustomPct(Math.round(parsed.alpha * 100));
            }
          }}
          alphaPct={customPct}
          setAlphaPct={setCustomPct}
          mode={mode}
          tokenName={tokenName}
          onPick={onPickCustom}
        />
      ) : (
        <PaletteTab
          rampSeeds={rampSeeds}
          mode={mode}
          tokenName={tokenName}
          rampName={paletteRamp}
          setRampName={setPaletteRamp}
          tone={paletteTone}
          setTone={setPaletteTone}
          alphaPct={palettePct}
          setAlphaPct={setPalettePct}
          onPick={(rampName, tone, alphaOverride) =>
            onPickPalette(rampName, tone, alphaOverride ?? palettePct / 100)
          }
        />
      )}
    </VStack>
  );
}

function CustomTab({
  currentHex,
  draft,
  setDraft,
  alphaPct,
  setAlphaPct,
  mode,
  tokenName,
  onPick,
}: {
  currentHex: string;
  /** Controlled draft hex — lives in EditorPopoverContent so the
   *  preview swatch can react to typing without committing. */
  draft: string;
  setDraft: (value: string) => void;
  /** Controlled alpha percentage (0-100). Round-trips with the alpha
   *  embedded in `draft` (typing `'#hex 25%'` updates this too). */
  alphaPct: number;
  setAlphaPct: (next: number) => void;
  mode: Mode;
  tokenName: string;
  onPick: (hex: string) => void;
}) {
  // Hidden native color input — opened programmatically when the
  // start-icon swatch inside the hex field is clicked. We keep the
  // visible affordance to a single text-style input and tuck the OS
  // color picker behind a small clickable swatch glyph (matches the
  // Figma / Linear pattern for hex+picker hybrid fields).
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const openNativePicker = () => {
    const el = colorInputRef.current;
    if (!el) {
      return;
    }
    if (typeof el.showPicker === 'function') {
      el.showPicker();
    } else {
      el.click();
    }
  };
  // Currently-resolved swatch chip color — alpha-baked so the chip
  // matches the typed value's transparency (matches Figma / Linear
  // hybrid hex+picker fields). The OS color picker only handles
  // 6-digit hex, so dragging the picker preserves the input's alpha
  // while updating the base color.
  const draftParsed = isValidHex(draft)
    ? parseHexWithAlpha(draft)
    : parseHexWithAlpha(currentHex);
  const swatchColor = composeAlphaHex(draftParsed.hex, draftParsed.alpha);

  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="secondary" style={{minWidth: 48}}>
          Hex
        </Text>
        <div style={{flex: 1, position: 'relative'}}>
          <TextInput
            label={`Hex value for ${tokenName} (${mode})`}
            isLabelHidden
            size="sm"
            value={draft}
            onChange={(next: string) => setDraft(next)}
            onEnter={() => {
              if (isValidHex(draft)) {
                // Compose the typed hex with the current alpha percent
                // so a value of `'#abcdef'` (no inline alpha) still
                // commits with the popover's Opacity stepper applied.
                const parsed = parseHexWithAlpha(draft);
                const next = formatHexWithAlpha(parsed.hex, alphaPct / 100);
                onPick(next);
              } else {
                setDraft(formatHexWithAlpha(currentHex, alphaPct / 100));
              }
            }}
            placeholder="#000000 100%"
            startIcon={
              // Clickable swatch chip inside the input. `aria-haspopup`
              // signals the OS color picker affordance to assistive tech.
              <button
                type="button"
                onClick={e => {
                  // The wrapper steals click → focus the input. We
                  // stop propagation so clicking the swatch doesn't
                  // also yank focus into the text field.
                  e.stopPropagation();
                  openNativePicker();
                }}
                aria-label={`Open color picker for ${tokenName} (${mode})`}
                aria-haspopup="dialog"
                style={{
                  appearance: 'none',
                  width: 18,
                  height: 18,
                  padding: 0,
                  borderRadius: 4,
                  border: '1px solid var(--color-border-emphasized)',
                  background: swatchColor,
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
              />
            }
          />
          {/* Hidden color input — receives the programmatic showPicker()
              call so the OS color wheel pops up where the user clicked
              the swatch chip. The OS picker only emits 6-digit hex; we
              preserve the input's alpha by re-rendering the draft in
              pretty form (`'#newhex N%'`) and routing that through onPick. */}
          <input
            ref={colorInputRef}
            type="color"
            value={normalizeHex(draftParsed.hex)}
            onChange={e => {
              const nextBase = normalizeHex(e.target.value);
              const nextDraft = formatHexWithAlpha(nextBase, alphaPct / 100);
              setDraft(nextDraft);
              onPick(nextDraft);
            }}
            aria-hidden="true"
            tabIndex={-1}
            style={{
              position: 'absolute',
              inset: 0,
              width: 0,
              height: 0,
              opacity: 0,
              border: 'none',
              padding: 0,
              margin: 0,
              pointerEvents: 'none',
            }}
          />
        </div>
      </HStack>
      <AlphaInput
        alphaPct={alphaPct}
        setAlphaPct={(nextPct: number) => {
          setAlphaPct(nextPct);
          // Re-emit the draft so the input's pretty form stays in
          // sync with the stepper, AND commit the change live so the
          // preview surface updates without a separate Enter press.
          if (isValidHex(draft)) {
            const parsed = parseHexWithAlpha(draft);
            const nextDraft = formatHexWithAlpha(parsed.hex, nextPct / 100);
            setDraft(nextDraft);
            onPick(nextDraft);
          }
        }}
        labelFor={`Opacity for ${tokenName} (${mode})`}
      />
    </VStack>
  );
}

/**
 * Numeric Opacity stepper input shared by both popover tabs. Renders
 * as `[Opacity %]  [_ 50 _]` — TextInput in number mode with native
 * step controls + a trailing "%" affordance. Range clamped 0-100;
 * non-numeric input snaps back to the current value.
 */
function AlphaInput({
  alphaPct,
  setAlphaPct,
  labelFor,
}: {
  alphaPct: number;
  setAlphaPct: (next: number) => void;
  labelFor: string;
}) {
  const [draft, setDraft] = useState<string>(String(alphaPct));
  // Keep the local draft in sync when the parent's alpha changes
  // (e.g. user typed `'#hex 30%'` in the Hex input above).
  useEffect(() => {
    setDraft(String(alphaPct));
  }, [alphaPct]);

  const commit = (raw: string) => {
    const n = Number(raw.replace(/%$/, '').trim());
    if (!Number.isFinite(n)) {
      setDraft(String(alphaPct));
      return;
    }
    const clamped = Math.max(0, Math.min(100, Math.round(n)));
    setDraft(String(clamped));
    if (clamped !== alphaPct) {
      setAlphaPct(clamped);
    }
  };

  return (
    <HStack gap={2} vAlign="center">
      <Text type="supporting" color="secondary" style={{minWidth: 48}}>
        Opacity
      </Text>
      {/* Stretch to fill the column so the input lines up with the
          Ramp/Tone selects above (which use flex: 1, maxWidth: none). */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          position: 'relative',
        }}>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={draft}
          aria-label={labelFor}
          onChange={e => setDraft(e.target.value)}
          onBlur={e => commit(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              commit((e.target as HTMLInputElement).value);
            }
          }}
          style={{
            flex: 1,
            width: '100%',
            border: '1px solid var(--color-border)',
            borderRadius: 4,
            padding: '4px 22px 4px 6px',
            fontFamily: MONO,
            fontSize: 11,
            background: 'var(--color-background-body)',
            color: 'var(--color-text-primary)',
            outline: 'none',
          }}
        />
        {/* Trailing `%` glyph rendered as an absolutely-positioned
            suffix inside the input's right padding so it doesn't add
            its own column width — keeps the input edge aligned with
            the Ramp/Tone selects above. */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'var(--font-family-body)',
            fontSize: 11,
            color: 'var(--color-text-secondary)',
            pointerEvents: 'none',
          }}>
          %
        </span>
      </div>
    </HStack>
  );
}

function PaletteTab({
  rampSeeds,
  mode,
  tokenName,
  rampName,
  setRampName,
  tone,
  setTone,
  alphaPct,
  setAlphaPct,
  onPick,
}: {
  rampSeeds: RampSeed[];
  mode: Mode;
  tokenName: string;
  /** Controlled selections live in EditorPopoverContent so the
   *  preview swatch can react to dropdown changes without committing. */
  rampName: string;
  setRampName: (value: string) => void;
  tone: ToneStep;
  setTone: (value: ToneStep) => void;
  /** Controlled alpha percentage (0-100). Editing it commits the
   *  current ramp+tone with the new alpha so the preview updates live. */
  alphaPct: number;
  setAlphaPct: (next: number) => void;
  /** Third arg (`alphaOverride` 0-1) lets the Opacity stepper pass the
   *  *new* alpha alongside the unchanged ramp+tone, side-stepping the
   *  React state-flush race: by the time `onPick` runs from the
   *  Opacity handler, the parent's `palettePct` closure is still the
   *  OLD value. The optional override wins when supplied. */
  onPick: (rampName: string, tone: ToneStep, alphaOverride?: number) => void;
}) {
  // Native <select>s here rather than DropdownMenu — the menu
  // component is heavier than needed for a 10-item ramp / 21-step tone
  // picker, and the native control gives us free keyboard navigation.
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="secondary" style={{minWidth: 48}}>
          Ramp
        </Text>
        <select
          value={rampName}
          onChange={e => {
            setRampName(e.target.value);
            onPick(e.target.value, tone);
          }}
          style={{...S.select, flex: 1, maxWidth: 'none'}}
          aria-label={`Ramp for ${tokenName} (${mode})`}>
          {rampSeeds.map(s => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </HStack>
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="secondary" style={{minWidth: 48}}>
          Tone
        </Text>
        <select
          value={tone}
          onChange={e => {
            const next = Number(e.target.value) as ToneStep;
            setTone(next);
            onPick(rampName, next);
          }}
          style={{...S.select, flex: 1, maxWidth: 'none'}}
          aria-label={`Tone for ${tokenName} (${mode})`}>
          {TONE_STEPS.map(t => (
            <option key={t} value={t}>
              T{t}
            </option>
          ))}
        </select>
      </HStack>
      <AlphaInput
        alphaPct={alphaPct}
        setAlphaPct={(nextPct: number) => {
          setAlphaPct(nextPct);
          // Pass the new alpha through onPick's third arg so the parent
          // commits the override with the just-set value, not the stale
          // closure-captured `palettePct`.
          onPick(rampName, tone, nextPct / 100);
        }}
        labelFor={`Opacity for ${tokenName} (${mode})`}
      />
    </VStack>
  );
}
