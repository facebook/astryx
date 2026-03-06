/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MobileNav',
  description:
    'Slide-out drawer overlay for mobile navigation. The mobile counterpart to XDSSideNav — accepts the same children (XDSSideNavSection, XDSSideNavItem, or any ReactNode).',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the drawer is open.',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        'Called when the drawer visibility changes (backdrop click, Escape key, or close button).',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Drawer content — typically XDSSideNavSection/XDSSideNavItem, or any ReactNode.',
      required: true,
    },
    {
      name: 'title',
      type: 'string',
      description: 'Optional title shown at the top of the drawer.',
    },
    {
      name: 'width',
      type: 'number',
      description:
        'Drawer width in pixels. Capped at 85vw to prevent overflow on small screens.',
      default: '280',
    },
    {
      name: 'side',
      type: "'start' | 'end'",
      description:
        'Which side the drawer slides from. Start is left in LTR, right in RTL.',
      default: "'start'",
    },
  ],
  examples: [
    {
      label: 'Basic hamburger menu',
      code: `const [isOpen, setIsOpen] = useState(false);

<XDSButton
  label="Menu"
  icon={<MenuIcon />}
  variant="ghost"
  onClick={() => setIsOpen(true)}
/>

<XDSMobileNav
  isOpen={isOpen}
  onOpenChange={() => setIsOpen(false)}
  title="Navigation"
>
  <XDSSideNavSection title="Main">
    <XDSSideNavItem label="Dashboard" href="/dashboard" isSelected />
    <XDSSideNavItem label="Analytics" href="/analytics" />
    <XDSSideNavItem label="Settings" href="/settings" />
  </XDSSideNavSection>
</XDSMobileNav>`,
    },
    {
      label: 'Responsive sidebar/drawer pattern',
      code: `const isMobile = useMediaQuery('(max-width: 768px)');
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

{isMobile ? (
  <>
    <XDSButton
      label="Menu"
      icon={<MenuIcon />}
      variant="ghost"
      onClick={() => setDrawerOpen(true)}
    />
    <XDSMobileNav
      isOpen={drawerOpen}
      onOpenChange={() => setDrawerOpen(false)}
      title="My App"
    >
      {navSections}
    </XDSMobileNav>
  </>
) : (
  <XDSSideNav>{navSections}</XDSSideNav>
)}`,
    },
    {
      label: 'Shared children with XDSSideNav',
      code: `const sections = (
  <XDSSideNavSection title="Main">
    <XDSSideNavItem label="Home" href="/" />
    <XDSSideNavItem label="Settings" href="/settings" />
  </XDSSideNavSection>
);

// Desktop: sidebar
<XDSSideNav>{sections}</XDSSideNav>

// Mobile: drawer
<XDSMobileNav isOpen={open} onOpenChange={close}>{sections}</XDSMobileNav>`,
    },
  ],
  features: [
    'Native <dialog> element with showModal() for top-layer rendering — no z-index stacking issues',
    'Animated slide-in from start or end edge with backdrop fade',
    'Shares children with XDSSideNav — extract nav sections into a variable and render in both',
    'RTL-aware: automatically mirrors slide direction for right-to-left layouts',
    'Respects prefers-reduced-motion: reduces animation duration',
  ],
  accessibility: [
    'Uses native <dialog> with showModal() for correct ARIA modal semantics.',
    "aria-label set to title or 'Navigation' as fallback.",
    'Focus trapping provided by showModal() (browser-native).',
    'Escape key closes via native cancel event.',
    'Backdrop click closes the drawer.',
    'Body scroll locked while modal is open.',
  ],
  keyboard:
    'Escape closes the drawer; Tab/Shift+Tab cycles focus within the drawer (browser-native focus trapping)',
  theming: {
    componentKey: 'mobileNav',
    surfaces: [
      {name: 'root', description: 'Root dialog element styles'},
      {name: 'drawer', description: 'Drawer panel styles'},
    ],
  },
};
