# Animation System

> **Status: Design exploration.** Only basic transition tokens exist today (`transitionTokens.fast`, `transitionTokens.normal`). This spec is the blueprint for the full animation system.

*Exploration, January 2026*

## Core Principle

**Animation is styling's sibling. Same rules apply.**

| XDS Principle | Animation Application |
|---------------|----------------------|
| Zero-styling | Zero animation code — no `animate={{}}`, no transition props |
| Theme as source of truth | Animation config lives in `theme.motion` |
| Props define intent, not style | `open={true}` expresses intent; animation is implementation detail |
| Typed, constrained APIs | Animation types are enums (`'fade' \| 'scale'`), not arbitrary values |
| AI-friendly by constraint | AI writes `<Dialog open>`, knows nothing about animation |

```tsx
// What developers write:
<Dialog open={isOpen}>
  <DialogContent>Are you sure?</DialogContent>
</Dialog>
// Animation just happens (configured in theme)
```

## Why CSS Over Motion Library

| | CSS / StyleX | Motion (motion/react) |
|--|--------------|----------------------|
| Enter animations | ✅ `@starting-style` | ✅ `initial → animate` |
| Exit animations | ⚠️ Need custom unmount delay | ✅ `AnimatePresence` |
| Spring physics | ⚠️ Cubic-bezier approx | ✅ Real springs |
| Bundle size | ✅ 0KB | ⚠️ ~18KB |
| Philosophy fit | ✅ Compile-time | ⚠️ Runtime JS |

**Decision:** Start with CSS. If exit animations or gestures become critical, adopt Motion for specific components. The public API stays the same either way.

---

## Theme API

### Motion Config

```tsx
createTheme({
  motion: {
    enabled: true,
    reducedMotion: 'respect', // 'respect' | 'always-reduce' | 'ignore'

    duration: { instant: 0, fast: 100, normal: 200, slow: 300 },

    easing: {
      linear: 'linear',
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },

    components: {
      dialog: { type: 'fade', duration: 'normal', easing: 'easeOut' },
      drawer: { type: 'slide', duration: 'normal', easing: 'easeOut' },
      accordion: { type: 'collapse', duration: 'fast', easing: 'easeOut' },
      popover: { type: 'fade', duration: 'fast', easing: 'default' },
      tooltip: { type: 'fade', duration: 'fast', easing: 'default' },
      toast: { type: 'slide', duration: 'fast', easing: 'easeOut' },
    },
  }
})
```

### Type Safety

Each component only accepts animation types that make sense:

```tsx
type DialogAnimationType = 'fade' | 'scale' | 'none';
type DrawerAnimationType = 'slide' | 'none';
type AccordionAnimationType = 'collapse' | 'none';

// Theme authors get constrained autocomplete
dialog: { type: 'fade' },    // ✅ Valid
dialog: { type: 'slide' },   // ❌ Type error
```

### StyleX Tokens

```tsx
export const motionTokens = stylex.defineVars({
  durationFast: '100ms',
  durationNormal: '200ms',
  durationSlow: '300ms',
  easingDefault: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easingEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easingSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
});
```

### Theme Variants

```tsx
// Snappy (internal tools)
{ motion: { duration: { fast: 50, normal: 100, slow: 150 } } }

// Smooth (consumer-facing)
{ motion: { duration: { fast: 150, normal: 250 }, components: { dialog: { type: 'scale', easing: 'spring' } } } }

// No animation (a11y/testing)
{ motion: { enabled: false } }
```

---

## Animation Patterns

### Pattern 1: Overlays (Dialog, Drawer)

Backdrop fades in, content slides/scales. Uses `@starting-style`:

```tsx
const styles = stylex.create({
  overlay: {
    opacity: { default: 1, '@starting-style': 0 },
    transition: `opacity ${motionTokens.durationNormal} ${motionTokens.easingEaseOut}`,
  },
});
```

### Pattern 2: Collapse (Accordion, Collapsible)

Height 0→auto via CSS grid trick:

```tsx
const styles = stylex.create({
  wrapper: {
    display: 'grid',
    gridTemplateRows: '0fr',
    transition: `grid-template-rows ${motionTokens.durationFast} ${motionTokens.easingDefault}`,
  },
  wrapperOpen: { gridTemplateRows: '1fr' },
  content: { overflow: 'hidden' },
});
```

### Pattern 3: Popups (Popover, Tooltip, Menu)

Fast fade in:

```tsx
const styles = stylex.create({
  popup: {
    opacity: { default: 1, '@starting-style': 0 },
    transition: `opacity ${motionTokens.durationFast} ${motionTokens.easingDefault}`,
  },
});
```

### Pattern 4: Toast

Slide from edge:

```tsx
const styles = stylex.create({
  toast: {
    transform: { default: 'translateX(0)', '@starting-style': 'translateX(100%)' },
    transition: `transform ${motionTokens.durationFast} ${motionTokens.easingEaseOut}`,
  },
});
```

---

## Reduced Motion

Handled automatically. `prefers-reduced-motion` sets durations to `0ms`. Themes can override:
- `'respect'` (default): honor OS preference
- `'always-reduce'`: force reduced motion
- `'ignore'`: ignore OS preference

Animation primitives are NOT exported. Swizzle is the escape hatch.

---

## Alternatives Considered

| Library | Size | Exit Animations | Notes |
|---------|------|-----------------|-------|
| CSS-only | 0KB | ❌ | Selected — handles 90% of needs |
| Motion | ~18KB | ✅ | Best DX, but runtime cost |
| Headless UI Transition | ~3KB | ✅ | Class-string API contradicts XDS |
| View Transitions API | 0KB | ✅ | Browser-native, Firefox behind flag |

Also rejected: exposing `<Fade>`, `<Slide>` primitives (wrapper div problem, cognitive load, inconsistency) and animation props on components (scattered decisions, inconsistent UX).

---

## Browser Support

`@starting-style`: Chrome 117+, Safari 17.4+. Firefox falls back gracefully (content appears instantly, not broken).

## Open Questions

- Exit animations: skip entirely or implement `useAnimatedUnmount` hook?
- `@starting-style` browser support sufficient for production?

## Related

- [[System Architecture]] — Core philosophy
- [[Swizzle Ergonomics]] — Customization paths
- [[Why StyleX]] — Styling decision
