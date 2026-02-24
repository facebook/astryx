# /packages/core/src/CommandPalette

Command palette component (Cmd+K) for searching and executing commands.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Provider/Context pattern**: Any component in the tree can register commands
- **Lifecycle-aware**: Commands register on mount, deregister on unmount
- **Fuzzy search**: Scores by exact match, starts-with, contains, aliases, and keywords
- **Search highlighting**: Contiguous matching portions are bolded in results via `<mark>` elements
- **Async command loading**: Fetch commands from external sources with loading spinner
- **Keyboard navigation**: ArrowUp/Down, Enter, Escape, Home/End
- **Grouped results**: Commands organized by group with "Recent" at top
- **Nested pages**: Commands can open sub-pages for hierarchical navigation
- **History tracking**: Recently used commands with invocation count, relative timestamps, source group, per-entry clearing, and optional localStorage persistence
- **Shortcut display**: Keyboard shortcut hints rendered as `<kbd>` elements
- **Accessible**: Proper ARIA roles (combobox, listbox, option), keyboard-driven

## Usage

```tsx
import {
  XDSCommandPaletteProvider,
  useXDSCommandPaletteRegister,
  useXDSCommandPalette,
} from '@xds/core/CommandPalette';

// 1. Wrap your app with the provider
function App() {
  return (
    <XDSCommandPaletteProvider>
      <Navigation />
      <MainContent />
    </XDSCommandPaletteProvider>
  );
}

// 2. Register commands from any component
function Navigation() {
  useXDSCommandPaletteRegister([
    {
      id: 'home',
      label: 'Go to Home',
      icon: 'home',
      onSelect: () => navigate('/'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      onSelect: () => navigate('/settings'),
    },
  ]);

  return <nav>...</nav>;
}

// 3. Programmatically open/close
function SearchButton() {
  const {open} = useXDSCommandPalette();
  return <button onClick={() => open()}>Search (Cmd+K)</button>;
}
```

### Async command loading

```tsx
async function fetchCommands(query: string): Promise<XDSCommand[]> {
  const response = await fetch(`/api/commands?q=${query}`);
  return response.json();
}

<XDSCommandPaletteProvider commandFetcher={fetchCommands} fetchDebounceMs={200}>
  <App />
</XDSCommandPaletteProvider>;
```

Local commands appear instantly while remote commands load with a spinner. Fetched commands are deduplicated against locally registered commands (local takes precedence).

## Provider Props

| Prop               | Type                                       | Default                | Description                       |
| ------------------ | ------------------------------------------ | ---------------------- | --------------------------------- |
| `children`         | `ReactNode`                                | --                     | Application content (required)    |
| `shortcut`         | `string`                                   | `"mod+k"`              | Keyboard shortcut to open palette |
| `isPersistHistory` | `boolean`                                  | `false`                | Persist history to localStorage   |
| `maxHistory`       | `number`                                   | `10`                   | Maximum history entries           |
| `placeholder`      | `string`                                   | `"Search commands..."` | Search input placeholder          |
| `emptyContent`     | `ReactNode`                                | `"No results found"`   | Content when no results match     |
| `footer`           | `ReactNode`                                | --                     | Footer content                    |
| `xstyle`           | `StyleXStyles`                             | --                     | StyleX overrides                  |
| `commandFetcher`   | `(query: string) => Promise<XDSCommand[]>` | --                     | Async function to fetch commands  |
| `fetchDebounceMs`  | `number`                                   | `200`                  | Debounce delay before fetching    |
| `data-testid`      | `string`                                   | --                     | Test ID                           |

## XDSCommand

| Property    | Type          | Default | Description                             |
| ----------- | ------------- | ------- | --------------------------------------- |
| `id`        | `string`      | --      | Unique identifier (required)            |
| `label`     | `string`      | --      | Display label (required)                |
| `onSelect`  | `() => void`  | --      | Selection callback (required)           |
| `aliases`   | `string[]`    | --      | Alternative names (matched like labels) |
| `keywords`  | `string[]`    | --      | Additional search terms                 |
| `group`     | `string`      | --      | Group name for visual grouping          |
| `icon`      | `XDSIconType` | --      | Icon before the label                   |
| `shortcut`  | `string`      | --      | Display-only shortcut hint              |
| `page`      | `string`      | --      | Opens sub-page instead of executing     |
| `priority`  | `number`      | `0`     | Higher = ranked higher in results       |
| `isEnabled` | `boolean`     | `true`  | Whether the command is available        |

## Types

### `MatchRange`

Represents a character range in a label where the search query matched.

| Property | Type     | Description             |
| -------- | -------- | ----------------------- |
| `start`  | `number` | Start index (inclusive) |
| `end`    | `number` | End index (exclusive)   |

### `ScoredCommand`

A command paired with its fuzzy search score and match ranges.

| Property      | Type           | Description                          |
| ------------- | -------------- | ------------------------------------ |
| `command`     | `XDSCommand`   | The matched command                  |
| `score`       | `number`       | Match score (higher = better)        |
| `matchRanges` | `MatchRange[]` | Where the query matched in the label |

### `HistoryEntry`

A recorded history entry for recently used commands.

| Property    | Type     | Description                                  |
| ----------- | -------- | -------------------------------------------- |
| `id`        | `string` | The command ID that was selected             |
| `timestamp` | `number` | When the command was last selected           |
| `count`     | `number` | How many times this command has been invoked |

## Hooks

### `useXDSCommandPaletteRegister(commands, deps?)`

Register commands on mount, deregister on unmount. Re-registers when `deps` change.

### `useXDSCommandPalette()`

Returns `{ open, close, isOpen }` for imperative control.

## Theming

Themes can override CommandPalette styles via `ComponentStyles`:

```tsx
const theme: Theme = {
  components: {
    commandPalette: {
      root: myStyles,
    },
  },
};
```

### Available surfaces

| Surface | Description              |
| ------- | ------------------------ |
| `root`  | Container element styles |

## Accessibility

- Search input uses `role="combobox"` with `aria-autocomplete="list"`
- Results list uses `role="listbox"` with `role="option"` items
- Active item tracked via `aria-activedescendant`
- Shortcut hints use `aria-hidden="true"` (decorative)
- Full keyboard navigation: ArrowUp/Down, Enter, Escape, Home/End, Backspace (back)

## Files

| File                              | Role     | Purpose                                                     |
| --------------------------------- | -------- | ----------------------------------------------------------- |
| `index.ts`                        | Entry    | Public exports                                              |
| `types.ts`                        | Types    | Shared type definitions                                     |
| `fuzzySearch.ts`                  | Utility  | Search scoring algorithm with match ranges                  |
| `XDSCommandPaletteContext.tsx`    | Context  | React context definition                                    |
| `XDSCommandPaletteProvider.tsx`   | Provider | Registry, keyboard listener, history, async fetching        |
| `useXDSCommandPaletteRegister.ts` | Hook     | Register commands on mount                                  |
| `useXDSCommandPalette.ts`         | Hook     | Imperative open/close API                                   |
| `XDSCommandPalette.tsx`           | UI       | Modal search input, result list, keyboard nav, highlighting |
| `XDSCommandPalette.test.tsx`      | Test     | Unit tests                                                  |
