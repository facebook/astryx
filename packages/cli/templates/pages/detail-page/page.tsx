'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutPanel,
  XDSVStack,
  XDSHStack,
  XDSCard,
  XDSSection,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSButton} from '@xds/core/Button';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSDivider} from '@xds/core/Divider';
import {XDSLink} from '@xds/core/Link';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCollapsible} from '@xds/core/Collapsible';
import {XDSCenter} from '@xds/core/Center';

// ─── Icons ──────────────────────────────────────────────────────────────────
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const OrdersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <rect x="2" y="3" width="20" height="18" rx="2" />
    <path d="M8 7h8M8 11h5M8 15h3" />
  </svg>
);
const ProductsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const CustomersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const ContentIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);
const AnalyticsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
  </svg>
);
const HelpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
  </svg>
);
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const FlagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
  </svg>
);
const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const ThumbUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);
const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);
const ShopIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
    />
  </svg>
);

// ─── Styles ─────────────────────────────────────────────────────────────────
const pageStyles = stylex.create({
  bulletSeparator: {
    fontSize: 12,
    lineHeight: '16px',
    color: 'var(--color-text-secondary, #666)',
    userSelect: 'none',
  },
  metaIcon: {
    width: 14,
    height: 14,
    color: 'var(--color-text-secondary, #666)',
    flexShrink: 0,
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 'var(--radius-content, 4px)',
  },
  productPlaceholder: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'var(--color-background-deemphasized, #e5e5e5)',
    borderRadius: 'var(--radius-content, 4px)',
  },
  productImageWrap: {
    width: 80,
    height: 80,
    flexShrink: 0,
  },
  activityDot: {
    width: 32,
    height: 32,
    flexShrink: 0,
  },
  reactionBar: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    fontSize: 12,
    color: 'var(--color-text-secondary, #666)',
  },
  commentBubble: {
    backgroundColor: 'var(--color-bg-wash, #f5f5f5)',
    borderRadius: 'var(--radius-container, 12px)',
    padding: 12,
  },
  panelSection: {
    paddingBlock: 4,
  },
  calloutCard: {
    backgroundColor: 'var(--color-bg-wash, rgba(5,54,89,0.06))',
    borderRadius: 'var(--radius-container, 12px)',
    padding: 16,
  },
  meterBar: {
    height: 8,
    flex: 1,
    backgroundColor: 'var(--color-bg-deemphasized, #e5e5e5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    width: '35%',
    backgroundColor: 'var(--color-accent, #0866ff)',
    borderRadius: 4,
  },
  learnMoreBtn: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 'var(--radius-element, 8px)',
    padding: '8px 12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
  },
  selectorLabel: {
    padding: '4px 0',
  },
});

// ─── Product data ───────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    name: 'Custom Notebook',
    details: 'Color: Brown\nSize: B5',
    price: 20.0,
    qty: 1,
  },
  {
    name: 'Custom Notebook',
    details: 'Color: Brown\nSize: B5',
    price: 20.0,
    qty: 1,
  },
  {
    name: 'Leather Pen Case',
    details: 'Color: Black\nMaterial: Full-grain leather',
    price: 35.0,
    qty: 2,
  },
  {
    name: 'Fountain Pen',
    details: 'Nib: Fine\nInk: Blue-black',
    price: 45.0,
    qty: 1,
  },
  {
    name: 'Washi Tape Set',
    details: 'Pack: 6 rolls\nPattern: Floral',
    price: 12.0,
    qty: 3,
  },
];

const SUBTOTAL = PRODUCTS.reduce((sum, p) => sum + p.price * p.qty, 0);
const DISCOUNT = 15.0;
const SHIPPING = 0;
const TAX_RATE = 0.0825;
const TAX = Math.round((SUBTOTAL - DISCOUNT) * TAX_RATE * 100) / 100;
const TOTAL = SUBTOTAL - DISCOUNT + SHIPPING + TAX;
const fmt = (n: number) => `$${n.toFixed(2)}`;

// ─── Activity data ──────────────────────────────────────────────────────────
const ACTIVITY = [
  {
    type: 'event' as const,
    user: 'Jane Doe',
    text: 'placed order #1001',
    reactions: 2,
    time: 'Feb 23 at 9:12 AM',
  },
  {
    type: 'comment' as const,
    user: 'Alex Rivera',
    text: "Customer requested gift wrapping for the notebooks. I've added a note to the packing slip — warehouse team should see it before fulfillment.",
    reactions: 3,
    time: 'Feb 23 at 10:45 AM',
  },
  {
    type: 'update' as const,
    user: 'System',
    text: 'has several information changes',
    time: 'Feb 23 at 11:30 AM',
    changes: [
      'Payment verified via Visa ...7482',
      'Fraud check passed — low risk',
    ],
  },
  {
    type: 'event' as const,
    user: 'Alex Rivera',
    text: 'marked order as ready for fulfillment',
    reactions: 1,
    time: 'Feb 23 at 2:15 PM',
  },
];

// ─── Side Nav ───────────────────────────────────────────────────────────────
function ShopSideNav() {
  const [active, setActive] = useState('orders');
  return (
    <XDSSideNav
      collapsible
      header={
        <XDSHStack gap={2} vAlign="center" style={{padding: '8px 12px'}}>
          <XDSNavIcon icon={<ShopIcon style={{width: 16, height: 16}} />} />
          <XDSHeading level={4}>Acme</XDSHeading>
        </XDSHStack>
      }
      footer={
        <XDSVStack gap={0} style={{padding: '8px 0'}}>
          <XDSSideNavItem
            label="Settings"
            icon={SettingsIcon}
            isSelected={active === 'settings'}
            onClick={() => setActive('settings')}
          />
          <XDSSideNavItem
            label="Help Center"
            icon={HelpIcon}
            isSelected={active === 'help'}
            onClick={() => setActive('help')}
          />
        </XDSVStack>
      }>
      <XDSSideNavSection title="Main" isHeaderHidden>
        <XDSSideNavItem
          label="Home"
          icon={HomeIcon}
          isSelected={active === 'home'}
          onClick={() => setActive('home')}
        />
        <XDSSideNavItem
          label="Orders"
          icon={OrdersIcon}
          isSelected={active === 'orders'}
          onClick={() => setActive('orders')}
        />
        <XDSSideNavItem
          label="Products"
          icon={ProductsIcon}
          isSelected={active === 'products'}
          onClick={() => setActive('products')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Sales channels">
        <XDSSideNavItem
          label="Customers"
          icon={CustomersIcon}
          isSelected={active === 'customers'}
          onClick={() => setActive('customers')}
        />
        <XDSSideNavItem
          label="Content"
          icon={ContentIcon}
          isSelected={active === 'content'}
          onClick={() => setActive('content')}
        />
        <XDSSideNavItem
          label="Analytics"
          icon={AnalyticsIcon}
          isSelected={active === 'analytics'}
          onClick={() => setActive('analytics')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

// ─── Bullet separator ───────────────────────────────────────────────────────
function Bullet() {
  return <span {...stylex.props(pageStyles.bulletSeparator)}>{'・'}</span>;
}

// ─── Page Header ────────────────────────────────────────────────────────────
function PageHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (v: string) => void;
}) {
  return (
    <XDSLayoutHeader hasDivider padding={4}>
      <XDSCenter axis="horizontal">
        <XDSVStack gap={0}>
          {/* Back link */}
          <XDSLink href="#" label="All orders" color="secondary">
            <XDSHStack gap={1} vAlign="center">
              <ArrowLeftIcon style={{width: 16, height: 16}} />
              All orders
            </XDSHStack>
          </XDSLink>
          {/* Title + metadata */}
          <XDSVStack gap={0}>
            {/* Title row */}
            <XDSHStack
              gap={2}
              vAlign="center"
              style={{justifyContent: 'space-between'}}>
              <XDSHStack gap={2} vAlign="center">
                <XDSHeading level={1}>#1001</XDSHeading>
              </XDSHStack>
              <XDSHStack gap={2} vAlign="start">
                <XDSButton label="← 2/9 →" variant="ghost" />
                <XDSButton label="Restock" variant="secondary" />
                <XDSButton label="Edit" variant="secondary" />
              </XDSHStack>
            </XDSHStack>

            {/* Metadata row */}
            <XDSHStack gap={1} vAlign="center" style={{flexWrap: 'wrap'}}>
              <XDSText type="body">{PRODUCTS.length} ordered items</XDSText>
              <Bullet />
              <XDSHStack gap={1} vAlign="center">
                <XDSAvatar name="Jane Doe" size="xsmall" />
                <XDSText type="body">Jane Doe</XDSText>
              </XDSHStack>
              <Bullet />
              <XDSBadge variant="warning" label="Unfulfilled" />
              <Bullet />
              <XDSHStack gap={1} vAlign="center">
                <CalendarIcon {...stylex.props(pageStyles.metaIcon)} />
                <XDSText type="body">02/23/2026</XDSText>
              </XDSHStack>
              <Bullet />
              <XDSHStack gap={1} vAlign="center">
                <FlagIcon {...stylex.props(pageStyles.metaIcon)} />
                <XDSText type="body">Needs attention</XDSText>
              </XDSHStack>
              <Bullet />
              <XDSLink href="#" label="See all" color="secondary">
                See all
              </XDSLink>
            </XDSHStack>
          </XDSVStack>

          {/* Tabs */}
          <XDSHStack
            vAlign="center"
            style={{
              justifyContent: 'space-between',
              marginInline: -12,
              marginBottom: -16,
              marginTop: 12,
            }}>
            <XDSTabList value={activeTab} onChange={onTabChange} size="lg">
              <XDSTab value="details" label="Details" />
              <XDSTab value="invoices" label="Invoices" />
              <XDSTab value="timeline" label="Timeline" />
              <XDSTab value="customer" label="Customer" />
              <XDSTab value="analysis" label="Analysis" />
            </XDSTabList>
            <XDSButton label="View options" variant="ghost" size="md" />
          </XDSHStack>
        </XDSVStack>
      </XDSCenter>
    </XDSLayoutHeader>
  );
}

// ─── Items Card ─────────────────────────────────────────────────────────────
function ItemsCard() {
  return (
    <XDSSection>
      <XDSVStack gap={4}>
        <XDSHStack vAlign="center" style={{justifyContent: 'space-between'}}>
          <XDSHStack gap={2} vAlign="center">
            <XDSHeading level={2}>Items</XDSHeading>
            <XDSBadge variant="warning" label="Unfulfilled" />
          </XDSHStack>
          <XDSHStack gap={2}>
            <XDSButton label="Fulfill item" variant="ghost" />
            <XDSButton label="Create shipping label" variant="secondary" />
          </XDSHStack>
        </XDSHStack>

        <XDSList density="spacious" style={{marginInline: -12}}>
          {PRODUCTS.map((product, i) => (
            <XDSListItem
              key={i}
              label={product.name}
              description={
                <XDSVStack gap={0}>
                  {product.details.split('\n').map((line, j) => (
                    <XDSText key={j} type="supporting" color="secondary">
                      {line}
                    </XDSText>
                  ))}
                </XDSVStack>
              }
              onClick={() => {}}
              startContent={
                <div style={{width: 100, height: 66, flexShrink: 0}}>
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor:
                        'var(--color-background-deemphasized, #e5e5e5)',
                      borderRadius: 'var(--radius-element, 8px)',
                    }}
                  />
                </div>
              }
              endContent={
                <XDSText type="body" color="secondary">
                  {fmt(product.price)} {'×'} {product.qty}
                  {'      '}
                  {fmt(product.price * product.qty)}
                </XDSText>
              }
            />
          ))}
        </XDSList>
      </XDSVStack>
    </XDSSection>
  );
}

// ─── Invoice Card ───────────────────────────────────────────────────────────
function InvoiceCard() {
  return (
    <XDSSection>
      <XDSVStack gap={4}>
        <XDSHStack vAlign="center" style={{justifyContent: 'space-between'}}>
          <XDSHStack gap={2} vAlign="center">
            <XDSHeading level={2}>Invoice</XDSHeading>
            <XDSBadge variant="success" label="Paid" />
          </XDSHStack>
          <XDSHStack gap={2}>
            <XDSButton label="Refund" variant="ghost" />
            <XDSButton label="Send Invoice" variant="secondary" />
          </XDSHStack>
        </XDSHStack>

        <XDSMetadataList>
          <XDSMetadataListItem label="Subtotal">
            <XDSHStack style={{justifyContent: 'space-between', width: '100%'}}>
              <span>{PRODUCTS.length} items</span>
              <span>{fmt(SUBTOTAL)}</span>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Discount">
            <XDSHStack style={{justifyContent: 'space-between', width: '100%'}}>
              <span>New customer code: NEW15</span>
              <span>– {fmt(DISCOUNT)}</span>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Shipping">
            <XDSHStack style={{justifyContent: 'space-between', width: '100%'}}>
              <span>Free shipping (0.0lbs) USPS</span>
              <span>{fmt(SHIPPING)}</span>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Tax">
            <XDSHStack style={{justifyContent: 'space-between', width: '100%'}}>
              <span>Sales tax (8.25%)</span>
              <span>{fmt(TAX)}</span>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Total">
            <XDSHStack style={{justifyContent: 'flex-end', width: '100%'}}>
              <XDSText type="body" weight="bold">
                {fmt(TOTAL)}
              </XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
        </XDSMetadataList>

        <XDSDivider />

        <XDSMetadataList>
          <XDSMetadataListItem label="Paid by customer">
            <XDSHStack style={{justifyContent: 'space-between', width: '100%'}}>
              <span>Visa ...7482</span>
              <span>{fmt(TOTAL)}</span>
            </XDSHStack>
          </XDSMetadataListItem>
        </XDSMetadataList>
      </XDSVStack>
    </XDSSection>
  );
}

// ─── Timeline ───────────────────────────────────────────────────────────────
function TimelineSection() {
  return (
    <XDSSection>
      <XDSVStack gap={4}>
        <XDSHStack vAlign="center" style={{justifyContent: 'space-between'}}>
          <XDSHeading level={2}>Timeline</XDSHeading>
          <XDSButton
            label="Filters"
            variant="ghost"
            icon={<FilterIcon style={{width: 14, height: 14}} />}
            isIconOnly
          />
        </XDSHStack>

        <XDSVStack gap={4}>
          {ACTIVITY.map((item, i) => (
            <div key={i}>
              <XDSVStack gap={2}>
                <XDSHStack gap={3} vAlign="start">
                  <XDSAvatar name={item.user} size="small" />
                  <XDSVStack gap={2} style={{flex: 1}}>
                    <div {...stylex.props(pageStyles.commentBubble)}>
                      <XDSVStack gap={1}>
                        <XDSText type="body" weight="bold">
                          {item.user}
                        </XDSText>
                        <XDSText type="body">{item.text}</XDSText>
                        {item.changes && (
                          <XDSVStack gap={1} style={{marginTop: 4}}>
                            {item.changes.map((change, j) => (
                              <XDSHStack key={j} gap={2} vAlign="center">
                                <EditIcon
                                  style={{
                                    width: 14,
                                    height: 14,
                                    color: 'var(--color-text-secondary, #888)',
                                  }}
                                />
                                <XDSText type="supporting" color="secondary">
                                  {change}
                                </XDSText>
                              </XDSHStack>
                            ))}
                          </XDSVStack>
                        )}
                      </XDSVStack>
                    </div>
                    <div {...stylex.props(pageStyles.reactionBar)}>
                      <XDSHStack gap={1} vAlign="center">
                        <ThumbUpIcon style={{width: 12, height: 12}} />
                        <HeartIcon style={{width: 12, height: 12}} />
                        <span>{item.reactions}</span>
                      </XDSHStack>
                      <span>Like</span>
                      <Bullet />
                      <span>Reply</span>
                      <Bullet />
                      <span>{item.time}</span>
                    </div>
                  </XDSVStack>
                </XDSHStack>
              </XDSVStack>
              {i < ACTIVITY.length - 1 && (
                <XDSDivider style={{marginTop: 12}} />
              )}
            </div>
          ))}
        </XDSVStack>
      </XDSVStack>
    </XDSSection>
  );
}

// ─── Right Panel ────────────────────────────────────────────────────────────
function RightPanel() {
  return (
    <XDSLayoutPanel hasDivider width={320} padding={0} role="complementary">
      <XDSVStack gap={4}>
        {/* Notes */}
        <div
          {...stylex.props(pageStyles.panelSection)}
          style={{padding: '8px 16px'}}>
          <XDSCollapsible trigger={<XDSHeading level={4}>Notes</XDSHeading>}>
            <XDSText type="body">
              Customer is a repeat buyer — 3rd order this quarter. Prefers brown
              leather goods and grid-format notebooks. Requested gift wrapping
              for this order. Ships to a residential address in CA.{' '}
              <XDSLink href="#" label="Show more" color="secondary">
                Show more
              </XDSLink>
            </XDSText>
          </XDSCollapsible>
        </div>

        {/* Customer */}
        <div
          {...stylex.props(pageStyles.panelSection)}
          style={{padding: '8px 16px'}}>
          <XDSCollapsible trigger={<XDSHeading level={4}>Customer</XDSHeading>}>
            <XDSMetadataList>
              <XDSMetadataListItem label="Name">Jane Doe</XDSMetadataListItem>
              <XDSMetadataListItem label="Address">
                321 Smith Road, CA 38238
              </XDSMetadataListItem>
              <XDSMetadataListItem label="Phone">234-</XDSMetadataListItem>
              <XDSMetadataListItem label="Email">
                janedoe@email.com
              </XDSMetadataListItem>
              <XDSMetadataListItem label="Billing Address">
                Same as shipping address
              </XDSMetadataListItem>
            </XDSMetadataList>
          </XDSCollapsible>
        </div>

        {/* Fraud Analysis */}
        <div
          {...stylex.props(pageStyles.panelSection)}
          style={{padding: '8px 16px'}}>
          <XDSCollapsible
            trigger={<XDSHeading level={4}>Fraud Analysis</XDSHeading>}>
            <XDSCard>
              <XDSSection variant="wash">
                <XDSVStack gap={3}>
                  <XDSText type="body">Recommendation: Fulfill order</XDSText>
                  <XDSProgressBar
                    label="Risk level"
                    value={15}
                    variant="positive"
                    isLabelHidden
                  />
                  <XDSText type="body">
                    There is a low chance that you will receive a chargeback on
                    this order.
                  </XDSText>
                  <XDSButton label="Learn more" variant="secondary" />
                </XDSVStack>
              </XDSSection>
            </XDSCard>
          </XDSCollapsible>
        </div>
      </XDSVStack>
    </XDSLayoutPanel>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function DetailPage2Template() {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <XDSAppShell
      sideNav={<ShopSideNav />}
      variant="elevated"
      contentPadding={0}>
      <XDSLayout
        height="fill"
        contentWidth={1000}
        defaultHasDividers
        header={<PageHeader activeTab={activeTab} onTabChange={setActiveTab} />}
        content={
          <XDSLayoutContent role="main">
            <XDSVStack gap={4}>
              <ItemsCard />
              <InvoiceCard />
              <TimelineSection />
            </XDSVStack>
          </XDSLayoutContent>
        }
        end={<RightPanel />}
      />
    </XDSAppShell>
  );
}
