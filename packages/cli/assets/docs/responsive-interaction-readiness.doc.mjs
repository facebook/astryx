// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'responsive-interaction-readiness',
  title: 'Responsive and Interaction Readiness',
  category: 'guide',
  description:
    'A scoped rubric for reviewing responsive layout, input modality, interaction-affecting motion, mobile viewport constraints, platform evidence, and the accessibility effects of those behaviors.',

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'Use this rubric when a new or changed component can behave differently across available space, input modality, browser/platform shell, or owned motion that affects interaction. It is not a general visual-polish or component-hardening checklist: include alignment, spacing, semantics, focus, or accessibility rows here only when responsive layout, adaptive presentation, pointer/gesture behavior, motion lifecycle, or mobile viewport geometry can change the outcome.',
        },
        {
          type: 'prose',
          text: 'Record each applicable row as Pass, Fail, Blocked, or N/A. Pass requires concrete evidence that can prove the claim. Fail means applicable work or obtainable evidence is missing. Blocked means required external or platform evidence is unavailable. N/A means the behavior genuinely does not apply; include the reason.',
        },
        {
          type: 'prose',
          text: 'Keep viewport size, pointer precision, hover capability, gesture support, and platform shell behavior separate. A narrow viewport does not prove touch input, and a coarse pointer does not prove a narrow viewport. Layout should follow available space and content fit; input behavior should follow the input capability it depends on.',
        },
      ],
    },
    {
      title: 'Scenario evidence patterns',
      content: [
        {
          type: 'prose',
          text: 'Use these four cross-axis scenarios as evidence patterns when the component can vary by width, pointer precision, or hover capability. They are not mandatory boilerplate for components that cannot vary on that axis. Add platform evidence to the scenario it supports instead of creating another device category.',
        },
        {
          type: 'table',
          headers: ['Scenario', 'What it proves', 'Appropriate evidence'],
          rows: [
            [
              'Wide viewport + fine pointer + hover',
              'The wide layout and hover-capable pointer path remain intact.',
              'Storybook, desktop-browser screenshot, or focused test when layout/order/interaction can regress.',
            ],
            [
              'Narrow viewport + fine pointer + hover',
              'Width-driven reflow does not depend on touch or no-hover media queries.',
              'Storybook or browser viewport evidence for the constrained layout and any pointer affordances still present.',
            ],
            [
              'Narrow viewport + coarse pointer + no hover',
              'Touch/coarse-pointer behavior works under constrained space without relying on hover.',
              'Browser, emulator, simulator, or device capture plus activation evidence when coarse-pointer behavior is in scope.',
            ],
            [
              'Wide viewport + coarse pointer + no hover',
              'Input capability does not accidentally force narrow geometry or hide required affordances.',
              'Browser/device capture or media-query test when pointer or hover branches exist; platform evidence when shell behavior is part of the claim.',
            ],
          ],
        },
      ],
    },
    {
      title: 'Platform evidence policy',
      content: [
        {
          type: 'prose',
          text: 'Choose the lightest evidence that can prove the claim. Storybook and desktop Playwright engines are useful for repeatable layout, keyboard, pointer, and focus regression evidence, but they do not establish iOS Safari or native platform-shell behavior. If supported behavior depends on touch dispatch, native top-layer dialog or popover behavior, focus or dismissal propagation, visual viewport/software keyboard behavior, safe-area/platform chrome, or other WebKit-on-iOS behavior, require iOS Simulator or physical iOS evidence. Escalate to a physical device only when hardware shape, OS/browser version, input accessory, performance, notch/chrome configuration, or sensor behavior can affect the experience.',
        },
        {
          type: 'prose',
          text: 'For responsive evidence, use the actual Storybook viewport or containing layout rather than placing the component inside a decorative device frame. Keep the normal interaction contract active: trigger toggle, outside dismissal, keyboard dismissal, and focus behavior. When a story should start open for inspection, open it through the story interaction instead of permanently controlling it open. Use a simulator or device separately when the claim depends on platform behavior.',
        },
        {
          type: 'table',
          headers: ['Evidence source', 'Appropriate for', 'Cannot prove'],
          rows: [
            [
              'Storybook',
              'Component states, examples, responsive width checks, and reviewer screenshots in a controlled desktop browser.',
              'Real touch dispatch, native iOS Safari/platform shell, iOS visual viewport/software keyboard, platform chrome, or every native top-layer `<dialog>`/popover behavior.',
            ],
            [
              'Desktop Playwright engines',
              'Repeatable keyboard, pointer, layout, focus, and browser-regression tests across supported desktop engines.',
              'iOS Safari/platform-shell behavior. Playwright WebKit is macOS WebKit and does not reproduce the iOS shell or every native top-layer `<dialog>`/popover behavior.',
            ],
            [
              'iOS Simulator or device',
              'iOS Safari/WebKit evidence for touch dispatch, top-layer dialog/popover propagation, focus/dismissal propagation, visual viewport, software keyboard, safe area, and platform chrome behavior.',
              'Physical-device-only constraints such as actual hardware ergonomics, camera/notch variation outside the simulator profile, real network/performance pressure, or accessory/input quirks.',
            ],
            [
              'Physical-device checks',
              'Final verification when real hardware shape, OS/browser version, input method, sensor/notch/chrome configuration, or performance can affect the experience.',
              'A complete automated regression suite by itself; keep focused tests and Storybook evidence for repeatable coverage.',
            ],
          ],
        },
      ],
    },
    {
      title: 'Core review categories',
      content: [
        {
          type: 'prose',
          text: 'Use these four categories for applicable responsive and interaction behavior. Adaptive presentation and transient/queued UI have conditional appendices below; do not expand every review with those details when they are not involved.',
        },
        {type: 'heading', level: 3, text: 'Responsive layout'},
        {
          type: 'table',
          headers: ['Check', 'Review requirement', 'N/A guidance'],
          rows: [
            [
              'Presentation choice gate',
              'Before implementation, decide whether the task keeps the same surface or intentionally opts into another presentation. Responsive pressure alone normally means reflowing, wrapping, resizing, or scrolling the same component rather than silently swapping components.',
              'N/A only when no adaptive presentation or substitution decision is involved; otherwise record the same-surface decision or link the adaptive appendix evidence.',
            ],
            [
              'Available space, content fit, and overflow',
              'Reflow from viewport or container space and actual content fit. Long labels and localized copy wrap, resize, or intentionally scroll instead of clipping or causing horizontal overflow. For anchored or layered surfaces, test every sizing path—explicit size, trigger-derived size, intrinsic content, and consumer overrides—on both inline and block axes. Verify the outer layer, intermediate wrappers, and actual content surface share the constraint. Prove both outcomes: oversized content scrolls within the available space, while content that fits remains unclipped and does not become an unnecessary scroll container.',
              'Rarely N/A. Even static components need evidence that their content fits or intentionally scrolls in supported containers.',
            ],
            [
              'Viewport/input independence',
              'Width, pointer precision, hover capability, and gesture support remain independent signals. Do not infer device type, placement, or presentation from one signal alone.',
              'N/A only when the component has no responsive or input-dependent branches; record that it uses inherited primitives unchanged.',
            ],
          ],
        },
        {type: 'heading', level: 3, text: 'Touch, pointer, and hover'},
        {
          type: 'table',
          headers: ['Check', 'Review requirement', 'N/A guidance'],
          rows: [
            [
              'Hover independence',
              'Required information and actions do not require hover. Hover may reveal convenience affordances only when the same action or information is reachable through focus, visible UI, or another non-hover path.',
              'N/A when the component has no hover-specific behavior; record that no required state depends on hover.',
            ],
            [
              'Pointer and gesture behavior',
              'Custom pointer handling uses the supported event model consistently across mouse, touch, and pen; preserves click, focus, text selection, and native scrolling; and provides non-gesture alternatives where applicable. Gesture progress, wrong-direction movement, below-threshold release, pointercancel, and lost capture reset or settle smoothly without accidental activation.',
              'N/A when the component has no custom pointer handling, gesture semantics, drag interactions, or pointer-capture flows.',
            ],
            [
              'Animated layout, stack, and overflow changes',
              'When responsive pressure, queued UI, add/remove/reorder, or gesture snap changes geometry, verify animated overflow and clipping are intentional; content does not clip; animated surfaces can remain visible until the true viewport or container boundary; and clipping, opacity, transforms, wrapper sizing/collapse, focus, scroll position, blocked input, and unmount lifecycle compose without jumps or conflicts. Capture intermediate frames, a recording, or a frame-by-frame geometry/log trace when before/after screenshots cannot prove continuity.',
              'N/A for static components and for motion that does not affect responsive layout, stack/collection geometry, gestures, scrolling, focus, dismissal, or transient UI.',
            ],
          ],
        },
        {
          type: 'heading',
          level: 3,
          text: 'Accessibility and interaction contracts',
        },
        {
          type: 'table',
          headers: ['Check', 'Review requirement', 'N/A guidance'],
          rows: [
            [
              'Target size under constrained or input-specific layouts',
              'Where responsive layout or input mode changes interactive controls, evaluate WCAG 2.2 Level AA SC 2.5.8: at least 24x24 CSS px or a permitted exception, including required separation when targets are crowded by constrained reflow.',
              'N/A only for non-interactive components or unchanged inherited controls; record the reason.',
            ],
            [
              'Semantic, keyboard, focus, and dismissal changes',
              'When responsive layout, adaptive presentation, custom input handling, gestures, or viewport-owned UI changes semantics, keyboard paths, focus order/return, focus visibility, or dismissal contracts, preserve the existing interaction contract or document the intentional difference with evidence.',
              'N/A when those contracts are unchanged and delegated to existing primitives; broader semantic or accessibility review belongs in the component-hardening checklist.',
            ],
            [
              'Reduced motion for interaction-affecting motion',
              'When component-owned motion affects opening, closing, responsive reflow, gestures, scrolling, timers, transient UI, focus, or dismissal, reduced-motion behavior preserves the same interaction contract and end state without visible travel. Treat this as Astryx product-quality guidance; cite WCAG 2.2 AA only where timed, moving, or flashing content criteria actually apply.',
              'N/A when the component owns no interaction-affecting motion. General duration, easing, purpose, polish, and performance guidance belong in `astryx docs motion` until lifecycle guidance is expanded there.',
            ],
          ],
        },
        {type: 'heading', level: 3, text: 'Mobile viewport constraints'},
        {
          type: 'table',
          headers: ['Check', 'Review requirement', 'N/A guidance'],
          rows: [
            [
              'Viewport geometry and obstruction',
              'When a component owns fixed, edge-anchored, full-viewport, or constrained-height geometry, evaluate software keyboard overlap, safe-area insets, browser/app chrome, bottom navigation/toolbars, sheets, focused controls, important top navigation/status, dynamic viewport units, body locking, nested scroll, and scroll position. Placement follows actual obstructions and content priority, not touch or coarse pointer alone.',
              'N/A when the component is inline, delegates geometry to a parent shell, and cannot obstruct or be obstructed by viewport-edge UI.',
            ],
            [
              'Software keyboard',
              'When the component owns inputs or geometry around focused controls, verify resize, occlusion, focus movement, and scroll position under the software keyboard using platform evidence when the claim depends on platform behavior.',
              'N/A when the component has no text input and does not own viewport geometry around focused controls; unavailable required platform evidence is Blocked.',
            ],
            [
              'Bottom-sheet edge continuity',
              'Every BottomSheet presentation delegates safe-area and viewport-edge mechanics to the shared primitive. Apply the bottom safe-area inset exactly once, keep actions above the home indicator and browser chrome without a second empty inset, and keep the surface visually continuous through the bottom edge. On iOS Safari, verify that the browser-bar colour matches the rendered sheet surface rather than the page or scrim.',
              'N/A when the component never presents a BottomSheet. A component that composes the shared primitive unchanged still records the primitive and applicable device evidence; unavailable iOS browser-chrome evidence is Blocked, not N/A.',
            ],
          ],
        },
      ],
    },
    {
      title: 'Adaptive presentation appendix',
      content: [
        {
          type: 'prose',
          text: 'Use this appendix only when a component offers or changes between presentations, such as inline to sheet, tray, popover, page, or fullscreen. Otherwise, record the presentation choice gate in the core checks and skip this appendix.',
        },
        {
          type: 'table',
          headers: ['Check', 'Evidence to record'],
          rows: [
            [
              'Explicit opt-in',
              'The alternate presentation is chosen by task semantics or product intent, not inferred silently from width, pointer, or hover alone.',
            ],
            [
              'State continuity',
              'Shared controlled state, selection, validation, and pending input survive presentation changes unless a difference is intentional.',
            ],
            [
              'Contract differences',
              'Placement, motion, dismissal, focus, scrolling, gesture, announcement, and non-gesture paths that differ between presentations are documented and evidenced.',
            ],
            [
              'Shared primitive and semantic-family frame',
              'The system BottomSheet owns dialog lifecycle, focus return, gestures, safe-area treatment, scrolling, animation, height budgets, and browser-edge treatment. Components in one semantic family share one presentation policy and visual frame; menus may share a menu frame while listboxes and bespoke pickers keep separate adapters. Trigger, selection, submenu, search, and picker state remain in the owning component rather than moving into a universal adaptive wrapper.',
            ],
          ],
        },
      ],
    },
    {
      title: 'Transient and queued UI appendix',
      content: [
        {
          type: 'prose',
          text: 'Use this appendix only for toasts, snackbars, notifications, transient banners, and similar queued, stacked, or auto-dismissing feedback. Static components and unrelated overlays should mark these rows N/A with the reason.',
        },
        {
          type: 'table',
          headers: ['Check', 'Review requirement'],
          rows: [
            [
              'Queue and stack policy',
              'Define whether concurrent items stack, queue, replace, or deduplicate. Visible item limits come from available space and obstruction, not input capability alone. Start timeouts only once an item is visible.',
            ],
            [
              'Content fit and obstruction',
              'Long localized text, actions, and dismiss controls fit, wrap, or intentionally scroll within the available viewport/container. Placement accounts for keyboard, safe area, app chrome, navigation, sheets, focused controls, and important content.',
            ],
            [
              'Timing and announcement semantics',
              'For timed content, evaluate WCAG 2.2 AA SC 2.2.1 instead of assuming a duration is compliant. Actionable or non-redundant feedback persists or has an untimed equivalent. Separate interactive visual content from live-region announcements, choose urgency intentionally, and do not place controls inside status or alert live regions.',
            ],
            [
              'Gesture alternatives and stack lifecycle',
              'Swipe or drag gestures are optional accelerators with button and keyboard alternatives, directional intent, below-threshold and cancellation handling, and native scrolling preserved. Removing an item from a stack animates the departing item and remaining-item reflow continuously; it does not wait for unmount and then jump.',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Transient UI anti-patterns: auto-hide actionable feedback without an untimed equivalent, controls inside alert/status live regions, unbounded narrow stacks, touch-to-placement assumptions, gesture-only dismissal, overflow hidden cutting motion, child exit plus parent unmount/reflow fighting, and final-state-only screenshots for motion behavior.',
        },
      ],
    },
    {
      title: 'Reporting in component PRs',
      content: [
        {
          type: 'prose',
          text: 'Paste only the rows that apply, plus evidence links for claims made. Keep the scenario matrix compact, use the adaptive and transient appendices only when those behaviors exist, and mark static or delegated behavior N/A with a reason.',
        },
        {
          type: 'code',
          lang: 'md',
          label: 'Responsive and Interaction Readiness outcomes',
          code: `## Responsive and Interaction Readiness outcomes

Status semantics: Pass = evidenced; Fail = applicable work or obtainable evidence missing; Blocked = required external/platform evidence unavailable; N/A = behavior does not apply.

### Scenario evidence

| Scenario | Result | Evidence |
| --- | --- | --- |
| Wide viewport + fine pointer + hover | Pass/Fail/Blocked/N/A | Link or N/A reason |
| Narrow viewport + fine pointer + hover | Pass/Fail/Blocked/N/A | Link or N/A reason |
| Narrow viewport + coarse pointer + no hover | Pass/Fail/Blocked/N/A | Link or N/A reason |
| Wide viewport + coarse pointer + no hover | Pass/Fail/Blocked/N/A | Link or N/A reason |

### Applicable core checks

| Check | Result | Evidence |
| --- | --- | --- |
| Presentation choice gate | Pass/Fail/Blocked/N/A | Same-surface decision, adaptive appendix link, or N/A reason |
| Available space/content fit/wrapping/overflow/scrolling | Pass/Fail/Blocked/N/A | Width/container evidence, nested/overlay wrapper constraints, clipping/scrolling behavior, or N/A reason |
| Input, hover, pointer, and gesture behavior | Pass/Fail/Blocked/N/A | Non-hover path, pointer/gesture/cancel evidence, platform evidence, or N/A reason |
| Interaction/accessibility effects | Pass/Fail/Blocked/N/A | Target size, semantic/focus/keyboard/dismissal changes, reduced-motion behavior, or N/A reason |
| Viewport geometry/obstruction | Pass/Fail/Blocked/N/A | Keyboard, safe-area, chrome, obstruction, scroll, dynamic viewport evidence, or N/A reason |
| BottomSheet safe-area/browser chrome | Pass/Fail/Blocked/N/A | One bottom inset, unobscured actions, continuous themed surface, real iOS Safari browser-bar evidence, or N/A reason |
| Animated overflow/clipping | Pass/Fail/Blocked/N/A | Recording/intermediate frames/trace showing no clipping, overlap, focus loss, scroll jump, blocked input, or lifecycle conflict; N/A for static components |
| Stack reflow/intermediate-frame evidence | Pass/Fail/Blocked/N/A | Recording/intermediate frames/geometry trace for add/remove/reorder or queued UI reflow; N/A when no stack/collection motion exists |

### Adaptive presentation appendix, if applicable

| Check | Result | Evidence |
| --- | --- | --- |
| Explicit opt-in and state continuity | Pass/Fail/Blocked/N/A | Task/product rationale, state continuity, contract differences, or N/A reason |
| Shared primitive and semantic-family frame | Pass/Fail/Blocked/N/A | Primitive/adapter ownership, sibling inventory, and evidence that domain state remains in the owning component |

### Transient and queued UI appendix, if applicable

| Check | Result | Evidence |
| --- | --- | --- |
| Queue/stack/timing/announcement/gesture alternatives | Pass/Fail/Blocked/N/A | Policy, obstruction/content fit, timing/announcement evidence, gesture alternatives, stack lifecycle evidence, or N/A reason |`,
        },
      ],
    },
    {
      title: 'Diagnostics appendix',
      content: [
        {
          type: 'prose',
          text: 'Non-normative aid: when a remote console is unavailable, a query-flagged, on-page forensics overlay can make iOS evidence reviewable in one screenshot. Keep it development-only, disable or remove it in production, set pointer-events: none so it cannot change the interaction under test, and record only the event, pointer, dispatch, focus, dismissal, viewport, and top-layer details needed for diagnosis.',
        },
      ],
    },
    {
      title: 'Scope example',
      content: [
        {
          type: 'prose',
          text: 'AlertDialog illustrates the boundary: constrained-width evidence should show content fit, wrapping, target size, focus/dismissal continuity, and platform evidence if the dialog relies on platform-specific top-layer behavior. General copy alignment, visual polish, or unchanged roles belong in broader component-hardening review unless the responsive or adaptive behavior changes them.',
        },
      ],
    },
    {
      title: 'Related docs',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`astryx docs layout` for frame, region, spacing, and breakpoint contracts outside this scoped review',
            '`astryx docs browser-support` for platform feature support and feature detection',
            '`astryx docs motion` for general motion tokens, duration, easing, purpose, polish, and performance guidance outside this lifecycle-focused rubric',
          ],
        },
      ],
    },
  ],
};
