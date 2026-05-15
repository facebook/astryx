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
import type {XDSDefinedTheme} from '@xds/core/theme';

// XDS components — used in the editor popover, export dialog, and the
// row trigger so the audit drawer's interactive surfaces stay
// consistent with the rest of XDS instead of a hand-rolled clone of
// each one.
import {XDSPopover} from '@xds/core/Popover';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSLayout, XDSLayoutContent, XDSLayoutFooter} from '@xds/core/Layout';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSButton} from '@xds/core/Button';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

import {
  TONE_STEPS,
  type Mode,
  type RampSeed,
  type ToneStep,
} from './colorMath';
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
  countOverrides,
  describeOverride,
  isValidHex,
  normalizeHex,
  overridesReducer,
  resolveOverrideHex,
  serializeAsTokensBlock,
  type ModeOverride,
  type OverridesMap,
  type SerializeContext,
} from './themeOverrides';
import {
  getCategorizedColorTokens,
  getTokenLabel,
} from './colorCategories';

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
  theme: XDSDefinedTheme,
  rampSeeds: RampSeed[],
): ThemeAuditData {
  return useMemo(() => {
    const diff = diffThemeTokens(theme);
    const snap = auditSnapToRamps(theme, rampSeeds);
    const snapByToken: Record<string, SnapAuditEntry> = {};
    for (const e of snap) snapByToken[e.name] = e;
    const diffByToken: Record<string, TokenDiffEntry> = {};
    for (const e of diff.entries) diffByToken[e.name] = e;
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
    color:
      count > 0 ? 'var(--color-on-accent)' : 'var(--color-text-secondary)',
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
  } as React.CSSProperties,
  headerTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  } as React.CSSProperties,
  title: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'var(--font-family-heading)',
  } as React.CSSProperties,
  subtitle: {
    margin: 0,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
  } as React.CSSProperties,
  modeRow: {
    display: 'flex',
    gap: 4,
    padding: '8px 16px',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-background-surface)',
    alignItems: 'center',
  } as React.CSSProperties,
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
  } as React.CSSProperties,
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
  } as React.CSSProperties,
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
  } as React.CSSProperties,
  labelCell: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  } as React.CSSProperties,
  labelText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  tokenName: {
    fontSize: 10,
    fontFamily: MONO,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
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
  } as React.CSSProperties,
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
  } as React.CSSProperties,
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
  } as React.CSSProperties,
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
  } as React.CSSProperties,
  triggerLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    minWidth: 0,
    flex: 1,
    textAlign: 'left' as const,
    paddingLeft: 8,
  } as React.CSSProperties,
  // "Original" swatch rendered to the left of the active swatch. Always
  // present (even when default === current) so the row geometry is
  // consistent and you can sanity-check the original value at a glance.
  //
  // When the token has no XDS default (theme-only addition), the caller
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
  // — `XDSDropdownMenu` is heavier than needed for a small list and the
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
  } as React.CSSProperties,
  indirectNote: {
    fontSize: 9.5,
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic' as const,
  } as React.CSSProperties,
  applyFooter: {
    borderTop: '1px solid var(--color-border)',
    padding: '12px 20px',
    background: 'var(--color-background-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  } as React.CSSProperties,
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
  const [internalOverrides, dispatchInternal] = useReducer(
    overridesReducer,
    {} as OverridesMap,
  );
  const overrides = overridesProp ?? internalOverrides;
  const dispatchOverrides = dispatchProp ?? dispatchInternal;
  const [exportOpen, setExportOpen] = useState(false);

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

  // Pre-bucket tokens into the docsite categories. We pass the *union*
  // of every color token the audit knows about (theme-defined + XDS
  // defaults) so anything not covered by the curated categories falls
  // into the trailing "Other Colors" / "Syntax Highlighting" buckets
  // instead of being silently hidden.
  const categorized = useMemo(() => {
    const known = new Set<string>();
    for (const e of audit.snap) known.add(e.name);
    for (const e of audit.diff.entries) known.add(e.name);
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
            if (visibleTokens.length === 0) return null;
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
                    onPickPalette={(rampName, tone) => {
                      const seed = audit.rampSeeds.find(s => s.name === rampName);
                      if (!seed) return;
                      dispatchOverrides({
                        type: 'set',
                        token: tokenName,
                        mode,
                        override: buildModeOverride(seed, tone, mode),
                      });
                    }}
                    onPickCustom={hex =>
                      dispatchOverrides({
                        type: 'set',
                        token: tokenName,
                        mode,
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
            <XDSText type="supporting" color="secondary">
              {overrideCount} token{overrideCount === 1 ? '' : 's'} pending
            </XDSText>
            <XDSHStack gap={2}>
              <XDSButton
                label="Discard"
                variant="ghost"
                size="sm"
                onClick={() => dispatchOverrides({type: 'reset'})}
              />
              <XDSButton
                label={`Export (${overrideCount})`}
                variant="primary"
                size="sm"
                onClick={() => setExportOpen(true)}
              />
            </XDSHStack>
          </div>
        )}
      </aside>
      {exportOpen && (
        <ExportModal
          themeName={themeName}
          overrides={overrides}
          ctx={serializeCtx}
          onClose={() => setExportOpen(false)}
        />
      )}
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
  onPickPalette: (rampName: string, tone: ToneStep) => void;
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
  const activeHex = override?.hex ?? sourceHex ?? '';

  // Resolve the XDS-default value for this token in the active mode.
  // Always rendered as the leftmost square so the row geometry is
  // consistent across the table, even when default === current.
  const defaultParsed = diff?.defaultValue
    ? parseTokenColor(diff.defaultValue)
    : null;
  const defaultHex =
    mode === 'light' ? defaultParsed?.light ?? null : defaultParsed?.dark ?? null;

  // Single-source label rendered inside the trigger button:
  //   - On-ramp (auto-detected exact/snapped, or edited via palette) → "Blue T35"
  //   - Off-ramp (auto-detected near/off, or edited via custom hex)  → "#28282a"
  // All editing happens in the popover — the trigger is read-only.
  const inputDisplay = (() => {
    if (override?.kind === 'palette') {
      return `${override.rampName} T${override.tone}`;
    }
    if (
      !override &&
      match &&
      (match.verdict === 'exact' || match.verdict === 'snapped')
    ) {
      return `${match.rampName} T${match.tone}`;
    }
    return activeHex;
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
          style={S.originalSwatch(defaultHex ?? 'transparent')}
          title={
            defaultHex
              ? `Original (XDS default): ${defaultHex}`
              : 'No XDS default — token added by theme'
          }
          aria-label={
            defaultHex
              ? `Original default value: ${defaultHex}`
              : 'No default value'
          }
        />
        {/* Trigger lives inside XDSPopover — it auto-locates the
            <button>, manages anchor positioning via CSS anchor
            positioning, handles outside-click + Esc + focus
            management, and stacks correctly above sibling content
            without needing a manual z-index. */}
        <XDSPopover
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
              currentHex={activeHex || '#000000'}
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
              onPickPalette={(rampName, tone) => {
                onPickPalette(rampName, tone);
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
            aria-label={`Edit ${getTokenLabel(tokenName)} (${mode}) — current value: ${activeHex}`}>
            <span
              style={{
                ...S.swatchInline,
                background: activeHex || '#000000',
              }}
              aria-hidden="true"
            />
            <span style={S.triggerLabel}>{inputDisplay}</span>
          </button>
        </XDSPopover>
        {override ? (
          <XDSButton
            label="reset"
            variant="ghost"
            size="sm"
            onClick={onReset}
          />
        ) : match &&
          (match.verdict === 'near' || match.verdict === 'off') ? (
          // "Snap to nearest ramp step" — surfaces the auto-detected
          // closest match as a one-click action so the user doesn't
          // have to open the popover and pick the dropdowns manually
          // when they just want to round the row to its closest ramp.
          // Only shown for `near` / `off` rows since `exact` / `snapped`
          // rows are already on-ramp and `edited` rows show `reset`
          // instead.
          <XDSButton
            label="snap"
            variant="ghost"
            size="sm"
            tooltip={`Snap to ${match.rampName} T${match.tone} (ΔE ${match.deltaE.toFixed(1)})`}
            onClick={() => onPickPalette(match.rampName, match.tone as ToneStep)}
          />
        ) : null}
      </div>
    </div>
  );
}

// =============================================================================
// Editor popover content — rendered inside <XDSPopover> as the `content` prop
// =============================================================================

interface EditorPopoverContentProps {
  mode: Mode;
  tokenName: string;
  currentHex: string;
  override: ModeOverride | undefined;
  initialTab: 'custom' | 'palette';
  rampSeeds: RampSeed[];
  paletteHint: {rampName: string; tone: ToneStep} | null;
  onPickPalette: (rampName: string, tone: ToneStep) => void;
  onPickCustom: (hex: string) => void;
}

/**
 * Body of the editor popover. The popover chrome (positioning, outside-
 * click, Esc, focus management) is provided by `XDSPopover`; this is just
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
      : paletteHint?.rampName ?? rampSeeds[0]?.name ?? '';
  const initialPaletteTone = (override?.kind === 'palette'
    ? override.tone
    : paletteHint?.tone ?? 50) as ToneStep;
  const [paletteRamp, setPaletteRamp] = useState<string>(initialPaletteRamp);
  const [paletteTone, setPaletteTone] = useState<ToneStep>(initialPaletteTone);
  const [customDraft, setCustomDraft] = useState<string>(currentHex);

  // Resolved hex for the swatch, computed from whichever tab is active.
  // Palette tab → resolve the selected ramp+tone via the same ramp
  // generator the visible Tonal section uses. Custom tab → echo the
  // user's typed draft (or fall back to the row's current hex while
  // they're not actively editing).
  const seedForRamp = rampSeeds.find(s => s.name === paletteRamp);
  const previewHex =
    tab === 'palette' && seedForRamp
      ? resolveOverrideHex(seedForRamp.sourceHex, paletteTone, mode)
      : isValidHex(customDraft)
        ? normalizeHex(customDraft)
        : currentHex;

  return (
    <XDSVStack gap={3} style={{padding: 4, minWidth: 0}}>
      <XDSTabList
        value={tab}
        onChange={v => setTab(v as 'custom' | 'palette')}
        layout="fill"
        size="sm"
        hasDivider>
        <XDSTab value="custom" label="Custom" />
        <XDSTab value="palette" label="Palette" />
      </XDSTabList>
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
          currentHex={currentHex}
          draft={customDraft}
          setDraft={setCustomDraft}
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
          onPick={onPickPalette}
        />
      )}
    </XDSVStack>
  );
}

function CustomTab({
  currentHex,
  draft,
  setDraft,
  mode,
  tokenName,
  onPick,
}: {
  currentHex: string;
  /** Controlled draft hex — lives in EditorPopoverContent so the
   *  preview swatch can react to typing without committing. */
  draft: string;
  setDraft: (value: string) => void;
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
    if (!el) return;
    if (typeof el.showPicker === 'function') {
      el.showPicker();
    } else {
      el.click();
    }
  };
  // Currently-resolved swatch color — used to paint the start-icon
  // chip live as the user types, so the chip always matches the input
  // value visually.
  const swatchColor = isValidHex(draft) ? normalizeHex(draft) : currentHex;

  return (
    <XDSHStack gap={2} vAlign="center">
      <XDSText type="supporting" color="secondary" style={{minWidth: 32}}>
        Hex
      </XDSText>
      <div style={{flex: 1, position: 'relative'}}>
        <XDSTextInput
          label={`Hex value for ${tokenName} (${mode})`}
          isLabelHidden
          size="sm"
          value={draft}
          onChange={(next: string) => setDraft(next)}
          onEnter={() => {
            if (isValidHex(draft)) onPick(normalizeHex(draft));
            else setDraft(currentHex);
          }}
          placeholder="#000000"
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
            the swatch chip. Takes no layout space. */}
        <input
          ref={colorInputRef}
          type="color"
          value={normalizeHex(draft)}
          onChange={e => {
            const next = normalizeHex(e.target.value);
            setDraft(next);
            onPick(next);
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
    </XDSHStack>
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
  onPick: (rampName: string, tone: ToneStep) => void;
}) {
  // Native <select>s here rather than XDSDropdownMenu — the menu
  // component is heavier than needed for a 10-item ramp / 21-step tone
  // picker, and the native control gives us free keyboard navigation.
  return (
    <XDSVStack gap={2}>
      <XDSHStack gap={2} vAlign="center">
        <XDSText type="supporting" color="secondary" style={{minWidth: 48}}>
          Ramp
        </XDSText>
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
      </XDSHStack>
      <XDSHStack gap={2} vAlign="center">
        <XDSText type="supporting" color="secondary" style={{minWidth: 48}}>
          Tone
        </XDSText>
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
      </XDSHStack>
    </XDSVStack>
  );
}

// =============================================================================
// Export modal — unchanged from previous version
// =============================================================================

interface ExportModalProps {
  themeName: string;
  overrides: OverridesMap;
  ctx: SerializeContext;
  onClose: () => void;
}

function ExportModal({
  themeName,
  overrides,
  ctx,
  onClose,
}: ExportModalProps) {
  // Wrap the bare `tokens: { ... }` snippet in an LLM-friendly prompt so
  // pasting into Cursor / Claude / any other coding agent gives the model
  // enough context to apply the edits without further instruction. The
  // prompt is the single source of truth for both the visible <pre> and
  // the clipboard payload.
  const promptSnippet = useMemo(() => {
    const inner = serializeAsTokensBlock(overrides, ctx);
    const filePath = `packages/themes/${themeName}/src/${themeName}Theme.ts`;
    const tokenCount = Object.keys(overrides).length;
    return [
      `Apply the following ${tokenCount} token override${tokenCount === 1 ? '' : 's'} to ${filePath}.`,
      '',
      'Rules:',
      `- Locate the \`defineTheme(...)\` call and find the existing \`tokens: { ... }\` block inside it.`,
      `- For each entry below, find a line whose key matches the token name and replace its value with the value below. Preserve indentation, quote style, and trailing comma. Replace any existing trailing inline comment with the annotation comment provided.`,
      `- If a token is not present, insert a new line at the bottom of the \`tokens\` block (just before the closing \`}\`) using the same indentation and quote style as sibling entries.`,
      `- For \`--color-syntax-*\` entries: prefer to update the \`defineSyntaxTheme({ tokens: { ... } })\` block instead — strip the \`--color-syntax-\` prefix to get the key name (e.g. \`--color-syntax-keyword\` → \`keyword\`). Only fall back to inserting them as direct \`--color-syntax-*\` tokens inside \`defineTheme.tokens\` if no \`defineSyntaxTheme\` block exists.`,
      `- Do not modify any other tokens, comments, or surrounding code.`,
      '',
      inner,
    ].join('\n');
  }, [overrides, ctx, themeName]);

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied (rare; some browsers when not
      // focused). Fall back to selecting the visible <pre> so the user
      // can ⌘+C manually.
      const node = document.getElementById('xds-audit-snippet');
      if (!node) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  return (
    <XDSDialog
      isOpen
      onOpenChange={open => {
        if (!open) onClose();
      }}
      width={720}
      maxHeight="80vh"
      padding={0}>
      <XDSLayout
        header={
          <XDSDialogHeader
            title={`Export · ${themeName}Theme.ts`}
            onOpenChange={open => {
              if (!open) onClose();
            }}
          />
        }
        content={
          <XDSLayoutContent padding={0}>
            <pre
              id="xds-audit-snippet"
              style={{
                margin: 0,
                padding: '16px 20px',
                fontFamily: MONO,
                fontSize: 11,
                lineHeight: 1.6,
                background: 'var(--color-background-body)',
                color: 'var(--color-text-primary)',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
              }}>
              {promptSnippet}
            </pre>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider padding={3}>
            <XDSHStack gap={3} vAlign="center" style={{width: '100%'}}>
              <div style={{flex: 1, minWidth: 0}}>
                {copied && (
                  <XDSText type="supporting" color="secondary">
                    Copied to clipboard
                  </XDSText>
                )}
              </div>
              <XDSButton
                label={copied ? 'Copied' : 'Copy snippet'}
                variant="primary"
                size="sm"
                onClick={handleCopy}
              />
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSDialog>
  );
}
