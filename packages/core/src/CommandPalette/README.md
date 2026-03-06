# CommandPalette

A composable command palette (Cmd+K) for XDS applications.

## Architecture

Three layers, each building on the last:

1. **Composable Primitives** — Full rendering control via compound components
2. **Registry Provider** — Distributed command registration via hooks
3. **History Hook** — Optional opt-in history tracking

## File Manifest

| File                             | Purpose                                    |
| -------------------------------- | ------------------------------------------ |
| `index.ts`                       | Public exports                             |
| `types.ts`                       | Shared types (XDSCommand, filter function) |
| `filter.ts`                      | Default substring filter                   |
| `CommandPaletteContext.ts`       | Internal context for compound components   |
| `XDSCommandPalette.tsx`          | Root component (wraps XDSDialog)           |
| `XDSCommandPaletteInput.tsx`     | Search input with combobox ARIA            |
| `XDSCommandPaletteList.tsx`      | Scrollable results container (listbox)     |
| `XDSCommandPaletteItem.tsx`      | Selectable item (option)                   |
| `XDSCommandPaletteGroup.tsx`     | Visual grouping with heading               |
| `XDSCommandPaletteEmpty.tsx`     | Empty state                                |
| `XDSCommandPaletteLoading.tsx`   | Loading indicator                          |
| `XDSCommandPaletteSeparator.tsx` | Visual divider (wraps XDSDivider)          |
| `XDSCommandPaletteShortcut.tsx`  | Keyboard shortcut display                  |
| `XDSCommandPaletteFooter.tsx`    | Footer bar                                 |
| `XDSCommandPaletteProvider.tsx`  | Registry provider + hooks                  |
| `useXDSCommandPaletteHistory.ts` | Optional history hook                      |

## Usage

### Layer 1: Composable

```tsx
<XDSCommandPalette isShown={isShown} onOpenChange={open => setIsShown(open)}>
  <XDSCommandPaletteInput placeholder="Search..." />
  <XDSCommandPaletteList>
    <XDSCommandPaletteGroup heading="Navigation">
      <XDSCommandPaletteItem value="home" onSelect={() => navigate('/')}>
        <XDSIcon icon="home" size="sm" />
        <span>Go Home</span>
        <XDSCommandPaletteShortcut keys="mod+h" />
      </XDSCommandPaletteItem>
    </XDSCommandPaletteGroup>
    <XDSCommandPaletteEmpty>No results</XDSCommandPaletteEmpty>
  </XDSCommandPaletteList>
  <XDSCommandPaletteFooter>
    <span>↑↓ Navigate</span>
    <span>↵ Select</span>
  </XDSCommandPaletteFooter>
</XDSCommandPalette>
```

### Layer 2: Provider

```tsx
// Wrap your app
<XDSCommandPaletteProvider shortcut="mod+k">
  <App />
</XDSCommandPaletteProvider>;

// Register commands from anywhere
function Navigation() {
  useXDSCommandPaletteRegister([
    {id: 'home', label: 'Go Home', icon: 'home', onSelect: () => navigate('/')},
    {
      id: 'settings',
      label: 'Settings',
      shortcut: 'mod+,',
      onSelect: () => navigate('/settings'),
    },
  ]);
  return <nav>...</nav>;
}

// Imperative control
function SearchButton() {
  const {open} = useXDSCommandPalette();
  return <XDSButton label="Search" onClick={open} />;
}
```

### Layer 3: History

```tsx
const {history, record, clear} = useXDSCommandPaletteHistory({
  persist: true,
  maxEntries: 10,
});
```
