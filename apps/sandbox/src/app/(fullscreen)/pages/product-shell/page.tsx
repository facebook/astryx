'use client';
import {useState, useEffect, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  ChartBarIcon,
  MegaphoneIcon,
  UsersIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  ShoppingBagIcon as BagSolid,
} from '@heroicons/react/24/solid';
import {ProductSettingsModal} from '../../../../components/ProductSettingsModal';
import {
  XDSCommandPalette,
  type CommandPaletteItem,
} from '../../../../components/XDSCommandPalette';

const styles = stylex.create({
  shell: {display: 'flex', height: '100vh', overflow: 'hidden'},
  nav: {
    width: 240,
    flexShrink: 0,
    height: '100%',
    borderInlineEnd: `1px solid ${colorVars['--color-border']}`,
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  searchTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    border: `1px solid ${colorVars['--color-border-emphasized']}`,
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: colorVars['--color-background-surface'],
    minWidth: 240,
  },
  kbdGroup: {marginInlineStart: 'auto', display: 'flex', gap: '4px'},
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  card: {
    border: `1px solid ${colorVars['--color-border']}`,
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  cardImg: {
    height: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 40,
  },
  cardBody: {padding: '12px'},
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  toast: {
    position: 'fixed' as const,
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#1F2937',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    zIndex: 9999,
  },
});

function Kbd({children}: {children: React.ReactNode}) {
  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minWidth: 18,
        height: 18,
        padding: '0 3px',
        borderRadius: 3,
        border: '1px solid #CCD3DB',
        backgroundColor: '#F5F6F7',
        fontSize: 11,
        fontWeight: 500,
        color: '#606770',
      }}>
      {children}
    </kbd>
  );
}

const PRODUCTS = [
  {
    id: '1',
    name: 'Ceramic Mug',
    price: '$24.00',
    emoji: '☕',
    category: 'Kitchen',
    stock: 42,
  },
  {
    id: '2',
    name: 'Linen Tote Bag',
    price: '$38.00',
    emoji: '👜',
    category: 'Accessories',
    stock: 8,
  },
  {
    id: '3',
    name: 'Scented Candle',
    price: '$32.00',
    emoji: '🕯️',
    category: 'Home',
    stock: 0,
  },
  {
    id: '4',
    name: 'Merino Beanie',
    price: '$45.00',
    emoji: '🧢',
    category: 'Apparel',
    stock: 17,
  },
  {
    id: '5',
    name: 'Bamboo Cutting Board',
    price: '$55.00',
    emoji: '🪵',
    category: 'Kitchen',
    stock: 23,
  },
  {
    id: '6',
    name: 'Soy Lip Balm',
    price: '$12.00',
    emoji: '💄',
    category: 'Beauty',
    stock: 91,
  },
];

const BASE_ITEMS: CommandPaletteItem[] = [
  {
    id: 'nav-home',
    group: 'Navigate',
    label: 'Dashboard',
    description: 'Overview and metrics',
    icon: HomeIcon,
    onSelect: () => {},
  },
  {
    id: 'nav-products',
    group: 'Navigate',
    label: 'Products',
    description: 'Browse and manage catalog',
    icon: ShoppingBagIcon,
    onSelect: () => {},
  },
  {
    id: 'nav-orders',
    group: 'Navigate',
    label: 'Orders',
    description: 'Recent and pending orders',
    icon: TagIcon,
    onSelect: () => {},
  },
  {
    id: 'nav-analytics',
    group: 'Navigate',
    label: 'Analytics',
    description: 'Sales and traffic reports',
    icon: ChartBarIcon,
    onSelect: () => {},
  },
  {
    id: 'act-add',
    group: 'Actions',
    label: 'Add product',
    description: 'Create a new product listing',
    shortcut: 'N',
    onSelect: () => {},
  },
  {
    id: 'act-import',
    group: 'Actions',
    label: 'Import products',
    description: 'Bulk import from CSV',
    onSelect: () => {},
  },
  {
    id: 'act-export',
    group: 'Actions',
    label: 'Export catalog',
    description: 'Download product data as CSV',
    onSelect: () => {},
  },
  {
    id: 'act-discount',
    group: 'Actions',
    label: 'Create discount',
    description: 'New discount code',
    icon: MegaphoneIcon,
    onSelect: () => {},
  },
  {
    id: 'act-settings',
    group: 'Actions',
    label: 'Open settings',
    description: 'Product workspace preferences',
    icon: Cog6ToothIcon,
    onSelect: () => {},
  },
];

export default function ProductShellPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('products');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };
  const paletteItems = BASE_ITEMS.map(item =>
    item.id === 'act-settings'
      ? {...item, onSelect: () => setSettingsOpen(true)}
      : {...item, onSelect: () => showToast(item.label)},
  );
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  return (
    <div {...stylex.props(styles.shell)}>
      <div {...stylex.props(styles.nav)}>
        <XDSSideNav
          header={
            <XDSSideNavHeading
              icon={
                <XDSNavIcon
                  icon={<ShoppingBagIcon style={{width: 16, height: 16}} />}
                />
              }
              heading="Storefront"
              headingHref="#"
            />
          }
          footerIcons={
            <>
              <XDSButton
                label="Search"
                icon={<XDSIcon icon={MagnifyingGlassIcon} size="md" />}
                variant="ghost"
                size="sm"
                onClick={() => setPaletteOpen(true)}
              />
              <XDSButton
                label="Settings"
                icon={<XDSIcon icon={Cog6ToothIcon} size="md" />}
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
              />
            </>
          }>
          <XDSSideNavSection title="Store">
            <XDSSideNavItem
              label="Dashboard"
              icon={HomeIcon}
              selectedIcon={HomeSolid}
              isSelected={activeNav === 'home'}
              onClick={() => setActiveNav('home')}
            />
            <XDSSideNavItem
              label="Products"
              icon={ShoppingBagIcon}
              selectedIcon={BagSolid}
              isSelected={activeNav === 'products'}
              onClick={() => setActiveNav('products')}
              endContent={
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: '#E7F3FF',
                    color: '#0064E0',
                  }}>
                  6
                </span>
              }
            />
            <XDSSideNavItem
              label="Orders"
              icon={TagIcon}
              isSelected={activeNav === 'orders'}
              onClick={() => setActiveNav('orders')}
              endContent={
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: '#FEE2E2',
                    color: '#B91C1C',
                  }}>
                  3
                </span>
              }
            />
            <XDSSideNavItem
              label="Analytics"
              icon={ChartBarIcon}
              isSelected={activeNav === 'analytics'}
              onClick={() => setActiveNav('analytics')}
            />
          </XDSSideNavSection>
          <XDSSideNavSection title="Marketing">
            <XDSSideNavItem
              label="Campaigns"
              icon={MegaphoneIcon}
              isSelected={activeNav === 'campaigns'}
              onClick={() => setActiveNav('campaigns')}
            />
            <XDSSideNavItem
              label="Customers"
              icon={UsersIcon}
              isSelected={activeNav === 'customers'}
              onClick={() => setActiveNav('customers')}
            />
          </XDSSideNavSection>
        </XDSSideNav>
      </div>
      <main {...stylex.props(styles.main)}>
        <div {...stylex.props(styles.topBar)}>
          <XDSHeading level={2}>Products</XDSHeading>
          <div
            {...stylex.props(styles.searchTrigger)}
            onClick={() => setPaletteOpen(true)}
            role="button"
            aria-label="Open command palette">
            <MagnifyingGlassIcon
              style={{width: 16, height: 16, opacity: 0.5}}
            />
            <XDSText type="body" color="secondary">
              Search or run a command…
            </XDSText>
            <div {...stylex.props(styles.kbdGroup)}>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </div>
          </div>
        </div>
        <XDSDivider />
        <div {...stylex.props(styles.grid)}>
          {PRODUCTS.map(p => (
            <div key={p.id} {...stylex.props(styles.card)}>
              <div
                {...stylex.props(styles.cardImg)}
                style={{
                  backgroundColor: p.stock === 0 ? '#FEF2F2' : '#F8FAFC',
                }}>
                {p.emoji}
              </div>
              <div {...stylex.props(styles.cardBody)}>
                <XDSText type="body" weight="semibold">
                  {p.name}
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  {p.category}
                </XDSText>
                <div {...stylex.props(styles.cardFooter)}>
                  <XDSText type="body">{p.price}</XDSText>
                  {p.stock === 0 ? (
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                      }}>
                      Out of stock
                    </span>
                  ) : p.stock < 10 ? (
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                      }}>
                      {p.stock} left
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: '#D1FAE5',
                        color: '#065F46',
                      }}>
                      In stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <ProductSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <XDSCommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        items={paletteItems}
      />
      {toast != null && (
        <div {...stylex.props(styles.toast)}>
          <XDSText type="supporting">{toast}</XDSText>
        </div>
      )}
    </div>
  );
}
