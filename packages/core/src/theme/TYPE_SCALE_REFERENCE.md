# Type Scale Reference

## Architecture

```
typeScale: { base, ratio }
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Layer 1: Raw Size Tokens (rem)                 │
│  --text-4xs … --text-4xl                        │
│  Geometric: round(base × ratio^step) / 16       │
├─────────────────────────────────────────────────┤
│  Layer 2: Semantic Tokens                       │
│  Sizes → var(--text-*)                          │
│  Line heights → hardcoded computed values       │
│  Weights → var(--font-weight-*) (unchanged)     │
└─────────────────────────────────────────────────┘

Named leading tokens (--leading-tight … --leading-relaxed)
are NOT part of the type scale system — untouched.
```

## Step Mapping

| Step | Size Token    | Heading | Text Type         |
| ---- | ------------- | ------: | ----------------- |
| -5   | `--text-4xs`  |         |                   |
| -4   | `--text-3xs`  |         |                   |
| -3   | `--text-2xs`  |         |                   |
| -2   | `--text-xsm`  |      h6 |                   |
| -1   | `--text-sm`   |      h5 | supporting        |
| 0    | `--text-base` |      h4 | body, label, code |
| +1   | `--text-lg`   |      h3 | large             |
| +2   | `--text-xl`   |      h2 |                   |
| +3   | `--text-2xl`  |      h1 |                   |
| +4   | `--text-3xl`  |         |                   |
| +5   | `--text-4xl`  |         |                   |

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

| Step | Token         | Formula    | Raw     | Rounded  | Rem       |
| ---- | ------------- | ---------- | ------- | -------- | --------- |
| -5   | `--text-4xs`  | 14 × 1.2⁻⁵ | 5.63px  | **6px**  | 0.375rem  |
| -4   | `--text-3xs`  | 14 × 1.2⁻⁴ | 6.75px  | **7px**  | 0.4375rem |
| -3   | `--text-2xs`  | 14 × 1.2⁻³ | 8.10px  | **8px**  | 0.5rem    |
| -2   | `--text-xsm`  | 14 × 1.2⁻² | 9.72px  | **10px** | 0.625rem  |
| -1   | `--text-sm`   | 14 × 1.2⁻¹ | 11.67px | **12px** | 0.75rem   |
| 0    | `--text-base` | 14 × 1.2⁰  | 14.00px | **14px** | 0.875rem  |
| +1   | `--text-lg`   | 14 × 1.2¹  | 16.80px | **17px** | 1.0625rem |
| +2   | `--text-xl`   | 14 × 1.2²  | 20.16px | **20px** | 1.25rem   |
| +3   | `--text-2xl`  | 14 × 1.2³  | 24.19px | **24px** | 1.5rem    |
| +4   | `--text-3xl`  | 14 × 1.2⁴  | 29.03px | **29px** | 1.8125rem |
| +5   | `--text-4xl`  | 14 × 1.2⁵  | 34.84px | **35px** | 2.1875rem |

### Semantic Token Verification

| Element        | Font | Target | LH px | Ratio  | 4px ✓ | ≥f+4 ✓ |
| -------------- | ---- | ------ | ----- | ------ | ----- | ------ |
| heading-1      | 24px | 1.4    | 32px  | 1.3333 | ✓     | ✓      |
| heading-2      | 20px | 1.4    | 28px  | 1.4    | ✓     | ✓      |
| heading-3      | 17px | 1.5    | 24px  | 1.4118 | ✓     | ✓      |
| heading-4/body | 14px | 1.5    | 20px  | 1.4286 | ✓     | ✓      |
| heading-5/supp | 12px | 1.5    | 20px  | 1.6667 | ✓     | ✓      |
| heading-6      | 10px | 1.5    | 16px  | 1.6    | ✓     | ✓      |
| text-large     | 17px | 1.5    | 24px  | 1.4118 | ✓     | ✓      |
