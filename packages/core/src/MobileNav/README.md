# MobileNav

Slide-out drawer overlay for mobile navigation. The mobile counterpart to `XDSSideNav` — accepts the same children (`XDSSideNavSection`, `XDSSideNavItem`, or any ReactNode).

## Components

| Component      | Description                                                       |
| -------------- | ----------------------------------------------------------------- |
| `XDSMobileNav` | Full-height drawer overlay with backdrop, close button, and title |

## Files

| File                    | Purpose          |
| ----------------------- | ---------------- |
| `XDSMobileNav.tsx`      | Drawer component |
| `XDSMobileNav.test.tsx` | Unit tests       |
| `index.ts`              | Public exports   |

## Usage

```tsx
import {XDSMobileNav} from '@xds/core/MobileNav';
```

### Basic — hamburger menu with nav links

```tsx
const [isOpen, setIsOpen] = useState(false);

<XDSButton
  label="Menu"
  icon={<MenuIcon />}
  variant="ghost"
  onClick={() => setIsOpen(true)}
/>

<XDSMobileNav
  isOpen={isOpen}
  onOpenChange={(open) => setIsOpen(open)}
  title="Navigation"
>
  <XDSSideNavSection title="Main">
    <XDSSideNavItem label="Dashboard" href="/dashboard" isSelected />
    <XDSSideNavItem label="Analytics" href="/analytics" />
    <XDSSideNavItem label="Settings" href="/settings" />
  </XDSSideNavSection>
</XDSMobileNav>
```

### Responsive — sidebar on desktop, drawer on mobile

Use a media query to show `XDSSideNav` on desktop and `XDSMobileNav` on mobile. The same nav items work in both:

```tsx
const isMobile = useMediaQuery('(max-width: 768px)');
const [drawerOpen, setDrawerOpen] = useState(false);

const navSections = (
  <>
    <XDSSideNavSection title="Main">
      <XDSSideNavItem label="Dashboard" href="/" isSelected />
      <XDSSideNavItem label="Projects" href="/projects" />
    </XDSSideNavSection>
    <XDSSideNavSection title="Settings">
      <XDSSideNavItem label="General" href="/settings" />
      <XDSSideNavItem label="Security" href="/security" />
    </XDSSideNavSection>
  </>
);

{
  isMobile ? (
    <>
      <XDSButton
        label="Menu"
        icon={<MenuIcon />}
        variant="ghost"
        onClick={() => setDrawerOpen(true)}
      />
      <XDSMobileNav
        isOpen={drawerOpen}
        onOpenChange={open => setDrawerOpen(open)}
        title="My App">
        {navSections}
      </XDSMobileNav>
    </>
  ) : (
    <XDSSideNav>{navSections}</XDSSideNav>
  );
}
```

### With top nav items moving to drawer

When top nav items need to collapse into the mobile drawer:

```tsx
const isMobile = useMediaQuery('(max-width: 768px)');
const [drawerOpen, setDrawerOpen] = useState(false);

<XDSTopNav
  title={<XDSTopNavTitle title="My App" />}
  startContent={
    isMobile ? (
      <XDSButton
        label="Menu"
        icon={<MenuIcon />}
        variant="ghost"
        onClick={() => setDrawerOpen(true)}
      />
    ) : (
      <>
        <XDSTopNavItem label="Home" href="/" isSelected />
        <XDSTopNavItem label="Products" href="/products" />
        <XDSTopNavItem label="Docs" href="/docs" />
      </>
    )
  }
/>

<XDSMobileNav isOpen={drawerOpen} onOpenChange={(open) => setDrawerOpen(open)}>
  <XDSSideNavSection title="Navigation">
    <XDSSideNavItem label="Home" href="/" isSelected />
    <XDSSideNavItem label="Products" href="/products" />
    <XDSSideNavItem label="Docs" href="/docs" />
  </XDSSideNavSection>
</XDSMobileNav>
```

## Props

| Prop           | Type                        | Default | Description                                     |
| -------------- | --------------------------- | ------- | ----------------------------------------------- |
| `isOpen`       | `boolean`                   | —       | Whether the drawer is open (required)           |
| `onOpenChange` | `(isOpen: boolean) => void` | —       | Called when drawer visibility changes           |
| `children`     | `ReactNode`                 | —       | Drawer content (XDSSideNavSection, items, etc.) |
| `title`        | `string`                    | —       | Optional title at the top of the drawer         |
| `width`        | `number`                    | `280`   | Drawer width in pixels (capped at 85vw)         |
| `side`         | `'start' \| 'end'`          | `start` | Which side the drawer slides from               |
| `data-testid`  | `string`                    | —       | Test ID for the root element                    |

## Accessibility

Uses the native `<dialog>` element with `showModal()` for top-layer rendering. The browser provides focus trapping, body scroll lock, and `::backdrop` — no manual z-index needed.

- Native `<dialog>` in top layer (no z-index stacking issues)
- `aria-label` set to title or "Navigation"
- Focus trapping via `showModal()` (browser-native)
- Escape key closes via native `cancel` event
- Backdrop click closes
- Body scroll locked while modal is open

## Composition with XDSSideNav

`XDSMobileNav` and `XDSSideNav` are designed to share children. Extract your nav sections into a variable and render them in both:

```tsx
const sections = (
  <XDSSideNavSection title="Main">
    <XDSSideNavItem label="Home" href="/" />
    <XDSSideNavItem label="Settings" href="/settings" />
  </XDSSideNavSection>
);

// Desktop: sidebar
<XDSSideNav>{sections}</XDSSideNav>

// Mobile: drawer
<XDSMobileNav isOpen={open} onOpenChange={(open) => { if (!open) close(); }}>{sections}</XDSMobileNav>
```
