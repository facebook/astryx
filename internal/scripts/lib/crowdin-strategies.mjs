// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// DOM measurement strategies for Crowdin screenshot manual tagging.
//
// Each strategy runs in the PAGE context (via page.evaluate) and returns
// {x, y, width, height} in CSS pixels, or null if no match was found. The
// caller multiplies by DPR before POSTing to Crowdin.
//
// Strategies are pure DOM lookups — they don't interact with the page.
// Interactions (open popover, click chip, etc.) happen in the target's
// `interact()` function before measurement.
//
// All strategy code is inlined into a single browserside function
// (STRATEGY_FN_SOURCE) which is stringified and executed via page.evaluate.

export const STRATEGY_NAMES = [
  'visibleText',
  'option',
  'placeholder',
  'ariaLabel',
  'chipOperator',
  'filterInput',
  'footerButton',
  'srOnlyLabel',
  'srOnlyReveal',
];

// This function is stringified and evaluated in the browser. Do not import
// anything from Node.js in here. `strategy` is the strategy name, `args` is
// an array of positional arguments.
export function browserSideMeasure() {
  return function measure(strategy, args) {
    // Utilities ---------------------------------------------------------------
    function visible(el) {
      return !!el && !!el.getClientRects && el.getClientRects().length > 0;
    }
    function rectOf(el) {
      if (!visible(el)) return null;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return null;
      return {x: r.x, y: r.y, width: r.width, height: r.height};
    }
    // Matches when trimmed `actual === want`, or (when tolerance > 0) when
    // `actual.startsWith(want)` and the extra suffix is <= `tolerance` chars.
    // Pass tolerance=Infinity to accept any startsWith match.
    function matchText(actual, want, tolerance) {
      const t = (actual || '').trim();
      if (t === want) return true;
      if (!tolerance) return false;
      if (!t.startsWith(want)) return false;
      return t.length <= want.length + tolerance;
    }
    function visibleListbox() {
      const all = Array.from(document.querySelectorAll('[role="listbox"]'));
      return all.find(el => rectOf(el)) || all[0] || null;
    }
    // Shared popover/dialog container selector list, used by strategies that
    // need to scope their DOM query to the currently-open popover surface.
    function visibleContainers(opts) {
      const includeListbox = opts && opts.includeListbox;
      const sel = includeListbox
        ? '[role="dialog"], [role="listbox"], [data-radix-popper-content-wrapper], [data-state="open"]'
        : '[role="dialog"], [data-radix-popper-content-wrapper], [data-state="open"]';
      return Array.from(document.querySelectorAll(sel));
    }
    // Walks up from `el.parentElement` looking for the first ancestor whose
    // rect is >= minSize × minSize. Used to find the visible widget above a
    // visually-hidden (sr-only) label.
    function walkUpToMeasurable(el, minSize) {
      const min = minSize == null ? 20 : minSize;
      let anc = el.parentElement;
      while (anc) {
        const pr = anc.getBoundingClientRect();
        if (pr.width >= min && pr.height >= min) return anc;
        anc = anc.parentElement;
      }
      return null;
    }
    // Like walkUpToMeasurable but considers `el` itself as the first
    // candidate. Used when the tagged element (a button/icon) is usually
    // already the widget but occasionally an inner span too small to
    // measure.
    function expandToMeasurableSelf(el, minSize) {
      const min = minSize == null ? 6 : minSize;
      let w = el;
      while (w) {
        const wr = w.getBoundingClientRect();
        if (wr.width >= min && wr.height >= min) return w;
        w = w.parentElement;
      }
      return null;
    }
    function findByExactText(text, root, candidateSelectors) {
      const scope = root || document.body;
      const els = Array.from(
        scope.querySelectorAll(candidateSelectors || '[role="option"], button, span, div, li, a, p, h1, h2, h3, h4'),
      );
      let best = null;
      for (const el of els) {
        if (!visible(el)) continue;
        if ((el.textContent || '').trim() !== text) continue;
        const r = el.getBoundingClientRect();
        // Skip essentially-invisible rects — sr-only labels are ~1×1 px.
        // Callers that specifically want sr-only labels should use
        // the srOnlyLabel strategy instead.
        if (r.width < 6 || r.height < 6) continue;
        // Prefer the SMALLEST matching element — it's the most specific
        // (avoids picking up giant wrapper divs whose textContent happens
        // to equal the target text because they contain only that node).
        if (!best || r.width * r.height < best.w * best.h) {
          best = {x: r.x, y: r.y, w: r.width, h: r.height};
        }
      }
      if (!best) return null;
      return {x: best.x, y: best.y, width: best.w, height: best.h};
    }
    // Returns true if `el` is the topmost element at its own center — i.e.
    // NOT covered by an overlapping popover/dropdown. Guards against
    // tagging positions of buttons that are hidden behind an open
    // value-picker dropdown that Playwright triggered mid-flight.
    function isVisibleAtCenter(el) {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return false;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const top = document.elementFromPoint(cx, cy);
      if (!top) return false;
      return top === el || el.contains(top) || top.contains(el);
    }

    // Strategy implementations -----------------------------------------------
    // visibleText(text) — find the smallest element whose exact trimmed text
    // is `text`. Searches the whole document. Good for generic labels.
    function visibleText(text) {
      return findByExactText(text);
    }

    // option(text) — find role=option whose accessible name / text is `text`.
    // Prefers the currently-visible listbox. Falls back to any role=option
    // in the document (exact match only for the fallback).
    function option(text) {
      const lb = visibleListbox();
      if (lb) {
        const opts = Array.from(lb.querySelectorAll('[role="option"]'));
        for (const el of opts) {
          if (!visible(el)) continue;
          // Match exact OR startsWith with tight length bound (guards
          // against options that include a trailing icon/counter).
          if (!matchText(el.textContent, text, 4)) continue;
          const r = rectOf(el);
          if (r) return r;
        }
      }
      const opts = Array.from(document.querySelectorAll('[role="option"]'));
      for (const el of opts) {
        if (!visible(el)) continue;
        if (!matchText(el.textContent, text, 0)) continue;
        const r = rectOf(el);
        if (r) return r;
      }
      return null;
    }

    // placeholder(text) — find an <input>/<textarea> whose placeholder
    // attribute equals or starts with `text`. Returns the input's rect.
    // Also matches aria-placeholder / data-placeholder as fallback.
    function placeholder(text) {
      const inputs = Array.from(
        document.querySelectorAll('input[placeholder], textarea[placeholder]'),
      );
      for (const el of inputs) {
        if (!visible(el)) continue;
        if (!matchText(el.getAttribute('placeholder'), text, Infinity)) continue;
        const r = rectOf(el);
        if (r) return r;
      }
      const alt = Array.from(
        document.querySelectorAll('[aria-placeholder], [data-placeholder]'),
      );
      for (const el of alt) {
        if (!visible(el)) continue;
        const p =
          el.getAttribute('aria-placeholder') ||
          el.getAttribute('data-placeholder');
        if (!matchText(p, text, Infinity)) continue;
        const r = rectOf(el);
        if (r) return r;
      }
      return null;
    }

    // ariaLabel(text) — find an element whose aria-label equals `text`.
    function ariaLabel(text) {
      const els = Array.from(document.querySelectorAll('[aria-label]'));
      for (const el of els) {
        if (!visible(el)) continue;
        if (!matchText(el.getAttribute('aria-label'), text, 0)) continue;
        const r = rectOf(el);
        if (r) return r;
      }
      return null;
    }

    // chipOperator(fieldName, opText) — find a chip labeled
    // `${fieldName}: ${opText} ...` and return the rect of just the opText
    // substring (using Range selection on the text node). Chips are
    // rendered as buttons with visible text like "Created: is after Jan 14".
    function chipOperator(fieldName, opText) {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        if (!visible(btn)) continue;
        const t = (btn.textContent || '').trim();
        if (!t.startsWith(`${fieldName}:`)) continue;
        // Find the text node containing opText and use a Range to measure.
        const walker = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const idx = node.nodeValue.indexOf(opText);
          if (idx === -1) continue;
          const range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + opText.length);
          const rects = range.getClientRects();
          if (!rects.length) continue;
          const r = rects[0];
          if (r.width <= 0 || r.height <= 0) continue;
          return {x: r.x, y: r.y, width: r.width, height: r.height};
        }
      }
      return null;
    }

    // filterInput(kind) — find the value editor input inside the currently
    // open filter popover. `kind` is 'string' | 'number' | 'search' | 'date'.
    //   string  -> input[type=text] or input without type
    //   number  -> input[type=number]
    //   date    -> input[type=date] or input with role=combobox in date popover
    //   search  -> input[placeholder*=Search]
    function filterInput(kind) {
      const containers = visibleContainers({includeListbox: true});
      const scope = containers.length ? containers : [document.body];
      let selector = 'input, textarea';
      if (kind === 'number') selector = 'input[type="number"]';
      else if (kind === 'date') selector = 'input[type="date"], input[type="datetime-local"], input[role="combobox"]';
      else if (kind === 'search') selector = 'input[placeholder*="Search" i]';
      for (const root of scope) {
        const inputs = Array.from(root.querySelectorAll(selector));
        for (const el of inputs) {
          if (!visible(el)) continue;
          const r = rectOf(el);
          if (r) return r;
        }
      }
      return null;
    }

    // footerButton(text) — find a <button> whose text is exactly `text`,
    // scoped to buttons that appear at the bottom of a dialog/popover.
    // Skips buttons that are covered by an overlapping element (e.g. an
    // open value-picker dropdown) so we don't tag hidden positions.
    // Fallback to any matching button in the document (smallest wins).
    function footerButton(text) {
      const containers = visibleContainers();
      for (const root of containers) {
        const btns = Array.from(root.querySelectorAll('button'));
        for (const b of btns) {
          if (!visible(b)) continue;
          if ((b.textContent || '').trim() !== text) continue;
          if (!isVisibleAtCenter(b)) continue;
          const r = rectOf(b);
          if (r) return r;
        }
      }
      const btns = Array.from(document.querySelectorAll('button'));
      let best = null;
      for (const b of btns) {
        if (!visible(b)) continue;
        if ((b.textContent || '').trim() !== text) continue;
        if (!isVisibleAtCenter(b)) continue;
        const r = b.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        // Pick the smallest — typically the actual footer button (larger
        // matches would be wrapper divs with the same text).
        if (!best || r.width * r.height < best.w * best.h) {
          best = {x: r.x, y: r.y, w: r.width, h: r.height};
        }
      }
      return best ? {x: best.x, y: best.y, width: best.w, height: best.h} : null;
    }

    // srOnlyLabel(text) — find a <label>/<span>/[aria-hidden] whose exact
    // text is `text` and return the rect of its nearest visible ancestor.
    // Useful for `isLabelHidden` controls where the label is in the DOM
    // (1×1 sr-only) but translators need to see the whole control.
    function srOnlyLabel(text) {
      const cands = Array.from(document.querySelectorAll('label, span, [aria-hidden="true"]'));
      for (const el of cands) {
        if ((el.textContent || '').trim() !== text) continue;
        const r = el.getBoundingClientRect();
        // Only apply when the label itself is visually-hidden (small rect).
        if (r.width > 20 && r.height > 20) continue;
        const anc = walkUpToMeasurable(el, 20);
        if (anc) return rectOf(anc);
      }
      return null;
    }

    // srOnlyReveal(text, placement?) — find a widget labeled `text` (via
    // either a visually-hidden <label>/<span>/aria-hidden element with
    // that text content, OR an aria-label / aria-labelledby matching that
    // text on any interactive element). Injects a small yellow "reveal
    // bubble" showing the label text next to the widget so translators
    // can SEE the label in the screenshot. Returns the bubble's rect so
    // the Crowdin tag lands on readable text, not an icon-only widget.
    //
    // placement: 'right' (default), 'below', 'above', 'left'.
    //
    // Prefer this over srOnlyLabel / ariaLabel when the tagged widget has
    // no visible text of its own (bare checkboxes, icon buttons like ×
    // and chevrons). Reveal bubbles are z-index 99999 so they overlay any
    // nearby content — pick a placement that doesn't cover the widget.
    function srOnlyReveal(text, placement) {
      const place = placement || 'right';

      // Idempotent: if a reveal bubble for this text already exists (from
      // a pre-screenshot pass), just return its rect instead of injecting
      // another one. We stash the viewport-relative paint rect at
      // injection time as data-* attrs, because getBoundingClientRect()
      // on top-layer descendants can shift between calls
      // (containing-block vs viewport) in some browsers.
      function readCachedRect(el) {
        if (!el) return null;
        const cx = parseFloat(el.getAttribute('data-crowdin-vx') || '');
        const cy = parseFloat(el.getAttribute('data-crowdin-vy') || '');
        const cw = parseFloat(el.getAttribute('data-crowdin-vw') || '');
        const ch = parseFloat(el.getAttribute('data-crowdin-vh') || '');
        if (Number.isFinite(cx) && Number.isFinite(cy) &&
            Number.isFinite(cw) && Number.isFinite(ch)) {
          return {x: cx, y: cy, width: cw, height: ch};
        }
        return null;
      }
      function cachePaintRect(bubble) {
        const p = bubble.getBoundingClientRect();
        bubble.setAttribute('data-crowdin-vx', String(p.x));
        bubble.setAttribute('data-crowdin-vy', String(p.y));
        bubble.setAttribute('data-crowdin-vw', String(p.width));
        bubble.setAttribute('data-crowdin-vh', String(p.height));
      }

      const existing = document.querySelector(
        `[data-crowdin-reveal-text="${CSS.escape(text)}"]`,
      );
      if (existing) {
        const cached = readCachedRect(existing);
        if (cached) return cached;
        const er = existing.getBoundingClientRect();
        if (er.width > 0 && er.height > 0) {
          return {x: er.x, y: er.y, width: er.width, height: er.height};
        }
      }

      // Two match paths (deduped):
      // (1) sr-only label/span/aria-hidden element whose textContent is `text`
      //     → the widget is the nearest visible ancestor.
      // (2) any element with aria-label === text (or aria-labelledby → text)
      //     → the widget IS that element (or its measurable ancestor if
      //     the element itself is sub-6px).
      function findWidgetsForRevealText(t) {
        const widgets = [];
        // Path 1: sr-only text nodes
        const textCands = Array.from(
          document.querySelectorAll('label, span, [aria-hidden="true"]'),
        );
        for (const el of textCands) {
          if ((el.textContent || '').trim() !== t) continue;
          const r = el.getBoundingClientRect();
          if (r.width > 20 && r.height > 20) continue;
          const anc = walkUpToMeasurable(el, 20);
          if (anc) widgets.push(anc);
        }
        // Path 2a: aria-label matches
        const ariaCands = Array.from(
          document.querySelectorAll(`[aria-label="${CSS.escape(t)}"]`),
        );
        for (const el of ariaCands) {
          const w = expandToMeasurableSelf(el, 6);
          if (w) widgets.push(w);
        }
        // Path 2b: aria-labelledby matches
        const labelledByEls = Array.from(
          document.querySelectorAll('[aria-labelledby]'),
        );
        for (const el of labelledByEls) {
          const ids = (el.getAttribute('aria-labelledby') || '').split(/\s+/);
          const parts = ids
            .map(id => document.getElementById(id))
            .filter(Boolean)
            .map(n => (n.textContent || '').trim())
            .join(' ')
            .trim();
          if (parts !== t) continue;
          const w = expandToMeasurableSelf(el, 6);
          if (w) widgets.push(w);
        }
        // Dedup (same widget can be discovered via both paths).
        const seen = new Set();
        const unique = [];
        for (const w of widgets) {
          if (seen.has(w)) continue;
          seen.add(w);
          unique.push(w);
        }
        return unique;
      }

      function applyBubbleStyle(bubble, t) {
        bubble.setAttribute('data-crowdin-reveal', '1');
        bubble.setAttribute('data-crowdin-reveal-text', t);
        bubble.textContent = t;
        const S = bubble.style;
        S.position = 'fixed';
        S.background = '#ffe680';
        S.border = '1px solid #b8860b';
        S.borderRadius = '4px';
        S.padding = '2px 6px';
        S.font =
          '600 11px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
        S.color = '#654200';
        S.zIndex = '99999';
        S.whiteSpace = 'nowrap';
        S.pointerEvents = 'none';
        S.lineHeight = '14px';
      }

      // Compute viewport-space left/top for the bubble at `place`, then
      // translate to containing-block-space when parented to a top-layer
      // element (native <dialog>/[popover]) whose `position: fixed`
      // descendants are scoped to the dialog's origin.
      function positionBubble(bubble, widgetRect, place, modalHost) {
        const b = bubble.getBoundingClientRect();
        let left = 0;
        let top = 0;
        switch (place) {
          case 'below':
            left = widgetRect.left + widgetRect.width / 2 - b.width / 2;
            top = widgetRect.bottom + 4;
            break;
          case 'above':
            left = widgetRect.left + widgetRect.width / 2 - b.width / 2;
            top = widgetRect.top - b.height - 4;
            break;
          case 'left':
            left = widgetRect.left - b.width - 6;
            top = widgetRect.top + widgetRect.height / 2 - b.height / 2;
            break;
          case 'right':
          default:
            left = widgetRect.right + 6;
            top = widgetRect.top + widgetRect.height / 2 - b.height / 2;
        }
        if (modalHost) {
          const mr = modalHost.getBoundingClientRect();
          left -= mr.left;
          top -= mr.top;
        }
        bubble.style.left = `${Math.max(0, Math.round(left))}px`;
        bubble.style.top = `${Math.max(0, Math.round(top))}px`;
      }

      const uniqueWidgets = findWidgetsForRevealText(text);
      if (uniqueWidgets.length === 0) return null;

      // Inject one bubble per widget so translators see the reveal for
      // every occurrence (e.g. "Expand row" on multiple rows).
      let lastBubble = null;
      for (const anc of uniqueWidgets) {
        const pr = anc.getBoundingClientRect();
        const bubble = document.createElement('div');
        applyBubbleStyle(bubble, text);
        // Native <dialog>.showModal() renders inside the browser's "top
        // layer" above all other content. Elements in the normal DOM tree
        // are painted UNDER the dialog regardless of z-index. If the
        // widget is inside a modal dialog, attach the bubble to that
        // dialog so it also renders in the top layer.
        const modalHost =
          anc.closest('dialog[open]') || anc.closest('[popover]');
        const host = modalHost || document.body;
        host.appendChild(bubble);
        positionBubble(bubble, pr, place, modalHost);
        cachePaintRect(bubble);
        lastBubble = bubble;
      }
      if (!lastBubble) return null;
      return readCachedRect(lastBubble);
    }

    // Dispatcher --------------------------------------------------------------
    switch (strategy) {
      case 'visibleText': return visibleText(args[0]);
      case 'option': return option(args[0]);
      case 'placeholder': return placeholder(args[0]);
      case 'ariaLabel': return ariaLabel(args[0]);
      case 'chipOperator': return chipOperator(args[0], args[1]);
      case 'filterInput': return filterInput(args[0]);
      case 'footerButton': return footerButton(args[0]);
      case 'srOnlyLabel': return srOnlyLabel(args[0]);
      case 'srOnlyReveal': return srOnlyReveal(args[0], args[1]);
      default: return null;
    }
  };
}
