# @astryxdesign/icons-heroicons

> **Experimental.** This package, its icon set, and the `astryx experimental icon` commands it works with may change or be removed in any patch release. It is not published yet.

The official [Heroicons](https://heroicons.com) icon set for Astryx. Every Heroicons icon is a `<Name>Icon` component, in three looks:

| Look      | Export           | Heroicons style |
| --------- | ---------------- | --------------- |
| `outline` | `TrashIcon`      | 24px outline    |
| `solid`   | `TrashSolidIcon` | 24px solid      |
| `mini`    | `TrashMiniIcon`  | 20px solid      |

Each icon is mapped to the Astryx icon definitions it draws (`delete`, `close`, `search`, …), so agents find icons by meaning and Astryx templates use them.

## Use it

```bash
npm install @astryxdesign/icons-heroicons
npx astryx experimental icon use heroicons
```

```tsx
import {Icon} from '@astryxdesign/core/Icon';
import {TrashIcon} from '@astryxdesign/icons-heroicons';

<Icon icon={TrashIcon} size="sm" />;
```

- `astryx experimental icon delete` finds the icon for a meaning and prints its import line.
- With `experimental.iconSet` set to `heroicons`, `astryx template` writes each template's icons from this set.
- `themeIcons` points Core's built-in icon names at Heroicons artwork: `defineTheme({name: 'brand', icons: themeIcons})`.

## Coverage

Every built-in Astryx icon definition is mapped. Of the other Astryx definitions, `drag` and `pin` have no Heroicons icon and are left unmapped.

## Maintain it

The set lives in `icon-sets/heroicons/`: the descriptor, the data file (`heroicons.icons.json`), and the module the CLI generates. Change it with the CLI, never by hand:

```bash
npx astryx experimental icon new-set heroicons --from @heroicons/react/24/outline
npx astryx experimental icon add TrashIcon --from @heroicons/react/24/solid --variant solid
npx astryx experimental icon map delete trash
pnpm check
```

## License

The package is MIT. The Heroicons artwork is MIT, copyright Tailwind Labs, Inc.; both notices are in [`LICENSE`](./LICENSE).
