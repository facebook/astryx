'use client';

import {useState} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {
  XDSSideNav,
  XDSSideNavCollapseButton,
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
import {XDSCenter} from '@xds/core/Center';
import {XDSIcon} from '@xds/core/Icon';
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
  contentFlushEnd: {
    paddingInlineEnd: 0,
  },
  panelAnimationWrapper: {
    overflow: 'hidden',
    flexShrink: 0,
    transition:
      'width var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), min-width var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
  },
  panelContent: {
    transition:
      'opacity var(--duration-fast, 175ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
  },
  tabsRow: {
    marginInline: -12,
    marginBottom: -16,
    marginTop: 12,
  },
  metadataRow: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
});

// ─── Product data ───────────────────────────────────────────────────────────
// Light product photography from the xds_oss asset set (ceramics collection)
// Source: meta assets.file list -s xds_oss -g light-product-{1..5}
const PRODUCT_IMAGES = [
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/671222955_2145727732941085_520241325832272863_n.png?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=nPid9vxWiAAQ7kNvwEn9zAk&_nc_oc=Adpvs8c0_OPaD3OBM2-RuvQhsq_ZIQCuI4MIYJDHog2g0wbDnnKsQY18ujPRPRsUsCQaE3gnHXhybHYdgHyTPGcy&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=ydKBqwA5klQRsF7pHyaL9Q&_nc_ss=7a30f&oh=00_Af1MWCNR4BSpKvDiJrg4I7hrhPhvwUkpwRMPpGkexhKxpg&oe=69E5F2F2',
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/673826432_1199625442080268_2235614826141527510_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=7sfupHwtMWoQ7kNvwHq-oll&_nc_oc=AdorjEzWeonV_cTC82CQcP_97bhPEFri4gRyJuRCTm5tm4RrSHqZHinwq3cpLIVwwDqJGdLCeaezQOL1pCTdEurA&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=dhQMbNPZ6a4O8tvuG-zaQQ&_nc_ss=7a30f&oh=00_Af0jFaeYAmFWPUXPDLAx1wHlwVkoTPaVfUQircvONREAew&oe=69E5DFF1',
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/672681263_1894137684571541_8624778644609428792_n.png?_nc_cat=109&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=O9FpOzmcuhIQ7kNvwHJc_5e&_nc_oc=AdohCQROsW1HA9oyV_P08xW-PZ7aRBaxKQDouJQeLqWBRg4s_diiKocTCXKFW6MrH29i-qmdKX4F1XacD-ZBr1aI&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=4Ho2VwbJyUMPRPg1_pYYXQ&_nc_ss=7a30f&oh=00_Af3rTWfTt78ZVlhHCjbjcvEMAmyt_Y5UApS2ezLwTSVDdw&oe=69E5F643',
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/670399674_3883527348446559_364118105607949641_n.png?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=qjhrCslvBhEQ7kNvwGIRrYU&_nc_oc=AdqjfEPZizLmq2xSVhncfdeilisr9iS4xyW6xvESla6s72ctRLyjAdz_aUhs0_7GlT2wLRjFqotzo6mCRpj_zoev&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=p5rjWn-ZxsbEF4l-xiDkoA&_nc_ss=7a30f&oh=00_Af0dfW78AWBoDni-ydDYmjYYnu6TcBty9hI97oewb6OFfw&oe=69E5EB2D',
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/671457944_4516505268571219_6833232903201599778_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=2LiO931mC78Q7kNvwEClCGO&_nc_oc=AdoxCLopOX1C45nJksLqWaffKTeqizJ7joW-P2gbmknrVE5KqvaVXRzof8YTOZNW0OMuPUSnUEX0aQ32RhRv6xeF&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=AXiNN0rtQ-RZnfzDQS5AjA&_nc_ss=7a30f&oh=00_Af3DYuG7fKdv_a6uNNcfTO5iIV16d_65o0-9FZnZp4jQfg&oe=69E5E555',
];

const PRODUCTS = [
  {
    name: 'Solstice Mug & Plate Set',
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
    name: 'Terra Serving Platter',
    details: 'Glaze: Oat\nSize: 14 in',
    price: 65.0,
    qty: 1,
    image: PRODUCT_IMAGES[2],
  },
  {
    name: 'Dawn Espresso Cup',
    details: 'Glaze: Charcoal\nCapacity: 3 oz',
    price: 34.0,
    qty: 3,
    image: PRODUCT_IMAGES[3],
  },
  {
    name: 'Kiln Vase',
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
      }
      footerIcons={<XDSSideNavCollapseButton />}>
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
      <XDSCenter axis="horizontal">
        <XDSVStack gap={0}>
          <XDSHStack gap={4} vAlign="start">
            <XDSStackItem size="fill">
              <XDSVStack gap={0}>
                <XDSLink href="#" label="All orders" color="secondary">
                  <XDSHStack gap={1} vAlign="center">
                    <XDSIcon icon={ArrowLeftIcon} size="sm" color="inherit" />
                    All orders
                  </XDSHStack>
                </XDSLink>
                <XDSVStack gap={0}>
                  <XDSHeading level={1}>#1001</XDSHeading>
                  <XDSHStack
                    gap={1}
                    vAlign="center"
                    xstyle={pageStyles.metadataRow}>
                    <XDSText type="body">
                      {PRODUCTS.length} ordered items
                    </XDSText>
                    <Bullet />
                    <XDSHStack gap={1} vAlign="center">
                      <XDSAvatar name="Jane Doe" size="xsmall" />
                      <XDSText type="body">Jane Doe</XDSText>
                    </XDSHStack>
                    <Bullet />
                    <XDSBadge variant="warning" label="Unfulfilled" />
                    <Bullet />
                    <XDSHStack gap={1} vAlign="center">
                      <XDSIcon
                        icon={CalendarIcon}
                        size="sm"
                        color="secondary"
                      />
                      <XDSText type="body">02/23/2026</XDSText>
                    </XDSHStack>
                    <Bullet />
                    <XDSHStack gap={1} vAlign="center">
                      <XDSIcon icon={FlagIcon} size="sm" color="secondary" />
                      <XDSText type="body">Needs attention</XDSText>
                    </XDSHStack>
                    <Bullet />
                    <XDSLink href="#" label="See all" color="secondary">
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
      </XDSCenter>
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
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: 100,
                    height: 66,
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-content, 4px)',
                  }}
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
function RightPanel({isOpen}: {isOpen: boolean}) {
  return (
    <div
      {...stylex.props(pageStyles.panelAnimationWrapper)}
      style={{
        width: isOpen ? 320 : 0,
        minWidth: isOpen ? 320 : 0,
      }}>
      <XDSLayoutPanel
        hasDivider
        width={320}
        padding={4}
        role="complementary"
        style={{
          opacity: isOpen ? 1 : 0,
          transitionDelay: isOpen ? 'var(--duration-fast, 175ms)' : '0ms',
        }}
        xstyle={pageStyles.panelContent}>
        <XDSVStack gap={4}>
          <XDSCollapsible trigger={<XDSHeading level={4}>Notes</XDSHeading>}>
            <XDSText type="body">
              Customer is a repeat buyer — 3rd order this quarter. Prefers snow
              and oat glazes. Requested gift wrapping for the mug set. Ships to
              a residential address in CA.{' '}
              <XDSLink href="#" label="Show more" color="secondary">
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
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function DetailPage2Template() {
  const [activeTab, setActiveTab] = useState('details');
  const [isPanelOpen, setIsPanelOpen] = useState(true);

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
          <XDSLayoutContent role="main" xstyle={pageStyles.contentFlushEnd}>
            <XDSVStack gap={4}>
              <ItemsCard />
              <InvoiceCard />
              <TimelineSection />
            </XDSVStack>
          </XDSLayoutContent>
        }
        end={<RightPanel isOpen={isPanelOpen} />}
      />
    </XDSAppShell>
  );
}
