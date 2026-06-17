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
import {Text, Heading} from '@xds/core/Text';
import {VStack, HStack} from '@xds/core/Layout';
import {Grid, GridSpan} from '@xds/core/Grid';
import {Card} from '@xds/core/Card';
import {Button} from '@xds/core/Button';
import {Link} from '@xds/core/Link';
import {Badge} from '@xds/core/Badge';
import {Banner} from '@xds/core/Banner';
import {Divider} from '@xds/core/Divider';
import {CheckboxInput} from '@xds/core/CheckboxInput';
import {Item} from '@xds/core/Item';
import {Table, proportional, pixel} from '@xds/core/Table';
import {TextInput} from '@xds/core/TextInput';
import {Selector} from '@xds/core/Selector';
import {RadioList, RadioListItem} from '@xds/core/RadioList';
import {SelectableCard} from '@xds/core/SelectableCard';
import {MoreMenu} from '@xds/core/MoreMenu';
import {
  ChatComposer,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatSystemMessage,
} from '@xds/core/Chat';
import {Theme} from '@xds/core/theme';
import type {DefinedTheme} from '@xds/core/theme';
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
  // its children (TextInput, etc.) shrink with it.
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
  // KNOWN-GAP (GridSpan): when an auto-fit Grid produces
  // fewer tracks than an GridSpan claims, the span keeps its
  // original count and leaves empty tracks beside smaller cards
  // (e.g. Chat claims 2-of-3, but if only 2 tracks fit, Checkout
  // ends up alone on its row with one empty track beside it).
  // Forcing every span to `grid-column: 1 / -1` below 1024px (the
  // threshold where the worst-case 4-track + 3-gap layout stops
  // fitting) collapses each row to a single column at narrow
  // widths so cards always reach the row edge.
  //
  // Ideally GridSpan would clamp `span N` to the available
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
  // Keeps the Card default variant's border (via --color-border-
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
  // Wraps the low-stock Banner above the table so it inherits the
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
  // Body wraps ChatMessageList in a flex-grow cell so the list
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
  // Negative inline margin to cancel out Item's --spacing-2
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
  theme: DefinedTheme;
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
    <Theme theme={theme} mode={mode}>
      <VStack gap={8}>
        {/* Top row: Checkout (1/3) + Chat (2/3) via GridSpan.
            Uses `repeat: 'fit'` so when the viewport is too narrow
            to fit 3 tracks of at least 200px, the remaining tracks
            collapse and the occupied ones stretch to fill the row
            edge-to-edge. NOTE: no `max` cap here — capping the
            track-max forces each cell to `(100% - gaps) / max`,
            which prevents auto-fit from stretching cells beyond
            that fraction at narrow widths (the cards would never
            fill the full row even with one card per row). */}
        <Grid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
          <GridSpan columns={1} xstyle={styles.fullSpanAtNarrow}>
            <CheckoutCard />
          </GridSpan>
          <GridSpan columns={2} xstyle={styles.fullSpanAtNarrow}>
            <ChatCard />
          </GridSpan>
        </Grid>
        {/* Bottom row: Inventory (3 cols) + Latest activity sidebar
            (1 col). `repeat: 'fit'` (auto-fit) stretches occupied
            tracks to fill the row when columns collapse at narrow
            viewports — same reasoning as the top row: no `max`
            cap so cells can stretch beyond the (100% / max)
            fraction when only one card per row fits. */}
        <Grid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
          <GridSpan columns={3} xstyle={styles.fullSpanAtNarrow}>
            <InventoryCard images={images} />
          </GridSpan>
          <GridSpan columns={1} xstyle={styles.fullSpanAtNarrow}>
            <LatestActivityCard />
          </GridSpan>
        </Grid>
      </VStack>
    </Theme>
  );
}

// =============================================================================
// Card 4 — Checkout form
// Components exercised: heading + supporting subtitle, TextInput
// (email), TextInput with startIcon (card number), 2-column grid
// for expiry + CVC, Selector (country dropdown), full-width
// primary button with leading icon. Demonstrates a realistic
// multi-input form composition.
// =============================================================================

function CheckoutCard() {
  return (
    <Card padding={5} xstyle={styles.card}>
      <VStack gap={4} xstyle={styles.checkoutStack}>
        <Heading level={2}>Checkout</Heading>

        <VStack gap={3} xstyle={styles.checkoutStack}>
          <TextInput
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
          <RadioList
            label="Shipping method"
            description="Delivery time may vary based on location and availability."
            value="economy"
            onChange={() => {}}>
            <RadioListItem
              value="economy"
              label="Economy Shipping"
              description="Delivered in 5–7 business days"
              endContent={
                <Text type="body" weight="bold">
                  $12.00
                </Text>
              }
            />
            <RadioListItem
              value="standard"
              label="Standard Shipping"
              description="Delivered in 3–5 business days"
              endContent={
                <Text type="body" weight="bold">
                  $16.00
                </Text>
              }
            />
            <RadioListItem
              value="express"
              label="Express Shipping"
              description="Delivered in 1–2 business days"
              endContent={
                <Text type="body" weight="bold">
                  $24.00
                </Text>
              }
            />
          </RadioList>

          {/* Payment method picker — 3 horizontal SelectableCards
              in an equal-width grid. Each card has a centered icon
              above a short label. Selected card gets the built-in
              accent border treatment. Static demo: "card" is hard-
              coded selected; tapping other cards does nothing.
              Uses the responsive {minWidth, max} grid pattern so
              cards collapse to fewer columns when the Checkout
              column itself is too narrow to fit 3 abreast. */}
          <VStack gap={2} xstyle={styles.checkoutStack}>
            <Text type="supporting" weight="bold">
              Payment method
            </Text>
            <Grid columns={{minWidth: 70, max: 3}} gap={2}>
              <SelectableCard
                label="Pay with card"
                isSelected={true}
                onChange={() => {}}
                padding={3}>
                <VStack
                  gap={1}
                  hAlign="center"
                  xstyle={styles.paymentCardContent}>
                  <CreditCard size={20} />
                  <Text type="supporting" weight="bold">
                    Card
                  </Text>
                </VStack>
              </SelectableCard>
              <SelectableCard
                label="Pay with Apple Pay"
                isSelected={false}
                onChange={() => {}}
                padding={3}>
                <VStack
                  gap={1}
                  hAlign="center"
                  xstyle={styles.paymentCardContent}>
                  <Smartphone size={20} />
                  <Text type="supporting" weight="bold">
                    Apple Pay
                  </Text>
                </VStack>
              </SelectableCard>
              <SelectableCard
                label="Pay with Google Pay"
                isSelected={false}
                onChange={() => {}}
                padding={3}>
                <VStack
                  gap={1}
                  hAlign="center"
                  xstyle={styles.paymentCardContent}>
                  <Wallet size={20} />
                  <Text type="supporting" weight="bold">
                    Google Pay
                  </Text>
                </VStack>
              </SelectableCard>
            </Grid>
          </VStack>

          <TextInput
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
          <Grid columns={{minWidth: 90, max: 2}} gap={2}>
            <TextInput
              label="Expiry"
              placeholder="MM / YY"
              value=""
              onChange={() => {}}
              size="lg"
            />
            <TextInput
              label="CVC"
              placeholder="123"
              value=""
              onChange={() => {}}
              size="lg"
            />
          </Grid>

          {/* Country — Selector (dropdown). */}
          <Selector
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
        </VStack>

        {/* 1-click checkout opt-in — pre-checked, with a helper
            description underneath. Uses CheckboxInput's built-in
            `description` slot rather than hand-stacking a second
            text row, so the helper inherits the right indentation
            and secondary text color from the primitive. */}
        <CheckboxInput
          label="Securely save my information for 1-click checkout"
          description="Pay faster on Studio and everywhere Link is accepted."
          value={true}
          onChange={() => {}}
        />

        <Button
          variant="primary"
          size="lg"
          label="Pay now"
          icon={<Lock size={16} />}
        />
      </VStack>
    </Card>
  );
}

// =============================================================================
// Card 5 — Chat
//
// Compact chat surface modeled after a typical product messaging UI.
// Header has avatar + name + status, followed by a short message
// thread (date divider + 4 alternating-sender bubbles), and an
// ChatComposer at the bottom. All built from real XDS chat
// primitives (ChatMessage, ChatMessageBubble, ChatMessageList,
// ChatSystemMessage, ChatComposer) so the showcase demonstrates
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
    <Card padding={0} xstyle={styles.chatCard}>
      {/* Header — heading on the left, action chrome (Export, Close)
          on the right. Uses level=2 so it matches the heading scale
          of the other cards (Inventory, Revenue, Checkout). Common
          chat-panel pattern where the surface owns its own dismiss
          and export affordances. */}
      <HStack
        hAlign="between"
        vAlign="center"
        gap={3}
        xstyle={styles.chatHeader}>
        <Heading level={2}>Studio AI</Heading>

        <HStack gap={1} vAlign="center">
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            label="Export conversation"
            tooltip="Export conversation"
            icon={<Download size={16} />}
          />
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            label="Close chat"
            tooltip="Close chat"
            icon={<X size={16} />}
          />
        </HStack>
      </HStack>

      <Divider variant="subtle" />

      {/* Message canvas — wider Copilot-style layout. Thread is a
          multi-turn concierge session about order #1043, with a
          "Today" system divider at the top and one structured-data
          block (compact order summary rendered as Item rows
          with a trailing track-package link). */}
      <div {...stylex.props(styles.chatBody)}>
        <ChatMessageList>
          <ChatSystemMessage>Today</ChatSystemMessage>

          <ChatMessage sender="user">
            <ChatMessageBubble variant="filled">
              Where’s my order?
            </ChatMessageBubble>
          </ChatMessage>

          <ChatMessage sender="assistant">
            <VStack gap={3}>
              <Text type="body">
                Your order #1043 — the Minimalist Watch and Linen Throw —
                shipped this morning from the Aisle 3 warehouse and is currently
                in transit with UPS. It’s on track to arrive at your address by
                end of day tomorrow.
              </Text>
              <Text type="body">
                Let me know if you’d like to reschedule the delivery, redirect
                it to a pickup point, or start a return once it arrives.
              </Text>
            </VStack>
          </ChatMessage>

          <ChatMessage sender="user">
            <ChatMessageBubble variant="filled">
              Can you show me the full details?
            </ChatMessageBubble>
          </ChatMessage>

          <ChatMessage sender="assistant">
            <VStack gap={3}>
              <Text type="body">
                Here’s everything I have on order #1043:
              </Text>
              {/* Compact order-summary block — Item rows give
                  a label/description + endContent value pair without
                  any custom layout code. Wrapped in Card so the
                  block reads as a distinct artifact within the
                  prose, similar to a Copilot tool-call result. */}
              <Card padding={3}>
                <VStack gap={1}>
                  <Item
                    label="Items"
                    description="Minimalist Watch · Linen Throw"
                    endContent={
                      <Text type="body" weight="bold">
                        $248
                      </Text>
                    }
                  />
                  <Item
                    label="Shipping"
                    description="UPS Ground"
                    endContent={
                      <Text type="body" weight="bold">
                        $12
                      </Text>
                    }
                  />
                  <Item
                    label="Estimated arrival"
                    description="Tomorrow by 8pm"
                    endContent={<Badge variant="green" label="On time" />}
                  />
                  <Item
                    label="Tracking"
                    description="UPS 1Z 999 AA1 0123 4567 84"
                    endContent={<Link href="#">Track →</Link>}
                  />
                </VStack>
              </Card>
            </VStack>
          </ChatMessage>
        </ChatMessageList>
      </div>

      {/* Suggested follow-up questions — quick chips above composer.
          Centered so they read as "tap one of these" affordances
          rather than a left-anchored toolbar. Static demo: no real
          send wiring; tapping does nothing. */}
      <div {...stylex.props(styles.chatSuggestions)}>
        <HStack gap={1} hAlign="center" wrap="wrap">
          {SUGGESTED_QUESTIONS.map(question => (
            <Button
              key={question}
              variant="secondary"
              size="sm"
              label={question}
            />
          ))}
        </HStack>
      </div>

      {/* Composer — full Copilot pattern via ChatComposer slots:
          footerActions = attach + Smart mode picker
          sendActions = voice/dictation icon */}
      <div {...stylex.props(styles.chatComposer)}>
        <ChatComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          placeholder="Ask Studio AI…"
          footerActions={
            <Button
              variant="ghost"
              size="md"
              isIconOnly
              label="Attach"
              tooltip="Attach"
              icon={<Plus size={16} />}
            />
          }
          sendActions={
            <Button
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
    </Card>
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
// Components exercised: Card (surface bg), Heading, Badge
// (categorical), Item (avatar + label + description rows),
// Divider, Link, hand-rolled CSS sparkline.
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
    <Card padding={5} xstyle={styles.activityCard}>
      <VStack gap={4} xstyle={styles.activityCardStack}>
        <Heading level={2}>Revenue</Heading>

        {/* Hand-rolled CSS sparkline — 5 vertical bars. Heights set
            via inline `height` so the bars are data-driven without
            generating a stylex class per row. */}
        <VStack gap={2}>
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
        </VStack>

        <Grid columns={2} gap={3}>
          <VStack gap={0}>
            <span {...stylex.props(styles.kpiValue)}>18K</span>
            <Text type="supporting" color="secondary">
              Monthly revenue
            </Text>
          </VStack>
          <VStack gap={0}>
            <span {...stylex.props(styles.kpiValue)}>+12%</span>
            <Text type="supporting" color="secondary">
              Order growth
            </Text>
          </VStack>
        </Grid>

        <Divider variant="subtle" />

        <HStack hAlign="between" vAlign="center">
          <Heading level={3}>Activity</Heading>
          <Link href="#">See all</Link>
        </HStack>

        <VStack gap={1} xstyle={styles.activityListFade}>
          {ACTIVITY.map(item => (
            <Item
              key={item.id}
              startContent={
                <div {...stylex.props(styles.activityIcon)} aria-hidden="true">
                  {item.icon}
                </div>
              }
              label={item.label}
              description={item.detail}
              endContent={
                <Text
                  type="body"
                  weight="bold"
                  color={item.amount < 0 ? 'secondary' : 'primary'}>
                  {formatAmount(item.amount)}
                </Text>
              }
              href="#"
            />
          ))}
        </VStack>
      </VStack>
    </Card>
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
// Components exercised: Heading, Button (primary + ghost),
// TextInput (with start icon), CheckboxInput, Table (custom
// renderers + proportional widths + dividers + hover), Badge
// (categorical variants), MoreMenu, Card, Divider, Icon
// (via lucide-react).
// =============================================================================

type TagSpec = {label: string; variant: 'blue' | 'green' | 'orange' | 'yellow'};

// `extends Record<string, unknown>` is load-bearing: Table's
// generic constraint requires it, and Next.js's production build
// enforces it strictly (dev builds let it slide). Without it the
// Vercel preview fails to compile at `<Table<InventoryRow>>`
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
    <CheckboxInput
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
    <HStack gap={3} vAlign="center">
      {thumbnailSrc ? (
        <img src={thumbnailSrc} alt="" {...stylex.props(styles.thumbnail)} />
      ) : (
        <div {...stylex.props(styles.thumbnailFallback)} aria-hidden="true">
          {row.thumbnailFallback}
        </div>
      )}
      <VStack gap={0} style={{minWidth: 0}}>
        <Text type="body" weight="bold">
          {row.name}
        </Text>
        <Text type="supporting" color="secondary">
          {row.meta}
        </Text>
      </VStack>
    </HStack>
  );
}

function TagsCell({row}: {row: InventoryRow}) {
  return (
    <HStack gap={1} wrap="wrap" hAlign="end">
      {row.tags.map(tag => (
        <Badge key={tag.label} label={tag.label} variant={tag.variant} />
      ))}
    </HStack>
  );
}

function ActionsCell() {
  return (
    <MoreMenu
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
    <Card padding={0} xstyle={styles.inventoryCard}>
      {/* Heading + primary action */}
      <HStack
        hAlign="between"
        vAlign="center"
        xstyle={styles.inventoryHeader}>
        <Heading level={2}>Inventory</Heading>
        <Button
          label="Add item"
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
        />
      </HStack>

      <Divider variant="subtle" />

      {/* Filter row — search, filter pills, view toggle */}
      <HStack
        gap={3}
        vAlign="center"
        hAlign="between"
        xstyle={styles.inventoryFilterRow}>
        <HStack gap={2} vAlign="center" style={{flex: 1, minWidth: 0}}>
          <TextInput
            label="Search inventory"
            isLabelHidden
            placeholder="Type and hit enter…"
            value=""
            onChange={() => {}}
            startIcon={<Search size={16} />}
            xstyle={styles.searchInput}
          />
          <Selector
            label="Categories"
            isLabelHidden
            placeholder="Categories"
            size="sm"
            startIcon={<Folder size={16} />}
            value={undefined}
            onChange={() => {}}
            options={['Wearables', 'Audio', 'Bags', 'Drinkware', 'Home']}
          />
          <Selector
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
          <Selector
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
        </HStack>
        <HStack gap={1} vAlign="center">
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            label="List view"
            tooltip="List view"
            icon={<List size={18} />}
          />
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            label="Grid view"
            tooltip="Grid view"
            icon={<LayoutGrid size={18} />}
          />
        </HStack>
      </HStack>

      {/* Low-stock warning — surfaces a contextual Banner above
          the table when any inventory rows fall below LOW_STOCK_
          THRESHOLD. Wrapped in inventoryBannerWrap so the banner
          inherits the table's horizontal padding. */}
      {LOW_STOCK_COUNT > 0 && (
        <div {...stylex.props(styles.inventoryBannerWrap)}>
          <Banner
            status="warning"
            title={`${LOW_STOCK_COUNT} items are running low`}
          />
        </div>
      )}

      <Table<InventoryRow>
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
            renderCell: row => <Text type="body">{row.available}</Text>,
          },
          {
            key: 'location',
            header: 'Location',
            width: pixel(100),
            renderCell: row => <Text type="body">{row.location}</Text>,
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
    </Card>
  );
}
