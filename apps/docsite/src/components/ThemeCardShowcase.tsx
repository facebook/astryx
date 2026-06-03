// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Real-world card showcase for a theme.
 *
 * Three realistic product surfaces rendered with the theme's components
 * — meant to demonstrate how the theme behaves in compositions people
 * actually build (stats card, task card, profile card) rather than as
 * an abstract sample-each-component list.
 *
 * Lives outside the live ThemeShowcasePreview card on the dedicated
 * /themes/<name> page. Always renders in light mode regardless of
 * the page-header toggle, so the cards work as a static reference.
 */

import {type ReactNode} from 'react';
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
import {
  XDSChatComposer,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageList,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSTheme} from '@xds/core/theme';
import type {XDSDefinedTheme} from '@xds/core/theme';
import type {ThemeImageSet} from './themeImages';

const styles = stylex.create({
  // Each card paints the theme's body color so the showcase reads as
  // a coherent product surface against the docsite's chrome.
  // Border is forced transparent so the cards float on the surface
  // chrome without visible chrome of their own.
  card: {
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
    minWidth: 0,
    borderColor: 'transparent',
  },
  // Nested flex columns inherit `min-width: auto` which equals
  // content-min-width — causing form inputs to overflow the card
  // at narrow viewports. Force min-width: 0 + width: 100% so the
  // stack always respects the parent's available width and lets
  // its children (XDSTextInput, etc.) shrink with it.
  checkoutStack: {
    minWidth: 0,
    width: '100%',
  },
  // Content inside a payment-method SelectableCard. Constrains the
  // inner stack to the card's available width and wraps long
  // labels (e.g. "Apple Pay", "Google Pay") to a second line
  // instead of overflowing the card boundary at narrow widths.
  paymentCardContent: {
    minWidth: 0,
    width: '100%',
    textAlign: 'center',
    wordBreak: 'break-word',
  },
  // KNOWN-GAP (XDSGridSpan): when an auto-fit XDSGrid produces
  // fewer tracks than an XDSGridSpan claims, the span keeps its
  // original count and leaves empty tracks beside smaller cards
  // (e.g. Chat claims 2-of-3, but if only 2 tracks fit, Checkout
  // ends up alone on its row with one empty track beside it).
  // Forcing every span to `grid-column: 1 / -1` below 1024px (the
  // threshold where the worst-case 4-track + 3-gap layout stops
  // fitting) collapses each row to a single column at narrow
  // widths so cards always reach the row edge.
  //
  // Ideally XDSGridSpan would clamp `span N` to the available
  // track count automatically; until that lands in @xds/core,
  // this xstyle is the load-bearing workaround for both grid rows
  // below.
  fullSpanAtNarrow: {
    gridColumn: {
      default: null,
      '@media (max-width: 1024px)': '1 / -1',
    },
  },
  // Inventory card uses padding={0} since the header, filter row,
  // and table each own their own padding. Background uses --color-
  // background-surface (the lifted-above-body tone) so the inventory
  // reads as a distinct interactive surface against the page chrome.
  // Keeps the XDSCard default variant's border (via --color-border-
  // emphasized) so it reads as a bordered card.
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
  // Wraps the low-stock XDSBanner above the table so it inherits the
  // table's horizontal padding rather than running edge-to-edge.
  inventoryBannerWrap: {
    paddingInline: 'var(--spacing-6)',
    paddingBottom: 'var(--spacing-4)',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    maxWidth: 240,
  },
  // Square thumbnail used in the Item column. Falls back to a
  // colored letter chip via styles.thumbnailFallback when no image
  // is provided.
  thumbnail: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-element)',
    objectFit: 'cover' as const,
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
  // Latest activity card uses surface bg so it reads as a distinct
  // analytics surface beside Inventory (which also uses surface).
  activityCard: {
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-primary)',
    minWidth: 0,
    height: '100%',
  },
  // Hand-rolled sparkline — 5 vertical bars rendered as flex children.
  // Theme-aware fill uses --color-success for the on-trend green tone
  // (matches the categorical "green" badge palette used elsewhere).
  // Each bar's height is set inline via --bar-h percentage.
  sparkline: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    width: '100%',
    gap: 8,
  },
  sparkBar: {
    flex: 1,
    minWidth: 0,
    borderRadius: 'var(--radius-element)',
    // Categorical green background tint — the soft pastel surface
    // stop, not the saturated icon/text stop. Reads as a quiet
    // chart fill rather than an alert/status color.
    backgroundColor: 'var(--color-background-green)',
    // Bar height comes from inline `height` style per bar.
  },
  sparkLabels: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-xs)',
  },
  // Big KPI value (e.g. "18K"). Uses the theme's heading font so it
  // tracks the theme's typography decisions.
  kpiValue: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.1,
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-heading)',
    letterSpacing: '-0.01em',
  },
  // Chat card uses padding={0} since the header, message list, and
  // composer each own their own padding. Uses surface bg to match
  // the chat-app pattern people expect (chat surfaces typically
  // lift above body to read as a focused conversation panel).
  chatCard: {
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-primary)',
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  // Chat header — avatar + name + status row pinned to the top of
  // the card. Sits flush above the message canvas divider.
  chatHeader: {
    paddingBlock: 'var(--spacing-4)',
    paddingInline: 'var(--spacing-4)',
  },
  // Body wraps XDSChatMessageList in a flex-grow cell so the list
  // expands to fill the card. The list owns its own internal
  // padding (density-based, balanced = spacing-4), so we don't add
  // any here — otherwise the first message ends up double-padded
  // away from the header divider.
  chatBody: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  // Suggested-question chips above the composer. Centered so the
  // chips feel like a "tap one of these" affordance rather than a
  // left-aligned toolbar. Same horizontal padding as the composer
  // for visual alignment.
  chatSuggestions: {
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-2)',
  },
  chatComposer: {
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-4)',
  },
  // Compact activity row icon — circular muted disc holding a heroicon.
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
  // Negative inline margin to cancel out XDSItem's --spacing-2
  // internal padding so item content sits flush with the heading
  // above. The item's hover/focus background still extends
  // correctly because the padding is preserved on each row.
  itemListFlush: {
    marginInline: 'calc(var(--spacing-2) * -1)',
  },
  // Lets the outer card content stack fill the full card height
  // so the activity list flex:1 child can absorb the remaining
  // space below the chart + KPI summary + activity heading.
  activityCardStack: {
    height: '100%',
  },
  // Activity list fills remaining vertical space in the card,
  // clips overflow, and fades the bottom edge so longer feeds
  // visually suggest "more below" without rendering a scrollbar.
  // The mask-image is the same value applied to both standard
  // and -webkit- properties for Safari compatibility.
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
});

interface ThemeCardShowcaseProps {
  theme: XDSDefinedTheme;
  images: ThemeImageSet;
  /**
   * Color mode forwarded from ThemePackagePage's mode toggle in the
   * floating footer. Lets the inventory + checkout + top customers
   * cards flip light/dark in sync with the live preview above.
   */
  mode: 'light' | 'dark';
}

export function ThemeCardShowcase({
  theme,
  images,
  mode,
}: ThemeCardShowcaseProps) {
  return (
    <XDSTheme theme={theme} mode={mode}>
      <XDSVStack gap={8}>
        {/* Top row: Checkout (1/3) + Chat (2/3) via XDSGridSpan.
            Uses `repeat: 'fit'` so when the viewport is too narrow
            to fit 3 tracks of at least 200px, the remaining tracks
            collapse and the occupied ones stretch to fill the row
            edge-to-edge. NOTE: no `max` cap here — capping the
            track-max forces each cell to `(100% - gaps) / max`,
            which prevents auto-fit from stretching cells beyond
            that fraction at narrow widths (the cards would never
            fill the full row even with one card per row). */}
        <XDSGrid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
          <XDSGridSpan columns={1} xstyle={styles.fullSpanAtNarrow}>
            <CheckoutCard />
          </XDSGridSpan>
          <XDSGridSpan columns={2} xstyle={styles.fullSpanAtNarrow}>
            <ChatCard />
          </XDSGridSpan>
        </XDSGrid>
        {/* Bottom row: Inventory (3 cols) + Latest activity sidebar
            (1 col). `repeat: 'fit'` (auto-fit) stretches occupied
            tracks to fill the row when columns collapse at narrow
            viewports — same reasoning as the top row: no `max`
            cap so cells can stretch beyond the (100% / max)
            fraction when only one card per row fits. */}
        <XDSGrid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
          <XDSGridSpan columns={3} xstyle={styles.fullSpanAtNarrow}>
            <InventoryCard images={images} />
          </XDSGridSpan>
          <XDSGridSpan columns={1} xstyle={styles.fullSpanAtNarrow}>
            <LatestActivityCard />
          </XDSGridSpan>
        </XDSGrid>
      </XDSVStack>
    </XDSTheme>
  );
}

// =============================================================================
// Card 4 — Checkout form
// Components exercised: heading + supporting subtitle, XDSTextInput
// (email), XDSTextInput with startIcon (card number), 2-column grid
// for expiry + CVC, XDSSelector (country dropdown), full-width
// primary button with leading icon. Demonstrates a realistic
// multi-input form composition.
// =============================================================================

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

          {/* Shipping method picker — vertical radio list. Each
              row pairs a label + a per-row helper description with
              a trailing price in endContent so the price reads
              right-aligned (typical shipping-options layout). The
              group itself has a `description` for the universal
              caveat under all three options. Static demo: value is
              hard-coded to "economy"; tapping other rows does
              nothing. */}
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

          {/* Payment method picker — 3 horizontal XDSSelectableCards
              in an equal-width grid. Each card has a centered icon
              above a short label. Selected card gets the built-in
              accent border treatment. Static demo: "card" is hard-
              coded selected; tapping other cards does nothing.
              Uses the responsive {minWidth, max} grid pattern so
              cards collapse to fewer columns when the Checkout
              column itself is too narrow to fit 3 abreast. */}
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

          {/* Expiry + CVC in a responsive 2-col grid. At narrow
              widths (Checkout column shrinks below the
              {minWidth: 90} threshold per cell) the grid collapses
              to a single column stack so neither input clips past
              the card edge. */}
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

          {/* Country — XDSSelector (dropdown). */}
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

        {/* 1-click checkout opt-in — pre-checked, with a helper
            description underneath. Uses XDSCheckboxInput's built-in
            `description` slot rather than hand-stacking a second
            text row, so the helper inherits the right indentation
            and secondary text color from the primitive. */}
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

// =============================================================================
// Card 5 — Chat
//
// Compact chat surface modeled after a typical product messaging UI.
// Header has avatar + name + status, followed by a short message
// thread (date divider + 4 alternating-sender bubbles), and an
// XDSChatComposer at the bottom. All built from real XDS chat
// primitives (XDSChatMessage, XDSChatMessageBubble, XDSChatMessageList,
// XDSChatSystemMessage, XDSChatComposer) so the showcase demonstrates
// theme tokens flowing through the full chat surface.
// =============================================================================

const SUGGESTED_QUESTIONS = [
  'Reschedule delivery',
  'Update shipping address',
  'Start a return',
];

// Copilot-style canvas: bare user prompt (filled, right-aligned) +
// plain-prose assistant response (ghost, flat) + a rich composer
// with attach / mode picker / voice icon. No avatar header — the
// canvas IS the surface, not a conversation window.
function ChatCard() {
  return (
    <XDSCard padding={0} xstyle={styles.chatCard}>
      {/* Header — heading on the left, action chrome (Export, Close)
          on the right. Uses level=2 so it matches the heading scale
          of the other cards (Inventory, Revenue, Checkout). Common
          chat-panel pattern where the surface owns its own dismiss
          and export affordances. */}
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
            icon={<Download size={16} />}
          />
          <XDSButton
            variant="ghost"
            size="sm"
            isIconOnly
            label="Close chat"
            icon={<X size={16} />}
          />
        </XDSHStack>
      </XDSHStack>

      <XDSDivider variant="subtle" />

      {/* Message canvas — wider Copilot-style layout. Thread is a
          multi-turn concierge session about order #1043, with a
          "Today" system divider at the top and one structured-data
          block (compact order summary rendered as XDSItem rows
          with a trailing track-package link). */}
      <div {...stylex.props(styles.chatBody)}>
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
              {/* Compact order-summary block — XDSItem rows give
                  a label/description + trailing value pair without
                  any custom layout code. Wrapped in XDSCard so the
                  block reads as a distinct artifact within the
                  prose, similar to a Copilot tool-call result. */}
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

      {/* Suggested follow-up questions — quick chips above composer.
          Centered so they read as "tap one of these" affordances
          rather than a left-anchored toolbar. Static demo: no real
          send wiring; tapping does nothing. */}
      <div {...stylex.props(styles.chatSuggestions)}>
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

      {/* Composer — full Copilot pattern via XDSChatComposer slots:
          footerActions = attach + Smart mode picker
          sendActions = voice/dictation icon */}
      <div {...stylex.props(styles.chatComposer)}>
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
              icon={<Plus size={16} />}
            />
          }
          sendActions={
            <XDSButton
              variant="ghost"
              size="md"
              isIconOnly
              label="Voice input"
              icon={<Mic size={16} />}
            />
          }
        />
      </div>
    </XDSCard>
  );
}

// =============================================================================
// Card 7 — Latest activity (sidebar beside Inventory)
//
// Vertical analytics sidebar that sits to the right of the Inventory
// card. Tops out with a small CSS-only sparkline (5 bars, no chart
// library) + a "Monthly" badge, two KPI summary numbers below the
// chart, then a 4-item activity feed at the bottom.
//
// Components exercised: XDSCard (surface bg), XDSHeading, XDSBadge
// (categorical), XDSItem (avatar + label + description rows),
// XDSDivider, XDSLink, hand-rolled CSS sparkline.
// =============================================================================

const SPARKLINE_DATA = [55, 70, 92, 78, 60];
const SPARKLINE_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

interface ActivityRow {
  id: string;
  icon: ReactNode;
  /** Order label, e.g. "Order #1043". */
  label: string;
  /** Activity type displayed under the label. */
  detail: string;
  time: string;
  /** Signed dollar amount. Negative values are refunds. */
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
  return `${sign}$${Math.abs(amount).toLocaleString()}`;
}

function LatestActivityCard() {
  return (
    <XDSCard padding={5} xstyle={styles.activityCard}>
      <XDSVStack gap={4} xstyle={styles.activityCardStack}>
        <XDSHeading level={2}>Revenue</XDSHeading>

        {/* Hand-rolled CSS sparkline — 5 vertical bars. Heights set
            via inline `height` so the bars are data-driven without
            generating a stylex class per row. */}
        <XDSVStack gap={2}>
          <div {...stylex.props(styles.sparkline)} aria-hidden="true">
            {SPARKLINE_DATA.map((value, i) => (
              <div
                key={i}
                {...stylex.props(styles.sparkBar)}
                style={{height: `${value}%`}}
              />
            ))}
          </div>
          <div {...stylex.props(styles.sparkLabels)} aria-hidden="true">
            {SPARKLINE_LABELS.map(label => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </XDSVStack>

        <XDSGrid columns={2} gap={3}>
          <XDSVStack gap={0}>
            <span {...stylex.props(styles.kpiValue)}>18K</span>
            <XDSText type="supporting" color="secondary">
              Monthly revenue
            </XDSText>
          </XDSVStack>
          <XDSVStack gap={0}>
            <span {...stylex.props(styles.kpiValue)}>+12%</span>
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
                <div {...stylex.props(styles.activityIcon)} aria-hidden="true">
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

// =============================================================================
// Card 7 — Inventory table
//
// Rich product-app inventory pattern with a heading + primary action,
// a filter row (search + 3 filter pills + view toggle), a table with
// thumbnails / multi-badge tags / per-row overflow menus / selection
// checkboxes, and a floating bulk-action toolbar showing "3 selected".
// Everything is a static demo — no real filtering, sorting, or
// selection wiring — to keep the focus on theme component fidelity.
//
// Components exercised: XDSHeading, XDSButton (primary + ghost),
// XDSTextInput (with start icon), XDSCheckboxInput, XDSTable (custom
// renderers + proportional widths + dividers + hover), XDSBadge
// (categorical variants), XDSMoreMenu, XDSCard, XDSDivider, XDSIcon
// (via lucide-react).
// =============================================================================

type TagSpec = {label: string; variant: 'blue' | 'green' | 'orange' | 'yellow'};

// `extends Record<string, unknown>` is load-bearing: XDSTable's
// generic constraint requires it, and Next.js's production build
// enforces it strictly (dev builds let it slide). Without it the
// Vercel preview fails to compile at `<XDSTable<InventoryRow>>`
// below. The `unknown` value type is broad enough to accept
// `tags: TagSpec[]` and any other field shape we add later.
interface InventoryRow extends Record<string, unknown> {
  id: string;
  name: string;
  meta: string;
  available: number;
  location: string;
  tags: TagSpec[];
  /**
   * Key into the active ThemeImageSet. The actual URL is resolved
   * at render time via the `images` prop passed down from
   * ThemePackagePage, so each theme can swap its own product
   * photos without touching this data.
   */
  imageKey?: keyof ThemeImageSet;
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

// Reorder threshold — items with `available` below this surface a
// warning banner above the table. Kept here next to the INVENTORY
// data so the threshold and the data stay co-located.
const LOW_STOCK_THRESHOLD = 25;
const LOW_STOCK_COUNT = INVENTORY.filter(
  row => row.available < LOW_STOCK_THRESHOLD,
).length;

// -- Cell renderers ---------------------------------------------------------

function SelectCell({row}: {row: InventoryRow}) {
  return (
    <XDSCheckboxInput
      label={`Select ${row.name}`}
      isLabelHidden
      value={row.selected}
      onChange={() => {}}
    />
  );
}

function ItemCell({row, images}: {row: InventoryRow; images: ThemeImageSet}) {
  const thumbnailSrc = row.imageKey ? images[row.imageKey] : undefined;
  return (
    <XDSHStack gap={3} vAlign="center">
      {thumbnailSrc ? (
        <img src={thumbnailSrc} alt="" {...stylex.props(styles.thumbnail)} />
      ) : (
        <div {...stylex.props(styles.thumbnailFallback)} aria-hidden="true">
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

// -- Inventory card --------------------------------------------------------

function InventoryCard({images}: {images: ThemeImageSet}) {
  return (
    <XDSCard padding={0} xstyle={styles.inventoryCard}>
      {/* Heading + primary action */}
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

      {/* Filter row — search, filter pills, view toggle */}
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
            icon={<List size={18} />}
          />
          <XDSButton
            variant="ghost"
            size="sm"
            isIconOnly
            label="Grid view"
            icon={<LayoutGrid size={18} />}
          />
        </XDSHStack>
      </XDSHStack>

      {/* Low-stock warning — surfaces a contextual XDSBanner above
          the table when any inventory rows fall below LOW_STOCK_
          THRESHOLD. Wrapped in inventoryBannerWrap so the banner
          inherits the table's horizontal padding. */}
      {LOW_STOCK_COUNT > 0 && (
        <div {...stylex.props(styles.inventoryBannerWrap)}>
          <XDSBanner
            status="warning"
            title={`${LOW_STOCK_COUNT} items are running low`}
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
            // Fixed pixel width since the data is short (2-3 digit
            // counts) and the header label is the widest piece.
            // Frees the remaining horizontal space for Item and
            // pushes Available/Location closer to Tags.
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
