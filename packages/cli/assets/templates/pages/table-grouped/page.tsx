// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Four kinds of financial account on one page, each in a collapsible Card with
 * a table of its own — because a credit card and a checking account do not
 * share a column grid.
 *
 * This is the grouping shape for heterogeneous records. `useTableGroupedRows`
 * is the right tool when every group is the same kind of thing and grouping is
 * just a sort you can collapse: issues by status, orders by month, rows by
 * owner. One table, one header, section rows in between. It is the wrong tool
 * the moment the groups stop agreeing on what the columns mean. Utilization is
 * a credit-card idea, next payout is a processor idea, and cost basis is an
 * investment idea; forcing all three into one grid produces a table that is
 * mostly em-dashes, with a header row that is true of no row beneath it.
 *
 * So each group owns a table. The Card supplies the boundary the shared header
 * row used to supply, and the Collapsible trigger carries the group's name,
 * count, and running total, so a collapsed group still answers the question
 * most people came for.
 *
 * ## Extending this template
 *
 * **The test for splitting is column divergence, not group count.** Two groups
 * with different columns belong in separate tables; twelve groups with
 * identical columns belong in one table with the plugin. If you find yourself
 * adding a column that only applies to some groups and writing a fallback dash
 * for the rest, that is the signal to split. Conversely, if these four tables
 * ever converge on the same columns, collapse them back — this layout costs a
 * Card and a header per group, and that is only worth paying for real
 * structural difference.
 *
 * **Each table is data-driven, and that is the payoff.** Because the groups are
 * separate tables, every one of them can use `data` + `columns` with
 * `renderCell`, which is the RSC-friendly path and the one that gets headers,
 * widths, and plugins for free. The single-table version of this page has to
 * drop to children mode to emit section rows, and loses all of that.
 *
 * **The trigger is a button, so it holds no buttons.** Group name, count, and
 * total are text and icons only. Per-account actions live in the rows, and
 * anything that acts on a whole group belongs in the page header rather than
 * inside the trigger — nesting a control inside the trigger makes the click
 * target ambiguous and is invalid HTML besides.
 *
 * **Open state is controlled, not `defaultIsOpen`.** The page owns a Set of
 * open group ids, which is what lets Expand all / Collapse all work and what
 * you would persist per user. Uncontrolled Collapsibles are fine for a static
 * FAQ; they cannot participate in a page-level control.
 *
 * **Money is stored in cents.** Every amount is an integer and only the display
 * step formats, so group totals and the header's net position stay exact. Net
 * position deliberately subtracts card balances — it is a derived figure, never
 * a stored one, so adding an account updates it with no other edit.
 *
 * **Sync state is the one piece of shared vocabulary.** All four record types
 * carry the same `syncState`, rendered by the same StatusDot, because "is this
 * connection healthy" is the one question that means the same thing across
 * every group. Where groups genuinely agree, share the component.
 */

import {useMemo, useState} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  PlusIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline';

// ============= SHARED VOCABULARY =============

/** The one attribute every account type genuinely shares. */
type SyncState = 'connected' | 'syncing' | 'reconnect';

const SYNC_VARIANT: Record<SyncState, 'success' | 'accent' | 'warning'> = {
  connected: 'success',
  syncing: 'accent',
  reconnect: 'warning',
};

const SYNC_LABEL: Record<SyncState, string> = {
  connected: 'Connected',
  syncing: 'Syncing',
  reconnect: 'Action needed',
};

// Pinned locale keeps the rendered output identical in every environment.
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function money(cents: number): string {
  return currency.format(cents / 100);
}

function sum<T>(rows: T[], pick: (row: T) => number): number {
  return rows.reduce((total, row) => total + pick(row), 0);
}

/** Right-aligned tabular figure — every numeric cell on the page uses this. */
function Figure({children}: {children: string}) {
  return (
    <Text display="block" justify="end" hasTabularNumbers>
      {children}
    </Text>
  );
}

// StatusDot's label is for assistive tech only, so the visible wording is a
// sibling Text rather than a second label on the dot.
function SyncCell({state}: {state: SyncState}) {
  return (
    <HStack gap={2} vAlign="center">
      <StatusDot variant={SYNC_VARIANT[state]} label={SYNC_LABEL[state]} />
      <Text color="secondary">{SYNC_LABEL[state]}</Text>
    </HStack>
  );
}

/** Secondary right-aligned figure — used for the de-emphasised comparison
 * column that sits beside each group's headline number. */
function MutedFigure({children}: {children: string}) {
  return (
    <Text display="block" justify="end" hasTabularNumbers color="secondary">
      {children}
    </Text>
  );
}

// ============= GROUP 1 — BANK ACCOUNTS =============

interface BankAccount extends Record<string, unknown> {
  id: string;
  name: string;
  institution: string;
  mask: string;
  kind: 'Checking' | 'Savings' | 'Money market';
  availableCents: number;
  lastSynced: string;
  syncState: SyncState;
}

const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-1',
    name: 'Operating',
    institution: 'First Meridian Bank',
    mask: '••4417',
    kind: 'Checking',
    availableCents: 84_215_600,
    lastSynced: 'Today, 6:02 AM',
    syncState: 'connected',
  },
  {
    id: 'bank-2',
    name: 'Payroll',
    institution: 'First Meridian Bank',
    mask: '••8830',
    kind: 'Checking',
    availableCents: 21_940_800,
    lastSynced: 'Today, 6:02 AM',
    syncState: 'connected',
  },
  {
    id: 'bank-3',
    name: 'Tax reserve',
    institution: 'Harborline Credit Union',
    mask: '••1265',
    kind: 'Savings',
    availableCents: 47_500_000,
    lastSynced: 'Today, 5:48 AM',
    syncState: 'connected',
  },
  {
    id: 'bank-4',
    name: 'Treasury sweep',
    institution: 'Northgate Financial',
    mask: '••7702',
    kind: 'Money market',
    availableCents: 132_800_000,
    lastSynced: 'Mar 28, 9:14 PM',
    syncState: 'reconnect',
  },
];

const bankColumns: TableColumn<BankAccount>[] = [
  {
    key: 'name',
    header: 'Account',
    width: proportional(2),
    renderCell: account => (
      <VStack gap={0}>
        <Text>{account.name}</Text>
        <Text type="supporting">
          {account.institution} · {account.mask}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'kind',
    header: 'Type',
    width: pixel(140),
    renderCell: account => <Text color="secondary">{account.kind}</Text>,
  },
  {
    key: 'available',
    header: 'Available',
    width: pixel(150),
    renderCell: account => <Figure>{money(account.availableCents)}</Figure>,
  },
  {
    key: 'lastSynced',
    header: 'Last synced',
    width: pixel(160),
    renderCell: account => <Text color="secondary">{account.lastSynced}</Text>,
  },
  {
    key: 'syncState',
    header: 'Status',
    width: pixel(180),
    renderCell: account => <SyncCell state={account.syncState} />,
  },
];

// ============= GROUP 2 — CREDIT CARDS =============

interface CreditCardAccount extends Record<string, unknown> {
  id: string;
  name: string;
  issuer: string;
  mask: string;
  balanceCents: number;
  limitCents: number;
  statementDue: string;
  syncState: SyncState;
}

const CREDIT_CARDS: CreditCardAccount[] = [
  {
    id: 'card-1',
    name: 'Corporate — Engineering',
    issuer: 'Meridian Business Card',
    mask: '••2041',
    balanceCents: 4_182_300,
    limitCents: 15_000_000,
    statementDue: 'Apr 12',
    syncState: 'connected',
  },
  {
    id: 'card-2',
    name: 'Corporate — Travel',
    issuer: 'Meridian Business Card',
    mask: '••6688',
    balanceCents: 9_640_500,
    limitCents: 12_000_000,
    statementDue: 'Apr 12',
    syncState: 'connected',
  },
  {
    id: 'card-3',
    name: 'Vendor payments',
    issuer: 'Northgate Commercial',
    mask: '••3319',
    balanceCents: 1_205_000,
    limitCents: 25_000_000,
    statementDue: 'Apr 20',
    syncState: 'syncing',
  },
];

/** Credit utilization reads inversely: a full bar is the bad outcome. */
function utilizationVariant(pct: number): 'success' | 'warning' | 'error' {
  if (pct >= 70) {
    return 'error';
  }
  if (pct >= 30) {
    return 'warning';
  }
  return 'success';
}

const creditCardColumns: TableColumn<CreditCardAccount>[] = [
  {
    key: 'name',
    header: 'Card',
    width: proportional(2),
    renderCell: card => (
      <VStack gap={0}>
        <Text>{card.name}</Text>
        <Text type="supporting">
          {card.issuer} · {card.mask}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'balance',
    header: 'Balance',
    width: pixel(140),
    renderCell: card => <Figure>{money(card.balanceCents)}</Figure>,
  },
  {
    key: 'limit',
    header: 'Limit',
    width: pixel(140),
    renderCell: card => <MutedFigure>{money(card.limitCents)}</MutedFigure>,
  },
  {
    key: 'utilization',
    header: 'Utilization',
    width: pixel(190),
    renderCell: card => {
      const pct = Math.round((card.balanceCents / card.limitCents) * 100);
      return (
        <ProgressBar
          label={`${card.name} utilization`}
          isLabelHidden
          hasValueLabel
          value={pct}
          variant={utilizationVariant(pct)}
        />
      );
    },
  },
  {
    key: 'statementDue',
    header: 'Statement due',
    width: pixel(140),
    renderCell: card => <Text color="secondary">{card.statementDue}</Text>,
  },
  {
    key: 'syncState',
    header: 'Status',
    width: pixel(150),
    renderCell: card => <SyncCell state={card.syncState} />,
  },
];

// ============= GROUP 3 — PAYMENT PROCESSORS =============

interface ProcessorAccount extends Record<string, unknown> {
  id: string;
  name: string;
  merchantId: string;
  pendingPayoutCents: number;
  feesMtdCents: number;
  nextPayout: string;
  syncState: SyncState;
}

const PROCESSORS: ProcessorAccount[] = [
  {
    id: 'proc-1',
    name: 'Stripe',
    merchantId: 'acct_1Qf82LmR',
    pendingPayoutCents: 18_442_900,
    feesMtdCents: 612_400,
    nextPayout: 'Apr 2',
    syncState: 'connected',
  },
  {
    id: 'proc-2',
    name: 'PayPal Commerce',
    merchantId: 'MRC-88214-XT',
    pendingPayoutCents: 3_218_650,
    feesMtdCents: 148_900,
    nextPayout: 'Apr 3',
    syncState: 'connected',
  },
  {
    id: 'proc-3',
    name: 'Adyen',
    merchantId: 'AD-NORTHWIND-01',
    pendingPayoutCents: 7_905_100,
    feesMtdCents: 233_050,
    nextPayout: 'Apr 5',
    syncState: 'syncing',
  },
];

const processorColumns: TableColumn<ProcessorAccount>[] = [
  {
    key: 'name',
    header: 'Processor',
    width: proportional(2),
    renderCell: processor => (
      <VStack gap={0}>
        <Text>{processor.name}</Text>
        <Text type="supporting">{processor.merchantId}</Text>
      </VStack>
    ),
  },
  {
    key: 'pendingPayout',
    header: 'Pending payout',
    width: pixel(160),
    renderCell: processor => (
      <Figure>{money(processor.pendingPayoutCents)}</Figure>
    ),
  },
  {
    key: 'feesMtd',
    header: 'Fees (MTD)',
    width: pixel(150),
    renderCell: processor => (
      <MutedFigure>{money(processor.feesMtdCents)}</MutedFigure>
    ),
  },
  {
    key: 'nextPayout',
    header: 'Next payout',
    width: pixel(140),
    renderCell: processor => (
      <Text color="secondary">{processor.nextPayout}</Text>
    ),
  },
  {
    key: 'syncState',
    header: 'Status',
    width: pixel(150),
    renderCell: processor => <SyncCell state={processor.syncState} />,
  },
];

// ============= GROUP 4 — INVESTMENT ACCOUNTS =============

interface InvestmentAccount extends Record<string, unknown> {
  id: string;
  name: string;
  custodian: string;
  marketValueCents: number;
  costBasisCents: number;
  dayChangeCents: number;
  syncState: SyncState;
}

const INVESTMENTS: InvestmentAccount[] = [
  {
    id: 'inv-1',
    name: 'Short-duration treasuries',
    custodian: 'Northgate Asset Management',
    marketValueCents: 245_180_000,
    costBasisCents: 240_000_000,
    dayChangeCents: 184_200,
    syncState: 'connected',
  },
  {
    id: 'inv-2',
    name: 'Corporate bond ladder',
    custodian: 'Northgate Asset Management',
    marketValueCents: 98_420_000,
    costBasisCents: 100_000_000,
    dayChangeCents: -62_800,
    syncState: 'connected',
  },
  {
    id: 'inv-3',
    name: 'Money market fund',
    custodian: 'Harborline Capital',
    marketValueCents: 61_050_000,
    costBasisCents: 61_000_000,
    dayChangeCents: 8_400,
    syncState: 'connected',
  },
];

const investmentColumns: TableColumn<InvestmentAccount>[] = [
  {
    key: 'name',
    header: 'Account',
    width: proportional(2),
    renderCell: account => (
      <VStack gap={0}>
        <Text>{account.name}</Text>
        <Text type="supporting">{account.custodian}</Text>
      </VStack>
    ),
  },
  {
    key: 'marketValue',
    header: 'Market value',
    width: pixel(160),
    renderCell: account => <Figure>{money(account.marketValueCents)}</Figure>,
  },
  {
    key: 'costBasis',
    header: 'Cost basis',
    width: pixel(150),
    renderCell: account => (
      <MutedFigure>{money(account.costBasisCents)}</MutedFigure>
    ),
  },
  {
    key: 'dayChange',
    header: 'Day change',
    width: pixel(150),
    renderCell: account => {
      const isUp = account.dayChangeCents >= 0;
      return (
        <HStack hAlign="end">
          <Token
            size="sm"
            color={isUp ? 'green' : 'red'}
            label={`${isUp ? '+' : '−'}${money(Math.abs(account.dayChangeCents))}`}
          />
        </HStack>
      );
    },
  },
  {
    key: 'syncState',
    header: 'Status',
    width: pixel(150),
    renderCell: account => <SyncCell state={account.syncState} />,
  },
];

// ============= GROUP SHELL =============

const GROUP_IDS = ['bank', 'cards', 'processors', 'investments'] as const;
type GroupId = (typeof GROUP_IDS)[number];

function AccountGroup({
  icon,
  title,
  count,
  summaryLabel,
  summaryValue,
  isOpen,
  onOpenChange,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  count: number;
  summaryLabel: string;
  summaryValue: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Card padding={0}>
      <Collapsible
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        // Collapsible wraps trigger content in a shrink-to-fit span, so a flex
        // spacer cannot push the summary to the right edge. Fixed widths on the
        // title and label blocks line the four group totals up as a column
        // instead, which is the part that matters when every group is closed.
        trigger={
          <HStack gap={4} vAlign="center">
            <HStack gap={2} vAlign="center" width={240}>
              <Icon icon={icon} size="sm" color="secondary" />
              <Text weight="semibold">{title}</Text>
              <Badge variant="neutral" label={String(count)} />
            </HStack>
            <HStack width={128}>
              <Text type="supporting">{summaryLabel}</Text>
            </HStack>
            <Text weight="semibold" hasTabularNumbers>
              {summaryValue}
            </Text>
          </HStack>
        }>
        {children}
      </Collapsible>
    </Card>
  );
}

// ============= PAGE =============

export default function ConnectedAccountsTemplate() {
  const [openGroups, setOpenGroups] = useState<Set<GroupId>>(
    () => new Set(GROUP_IDS),
  );

  const toggleGroup = (id: GroupId) => (open: boolean) => {
    setOpenGroups(previous => {
      const next = new Set(previous);
      if (open) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const totals = useMemo(() => {
    const banks = sum(BANK_ACCOUNTS, account => account.availableCents);
    const cards = sum(CREDIT_CARDS, card => card.balanceCents);
    const pending = sum(PROCESSORS, p => p.pendingPayoutCents);
    const investments = sum(INVESTMENTS, i => i.marketValueCents);
    return {
      banks,
      cards,
      pending,
      investments,
      // Outstanding card balances are a liability, so they come off the top.
      net: banks + pending + investments - cards,
    };
  }, []);

  const needsAttention = [
    ...BANK_ACCOUNTS,
    ...CREDIT_CARDS,
    ...PROCESSORS,
    ...INVESTMENTS,
  ].filter(account => account.syncState === 'reconnect').length;

  const areAllOpen = openGroups.size === GROUP_IDS.length;

  return (
    <Layout
      height="fill"
      contentWidth={1200}
      header={
        <LayoutHeader hasDivider padding={4}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={0.5}>
                <Heading level={1}>Connected accounts</Heading>
                <HStack gap={2} vAlign="center">
                  <Text type="supporting">
                    Net position {money(totals.net)} across 13 accounts
                  </Text>
                  {needsAttention > 0 && (
                    <StatusDot
                      variant="warning"
                      label={`${needsAttention} account needs reconnecting`}
                    />
                  )}
                </HStack>
              </VStack>
            </StackItem>
            <Button
              label={areAllOpen ? 'Collapse all' : 'Expand all'}
              variant="ghost"
              onClick={() =>
                setOpenGroups(areAllOpen ? new Set() : new Set(GROUP_IDS))
              }
            />
            <Button
              label="Sync now"
              variant="secondary"
              icon={<Icon icon={ArrowPathIcon} size="sm" />}
            />
            <Button
              label="Connect account"
              variant="primary"
              icon={<Icon icon={PlusIcon} size="sm" />}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={4}>
          <VStack gap={4}>
            <AccountGroup
              icon={BuildingLibraryIcon}
              title="Bank accounts"
              count={BANK_ACCOUNTS.length}
              summaryLabel="Available"
              summaryValue={money(totals.banks)}
              isOpen={openGroups.has('bank')}
              onOpenChange={toggleGroup('bank')}>
              <Table<BankAccount>
                data={BANK_ACCOUNTS}
                columns={bankColumns}
                idKey="id"
                density="compact"
                dividers="rows"
                textOverflow="truncate"
                hasHover
              />
            </AccountGroup>

            <AccountGroup
              icon={CreditCardIcon}
              title="Credit cards"
              count={CREDIT_CARDS.length}
              summaryLabel="Outstanding"
              summaryValue={money(totals.cards)}
              isOpen={openGroups.has('cards')}
              onOpenChange={toggleGroup('cards')}>
              <Table<CreditCardAccount>
                data={CREDIT_CARDS}
                columns={creditCardColumns}
                idKey="id"
                density="compact"
                dividers="rows"
                textOverflow="truncate"
                hasHover
              />
            </AccountGroup>

            <AccountGroup
              icon={ArrowsRightLeftIcon}
              title="Payment processors"
              count={PROCESSORS.length}
              summaryLabel="Pending payout"
              summaryValue={money(totals.pending)}
              isOpen={openGroups.has('processors')}
              onOpenChange={toggleGroup('processors')}>
              <Table<ProcessorAccount>
                data={PROCESSORS}
                columns={processorColumns}
                idKey="id"
                density="compact"
                dividers="rows"
                textOverflow="truncate"
                hasHover
              />
            </AccountGroup>

            <AccountGroup
              icon={PresentationChartLineIcon}
              title="Investment accounts"
              count={INVESTMENTS.length}
              summaryLabel="Market value"
              summaryValue={money(totals.investments)}
              isOpen={openGroups.has('investments')}
              onOpenChange={toggleGroup('investments')}>
              <Table<InvestmentAccount>
                data={INVESTMENTS}
                columns={investmentColumns}
                idKey="id"
                density="compact"
                dividers="rows"
                textOverflow="truncate"
                hasHover
              />
            </AccountGroup>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
