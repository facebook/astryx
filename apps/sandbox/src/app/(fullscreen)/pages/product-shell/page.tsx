'use client';
import {useState, useEffect} from 'react';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSDivider} from '@xds/core';
import {
  XDSCommandPalette,
  XDSCommandPaletteInput,
  XDSCommandPaletteList,
  XDSCommandPaletteItem,
  XDSCommandPaletteGroup,
  XDSCommandPaletteFooter,
} from '../../../../../../../packages/lab/src/CommandPalette';
import {ProductSettingsModal} from '../../../../components/ProductSettingsModal';
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

const PRODUCTS = [
  {
    id: '1',
    name: 'Ceramic Mug',
    price: '$24.00',
    bg: '#F8FAFC',
    emoji: '☕',
    sb: '#D1FAE5',
    sc: '#065F46',
    stock: 'In stock',
  },
  {
    id: '2',
    name: 'Linen Tote Bag',
    price: '$38.00',
    bg: '#F8FAFC',
    emoji: '👜',
    sb: '#FEF3C7',
    sc: '#92400E',
    stock: '8 left',
  },
  {
    id: '3',
    name: 'Scented Candle',
    price: '$32.00',
    bg: '#FEF2F2',
    emoji: '🕯',
    sb: '#FEE2E2',
    sc: '#B91C1C',
    stock: 'Out of stock',
  },
  {
    id: '4',
    name: 'Merino Beanie',
    price: '$45.00',
    bg: '#F8FAFC',
    emoji: '🧢',
    sb: '#D1FAE5',
    sc: '#065F46',
    stock: 'In stock',
  },
  {
    id: '5',
    name: 'Cutting Board',
    price: '$55.00',
    bg: '#F8FAFC',
    emoji: '🌿',
    sb: '#D1FAE5',
    sc: '#065F46',
    stock: 'In stock',
  },
  {
    id: '6',
    name: 'Soy Lip Balm',
    price: '$12.00',
    bg: '#F8FAFC',
    emoji: '✨',
    sb: '#D1FAE5',
    sc: '#065F46',
    stock: 'In stock',
  },
];

export default function ProductShellPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

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
    <div style={{display: 'flex', height: '100vh', overflow: 'hidden'}}>
      <div
        style={{
          width: 240,
          flexShrink: 0,
          height: '100%',
          borderRight: '1px solid #E5E7EB',
        }}>
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
              isSelected={false}
              href="#"
            />
            <XDSSideNavItem
              label="Products"
              icon={ShoppingBagIcon}
              selectedIcon={BagSolid}
              isSelected={true}
              href="#"
            />
            <XDSSideNavItem
              label="Orders"
              icon={TagIcon}
              isSelected={false}
              href="#"
            />
            <XDSSideNavItem
              label="Analytics"
              icon={ChartBarIcon}
              isSelected={false}
              href="#"
            />
          </XDSSideNavSection>
          <XDSSideNavSection title="Marketing">
            <XDSSideNavItem
              label="Campaigns"
              icon={MegaphoneIcon}
              isSelected={false}
              href="#"
            />
            <XDSSideNavItem
              label="Customers"
              icon={UsersIcon}
              isSelected={false}
              href="#"
            />
          </XDSSideNavSection>
        </XDSSideNav>
      </div>

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <h2 style={{fontSize: 24, fontWeight: 700, margin: 0}}>Products</h2>
          <div
            onClick={() => setPaletteOpen(true)}
            role="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: 6,
              cursor: 'pointer',
              backgroundColor: 'white',
              minWidth: 240,
            }}>
            <MagnifyingGlassIcon
              style={{width: 16, height: 16, opacity: 0.5}}
            />
            <span style={{fontSize: 14, color: '#9CA3AF', flex: 1}}>
              Search or run a command…
            </span>
            <span style={{display: 'flex', gap: 4}}>
              {['⌘', 'K'].map(k => (
                <kbd
                  key={k}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0 3px',
                    height: 18,
                    borderRadius: 3,
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#F9FAFB',
                    fontSize: 11,
                    color: '#6B7280',
                  }}>
                  {k}
                </kbd>
              ))}
            </span>
          </div>
        </div>
        <div style={{height: 1, backgroundColor: '#E5E7EB'}} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
            gap: 16,
          }}>
          {PRODUCTS.map(p => (
            <div
              key={p.id}
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                overflow: 'hidden',
              }}>
              <div
                style={{
                  height: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                  backgroundColor: p.bg,
                }}>
                {p.emoji}
              </div>
              <div style={{padding: 12}}>
                <div style={{fontSize: 14, fontWeight: 600, marginBottom: 4}}>
                  {p.name}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <span style={{fontSize: 14}}>{p.price}</span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: p.sb,
                      color: p.sc,
                    }}>
                    {p.stock}
                  </span>
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
        onOpenChange={setPaletteOpen}
        onValueChange={value => {
          if (value === 'Open settings') setSettingsOpen(true);
          setPaletteOpen(false);
        }}>
        <XDSCommandPaletteInput placeholder="Search actions, pages, and more…" />
        <XDSDivider />
        <XDSCommandPaletteList>
          <XDSCommandPaletteGroup heading="Navigate">
            <XDSCommandPaletteItem value="Dashboard">
              Dashboard
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Products">
              Products
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Orders">Orders</XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Analytics">
              Analytics
            </XDSCommandPaletteItem>
          </XDSCommandPaletteGroup>
          <XDSCommandPaletteGroup heading="Actions">
            <XDSCommandPaletteItem value="Add product">
              Add product
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Import products">
              Import products
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Export catalog">
              Export catalog
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Open settings">
              Open settings
            </XDSCommandPaletteItem>
          </XDSCommandPaletteGroup>
        </XDSCommandPaletteList>
        <XDSCommandPaletteFooter />
      </XDSCommandPalette>
    </div>
  );
}
