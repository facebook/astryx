# Type Scale Reference

## Architecture

```
typeScale: { base, ratio }
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Layer 1: Raw Size Tokens                       │
│  --text-xsm … --text-4xl                       │
│  Geometric: round(base × ratio^step)            │
├─────────────────────────────────────────────────┤
│  Note: Leading Tokens                       │
│  --leading-tight … --leading-4xl                │
│  Tiered target ratio, 4px grid snap             │
├─────────────────────────────────────────────────┤
│  Layer 2: Semantic Tokens                       │
│  --heading-*-size → var(--text-*)               │
│  --heading-*-leading → var(--leading-*)          │
│  --text-*-size → var(--text-*)                  │
│  --text-*-leading → var(--leading-*)             │
│  Weight tokens unchanged (already var refs)     │
└─────────────────────────────────────────────────┘
```

## Step Mapping

| Step | Size Token    | Leading Token       | Heading | Text Type         |
| ---- | ------------- | ------------------- | ------: | ----------------- |
| -2   | `--text-xsm`  | `--leading-tight`   |      h6 |                   |
| -1   | `--text-sm`   | `--leading-snug`    |      h5 | supporting        |
| 0    | `--text-base` | `--leading-base`    |      h4 | body, label, code |
| +1   | `--text-lg`   | `--leading-normal`  |      h3 | large             |
| +2   | `--text-xl`   | `--leading-relaxed` |      h2 |                   |
| +3   | `--text-2xl`  | `--leading-2xl`     |      h1 |                   |
| +4   | `--text-3xl`  | `--leading-3xl`     |         |                   |
| +5   | `--text-4xl`  | `--leading-4xl`     |         |                   |

## Line Height Computation

Tiered target ratio based on font size:

```
targetRatio = fontSize < 20 ? 1.5 : fontSize < 32 ? 1.4 : 1.25
```

4px grid snap with `Math.round`:

```
rawLh     = fontSize × targetRatio
minLh     = ceil((fontSize + 4) / 4) × 4
snappedLh = max(round(rawLh / 4) × 4, minLh)
ratio     = snappedLh / fontSize
```

## Default Scale: base=14, ratio=1.2

### Raw Size Tokens

| Step | Token         | Formula    | Raw     | Rounded  |
| ---- | ------------- | ---------- | ------- | -------- |
| -2   | `--text-xsm`  | 14 × 1.2⁻² | 9.72px  | **10px** |
| -1   | `--text-sm`   | 14 × 1.2⁻¹ | 11.67px | **12px** |
| 0    | `--text-base` | 14 × 1.2⁰  | 14.00px | **14px** |
| +1   | `--text-lg`   | 14 × 1.2¹  | 16.80px | **17px** |
| +2   | `--text-xl`   | 14 × 1.2²  | 20.16px | **20px** |
| +3   | `--text-2xl`  | 14 × 1.2³  | 24.19px | **24px** |
| +4   | `--text-3xl`  | 14 × 1.2⁴  | 29.03px | **29px** |
| +5   | `--text-4xl`  | 14 × 1.2⁵  | 34.84px | **35px** |

### Leading Tokens

| Step | Token               | Font | Target | Raw LH | Min LH | Snapped | **Ratio**  |
| ---- | ------------------- | ---- | ------ | ------ | ------ | ------- | ---------- |
| -2   | `--leading-tight`   | 10px | 1.5    | 15.0px | 16px   | 16px    | **1.6**    |
| -1   | `--leading-snug`    | 12px | 1.5    | 18.0px | 16px   | 16px    | **1.3333** |
| 0    | `--leading-base`    | 14px | 1.5    | 21.0px | 20px   | 20px    | **1.4286** |
| +1   | `--leading-normal`  | 17px | 1.5    | 25.5px | 24px   | 24px    | **1.4118** |
| +2   | `--leading-relaxed` | 20px | 1.4    | 28.0px | 24px   | 28px    | **1.4**    |
| +3   | `--leading-2xl`     | 24px | 1.4    | 33.6px | 28px   | 32px    | **1.3333** |
| +4   | `--leading-3xl`     | 29px | 1.4    | 40.6px | 36px   | 40px    | **1.3793** |
| +5   | `--leading-4xl`     | 35px | 1.25   | 43.8px | 40px   | 44px    | **1.2571** |

### Verification

| Element         | Font | LH px | Ratio  | 4px ✓ | ≥f+4 ✓ |
| --------------- | ---- | ----- | ------ | ----- | ------ |
| text-body       | 14px | 20px  | 1.4286 | ✓     | ✓      |
| text-large      | 17px | 24px  | 1.4118 | ✓     | ✓      |
| text-label      | 14px | 20px  | 1.4286 | ✓     | ✓      |
| text-code       | 14px | 20px  | 1.4286 | ✓     | ✓      |
| text-supporting | 12px | 16px  | 1.3333 | ✓     | ✓      |
| heading-1       | 24px | 32px  | 1.3333 | ✓     | ✓      |
| heading-2       | 20px | 28px  | 1.4    | ✓     | ✓      |
| heading-3       | 17px | 24px  | 1.4118 | ✓     | ✓      |
| heading-4       | 14px | 20px  | 1.4286 | ✓     | ✓      |
| heading-5       | 12px | 16px  | 1.3333 | ✓     | ✓      |
| heading-6       | 10px | 16px  | 1.6    | ✓     | ✓      |

## Raw CSS Output (default theme)

Generated by `generateThemeCSS` for `typeScale: { base: 14, ratio: 1.2 }`:

```css
@scope ([data-xds-theme="default"]) to ([data-xds-theme]) {
  :scope {
    /* ── Layer 1: Raw size tokens (geometric: round(14 × 1.2^step)) ── */
    --text-xsm: 10px;       /* step -2 */
    --text-sm: 12px;         /* step -1 */
    --text-base: 14px;       /* step  0 (anchor) */
    --text-lg: 17px;         /* step +1 */
    --text-xl: 20px;         /* step +2 */
    --text-2xl: 24px;        /* step +3 */
    --text-3xl: 29px;        /* step +4 */
    --text-4xl: 35px;        /* step +5 */

    /* ── Note: Leading tokens (tiered target, 4px grid snap) ── */
    /* target: <20px→1.5, 20–31px→1.4, ≥32px→1.25 */
    --leading-tight: 1.6;    /* 10px → 16px line */
    --leading-snug: 1.3333;  /* 12px → 16px line */
    --leading-base: 1.4286;  /* 14px → 20px line */
    --leading-normal: 1.4118;/* 17px → 24px line */
    --leading-relaxed: 1.4;  /* 20px → 28px line */
    --leading-2xl: 1.3333;   /* 24px → 32px line */
    --leading-3xl: 1.3793;   /* 29px → 40px line */
    --leading-4xl: 1.2571;   /* 35px → 44px line */

    /* ── Layer 2: Semantic tokens (var refs to Layer 1/1b) ── */

    /* Headings: h1=step+3, h2=+2, h3=+1, h4=0, h5=-1, h6=-2 */
    --heading-1-size: var(--text-2xl);
    --heading-1-weight: var(--font-weight-semibold);
    --heading-1-leading: var(--leading-2xl);
    --heading-2-size: var(--text-xl);
    --heading-2-weight: var(--font-weight-semibold);
    --heading-2-leading: var(--leading-relaxed);
    --heading-3-size: var(--text-lg);
    --heading-3-weight: var(--font-weight-semibold);
    --heading-3-leading: var(--leading-normal);
    --heading-4-size: var(--text-base);
    --heading-4-weight: var(--font-weight-semibold);
    --heading-4-leading: var(--leading-base);
    --heading-5-size: var(--text-sm);
    --heading-5-weight: var(--font-weight-semibold);
    --heading-5-leading: var(--leading-snug);
    --heading-6-size: var(--text-xsm);
    --heading-6-weight: var(--font-weight-semibold);
    --heading-6-leading: var(--leading-tight);

    /* Text types: body/label/code=step 0, large=+1, supporting=-1 */
    --text-body-size: var(--text-base);
    --text-body-weight: var(--font-weight-normal);
    --text-body-leading: var(--leading-base);
    --text-large-size: var(--text-lg);
    --text-large-weight: var(--font-weight-semibold);
    --text-large-leading: var(--leading-normal);
    --text-label-size: var(--text-base);
    --text-label-weight: var(--font-weight-medium);
    --text-label-leading: var(--leading-base);
    --text-code-size: var(--text-base);
    --text-code-weight: var(--font-weight-normal);
    --text-code-leading: var(--leading-base);
    --text-supporting-size: var(--text-sm);
    --text-supporting-weight: var(--font-weight-normal);
    --text-supporting-leading: var(--leading-snug);
  }

  /* Component overrides (auto-generated from typeScale) */
  .xds-heading.level-1 { ... }
  .xds-heading.level-2 { ... }
  /* etc. */
}
```
