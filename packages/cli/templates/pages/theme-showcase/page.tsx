// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {type CSSProperties, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  Plus,
  Search,
  Tag,
  Folder,
  MapPin,
  List,
  LayoutGrid,
  ShoppingBag,
  Banknote,
  Mic,
  CreditCard,
  Lock,
  X,
  Download,
  Smartphone,
  Wallet,
  User,
} from 'lucide-react';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSBadge} from '@xds/core/Badge';
import {XDSBanner} from '@xds/core/Banner';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSItem} from '@xds/core/Item';
import {XDSTable, proportional, pixel} from '@xds/core/Table';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSSelectableCard} from '@xds/core/SelectableCard';
import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {XDSCenter} from '@xds/core/Center';
import {XDSSection} from '@xds/core/Section';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {
  XDSChatComposer,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageList,
  XDSChatSystemMessage,
} from '@xds/core/Chat';

// Styles passed to XDS components via their `xstyle` prop. These are
// applied by the components themselves, so they work in compiled builds
// and in the live playground preview alike.
const styles = stylex.create({
  card: {
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
    minWidth: 0,
    borderColor: 'transparent',
  },
  checkoutStack: {
    minWidth: 0,
    width: '100%',
  },
  paymentCardContent: {
    minWidth: 0,
    width: '100%',
    textAlign: 'center',
    wordBreak: 'break-word',
  },
  fullSpanAtNarrow: {
    gridColumn: {
      default: null,
      '@media (max-width: 1024px)': '1 / -1',
    },
  },
  inventoryCard: {
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-primary)',
    overflow: 'hidden',
  },
  inventoryHeader: {
    paddingBlock: 'var(--spacing-6)',
    paddingInline: 'var(--spacing-6)',
  },
  inventoryFilterRow: {
    paddingBlock: 'var(--spacing-4)',
    paddingInline: 'var(--spacing-6)',
    width: '100%',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    maxWidth: 240,
  },
  activityCard: {
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-primary)',
    minWidth: 0,
    height: '100%',
  },
  chatCard: {
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-primary)',
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  chatHeader: {
    paddingBlock: 'var(--spacing-4)',
    paddingInline: 'var(--spacing-4)',
  },
  activityCardStack: {
    height: '100%',
  },
  activityListFade: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    maskImage:
      'linear-gradient(to bottom, black calc(100% - 48px), transparent)',
    WebkitMaskImage:
      'linear-gradient(to bottom, black calc(100% - 48px), transparent)',
    marginInline: 'calc(var(--spacing-2) * -1)',
  },
  content: {
    maxWidth: 960,
    marginInline: 'auto',
  },
  contentFluid: {
    maxWidth: 880,
  },
  heroText: {
    textAlign: 'center' as const,
    maxWidth: 560,
  },
  centerText: {
    textAlign: 'center',
  },
  cardStack: {
    height: '100%',
  },
  cardDescription: {
    flex: 1,
  },
  quantityInput: {
    width: 40,
    flexShrink: 0,
  },
  cartButton: {
    flex: 1,
  },
});

// Styles applied directly to plain DOM elements via the `style` prop.
// Kept as inline styles (rather than stylex.create) so they render in the
// playground preview, which can't compile StyleX — `stylex.props()` is a
// no-op there, so raw `{...stylex.props(...)}` on a <div>/<img> would lose
// these declarations. All are static (no media/pseudo variants), so inline
// styles reproduce them exactly.
const inlineStyles: Record<string, CSSProperties> = {
  inventoryBannerWrap: {
    paddingInline: 'var(--spacing-6)',
    paddingBottom: 'var(--spacing-4)',
  },
  thumbnail: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-element)',
    objectFit: 'cover',
    display: 'block',
    flexShrink: 0,
  },
  thumbnailFallback: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    flexShrink: 0,
  },
  sparkline: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    width: '100%',
    gap: 8,
  },
  sparkLabels: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-xs)',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.1,
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-heading)',
    letterSpacing: '-0.01em',
  },
  chatBody: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  chatSuggestions: {
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-2)',
  },
  chatComposer: {
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-4)',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardBody: {
    padding: 'var(--spacing-4)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
};

// Sparkline bar — height is data-driven, so it's a function returning an
// inline style object (same reasoning as inlineStyles above).
const sparkBarStyle = (height: string): CSSProperties => ({
  flex: 1,
  minWidth: 0,
  borderRadius: 'var(--radius-element)',
  backgroundColor: 'var(--color-background-green)',
  height,
});

const PRODUCT_IMAGE_KEYS = ['watch', 'headphones', 'backpack'];

const PRODUCTS = [
  {
    name: 'Minimalist Watch',
    description: 'Clean design meets everyday durability.',
    badge: 'New',
    badgeVariant: 'blue' as const,
  },
  {
    name: 'Wireless Headphones',
    description: 'Immersive sound, all-day comfort.',
    badge: 'Popular',
    badgeVariant: 'green' as const,
  },
  {
    name: 'Canvas Backpack',
    description: 'Water-resistant canvas with a quiet, modern profile.',
    badge: 'Limited',
    badgeVariant: 'yellow' as const,
  },
];

const PREVIEW_IMAGES: Record<string, string> = {
  watch: '/neutral/preview-watch.png',
  headphones: '/neutral/preview-headphones.png',
  backpack: '/neutral/preview-backpack.png',
  wallet: '/neutral/preview-wallet.png',
  mug: '/neutral/preview-mug.png',
  throw_: '/neutral/preview-throw.png',
};

export default function ThemeShowcase() {
  const images: Record<string, string> = PREVIEW_IMAGES;
  return (
    <div
      style={{
        minHeight: '100%',
        backgroundColor: 'var(--color-background-body)',
      }}>
      <StorePreview images={images} />
      <div
        style={{
          padding: 'var(--spacing-6)',
          backgroundColor: 'var(--color-background-surface)',
        }}>
        <CardShowcase images={images} />
      </div>
    </div>
  );
}

function CardShowcase({images}: {images: Record<string, string>}) {
  return (
    <XDSVStack gap={8}>
      <XDSGrid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
        <XDSGridSpan columns={1} xstyle={styles.fullSpanAtNarrow}>
          <CheckoutCard />
        </XDSGridSpan>
        <XDSGridSpan columns={2} xstyle={styles.fullSpanAtNarrow}>
          <ChatCard />
        </XDSGridSpan>
      </XDSGrid>
      <XDSGrid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
        <XDSGridSpan columns={3} xstyle={styles.fullSpanAtNarrow}>
          <InventoryCard images={images} />
        </XDSGridSpan>
        <XDSGridSpan columns={1} xstyle={styles.fullSpanAtNarrow}>
          <LatestActivityCard />
        </XDSGridSpan>
      </XDSGrid>
    </XDSVStack>
  );
}

function StorePreview({images}: {images: Record<string, string>}) {
  return (
    <div data-theme-preview="true">
      <XDSVStack gap={0}>
        <XDSTopNav
          label="Theme preview navigation"
          heading={<XDSTopNavHeading heading="Studio" />}
          centerContent={
            <>
              <XDSTopNavItem label="Shop" href="#" isSelected />
              <XDSTopNavItem label="New In" href="#" />
              <XDSTopNavItem label="Stories" href="#" />
              <XDSTopNavItem label="Help" href="#" />
            </>
          }
          endContent={
            <XDSHStack gap={2} vAlign="center">
              <XDSHStack gap={0.5}>
                <XDSButton
                  label="Search"
                  tooltip="Search"
                  variant="ghost"
                  isIconOnly
                  icon={<Search size={20} />}
                  href="#"
                />
                <XDSButton
                  label="Account"
                  tooltip="Account"
                  variant="ghost"
                  isIconOnly
                  icon={<User size={20} />}
                  href="#"
                />
                <XDSButton
                  label="Cart"
                  tooltip="Cart"
                  variant="ghost"
                  isIconOnly
                  icon={<ShoppingBag size={20} />}
                  href="#"
                />
              </XDSHStack>
              <XDSButton label="Sign in" variant="primary" href="#" />
            </XDSHStack>
          }
        />

        <XDSSection padding={8} variant="transparent">
          <XDSVStack gap={10} xstyle={[styles.content, styles.contentFluid]}>
            <XDSCenter>
              <XDSVStack gap={4} hAlign="center" xstyle={styles.heroText}>
                <XDSText type="display-3">
                  Little joys,
                  <br />
                  everywhere you go
                </XDSText>
                <XDSText type="body" color="secondary">
                  We believe the smallest details are the ones that matter most.
                  Turn an ordinary day into something worth remembering.
                </XDSText>
              </XDSVStack>
            </XDSCenter>

            <XDSGrid columns={{minWidth: 240}} gap={4}>
              {PRODUCTS.map((p, i) => (
                <XDSCard key={p.name} padding={0} height="100%">
                  <XDSVStack gap={0} xstyle={styles.cardStack}>
                    <XDSAspectRatio ratio={1}>
                      <img
                        src={images[PRODUCT_IMAGE_KEYS[i]]}
                        alt={p.name}
                        style={inlineStyles.productImage}
                      />
                    </XDSAspectRatio>
                    <div style={inlineStyles.cardBody}>
                      <XDSVStack
                        gap={2}
                        hAlign="center"
                        xstyle={styles.cardStack}>
                        <XDSHStack>
                          <XDSBadge label={p.badge} variant={p.badgeVariant} />
                        </XDSHStack>
                        <XDSHeading level={2} xstyle={styles.centerText}>
                          {p.name}
                        </XDSHeading>
                        <XDSText
                          type="supporting"
                          color="secondary"
                          xstyle={[styles.cardDescription, styles.centerText]}>
                          {p.description}
                        </XDSText>
                        <XDSHStack gap={2} vAlign="center" hAlign="center">
                          <XDSNumberInput
                            label="Quantity"
                            isLabelHidden
                            value={1}
                            onChange={() => {}}
                            min={1}
                            max={99}
                            size="sm"
                            xstyle={styles.quantityInput}
                          />
                          <XDSButton
                            label="Add to cart"
                            variant="secondary"
                            href="#"
                            xstyle={styles.cartButton}
                          />
                        </XDSHStack>
                      </XDSVStack>
                    </div>
                  </XDSVStack>
                </XDSCard>
              ))}
            </XDSGrid>
          </XDSVStack>
        </XDSSection>
      </XDSVStack>
    </div>
  );
}

function CheckoutCard() {
  return (
    <XDSCard padding={5} xstyle={styles.card}>
      <XDSVStack gap={4} xstyle={styles.checkoutStack}>
        <XDSHeading level={2}>Checkout</XDSHeading>

        <XDSVStack gap={3} xstyle={styles.checkoutStack}>
          <XDSTextInput
            label="Email"
            placeholder="you@studio.com"
            value=""
            onChange={() => {}}
            size="lg"
          />

          <XDSRadioList
            label="Shipping method"
            description="Delivery time may vary based on location and availability."
            value="economy"
            onChange={() => {}}>
            <XDSRadioListItem
              value="economy"
              label="Economy Shipping"
              description="Delivered in 5–7 business days"
              endContent={
                <XDSText type="body" weight="bold">
                  $12.00
                </XDSText>
              }
            />
            <XDSRadioListItem
              value="standard"
              label="Standard Shipping"
              description="Delivered in 3–5 business days"
              endContent={
                <XDSText type="body" weight="bold">
                  $16.00
                </XDSText>
              }
            />
            <XDSRadioListItem
              value="express"
              label="Express Shipping"
              description="Delivered in 1–2 business days"
              endContent={
                <XDSText type="body" weight="bold">
                  $24.00
                </XDSText>
              }
            />
          </XDSRadioList>

          <XDSVStack gap={2} xstyle={styles.checkoutStack}>
            <XDSText type="supporting" weight="bold">
              Payment method
            </XDSText>
            <XDSGrid columns={{minWidth: 70, max: 3}} gap={2}>
              <XDSSelectableCard
                label="Pay with card"
                isSelected={true}
                onChange={() => {}}
                padding={3}>
                <XDSVStack
                  gap={1}
                  hAlign="center"
                  xstyle={styles.paymentCardContent}>
                  <CreditCard size={20} />
                  <XDSText type="supporting" weight="bold">
                    Card
                  </XDSText>
                </XDSVStack>
              </XDSSelectableCard>
              <XDSSelectableCard
                label="Pay with Apple Pay"
                isSelected={false}
                onChange={() => {}}
                padding={3}>
                <XDSVStack
                  gap={1}
                  hAlign="center"
                  xstyle={styles.paymentCardContent}>
                  <Smartphone size={20} />
                  <XDSText type="supporting" weight="bold">
                    Apple Pay
                  </XDSText>
                </XDSVStack>
              </XDSSelectableCard>
              <XDSSelectableCard
                label="Pay with Google Pay"
                isSelected={false}
                onChange={() => {}}
                padding={3}>
                <XDSVStack
                  gap={1}
                  hAlign="center"
                  xstyle={styles.paymentCardContent}>
                  <Wallet size={20} />
                  <XDSText type="supporting" weight="bold">
                    Google Pay
                  </XDSText>
                </XDSVStack>
              </XDSSelectableCard>
            </XDSGrid>
          </XDSVStack>

          <XDSTextInput
            label="Card number"
            placeholder="1234 1234 1234 1234"
            value=""
            onChange={() => {}}
            startIcon={<CreditCard size={16} />}
            size="lg"
          />

          <XDSGrid columns={{minWidth: 90, max: 2}} gap={2}>
            <XDSTextInput
              label="Expiry"
              placeholder="MM / YY"
              value=""
              onChange={() => {}}
              size="lg"
            />
            <XDSTextInput
              label="CVC"
              placeholder="123"
              value=""
              onChange={() => {}}
              size="lg"
            />
          </XDSGrid>

          <XDSSelector
            label="Country"
            value="us"
            onChange={() => {}}
            size="lg"
            options={[
              {value: 'us', label: 'United States'},
              {value: 'ca', label: 'Canada'},
              {value: 'uk', label: 'United Kingdom'},
              {value: 'de', label: 'Germany'},
              {value: 'jp', label: 'Japan'},
              {value: 'au', label: 'Australia'},
            ]}
          />
        </XDSVStack>

        <XDSCheckboxInput
          label="Securely save my information for 1-click checkout"
          description="Pay faster on Studio and everywhere Link is accepted."
          value={true}
          onChange={() => {}}
        />

        <XDSButton
          variant="primary"
          size="lg"
          label="Pay now"
          icon={<Lock size={16} />}
        />
      </XDSVStack>
    </XDSCard>
  );
}

const SUGGESTED_QUESTIONS = [
  'Reschedule delivery',
  'Update shipping address',
  'Start a return',
];

function ChatCard() {
  return (
    <XDSCard padding={0} xstyle={styles.chatCard}>
      <XDSHStack
        hAlign="between"
        vAlign="center"
        gap={3}
        xstyle={styles.chatHeader}>
        <XDSHeading level={2}>Studio AI</XDSHeading>

        <XDSHStack gap={1} vAlign="center">
          <XDSButton
            variant="ghost"
            size="sm"
            isIconOnly
            label="Export conversation"
            tooltip="Export conversation"
            icon={<Download size={16} />}
          />
          <XDSButton
            variant="ghost"
            size="sm"
            isIconOnly
            label="Close chat"
            tooltip="Close chat"
            icon={<X size={16} />}
          />
        </XDSHStack>
      </XDSHStack>

      <XDSDivider variant="subtle" />

      <div style={inlineStyles.chatBody}>
        <XDSChatMessageList>
          <XDSChatSystemMessage>Today</XDSChatSystemMessage>

          <XDSChatMessage sender="user">
            <XDSChatMessageBubble variant="filled">
              Where’s my order?
            </XDSChatMessageBubble>
          </XDSChatMessage>

          <XDSChatMessage sender="assistant">
            <XDSVStack gap={3}>
              <XDSText type="body">
                Your order #1043 — the Minimalist Watch and Linen Throw —
                shipped this morning from the Aisle 3 warehouse and is currently
                in transit with UPS. It’s on track to arrive at your address by
                end of day tomorrow.
              </XDSText>
              <XDSText type="body">
                Let me know if you’d like to reschedule the delivery, redirect
                it to a pickup point, or start a return once it arrives.
              </XDSText>
            </XDSVStack>
          </XDSChatMessage>

          <XDSChatMessage sender="user">
            <XDSChatMessageBubble variant="filled">
              Can you show me the full details?
            </XDSChatMessageBubble>
          </XDSChatMessage>

          <XDSChatMessage sender="assistant">
            <XDSVStack gap={3}>
              <XDSText type="body">
                Here’s everything I have on order #1043:
              </XDSText>
              <XDSCard padding={3}>
                <XDSVStack gap={1}>
                  <XDSItem
                    label="Items"
                    description="Minimalist Watch · Linen Throw"
                    trailing={
                      <XDSText type="body" weight="bold">
                        $248
                      </XDSText>
                    }
                  />
                  <XDSItem
                    label="Shipping"
                    description="UPS Ground"
                    trailing={
                      <XDSText type="body" weight="bold">
                        $12
                      </XDSText>
                    }
                  />
                  <XDSItem
                    label="Estimated arrival"
                    description="Tomorrow by 8pm"
                    trailing={<XDSBadge variant="green" label="On time" />}
                  />
                  <XDSItem
                    label="Tracking"
                    description="UPS 1Z 999 AA1 0123 4567 84"
                    trailing={<XDSLink href="#">Track →</XDSLink>}
                  />
                </XDSVStack>
              </XDSCard>
            </XDSVStack>
          </XDSChatMessage>
        </XDSChatMessageList>
      </div>

      <div style={inlineStyles.chatSuggestions}>
        <XDSHStack gap={1} hAlign="center" wrap="wrap">
          {SUGGESTED_QUESTIONS.map(question => (
            <XDSButton
              key={question}
              variant="secondary"
              size="sm"
              label={question}
            />
          ))}
        </XDSHStack>
      </div>

      <div style={inlineStyles.chatComposer}>
        <XDSChatComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          placeholder="Ask Studio AI…"
          footerActions={
            <XDSButton
              variant="ghost"
              size="md"
              isIconOnly
              label="Attach"
              tooltip="Attach"
              icon={<Plus size={16} />}
            />
          }
          sendActions={
            <XDSButton
              variant="ghost"
              size="md"
              isIconOnly
              label="Voice input"
              tooltip="Voice input"
              icon={<Mic size={16} />}
            />
          }
        />
      </div>
    </XDSCard>
  );
}

const SPARKLINE_DATA = [55, 70, 92, 78, 60];
const SPARKLINE_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

interface ActivityRow {
  id: string;
  icon: ReactNode;
  label: string;
  detail: string;
  time: string;
  amount: number;
}

const ACTIVITY: ActivityRow[] = [
  {
    id: '1',
    icon: <ShoppingBag size={16} />,
    label: 'Order #1043',
    detail: 'Placed · 1:59 pm',
    time: '1:59 pm',
    amount: 248,
  },
  {
    id: '2',
    icon: <Banknote size={16} />,
    label: 'Order #1041',
    detail: 'Refunded · 12:40 pm',
    time: '12:40 pm',
    amount: -89,
  },
  {
    id: '3',
    icon: <ShoppingBag size={16} />,
    label: 'Order #1040',
    detail: 'Placed · 10:30 am',
    time: '10:30 am',
    amount: 156,
  },
  {
    id: '4',
    icon: <ShoppingBag size={16} />,
    label: 'Order #1038',
    detail: 'Placed · 9:11 am',
    time: '9:11 am',
    amount: 412,
  },
  {
    id: '5',
    icon: <ShoppingBag size={16} />,
    label: 'Order #1037',
    detail: 'Placed · 8:42 am',
    time: '8:42 am',
    amount: 95,
  },
];

function formatAmount(amount: number): string {
  const sign = amount < 0 ? '−' : '+';
  return sign + '$' + Math.abs(amount).toLocaleString();
}

function LatestActivityCard() {
  return (
    <XDSCard padding={5} xstyle={styles.activityCard}>
      <XDSVStack gap={4} xstyle={styles.activityCardStack}>
        <XDSHeading level={2}>Revenue</XDSHeading>

        <XDSVStack gap={2}>
          <div style={inlineStyles.sparkline} aria-hidden="true">
            {SPARKLINE_DATA.map((value, i) => (
              <div key={i} style={sparkBarStyle(value + '%')} />
            ))}
          </div>
          <div style={inlineStyles.sparkLabels} aria-hidden="true">
            {SPARKLINE_LABELS.map(label => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </XDSVStack>

        <XDSGrid columns={2} gap={3}>
          <XDSVStack gap={0}>
            <span style={inlineStyles.kpiValue}>18K</span>
            <XDSText type="supporting" color="secondary">
              Monthly revenue
            </XDSText>
          </XDSVStack>
          <XDSVStack gap={0}>
            <span style={inlineStyles.kpiValue}>+12%</span>
            <XDSText type="supporting" color="secondary">
              Order growth
            </XDSText>
          </XDSVStack>
        </XDSGrid>

        <XDSDivider variant="subtle" />

        <XDSHStack hAlign="between" vAlign="center">
          <XDSHeading level={3}>Activity</XDSHeading>
          <XDSLink href="#">See all</XDSLink>
        </XDSHStack>

        <XDSVStack gap={1} xstyle={styles.activityListFade}>
          {ACTIVITY.map(item => (
            <XDSItem
              key={item.id}
              media={
                <div style={inlineStyles.activityIcon} aria-hidden="true">
                  {item.icon}
                </div>
              }
              label={item.label}
              description={item.detail}
              trailing={
                <XDSText
                  type="body"
                  weight="bold"
                  color={item.amount < 0 ? 'secondary' : 'primary'}>
                  {formatAmount(item.amount)}
                </XDSText>
              }
              href="#"
            />
          ))}
        </XDSVStack>
      </XDSVStack>
    </XDSCard>
  );
}

type TagSpec = {label: string; variant: 'blue' | 'green' | 'orange' | 'yellow'};

interface InventoryRow extends Record<string, unknown> {
  id: string;
  name: string;
  meta: string;
  available: number;
  location: string;
  tags: TagSpec[];
  imageKey?: string;
  thumbnailFallback: string;
  selected: boolean;
}

const INVENTORY: InventoryRow[] = [
  {
    id: 'a',
    name: 'Minimalist Watch',
    meta: 'Stainless steel, sapphire crystal',
    available: 42,
    location: 'Aisle 3',
    tags: [{label: 'New', variant: 'blue'}],
    imageKey: 'watch',
    thumbnailFallback: 'M',
    selected: false,
  },
  {
    id: 'b',
    name: 'Wireless Headphones',
    meta: 'ANC, 30hr battery',
    available: 128,
    location: 'Aisle 1',
    tags: [{label: 'Popular', variant: 'green'}],
    imageKey: 'headphones',
    thumbnailFallback: 'W',
    selected: true,
  },
  {
    id: 'c',
    name: 'Canvas Backpack',
    meta: 'Water-resistant, 25L',
    available: 63,
    location: 'Aisle 2',
    tags: [{label: 'Limited', variant: 'yellow'}],
    imageKey: 'backpack',
    thumbnailFallback: 'C',
    selected: false,
  },
  {
    id: 'd',
    name: 'Leather Wallet',
    meta: 'Full-grain, RFID blocking',
    available: 15,
    location: 'Aisle 4',
    tags: [{label: 'Leather', variant: 'yellow'}],
    imageKey: 'wallet',
    thumbnailFallback: 'L',
    selected: true,
  },
  {
    id: 'e',
    name: 'Travel Mug',
    meta: 'Vacuum insulated, 16oz',
    available: 87,
    location: 'Aisle 5',
    tags: [{label: 'Drinkware', variant: 'green'}],
    imageKey: 'mug',
    thumbnailFallback: 'T',
    selected: false,
  },
  {
    id: 'f',
    name: 'Linen Throw',
    meta: 'Heavyweight, oat',
    available: 24,
    location: 'Aisle 6',
    tags: [{label: 'Home', variant: 'orange'}],
    imageKey: 'throw_',
    thumbnailFallback: 'L',
    selected: true,
  },
];

const LOW_STOCK_THRESHOLD = 25;
const LOW_STOCK_COUNT = INVENTORY.filter(
  row => row.available < LOW_STOCK_THRESHOLD,
).length;

function SelectCell({row}: {row: InventoryRow}) {
  return (
    <XDSCheckboxInput
      label={'Select ' + row.name}
      isLabelHidden
      value={row.selected}
      onChange={() => {}}
    />
  );
}

function ItemCell({
  row,
  images,
}: {
  row: InventoryRow;
  images: Record<string, string>;
}) {
  const thumbnailSrc = row.imageKey ? images[row.imageKey] : undefined;
  return (
    <XDSHStack gap={3} vAlign="center">
      {thumbnailSrc ? (
        <img src={thumbnailSrc} alt="" style={inlineStyles.thumbnail} />
      ) : (
        <div style={inlineStyles.thumbnailFallback} aria-hidden="true">
          {row.thumbnailFallback}
        </div>
      )}
      <XDSVStack gap={0} style={{minWidth: 0}}>
        <XDSText type="body" weight="bold">
          {row.name}
        </XDSText>
        <XDSText type="supporting" color="secondary">
          {row.meta}
        </XDSText>
      </XDSVStack>
    </XDSHStack>
  );
}

function TagsCell({row}: {row: InventoryRow}) {
  return (
    <XDSHStack gap={1} wrap="wrap" hAlign="end">
      {row.tags.map(tag => (
        <XDSBadge key={tag.label} label={tag.label} variant={tag.variant} />
      ))}
    </XDSHStack>
  );
}

function ActionsCell() {
  return (
    <XDSMoreMenu
      label="Row actions"
      items={[
        {label: 'Edit'},
        {label: 'Duplicate'},
        {label: 'Move to…'},
        {type: 'divider'},
        {label: 'Delete'},
      ]}
    />
  );
}

function InventoryCard({images}: {images: Record<string, string>}) {
  return (
    <XDSCard padding={0} xstyle={styles.inventoryCard}>
      <XDSHStack
        hAlign="between"
        vAlign="center"
        xstyle={styles.inventoryHeader}>
        <XDSHeading level={2}>Inventory</XDSHeading>
        <XDSButton
          label="Add item"
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
        />
      </XDSHStack>

      <XDSDivider variant="subtle" />

      <XDSHStack
        gap={3}
        vAlign="center"
        hAlign="between"
        xstyle={styles.inventoryFilterRow}>
        <XDSHStack gap={2} vAlign="center" style={{flex: 1, minWidth: 0}}>
          <XDSTextInput
            label="Search inventory"
            isLabelHidden
            placeholder="Type and hit enter…"
            value=""
            onChange={() => {}}
            startIcon={<Search size={16} />}
            xstyle={styles.searchInput}
          />
          <XDSSelector
            label="Categories"
            isLabelHidden
            placeholder="Categories"
            size="sm"
            startIcon={<Folder size={16} />}
            value={undefined}
            onChange={() => {}}
            options={['Wearables', 'Audio', 'Bags', 'Drinkware', 'Home']}
          />
          <XDSSelector
            label="Locations"
            isLabelHidden
            placeholder="Locations"
            size="sm"
            startIcon={<MapPin size={16} />}
            value={undefined}
            onChange={() => {}}
            options={[
              'Aisle 1',
              'Aisle 2',
              'Aisle 3',
              'Aisle 4',
              'Aisle 5',
              'Aisle 6',
            ]}
          />
          <XDSSelector
            label="Tags"
            isLabelHidden
            placeholder="Tags"
            size="sm"
            startIcon={<Tag size={16} />}
            value={undefined}
            onChange={() => {}}
            options={[
              'New',
              'Popular',
              'Limited',
              'Leather',
              'Drinkware',
              'Home',
            ]}
          />
        </XDSHStack>
        <XDSHStack gap={1} vAlign="center">
          <XDSButton
            variant="ghost"
            size="sm"
            isIconOnly
            label="List view"
            tooltip="List view"
            icon={<List size={18} />}
          />
          <XDSButton
            variant="ghost"
            size="sm"
            isIconOnly
            label="Grid view"
            tooltip="Grid view"
            icon={<LayoutGrid size={18} />}
          />
        </XDSHStack>
      </XDSHStack>

      {LOW_STOCK_COUNT > 0 && (
        <div style={inlineStyles.inventoryBannerWrap}>
          <XDSBanner
            status="warning"
            title={LOW_STOCK_COUNT + ' items are running low'}
          />
        </div>
      )}

      <XDSTable<InventoryRow>
        data={INVENTORY}
        columns={[
          {
            key: 'select',
            header: '',
            width: pixel(48),
            renderCell: row => <SelectCell row={row} />,
          },
          {
            key: 'item',
            header: 'Item',
            width: proportional(3),
            renderCell: row => <ItemCell row={row} images={images} />,
          },
          {
            key: 'available',
            header: 'Available',
            width: pixel(100),
            renderCell: row => <XDSText type="body">{row.available}</XDSText>,
          },
          {
            key: 'location',
            header: 'Location',
            width: pixel(100),
            renderCell: row => <XDSText type="body">{row.location}</XDSText>,
          },
          {
            key: 'tags',
            header: 'Tags',
            width: proportional(2),
            align: 'end',
            renderCell: row => <TagsCell row={row} />,
          },
          {
            key: 'actions',
            header: '',
            width: pixel(48),
            renderCell: () => <ActionsCell />,
          },
        ]}
        density="spacious"
        dividers="rows"
        hasHover
      />
    </XDSCard>
  );
}
