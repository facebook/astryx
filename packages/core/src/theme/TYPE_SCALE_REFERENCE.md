# Type Scale Reference

Internal reference for the type scale computation. For token docs, see `packages/cli/docs/tokens.md`.

## Architecture

```
typeScale: { base, ratio }  →  Layer 1 (raw)  →  Layer 2 (semantic)
```

- **Layer 1 — Raw size tokens** (`--text-4xs` … `--text-4xl`): geometric `round(base × ratio^step) / 16` in rem
- **Layer 2 — Semantic tokens**: sizes are `var()` refs to Layer 1, line heights are 4px-grid-snapped computed values
- **Named leading** (`--leading-tight` … `--leading-relaxed`): untouched by the type scale system

## Step → Token Mapping

| Step | Token         | Heading | Text Type         |
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

```
targetRatio = fontSize < 20 ? 1.5 : fontSize < 32 ? 1.4 : 1.25
snappedLh   = max(round(fontSize × targetRatio / 4) × 4, ceil((fontSize + 4) / 4) × 4)
```

Guarantees: divisible by 4px, minimum `fontSize + 4`.
