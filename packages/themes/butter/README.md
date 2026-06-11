# @xds/theme-butter

Golden buttery theme for XDS with blue accents. Sarina for display type, Outfit for headings and body.

## Install

```bash
npm install @xds/theme-butter
```

## Usage

```tsx
import {butterTheme} from '@xds/theme-butter/built';
import {XDSTheme} from '@xds/core/theme';
import '@xds/theme-butter/theme.css';

function App() {
  return <XDSTheme theme={butterTheme}>{/* Your app content */}</XDSTheme>;
}
```

## Colors

Source palette:

| Role    | Hex       |
| ------- | --------- |
| Accent  | `#225BFF` |
| Yellow  | `#FDEE8C` |
| Error   | `#FC473B` |
| Warning | `#FFC502` |
| Success | `#91D143` |
| Info    | `#4883FD` |

Each color (Blue, Cyan, Green, Orange, Pink, Purple, Red, Teal, Yellow,
plus Error / Warning / Success) is published as a smooth 21-step tonal
palette in `butterPalettes`. Categorical badges, cards, and banner text
roles read from these palettes via:

- `T90` light / `T15` dark: background surfaces
- `T80` light / `T25` dark: borders, dark-mode text
- `T25` light / `T80` dark: light-mode text, icons

To regenerate the palettes after changing a source color, edit the
`SOURCES` map in `scripts/generate-palettes.mjs`, run the script, and
paste the output back into `src/butterTheme.ts`.

## Typography

- **Display**: Sarina (cursive), applied per-page via inline style.
- **Heading & Body**: Outfit, base 14px, ratio 1.25.
- **Code**: JetBrains Mono.

Sarina and Outfit ship via Google Fonts. Add the appropriate
`<link rel="stylesheet" href="...">` to your document `<head>` to avoid
runtime font fetching.
