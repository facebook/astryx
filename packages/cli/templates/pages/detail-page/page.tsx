'use client';

import {useState, useEffect} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {useMediaQuery} from '@xds/core/hooks';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutPanel,
  XDSVStack,
  XDSHStack,
  XDSStackItem,
  XDSCard,
  XDSSection,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSButton} from '@xds/core/Button';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSDivider} from '@xds/core/Divider';
import {XDSLink} from '@xds/core/Link';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCollapsible} from '@xds/core/Collapsible';
import {XDSIcon} from '@xds/core/Icon';
import {XDSThumbnail} from '@xds/core/Thumbnail';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
  FlagIcon,
  FunnelIcon,
  HandThumbUpIcon,
  HeartIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import {BuildingStorefrontIcon} from '@heroicons/react/24/solid';

// ─── Styles ─────────────────────────────────────────────────────────────────
import * as stylex from '@stylexjs/stylex';

const pageStyles = stylex.create({
  tabsRow: {
    marginInline: -12,
    marginBottom: -16,
    marginTop: 12,
  },
});

// ─── Product data ───────────────────────────────────────────────────────────
// Light product photography from the xds_oss asset set (ceramics collection)
// Source: meta assets.file list -s xds_oss -g light-product-{1..5}
const PRODUCT_IMAGES = [
  // light-product-1 from xds_oss asset set
  'https://lookaside.facebook.com/assets/xds_oss/light-product-1.png',
  // light-product-2 from xds_oss asset set
  'https://lookaside.facebook.com/assets/xds_oss/light-product-2.png',
  // light-product-3 from xds_oss asset set
  'https://lookaside.facebook.com/assets/xds_oss/light-product-3.png',
  // light-product-4 from xds_oss asset set
  'https://lookaside.facebook.com/assets/xds_oss/light-product-4.png',
  // light-product-5 from xds_oss asset set
  'https://lookaside.facebook.com/assets/xds_oss/light-product-5.png',
];

const PRODUCTS = [
  {
    name: 'Solstice Mug',
    details: 'Glaze: Snow\nFinish: Matte',
    price: 89.0,
    qty: 1,
    image: PRODUCT_IMAGES[0],
  },
  {
    name: 'Ember Bowl',
    details: 'Glaze: Sage\nSize: 6 in',
    price: 42.0,
    qty: 2,
    image: PRODUCT_IMAGES[1],
  },
  {
    name: 'Terra Cup',
    details: 'Glaze: Oat\nSize: 14 in',
    price: 65.0,
    qty: 1,
    image: PRODUCT_IMAGES[2],
  },
  {
    name: 'Dawn Plate Set',
    details: 'Glaze: Charcoal\nCapacity: 3 oz',
    price: 34.0,
    qty: 3,
    image: PRODUCT_IMAGES[3],
  },
  {
    name: 'Kiln Salad Bowl',
    details: 'Glaze: Snow\nHeight: 8 in',
    price: 78.0,
    qty: 1,
    image: PRODUCT_IMAGES[4],
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
    text: "Customer requested gift wrapping for the mug & plate set. I've added a note to the packing slip — warehouse team should wrap in recycled kraft paper.",
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
        <XDSSideNavHeading
          icon={
            <XDSNavIcon
              icon={
                <XDSIcon
                  icon={BuildingStorefrontIcon}
                  size="sm"
                  color="inherit"
                />
              }
            />
          }
          heading="Kiln & Table"
          headingHref="/"
        />
      }
      footer={
        <XDSVStack gap={0}>
          <XDSSideNavItem
            label="Settings"
            icon={Cog6ToothIcon}
            isSelected={active === 'settings'}
            onClick={() => setActive('settings')}
          />
          <XDSSideNavItem
            label="Help Center"
            icon={QuestionMarkCircleIcon}
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
          icon={ClipboardDocumentListIcon}
          isSelected={active === 'orders'}
          onClick={() => setActive('orders')}
        />
        <XDSSideNavItem
          label="Products"
          icon={CubeIcon}
          isSelected={active === 'products'}
          onClick={() => setActive('products')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Sales channels">
        <XDSSideNavItem
          label="Customers"
          icon={UserGroupIcon}
          isSelected={active === 'customers'}
          onClick={() => setActive('customers')}
        />
        <XDSSideNavItem
          label="Content"
          icon={DocumentTextIcon}
          isSelected={active === 'content'}
          onClick={() => setActive('content')}
        />
        <XDSSideNavItem
          label="Analytics"
          icon={ChartBarIcon}
          isSelected={active === 'analytics'}
          onClick={() => setActive('analytics')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

// ─── Bullet separator ───────────────────────────────────────────────────────
function Bullet() {
  return (
    <XDSText type="supporting" color="secondary">
      {'・'}
    </XDSText>
  );
}

// ─── Page Header ────────────────────────────────────────────────────────────
function PageHeader({
  activeTab,
  onTabChange,
  isPanelOpen,
  onTogglePanel,
}: {
  activeTab: string;
  onTabChange: (v: string) => void;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
}) {
  return (
    <XDSLayoutHeader hasDivider padding={4}>
      <XDSVStack gap={0}>
        <XDSHStack gap={4} vAlign="start">
          <XDSStackItem size="fill">
            <XDSVStack gap={0}>
              <XDSLink href="#" color="secondary">
                <XDSHStack gap={1} vAlign="center">
                  <XDSIcon icon={ArrowLeftIcon} size="sm" color="inherit" />
                  All orders
                </XDSHStack>
              </XDSLink>
              <XDSVStack gap={0}>
                <XDSHeading level={1}>#1001</XDSHeading>
                <XDSHStack gap={1} vAlign="center">
                  <XDSText type="body" maxLines={1}>
                    {PRODUCTS.length} ordered items
                  </XDSText>
                  <Bullet />
                  <XDSHStack gap={1} vAlign="center">
                    <XDSAvatar name="Jane Doe" size="xsmall" />
                    <XDSText type="body" maxLines={1}>
                      Jane Doe
                    </XDSText>
                  </XDSHStack>
                  <Bullet />
                  <XDSBadge variant="warning" label="Unfulfilled" />
                  <Bullet />
                  <XDSHStack gap={1} vAlign="center">
                    <XDSIcon icon={CalendarIcon} size="sm" color="secondary" />
                    <XDSText type="body" maxLines={1}>
                      02/23/2026
                    </XDSText>
                  </XDSHStack>
                  <Bullet />
                  <XDSHStack gap={1} vAlign="center">
                    <XDSIcon icon={FlagIcon} size="sm" color="secondary" />
                    <XDSText type="body" maxLines={1}>
                      Needs attention
                    </XDSText>
                  </XDSHStack>
                  <Bullet />
                  <XDSLink href="#" color="secondary">
                    See all
                  </XDSLink>
                </XDSHStack>
              </XDSVStack>
            </XDSVStack>
          </XDSStackItem>
          <XDSHStack gap={2}>
            <XDSButton label="Restock" variant="secondary" />
            <XDSButton label="Edit" variant="secondary" />
          </XDSHStack>
        </XDSHStack>

        <XDSHStack vAlign="center" xstyle={pageStyles.tabsRow}>
          <XDSStackItem size="fill">
            <XDSTabList value={activeTab} onChange={onTabChange} size="lg">
              <XDSTab value="details" label="Details" />
              <XDSTab value="invoices" label="Invoices" />
              <XDSTab value="timeline" label="Timeline" />
              <XDSTab value="customer" label="Customer" />
              <XDSTab value="analysis" label="Analysis" />
            </XDSTabList>
          </XDSStackItem>
          <XDSButton
            label={isPanelOpen ? 'Hide panel' : 'Show panel'}
            variant="ghost"
            size="md"
            icon={<XDSIcon icon={ViewColumnsIcon} size="sm" />}
            isIconOnly
            onClick={onTogglePanel}
          />
        </XDSHStack>
      </XDSVStack>
    </XDSLayoutHeader>
  );
}

// ─── Items Card ─────────────────────────────────────────────────────────────
function ItemsCard() {
  return (
    <XDSSection>
      <XDSVStack gap={4}>
        <XDSHStack vAlign="center">
          <XDSStackItem size="fill">
            <XDSHStack gap={2} vAlign="center">
              <XDSHeading level={2}>Items</XDSHeading>
              <XDSBadge variant="warning" label="Unfulfilled" />
            </XDSHStack>
          </XDSStackItem>
          <XDSHStack gap={2}>
            <XDSButton label="Fulfill item" variant="ghost" />
            <XDSButton label="Create shipping label" variant="secondary" />
          </XDSHStack>
        </XDSHStack>

        <XDSList density="spacious">
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
                <XDSThumbnail
                  src={product.image}
                  alt={product.name}
                  label={product.name}
                />
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
        <XDSHStack vAlign="center">
          <XDSStackItem size="fill">
            <XDSHStack gap={2} vAlign="center">
              <XDSHeading level={2}>Invoice</XDSHeading>
              <XDSBadge variant="success" label="Paid" />
            </XDSHStack>
          </XDSStackItem>
          <XDSHStack gap={2}>
            <XDSButton label="Refund" variant="ghost" />
            <XDSButton label="Send Invoice" variant="secondary" />
          </XDSHStack>
        </XDSHStack>

        <XDSMetadataList>
          <XDSMetadataListItem label="Subtotal">
            <XDSHStack>
              <XDSStackItem size="fill">
                <XDSText type="body">{PRODUCTS.length} items</XDSText>
              </XDSStackItem>
              <XDSText type="body">{fmt(SUBTOTAL)}</XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Discount">
            <XDSHStack>
              <XDSStackItem size="fill">
                <XDSText type="body">New customer code: NEW15</XDSText>
              </XDSStackItem>
              <XDSText type="body">– {fmt(DISCOUNT)}</XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Shipping">
            <XDSHStack>
              <XDSStackItem size="fill">
                <XDSText type="body">Free shipping (0.0lbs) USPS</XDSText>
              </XDSStackItem>
              <XDSText type="body">{fmt(SHIPPING)}</XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Tax">
            <XDSHStack>
              <XDSStackItem size="fill">
                <XDSText type="body">Sales tax (8.25%)</XDSText>
              </XDSStackItem>
              <XDSText type="body">{fmt(TAX)}</XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Total">
            <XDSHStack>
              <XDSStackItem size="fill" />
              <XDSText type="body" weight="bold">
                {fmt(TOTAL)}
              </XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
        </XDSMetadataList>

        <XDSDivider />

        <XDSMetadataList>
          <XDSMetadataListItem label="Paid by customer">
            <XDSHStack>
              <XDSStackItem size="fill">
                <XDSText type="body">Visa ...7482</XDSText>
              </XDSStackItem>
              <XDSText type="body">{fmt(TOTAL)}</XDSText>
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
        <XDSHStack vAlign="center">
          <XDSStackItem size="fill">
            <XDSHeading level={2}>Timeline</XDSHeading>
          </XDSStackItem>
          <XDSButton
            label="Filters"
            variant="ghost"
            icon={<XDSIcon icon={FunnelIcon} />}
            isIconOnly
          />
        </XDSHStack>

        <XDSVStack gap={4}>
          {ACTIVITY.map((item, i) => (
            <XDSVStack key={i} gap={2}>
              <XDSHStack gap={3} vAlign="start">
                <XDSAvatar name={item.user} size="small" />
                <XDSStackItem size="fill">
                  <XDSVStack gap={2}>
                    <XDSCard variant="muted" padding={3}>
                      <XDSVStack gap={1}>
                        <XDSText type="body" weight="bold">
                          {item.user}
                        </XDSText>
                        <XDSText type="body">{item.text}</XDSText>
                        {item.changes && (
                          <XDSVStack gap={1}>
                            {item.changes.map((change, j) => (
                              <XDSHStack key={j} gap={2} vAlign="center">
                                <XDSIcon
                                  icon={PencilSquareIcon}
                                  size="sm"
                                  color="secondary"
                                />
                                <XDSText type="supporting" color="secondary">
                                  {change}
                                </XDSText>
                              </XDSHStack>
                            ))}
                          </XDSVStack>
                        )}
                      </XDSVStack>
                    </XDSCard>
                    <XDSHStack gap={3} vAlign="center">
                      <XDSHStack gap={1} vAlign="center">
                        <XDSIcon
                          icon={HandThumbUpIcon}
                          size="xsm"
                          color="secondary"
                        />
                        <XDSIcon
                          icon={HeartIcon}
                          size="xsm"
                          color="secondary"
                        />
                        <XDSText type="supporting" color="secondary">
                          {item.reactions}
                        </XDSText>
                      </XDSHStack>
                      <XDSText type="supporting" color="secondary">
                        Like
                      </XDSText>
                      <Bullet />
                      <XDSText type="supporting" color="secondary">
                        Reply
                      </XDSText>
                      <Bullet />
                      <XDSText type="supporting" color="secondary">
                        {item.time}
                      </XDSText>
                    </XDSHStack>
                  </XDSVStack>
                </XDSStackItem>
              </XDSHStack>
              {i < ACTIVITY.length - 1 && <XDSDivider />}
            </XDSVStack>
          ))}
        </XDSVStack>
      </XDSVStack>
    </XDSSection>
  );
}

// ─── Right Panel ────────────────────────────────────────────────────────────
function RightPanel() {
  return (
    <XDSLayoutPanel width={320} padding={4} role="complementary">
      <XDSVStack gap={4}>
        <XDSCollapsible trigger={<XDSHeading level={4}>Notes</XDSHeading>}>
          <XDSText type="body">
            Customer is a repeat buyer — 3rd order this quarter. Prefers snow
            and oat glazes. Requested gift wrapping for the mug set. Ships to a
            residential address in CA.{' '}
            <XDSLink href="#" color="secondary">
              Show more
            </XDSLink>
          </XDSText>
        </XDSCollapsible>

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

        <XDSCollapsible
          trigger={<XDSHeading level={4}>Fraud Analysis</XDSHeading>}>
          <XDSVStack gap={1}>
            <XDSProgressBar
              label="Risk level"
              value={15}
              variant="positive"
              isLabelHidden
            />
            <XDSText type="body">Recommendation: Fulfill order</XDSText>
            <XDSText type="body">
              There is a low chance that you will receive a chargeback on this
              order.
            </XDSText>
          </XDSVStack>
        </XDSCollapsible>
      </XDSVStack>
    </XDSLayoutPanel>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function DetailPage2Template() {
  const [activeTab, setActiveTab] = useState('details');
  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  useEffect(() => {
    setIsPanelOpen(!isNarrow);
  }, [isNarrow]);

  return (
    <XDSAppShell
      sideNav={<ShopSideNav />}
      variant="elevated"
      contentPadding={0}>
      <XDSLayout
        height="fill"
        contentWidth={1000}
        defaultHasDividers
        header={
          <PageHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isPanelOpen={isPanelOpen}
            onTogglePanel={() => setIsPanelOpen(prev => !prev)}
          />
        }
        content={
          <XDSLayoutContent role="main">
            <XDSVStack gap={4}>
              <ItemsCard />
              <InvoiceCard />
              <TimelineSection />
            </XDSVStack>
          </XDSLayoutContent>
        }
        end={isPanelOpen ? <RightPanel /> : undefined}
      />
    </XDSAppShell>
  );
}
