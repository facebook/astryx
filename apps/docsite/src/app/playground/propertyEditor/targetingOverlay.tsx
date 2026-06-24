// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file targetingOverlay.tsx
 * @input Pointer events inside the preview iframe + messages from the parent
 * @output Hover/selection overlays + a minimal selection badge (name + deselect)
 * @position Playground preview iframe — the element-targeting half of editing.
 *
 * Runs inside the preview iframe. The hover/selection overlays and their labels
 * are vanilla DOM (created imperatively and positioned every animation frame for
 * performance); each label hosts a React root rendering the selection badge. The
 * actual editing UI lives in the parent's left-panel "Design Editor" — selection
 * flows there via postMessage (targeting-select). The parent drives the
 * apply-target highlight preview back here via previewSelectionTarget.
 */

import {createRoot, type Root} from 'react-dom/client';
import * as stylex from '@stylexjs/stylex';
import './targetingOverlay.css';
import {Crosshair, X} from 'lucide-react';
import {HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Theme, MediaTheme} from '@astryxdesign/core/theme';
import type {ThemeMode} from '@astryxdesign/core/theme';
import {astryxTheme} from '../../../themes/astryx';
import type {StyleApplyTarget} from '../styleOverride/StyleScopeEditor';
import {componentDisplayName} from '../themeEditor/componentThemeTargets';

const styles = stylex.create({
  badge: {minHeight: 32},
  badgeActions: {marginRight: -10},
});

// Minimal blue label for a selected instance: the component name + a deselect
// button. Editing happens in the parent's Design Editor panel, not here.
function TargetLabel({
  name,
  isInteractive,
}: {
  name: string;
  isInteractive: boolean;
}) {
  return (
    <MediaTheme mode="dark">
      <HStack gap={2} vAlign="center" xstyle={styles.badge}>
        <Crosshair size={12} />
        <Text>{componentDisplayName(name)}</Text>
        {isInteractive && (
          <HStack xstyle={styles.badgeActions}>
            <Button
              label="Deselect"
              variant="ghost"
              size="sm"
              isIconOnly
              icon={<X size={12} />}
              onClick={() => deselectFromBadge()}
            />
          </HStack>
        )}
      </HStack>
    </MediaTheme>
  );
}

const labelRoots = new WeakMap<HTMLElement, Root>();
const activeLabels = new Set<HTMLDivElement>();

// The selection tool (badge, rings) is Playground chrome, not preview content —
// it always renders on the site theme (Astryx) so it stays visually distinct
// from whatever theme the preview is showing. We only track the site color mode
// so the chrome matches light/dark.
let activeSiteMode: ThemeMode = 'light';

// Set by createTargetingController so the badge's deselect can notify the parent.
let postToParentFn: ((msg: Record<string, unknown>) => void) | null = null;

function deselectFromBadge() {
  clearSelectionOverlay();
  postToParentFn?.({type: 'targeting-deselect'});
}

// Hover/selection highlight state, tracked by the targeted instance id
// (`Component#index`). We outline the DOM nodes directly (via data attributes +
// CSS) rather than a positioned box, so the outline hugs each element's real
// shape — following its border-radius — and tracks layout/scroll for free.
//
// Selection draws TWO rings so the Design Editor's Style scopes read at a
// glance: the selected element's rendered copies get a SOLID ring (what
// Properties / This-instance affect), and the type's other instances get a
// FAINT ring (what All-instances additionally affects). Hover keeps one ring.
const highlight = {
  hoverId: null as string | null,
  selId: null as string | null,
};

function clearAttr(attr: string) {
  for (const el of document.querySelectorAll(`[${attr}]`)) {
    el.removeAttribute(attr);
  }
}

function typePrefix(id: string): string {
  const sep = id.lastIndexOf('#');
  return sep >= 0 ? id.slice(0, sep) : id;
}

function applyToExact(id: string, attr: string) {
  for (const el of document.querySelectorAll(`[data-pg-id="${id}"]`)) {
    el.setAttribute(attr, '');
  }
}

function applyToType(id: string, attr: string) {
  for (const el of document.querySelectorAll(
    `[data-pg-id^="${typePrefix(id)}#"]`,
  )) {
    el.setAttribute(attr, '');
  }
}

function setHoverHighlight(id: string | null) {
  clearAttr('data-pg-hl-hover');
  if (!id) {
    return;
  }
  applyToExact(id, 'data-pg-hl-hover');
}

function setSelectionHighlight(id: string | null) {
  clearAttr('data-pg-hl-sel');
  if (!id) {
    return;
  }
  applyToExact(id, 'data-pg-hl-sel');
}

/** Re-apply the element outlines (after a re-render, selection, or view change). */
export function reapplyHighlights() {
  setHoverHighlight(highlight.hoverId);
  setSelectionHighlight(highlight.selId);
}

/**
 * Preview which elements a Style apply target would affect (driven by the parent
 * Design Editor hovering the apply buttons): `instance` rings just the selected
 * element, `all` rings every instance of the type, `null` restores the default
 * selection highlight (just the selected element, solid).
 */
export function previewSelectionTarget(target: StyleApplyTarget | null) {
  const id = highlight.selId;
  if (!id) {
    return;
  }
  if (target === null) {
    setSelectionHighlight(id);
    return;
  }
  clearAttr('data-pg-hl-sel');
  if (target === 'instance') {
    applyToExact(id, 'data-pg-hl-sel');
  } else {
    applyToType(id, 'data-pg-hl-sel');
  }
}

/** Clear the current selection overlay (e.g. when the parent deselects). */
export function clearSelectionFromParent() {
  clearSelectionOverlay();
}

/** The site color mode the badges render in (set by the preview page). */
export function setActiveSiteMode(mode: ThemeMode) {
  activeSiteMode = mode;
}

function renderTargetLabel(label: HTMLDivElement) {
  const root = labelRoots.get(label);
  if (!root) {
    return;
  }
  const name = label.dataset.labelText ?? '';
  const isInteractive = label.dataset.interactive === 'true';
  root.render(
    <Theme theme={astryxTheme} mode={activeSiteMode}>
      <TargetLabel name={name} isInteractive={isInteractive} />
    </Theme>,
  );
}

function createTargetLabel(isInteractive: boolean): HTMLDivElement {
  const label = document.createElement('div');
  label.className = 'pg-target-label';
  label.dataset.interactive = String(isInteractive);
  label.dataset.labelText = '';
  labelRoots.set(label, createRoot(label));
  activeLabels.add(label);
  renderTargetLabel(label);
  return label;
}

function setTargetLabelText(label: HTMLDivElement, value: string) {
  if (label.dataset.labelText === value) {
    return;
  }
  label.dataset.labelText = value;
  renderTargetLabel(label);
}

/** Re-render every live badge (e.g. after the site mode or source changes). */
export function refreshTargetLabels() {
  for (const label of activeLabels) {
    renderTargetLabel(label);
  }
  // The preview may have re-rendered with fresh DOM nodes; re-apply outlines.
  reapplyHighlights();
}

/**
 * Persistent selection overlay — same visual treatment as the hover overlay
 * (blue border + tinted fill + component name label). Lives in a separate
 * DOM element so it can coexist with (or be hidden by) the hover overlay.
 */
const selectionState = {
  overlay: null as HTMLDivElement | null,
  label: null as HTMLDivElement | null,
  id: null as string | null,
  rafId: 0,
};

function ensureSelectionOverlay() {
  if (selectionState.overlay) {
    return;
  }
  const overlay = document.createElement('div');
  overlay.className = 'pg-target-selection';
  const label = createTargetLabel(true);
  overlay.appendChild(label);
  document.body.appendChild(overlay);
  selectionState.overlay = overlay;
  selectionState.label = label;
}

function updateSelectionPosition() {
  const {overlay, label, id} = selectionState;
  if (!overlay || !label || !id) {
    return;
  }
  const el = document.querySelector<HTMLElement>(`[data-pg-id="${id}"]`);
  if (!el) {
    overlay.dataset.visible = 'false';
    return;
  }
  const rect = el.getBoundingClientRect();
  overlay.style.top = `${rect.top - 2}px`;
  overlay.style.left = `${rect.left - 2}px`;
  overlay.style.width = `${rect.width + 4}px`;
  overlay.style.height = `${rect.height + 4}px`;
  overlay.dataset.visible = 'true';

  // Carry the full id (Component#index) so the selection badge's popover can
  // scope its PropertyEditor to this exact instance. Re-render only when the
  // name or id actually changes (this runs every animation frame).
  const sep = id.lastIndexOf('#');
  const name = sep >= 0 ? id.slice(0, sep) : id;
  if (label.dataset.labelText !== name || label.dataset.labelId !== id) {
    label.dataset.labelText = name;
    label.dataset.labelId = id;
    renderTargetLabel(label);
  }

  if (rect.top < 28) {
    label.classList.add('pg-target-label-bottom');
  } else {
    label.classList.remove('pg-target-label-bottom');
  }
}

function selectElement(id: string) {
  ensureSelectionOverlay();
  selectionState.id = id;
  // Pre-seed the label text/id so updateSelectionPosition's render guard doesn't
  // re-render and discard it.
  if (selectionState.label) {
    const sep = id.lastIndexOf('#');
    selectionState.label.dataset.labelText = sep >= 0 ? id.slice(0, sep) : id;
    selectionState.label.dataset.labelId = id;
    renderTargetLabel(selectionState.label);
  }
  const el = document.querySelector<HTMLElement>(`[data-pg-id="${id}"]`);
  if (el) {
    el.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }
  updateSelectionPosition();

  // Keep the overlay positioned during scroll.
  cancelAnimationFrame(selectionState.rafId);
  const track = () => {
    updateSelectionPosition();
    if (selectionState.id === id) {
      selectionState.rafId = requestAnimationFrame(track);
    }
  };
  selectionState.rafId = requestAnimationFrame(track);
}

function clearSelectionOverlay() {
  cancelAnimationFrame(selectionState.rafId);
  selectionState.id = null;
  if (selectionState.overlay) {
    selectionState.overlay.dataset.visible = 'false';
  }
  highlight.selId = null;
  setSelectionHighlight(null);
}

/**
 * Manages the targeting overlay lifecycle inside the iframe. When enabled,
 * intercepts pointer events to highlight hovered XDS components and report
 * clicks back to the parent frame.
 */
export function createTargetingController(
  postToParent: (msg: Record<string, unknown>) => void,
) {
  // Expose for the badge's deselect button (rendered in its own React root).
  postToParentFn = postToParent;
  let enabled = false;
  let overlayEl: HTMLDivElement | null = null;
  let labelEl: HTMLDivElement | null = null;
  let rafId = 0;
  let lastHoveredId: string | null = null;

  function ensureOverlay() {
    if (overlayEl) {
      return;
    }
    overlayEl = document.createElement('div');
    overlayEl.className = 'pg-target-overlay';
    labelEl = createTargetLabel(false);
    overlayEl.appendChild(labelEl);
    document.body.appendChild(overlayEl);
  }

  function findTargetable(el: Element | null): HTMLElement | null {
    let node = el;
    while (node && node !== document.body) {
      if (node instanceof HTMLElement && node.dataset.pgId) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function parsePgId(id: string): {component: string; index: number} | null {
    const sep = id.lastIndexOf('#');
    if (sep < 0) {
      return null;
    }
    return {
      component: id.slice(0, sep),
      index: parseInt(id.slice(sep + 1), 10),
    };
  }

  function positionOverlay(target: HTMLElement) {
    if (!overlayEl || !labelEl) {
      return;
    }
    const rect = target.getBoundingClientRect();
    const pgId = target.dataset.pgId ?? '';
    overlayEl.style.top = `${rect.top - 2}px`;
    overlayEl.style.left = `${rect.left - 2}px`;
    overlayEl.style.width = `${rect.width + 4}px`;
    overlayEl.style.height = `${rect.height + 4}px`;
    overlayEl.dataset.visible = 'true';

    const parsed = parsePgId(pgId);
    setTargetLabelText(labelEl, parsed ? parsed.component : pgId);

    // Flip label below if it would overflow above the viewport
    if (rect.top < 28) {
      labelEl.classList.add('pg-target-label-bottom');
    } else {
      labelEl.classList.remove('pg-target-label-bottom');
    }
  }

  function hideOverlay() {
    if (overlayEl) {
      overlayEl.dataset.visible = 'false';
    }
    lastHoveredId = null;
    if (highlight.hoverId) {
      highlight.hoverId = null;
      setHoverHighlight(null);
    }
  }

  function clearSelection() {
    clearSelectionOverlay();
  }

  function onMouseMove(e: MouseEvent) {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      // Hide overlay temporarily to hit-test through it
      if (overlayEl) {
        overlayEl.style.display = 'none';
      }
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      if (overlayEl) {
        overlayEl.style.display = '';
      }

      const target = findTargetable(hit);
      if (!target) {
        hideOverlay();
        postToParent({type: 'targeting-hover', id: null});
        return;
      }

      const id = target.dataset.pgId ?? '';
      if (id !== lastHoveredId) {
        lastHoveredId = id;
        positionOverlay(target);
        const parsed = parsePgId(id);
        // Outline the hovered element directly (its real border-radius); the
        // positioned box only anchors the label now.
        highlight.hoverId = id;
        setHoverHighlight(id);
        postToParent({
          type: 'targeting-hover',
          id,
          component: parsed?.component ?? null,
          index: parsed?.index ?? 0,
        });
      }
    });
  }

  function onClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (overlayEl) {
      overlayEl.style.display = 'none';
    }
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    if (overlayEl) {
      overlayEl.style.display = '';
    }

    const target = findTargetable(hit);
    if (!target) {
      return;
    }

    const id = target.dataset.pgId ?? '';
    const parsed = parsePgId(id);
    if (!parsed) {
      return;
    }

    clearSelection();
    selectElement(id);

    // Persistently outline the selection: solid ring on this element's copies,
    // faint ring on the type's other instances (so the popover's scopes read).
    highlight.selId = id;
    setSelectionHighlight(id);

    postToParent({
      type: 'targeting-select',
      id,
      component: parsed.component,
      index: parsed.index,
    });
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      disable();
      postToParent({type: 'targeting-exit'});
    }
  }

  function enable() {
    if (enabled) {
      return;
    }
    enabled = true;
    clearSelection();
    ensureOverlay();
    document.documentElement.classList.add('pg-targeting');
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
  }

  function disable() {
    if (!enabled) {
      return;
    }
    enabled = false;
    cancelAnimationFrame(rafId);
    document.documentElement.classList.remove('pg-targeting');
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    hideOverlay();
  }

  return {enable, disable, clearSelection};
}
