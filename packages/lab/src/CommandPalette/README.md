# CommandPalette

Command palette dialog for quick access to commands, navigation, and search.

## Architecture

The command palette is built incrementally as composable pieces:

1. **XDSCommandPalette** — Dialog shell with flex column layout (this PR)
2. **XDSCommandPaletteInput** — Search input with icon (planned)
3. **XDSCommandPaletteList / Item / Group** — Scrollable item list (planned)
4. **XDSCommandPaletteFooter** — Keyboard shortcut hints (planned)
5. **CommandPaletteContext** — State management provider (planned)

## Files

| File                         | Purpose                     |
| ---------------------------- | --------------------------- |
| `XDSCommandPalette.tsx`      | Root dialog shell component |
| `index.ts`                   | Public exports              |
| `README.md`                  | This file                   |
| `XDSCommandPalette.test.tsx` | Unit tests                  |

## Usage

```tsx
import {XDSCommandPalette} from '@xds/core/CommandPalette';

const [isOpen, setIsOpen] = useState(false);

<XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
  {/* Sub-components go here */}
</XDSCommandPalette>;
```
