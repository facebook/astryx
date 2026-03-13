# XDS + Tailwind Design System

React design system for building internal tools. All components use the `XDS` prefix.
XDS components handle structure, behavior, and accessibility. Use Tailwind utility classes for layout, spacing, and visual customization.

> This document is auto-generated from source. Do not edit manually.

## Key Concept

All XDS components accept a `className` prop for Tailwind utilities. Use XDS components for structure and behavior, Tailwind for styling.

```tsx
// XDS components + Tailwind utilities
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

<XDSCard className="max-w-md p-6 shadow-lg">
  <XDSVStack className="gap-4">
    <XDSHeading level={2}>Title</XDSHeading>
    <XDSText className="text-gray-500">Description text</XDSText>
    <XDSButton label="Submit" variant="primary" />
  </XDSVStack>
</XDSCard>;
```

## CLI Reference

Run these commands to get detailed docs on any component:

- `npx xds component metadata <Name>` — description, features, notes, a11y
- `npx xds component props <Name>` — props table
- `npx xds component list` — all components by category
- `npx xds component catalog` — brief summaries of all components
- `npx xds docs tokens` — token reference (spacing, color, radius)
- `npx xds docs theme` — theme system reference

## Principles

React design system for internal tools. Components use `XDS` prefix.

### Rules

1. Use XDS components for everything they cover
2. Use Tailwind utility classes for layout, spacing, colors, and responsive design
3. Semantic tokens, not hardcoded values
4. CSS variables for colors, not hex
5. Form inputs are controlled (value + onChange)

### Styling with Tailwind

Use Tailwind utilities for:

- **Spacing**: `p-4`, `mt-2`, `gap-3`, `mx-auto`, `space-y-4`
- **Layout**: `flex`, `grid`, `max-w-md`, `w-full`, `items-center`, `justify-between`
- **Colors**: `text-gray-500`, `bg-white`, `border-gray-200`, `bg-blue-50`
- **Typography**: `text-sm`, `font-semibold`, `text-center`, `truncate`
- **Responsive**: `sm:grid-cols-2`, `md:flex-row`, `lg:max-w-4xl`
- **Borders**: `rounded-lg`, `border`, `shadow-md`
- **States**: `hover:bg-gray-100`, `focus:ring-2`, `disabled:opacity-50`

### Anti-Patterns

❌ Inline `style={{}}` on elements → Use Tailwind classes via `className`
❌ Hardcoded colors (#fff) → Use Tailwind color classes or var(--color-\*)
❌ Inventing props → Read component docs first
❌ Reimplementing components that XDS provides → Check the catalog below

## Component Catalog

Brief summaries of all available components. Run `npx xds component metadata <Name>` for full docs.

### Layout

| Component        | Import                  | Description                                    |
| ---------------- | ----------------------- | ---------------------------------------------- |
| XDSAspectRatio   | `@xds/core/AspectRatio` | Maintains aspect ratio for content             |
| XDSCenter        | `@xds/core/Center`      | Centers content horizontally and vertically    |
| XDSGrid          | `@xds/core/Grid`        | CSS grid layout container                      |
| XDSGridSpan      | `@xds/core/Grid`        | Grid item that spans columns                   |
| XDSHStack        | `@xds/core/Stack`       | Horizontal stack layout                        |
| XDSLayout        | `@xds/core/Layout`      | Page-level layout with header, content, panels |
| XDSLayoutContent | `@xds/core/Layout`      | Main content area of layout                    |
| XDSLayoutFooter  | `@xds/core/Layout`      | Footer area of layout                          |
| XDSLayoutHeader  | `@xds/core/Layout`      | Header area of layout                          |
| XDSLayoutPanel   | `@xds/core/Layout`      | Side panel of layout                           |
| XDSStack         | `@xds/core/Stack`       | Generic stack (horizontal or vertical)         |
| XDSStackItem     | `@xds/core/Stack`       | Individual item in a stack                     |
| XDSVStack        | `@xds/core/Stack`       | Vertical stack layout                          |

### Display

| Component          | Import               | Description                        |
| ------------------ | -------------------- | ---------------------------------- |
| XDSAvatar          | `@xds/core/Avatar`   | User avatar with image or initials |
| XDSAvatarStatusDot | `@xds/core/Avatar`   | Status indicator on avatar         |
| XDSBadge           | `@xds/core/Badge`    | Small label/count indicator        |
| XDSBaseTable       | `@xds/core/Table`    | Low-level table primitive          |
| XDSDivider         | `@xds/core/Divider`  | Visual separator line              |
| XDSFontWrapper     | `@xds/core/Text`     | Font family wrapper                |
| XDSHeading         | `@xds/core/Text`     | Heading text (h1-h6)               |
| XDSIcon            | `@xds/core/Icon`     | Icon display component             |
| XDSSkeleton        | `@xds/core/Skeleton` | Loading placeholder                |
| XDSTable           | `@xds/core/Table`    | Data table with sorting            |
| XDSTableCell       | `@xds/core/Table`    | Table cell                         |
| XDSTableHeaderCell | `@xds/core/Table`    | Table header cell                  |
| XDSTableRow        | `@xds/core/Table`    | Table row                          |
| XDSText            | `@xds/core/Text`     | Body text with type scales         |

### Form

| Component         | Import                    | Description                          |
| ----------------- | ------------------------- | ------------------------------------ |
| XDSCheckboxInput  | `@xds/core/CheckboxInput` | Checkbox with label                  |
| XDSDateInput      | `@xds/core/DateInput`     | Date picker input                    |
| XDSField          | `@xds/core/Field`         | Form field wrapper with label/status |
| XDSFieldLabel     | `@xds/core/Field`         | Field label                          |
| XDSFieldStatus    | `@xds/core/Field`         | Field validation status              |
| XDSNumberInput    | `@xds/core/NumberInput`   | Numeric input with stepper           |
| XDSRadioList      | `@xds/core/RadioList`     | Radio button group                   |
| XDSRadioListItem  | `@xds/core/RadioList`     | Individual radio option              |
| XDSSelector       | `@xds/core/Selector`      | Dropdown select                      |
| XDSSelectorItem   | `@xds/core/Selector`      | Selector option item                 |
| XDSSelectorOption | `@xds/core/Selector`      | Selector option                      |
| XDSSlider         | `@xds/core/Slider`        | Range slider                         |
| XDSSwitch         | `@xds/core/Switch`        | Toggle switch                        |
| XDSTextArea       | `@xds/core/TextArea`      | Multi-line text input                |
| XDSTextInput      | `@xds/core/TextInput`     | Single-line text input               |
| XDSTimeInput      | `@xds/core/TimeInput`     | Time picker input                    |

### Action

| Component           | Import                   | Description                                     |
| ------------------- | ------------------------ | ----------------------------------------------- |
| XDSButton           | `@xds/core/Button`       | Button with variants (primary, secondary, etc.) |
| XDSDropdownMenu     | `@xds/core/DropdownMenu` | Dropdown menu with items                        |
| XDSDropdownMenuItem | `@xds/core/DropdownMenu` | Menu item                                       |
| XDSLink             | `@xds/core/Link`         | Navigation link                                 |
| XDSLinkProvider     | `@xds/core/Link`         | Link routing provider                           |

### Navigation

| Component         | Import              | Description            |
| ----------------- | ------------------- | ---------------------- |
| XDSTab            | `@xds/core/TabList` | Individual tab         |
| XDSTabList        | `@xds/core/TabList` | Tab navigation bar     |
| XDSTabMenu        | `@xds/core/TabList` | Tab with dropdown menu |
| XDSTopNav         | `@xds/core/TopNav`  | Top navigation bar     |
| XDSTopNavItem     | `@xds/core/TopNav`  | Nav bar item           |
| XDSTopNavMegaMenu | `@xds/core/TopNav`  | Mega menu dropdown     |
| XDSTopNavMenu     | `@xds/core/TopNav`  | Nav bar menu           |
| XDSTopNavTitle    | `@xds/core/TopNav`  | Nav bar title/logo     |

### Overlay

| Component       | Import               | Description          |
| --------------- | -------------------- | -------------------- |
| XDSCalendar     | `@xds/core/Calendar` | Calendar date picker |
| XDSDialog       | `@xds/core/Dialog`   | Modal dialog         |
| XDSDialogHeader | `@xds/core/Dialog`   | Dialog header        |
| XDSHoverCard    | `@xds/core/Layer`    | Card shown on hover  |
| XDSPopover      | `@xds/core/Layer`    | Popover overlay      |
| XDSTooltip      | `@xds/core/Layer`    | Tooltip overlay      |

### Other

| Component           | Import                  | Description                               |
| ------------------- | ----------------------- | ----------------------------------------- |
| XDSAppShell         | `@xds/core/AppShell`    | Application shell wrapper                 |
| XDSBanner           | `@xds/core/Banner`      | Banner notification                       |
| XDSBaseTypeahead    | `@xds/core/Typeahead`   | Low-level typeahead primitive             |
| XDSBreadcrumbItem   | `@xds/core/Breadcrumbs` | Breadcrumb item                           |
| XDSBreadcrumbs      | `@xds/core/Breadcrumbs` | Breadcrumb navigation                     |
| XDSCard             | `@xds/core/Card`        | Content card container                    |
| XDSCollapsible      | `@xds/core/Collapsible` | Collapsible/expandable section            |
| XDSCollapsibleGroup | `@xds/core/Collapsible` | Group of collapsible sections (accordion) |
| XDSEmptyState       | `@xds/core/EmptyState`  | Empty state placeholder                   |
| XDSFormLayout       | `@xds/core/FormLayout`  | Form layout helper                        |
| XDSKbd              | `@xds/core/Kbd`         | Keyboard shortcut display                 |
| XDSList             | `@xds/core/List`        | List container                            |
| XDSListItem         | `@xds/core/List`        | List item                                 |
| XDSMobileNav        | `@xds/core/MobileNav`   | Mobile navigation drawer                  |
| XDSMoreMenu         | `@xds/core/MoreMenu`    | "..." overflow menu                       |
| XDSNavIcon          | `@xds/core/NavIcon`     | Navigation icon button                    |
| XDSPagination       | `@xds/core/Pagination`  | Page navigation controls                  |
| XDSProgressBar      | `@xds/core/ProgressBar` | Progress indicator bar                    |
| XDSSection          | `@xds/core/Section`     | Content section with heading              |
| XDSSideNav          | `@xds/core/SideNav`     | Side navigation panel                     |
| XDSSideNavHeader    | `@xds/core/SideNav`     | Side nav header                           |
| XDSSideNavItem      | `@xds/core/SideNav`     | Side nav item                             |
| XDSSideNavSection   | `@xds/core/SideNav`     | Side nav section group                    |
| XDSSpinner          | `@xds/core/Spinner`     | Loading spinner                           |
| XDSStatusDot        | `@xds/core/StatusDot`   | Status indicator dot                      |
| XDSToken            | `@xds/core/Token`       | Removable tag/token                       |
| XDSTokenizer        | `@xds/core/Tokenizer`   | Multi-token input                         |
| XDSTypeahead        | `@xds/core/Typeahead`   | Searchable dropdown with suggestions      |
| XDSTypeaheadItem    | `@xds/core/Typeahead`   | Typeahead suggestion item                 |

## Token Reference

XDS provides CSS custom properties you can reference alongside Tailwind utilities:

### Spacing Tokens

| Token             | Value | Usage           |
| ----------------- | ----- | --------------- |
| var(--spacing-0)  | 0px   | No spacing      |
| var(--spacing-1)  | 4px   | Tight spacing   |
| var(--spacing-2)  | 8px   | Compact spacing |
| var(--spacing-3)  | 12px  | Default small   |
| var(--spacing-4)  | 16px  | Default medium  |
| var(--spacing-6)  | 24px  | Loose           |
| var(--spacing-8)  | 32px  | Extra loose     |
| var(--spacing-12) | 48px  | Maximum spacing |

### Color Tokens

| Token                       | Usage                |
| --------------------------- | -------------------- |
| var(--color-accent)         | Primary action color |
| var(--color-surface)        | Background surface   |
| var(--color-wash)           | Secondary background |
| var(--color-positive)       | Success states       |
| var(--color-negative)       | Error states         |
| var(--color-warning)        | Warning states       |
| var(--color-text-primary)   | Main text            |
| var(--color-text-secondary) | Secondary text       |
| var(--color-text-link)      | Link text            |

### Radius Tokens

| Token                   | Value  | Usage           |
| ----------------------- | ------ | --------------- |
| var(--radius-rounded)   | 9999px | Pills, avatars  |
| var(--radius-container) | 12px   | Cards, modals   |
| var(--radius-element)   | 8px    | Buttons, inputs |
| var(--radius-content)   | 4px    | Small elements  |

### Size Tokens

| Token          | Value | Usage                |
| -------------- | ----- | -------------------- |
| var(--size-sm) | 28px  | Compact controls     |
| var(--size-md) | 32px  | Default control size |
| var(--size-lg) | 36px  | Larger controls      |

### Using Tokens with Tailwind

You can reference XDS tokens in Tailwind arbitrary values:

```tsx
<div className="p-[var(--spacing-4)] bg-[var(--color-surface)] rounded-[var(--radius-container)]">
  Content
</div>
```

Or simply use Tailwind's built-in scale which maps closely:

- `p-4` ≈ var(--spacing-4) (16px)
- `rounded-xl` ≈ var(--radius-container) (12px)
- `rounded-lg` ≈ var(--radius-element) (8px)

## Theme System

XDS uses a theme provider for consistent styling:

```tsx
import {XDSTheme, defaultTheme} from '@xds/core';

<XDSTheme theme={defaultTheme}>
  <App />
</XDSTheme>;
```

### Custom Themes

Create themes by overriding CSS custom properties:

```tsx
const myTheme = {
  ...defaultTheme,
  '--color-accent': '#7B61FF',
  '--color-surface': '#1A1A2E',
};

<XDSTheme theme={myTheme}>
  <App />
</XDSTheme>;
```

### Nested Themes

Wrap sections in different themes:

```tsx
<XDSTheme theme={lightTheme}>
  <main className="flex">
    <XDSTheme theme={darkTheme}>
      <aside className="w-64">Dark sidebar</aside>
    </XDSTheme>
    <div className="flex-1">Light content</div>
  </main>
</XDSTheme>
```

## Common Patterns

### Page Layout

```tsx
<XDSTheme theme={defaultTheme}>
  <XDSLayout>
    <XDSLayoutHeader>
      <XDSTopNav>
        <XDSTopNavTitle>My App</XDSTopNavTitle>
      </XDSTopNav>
    </XDSLayoutHeader>
    <XDSLayoutPanel className="w-64">
      <XDSSideNav>
        <XDSSideNavItem label="Dashboard" />
        <XDSSideNavItem label="Settings" />
      </XDSSideNav>
    </XDSLayoutPanel>
    <XDSLayoutContent className="p-6">
      <XDSVStack className="gap-6 max-w-4xl mx-auto">
        <XDSHeading level={1}>Dashboard</XDSHeading>
        <XDSText>Welcome to the app.</XDSText>
      </XDSVStack>
    </XDSLayoutContent>
  </XDSLayout>
</XDSTheme>
```

### Form with Validation

```tsx
<XDSCard className="max-w-md p-6">
  <XDSVStack className="gap-4">
    <XDSHeading level={2}>Sign Up</XDSHeading>
    <XDSTextInput
      label="Email"
      value={email}
      onChange={setEmail}
      placeholder="you@example.com"
    />
    <XDSTextInput
      label="Password"
      type="password"
      value={password}
      onChange={setPassword}
    />
    <XDSButton
      label="Create Account"
      variant="primary"
      onClick={handleSubmit}
      className="w-full"
    />
  </XDSVStack>
</XDSCard>
```

### Responsive Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <XDSCard key={item.id} className="p-4">
      <XDSVStack className="gap-2">
        <XDSHeading level={3}>{item.title}</XDSHeading>
        <XDSText className="text-sm text-gray-500">{item.description}</XDSText>
        <XDSButton label="View" variant="secondary" />
      </XDSVStack>
    </XDSCard>
  ))}
</div>
```

### Dialog with Form

```tsx
<XDSDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <XDSDialogHeader title="Edit Profile" />
  <div className="p-4">
    <XDSVStack className="gap-4">
      <XDSTextInput label="Name" value={name} onChange={setName} />
      <XDSTextArea label="Bio" value={bio} onChange={setBio} />
      <XDSHStack className="gap-2 justify-end">
        <XDSButton
          label="Cancel"
          variant="secondary"
          onClick={() => setIsOpen(false)}
        />
        <XDSButton label="Save" variant="primary" onClick={handleSave} />
      </XDSHStack>
    </XDSVStack>
  </div>
</XDSDialog>
```
