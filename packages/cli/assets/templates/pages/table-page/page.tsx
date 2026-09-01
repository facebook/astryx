// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * An invoice you can interrogate: the document's own facts up top, a sortable
 * and filterable table of line items, and totals that stay glued to the
 * columns above them.
 *
 * The reader here does two things — find a line, and check what it cost. Sorting
 * by amount answers "what is driving this bill?" and the column filters answer
 * "show me only the design work", without either question needing a new screen.
 * `table-grouped` is the version for heterogeneous records and `table-inbox` the
 * version for triage; this is the one for a single uniform list.
 *
 * ## Extending this template
 *
 * **Plugins mean data mode, and data mode has no footer.** `BaseTable` renders
 * `children ? children : (header + body)`, so composing rows by hand — the only
 * way to reach `TableFooter` — bypasses the plugin pipeline entirely. Sorting
 * and column filters are render plugins, so they need `data` + `columns`. The
 * totals therefore live in a **second table** that shares the same `columns`,
 * and so the same `colgroup`, which is what keeps the figures in the same
 * vertical line as the Amount column above. It costs one extra `<table>` in the
 * accessibility tree, which is why the pair is wrapped in a labelled group.
 *
 * This alignment holds only because every column declares an explicit width.
 * `useTableFiltering` rewrites a column to `proportional(1)` when it has a
 * filter *and no width* — leave one width off and the two tables drift apart.
 *
 * **Sort keys default to the column key, so derived columns need comparators.**
 * `unitPrice` and `amount` are not fields on the row — the money lives in
 * `unitPriceCents` and `amountCents` — and the hook's fallback stringifies the
 * value it finds, which for a missing key means sorting a column of
 * `undefined`. Every numeric column here passes an explicit comparator, and
 * they subtract integers rather than comparing formatted strings, so `$1,240.00`
 * never sorts below `$980.00`.
 *
 * **Two filtering surfaces, one predicate.** PowerSearch owns the free-form
 * query and `useTableFiltering` owns the per-column popovers, but both produce
 * `PowerSearchFilter`s against the same `SEARCH_FIELDS`, so they are
 * concatenated and run through a single `applyFilters`. `toSearchFilters` is
 * the adapter that turns column filter state into that shape. Filtering the
 * data twice — once per surface — is the version that eventually disagrees with
 * itself.
 *
 * The popover variant is deliberate. `inline` puts a control row under every
 * header, which on a five-column invoice competes with the PowerSearch directly
 * above it; the popover keeps the filter available and the header quiet. Switch
 * to `inline` when the table is the only thing on the page.
 *
 * **A plugin is just an object of transforms.** `useFlushEdges` below is a
 * complete plugin in a dozen lines — no factory, no registration. It exists
 * because cancelling the container bleed only gets the *stripe* to the content
 * line: cell padding resolves to `max(var(--container-padding-inline-start),
 * spacing-2)`, so zeroing the variable still floors at 8px and the text sits
 * indented. In children mode an inline `style` on the outer cells fixes that;
 * in data mode a `transformBodyCell` is the equivalent. Reach for this whenever
 * you need per-cell chrome that columns cannot express.
 *
 * **Zebra striping replaces the row hairline, rather than joining it.** The
 * table runs `dividers="none"` with `isStriped`, so the eye tracks a row by its
 * background rather than by the line under it. Both at once double-encodes the
 * same boundary, which is the usual reason a plain table starts to read as
 * busy. The cost is that a striped table can never be visually quiet — on a
 * page where the table is one widget among several, invert this: keep
 * `dividers="rows"` and drop the stripe.
 *
 * The stripe's corners are square and cannot be rounded from here. The band is
 * painted on the `<tr>`, and `BaseTable` sets `border-collapse: collapse`,
 * under which browsers ignore `border-radius` on rows and cells alike.
 *
 * **The one rule on the page sits above the total.** With `dividers="none"`
 * there is no hairline anywhere, which is what makes a single `borderBlockStart`
 * read as punctuation rather than as one more line in a grid. Add a second rule
 * elsewhere and this one stops meaning anything.
 *
 * **Document facts belong above the table, not inside it.** Client, project,
 * and terms are true of the whole invoice, so they render as a `MetadataList`
 * rather than as columns repeating the same value nineteen times. The test is
 * whether the value varies per row; if it does not, it is a header fact.
 *
 * **Width is capped on the Layout, not on the table.** `contentWidth` bounds
 * every slot and leaves dividers full-bleed, so the header rule still spans the
 * window while the invoice sits in a readable column. Wrapping the table in a
 * centered box instead would pull the header rule in with it.
 *
 * **The totals are derived from the rows on screen.** `visible` feeds the body,
 * the count caption, and every figure below it, so filtering to Design really
 * does retotal the invoice. The failure mode this avoids is a hardcoded total
 * that silently disagrees with the rows above it.
 *
 * **Money is stored in cents and formatted once.** Only the display step goes
 * through `Intl.NumberFormat`, at a pinned locale. Float dollars accumulate
 * rounding drift across nineteen lines and the total is exactly where it shows
 * up. Swap the formatter for the viewer's locale in a real app; keep the
 * integers.
 */

import {useEffect, useMemo, useRef, useState} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {useHoverCard} from '@astryxdesign/core/HoverCard';
import {Icon} from '@astryxdesign/core/Icon';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  PowerSearch,
  usePowerSearchConfig,
} from '@astryxdesign/core/PowerSearch';
import type {PowerSearchFilter} from '@astryxdesign/core/PowerSearch';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  pixel,
  proportional,
  resolveColumnWidths,
  toSearchFilters,
  useTableFilterState,
  useTableFiltering,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import type {
  TableColumn,
  TablePlugin,
  TableSortComparator,
} from '@astryxdesign/core/Table';
import {ArrowDownTrayIcon} from '@heroicons/react/24/outline';

// ============= DATA =============

type LineCategory = 'design' | 'development' | 'content' | 'project';

/**
 * How the line is priced. Hourly lines vary with the time booked against them
 * and are the ones a client queries; fixed-fee lines were agreed up front.
 */
type BillingBasis = 'hourly' | 'fixed';

interface LineItem extends Record<string, unknown> {
  id: string;
  description: string;
  category: LineCategory;
  basis: BillingBasis;
  /** Hours booked on an hourly line, or units delivered on a fixed-fee one. */
  quantity: number;
  /** Integer cents. Dollars are a formatting concern, never a stored one. */
  unitPriceCents: number;
}

/** A line with its extended amount precomputed, so `amount` is sortable. */
interface InvoiceRow extends LineItem {
  amountCents: number;
}

const CATEGORY_LABEL: Record<LineCategory, string> = {
  design: 'Design',
  development: 'Development',
  content: 'Content',
  project: 'Project management',
};

const LINE_ITEMS: LineItem[] = [
  {
    id: 'li-01',
    description: 'Discovery workshop',
    category: 'design',
    basis: 'fixed',
    quantity: 1,
    unitPriceCents: 240_000,
  },
  {
    id: 'li-02',
    description: 'Stakeholder interviews',
    category: 'design',
    basis: 'hourly',
    quantity: 12,
    unitPriceCents: 14_500,
  },
  {
    id: 'li-03',
    description: 'User research synthesis',
    category: 'design',
    basis: 'hourly',
    quantity: 18,
    unitPriceCents: 14_500,
  },
  {
    id: 'li-04',
    description: 'Wireframes — key templates',
    category: 'design',
    basis: 'hourly',
    quantity: 34,
    unitPriceCents: 14_500,
  },
  {
    id: 'li-05',
    description: 'Visual design system',
    category: 'design',
    basis: 'fixed',
    quantity: 1,
    unitPriceCents: 680_000,
  },
  {
    id: 'li-06',
    description: 'Page designs — 14 templates',
    category: 'design',
    basis: 'hourly',
    quantity: 62,
    unitPriceCents: 14_500,
  },
  {
    id: 'li-07',
    description: 'Prototype & usability testing',
    category: 'design',
    basis: 'hourly',
    quantity: 22,
    unitPriceCents: 14_500,
  },
  {
    id: 'li-08',
    description: 'Frontend build — component library',
    category: 'development',
    basis: 'hourly',
    quantity: 88,
    unitPriceCents: 16_500,
  },
  {
    id: 'li-09',
    description: 'Frontend build — page templates',
    category: 'development',
    basis: 'hourly',
    quantity: 104,
    unitPriceCents: 16_500,
  },
  {
    id: 'li-10',
    description: 'CMS setup & content modelling',
    category: 'development',
    basis: 'hourly',
    quantity: 40,
    unitPriceCents: 16_500,
  },
  {
    id: 'li-11',
    description: 'Search & filtering integration',
    category: 'development',
    basis: 'hourly',
    quantity: 26,
    unitPriceCents: 16_500,
  },
  {
    id: 'li-12',
    description: 'Analytics & tag manager setup',
    category: 'development',
    basis: 'hourly',
    quantity: 10,
    unitPriceCents: 16_500,
  },
  {
    id: 'li-13',
    description: 'Accessibility audit & remediation',
    category: 'development',
    basis: 'fixed',
    quantity: 1,
    unitPriceCents: 320_000,
  },
  {
    id: 'li-14',
    description: 'Cross-browser QA',
    category: 'development',
    basis: 'hourly',
    quantity: 24,
    unitPriceCents: 13_500,
  },
  {
    id: 'li-15',
    description: 'Copywriting — 14 pages',
    category: 'content',
    basis: 'hourly',
    quantity: 36,
    unitPriceCents: 12_500,
  },
  {
    id: 'li-16',
    description: 'Content migration',
    category: 'content',
    basis: 'hourly',
    quantity: 28,
    unitPriceCents: 9_500,
  },
  {
    id: 'li-17',
    description: 'Stock photography licences',
    category: 'content',
    basis: 'fixed',
    quantity: 24,
    unitPriceCents: 1_800,
  },
  {
    id: 'li-18',
    description: 'Project management — 12 weeks',
    category: 'project',
    basis: 'fixed',
    quantity: 12,
    unitPriceCents: 85_000,
  },
  {
    id: 'li-19',
    description: 'Training & handover session',
    category: 'project',
    basis: 'fixed',
    quantity: 2,
    unitPriceCents: 120_000,
  },
];

/** Extended amounts are precomputed so the Amount column has a value to sort. */
const ROWS: InvoiceRow[] = LINE_ITEMS.map(item => ({
  ...item,
  amountCents: item.quantity * item.unitPriceCents,
}));

/** Invoice-wide, so a line's share does not move when the view is filtered. */
const INVOICE_SUBTOTAL_CENTS = ROWS.reduce(
  (sum, item) => sum + item.amountCents,
  0,
);

/**
 * The segmented control answers one question — "which lines are time-based?" —
 * and leaves every other cut to the search and the column filters. Two segments
 * is the ceiling for a control that sits in front of a query builder.
 */
const BASIS_FILTERS: {value: BillingBasis | 'all'; label: string}[] = [
  {value: 'all', label: 'All lines'},
  {value: 'hourly', label: 'Hourly'},
];

/**
 * One set of field definitions feeds both filtering surfaces: PowerSearch
 * renders its query builder from them, and the column filter popovers resolve
 * their controls through the same config.
 */
const SEARCH_FIELDS = [
  {key: 'description', type: 'string', label: 'Description'},
  {
    key: 'category',
    type: 'enum',
    label: 'Category',
    enumValues: [
      {value: 'design', label: 'Design'},
      {value: 'development', label: 'Development'},
      {value: 'content', label: 'Content'},
      {value: 'project', label: 'Project management'},
    ],
  },
  {key: 'quantity', type: 'number', label: 'Quantity'},
] as const;

const TAX_RATE = 0.0875;

/** Static invoice facts. Rendered as a MetadataList, not as table columns —
 * they describe the whole document, so repeating them per row would be noise. */
const INVOICE_DETAILS: {label: string; value: string}[] = [
  {label: 'Billed to', value: 'Brightwater Coffee Co.'},
  {label: 'Project', value: 'Website redesign'},
  {label: 'Issue date', value: 'Mar 31, 2026'},
  {label: 'Due date', value: 'Apr 30, 2026'},
  {label: 'Payment terms', value: 'Net 30'},
  {label: 'Purchase order', value: 'PO-4471'},
];

// ============= FORMATTING =============

// Pinned locale so the rendered output is identical in every environment.
// A real app resolves this from the viewer instead.
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
const decimal = new Intl.NumberFormat('en-US');

function formatCents(cents: number): string {
  return currency.format(cents / 100);
}

/** Right-aligned tabular figure. The column's `align` handles the cell; this
 * keeps the digits themselves on a grid so decimal points line up. */
function Figure({
  children,
  weight,
}: {
  children: string;
  weight?: 'normal' | 'semibold';
}) {
  return (
    <Text hasTabularNumbers weight={weight}>
      {children}
    </Text>
  );
}

// ============= ROW DETAIL =============

/**
 * One hover card per row, triggered by the whole row.
 *
 * Three constraints shape this. The `<HoverCard>` wrapper is unusable: it wraps
 * its trigger in a `display: contents` span, and a span between `<tr>` and
 * `<td>` is invalid markup. A column's `renderCell` is a plain function, so the
 * hook has to live in a per-row component like this one. And `Table` has no
 * `rowComponent` escape hatch, so there is no way to hand the row itself a hook.
 *
 * The way through is to let the hook keep its own uncontrolled hover/focus
 * handling and simply point it at the enclosing `<tr>`. Driving `isOpen` from
 * row-level mouse handlers instead — the obvious alternative — produces a card
 * that closes the moment the pointer leaves the row, which makes anything
 * interactive inside it unreachable. Uncontrolled, the hook keeps the card open
 * while the pointer is moving onto it, so the Dispute button is clickable.
 *
 * `tabIndex` and `aria-describedby` are set on the row in the same effect,
 * because the node is already in hand and neither can be expressed through a
 * column definition. That also makes the detail reachable without a pointer.
 */
function DescriptionCell({item}: {item: InvoiceRow}) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const hoverCard = useHoverCard({
    placement: 'below',
    alignment: 'start',
    label: `${item.description} details`,
  });

  const attach = hoverCard.ref;
  const cardId = hoverCard.id;
  useEffect(() => {
    const row = anchorRef.current?.closest('tr');
    if (row == null) {
      return;
    }
    attach(row);
    row.tabIndex = 0;
    row.setAttribute('aria-describedby', cardId);
    return () => {
      attach(null);
      row.removeAttribute('aria-describedby');
    };
  }, [attach, cardId]);

  const share = (item.amountCents / INVOICE_SUBTOTAL_CENTS) * 100;

  return (
    <>
      <Text maxLines={1}>
        <span ref={anchorRef}>{item.description}</span>
      </Text>
      {hoverCard.renderHoverCard(
        // No padding here — useHoverCard's content wrapper already applies
        // spacing-3 on all four sides. Adding it again doubles it to 24px.
        <VStack gap={3} width={280}>
          <Text weight="semibold">{item.description}</Text>
          <MetadataList label={{position: 'start'}}>
            <MetadataListItem label="Category">
              {CATEGORY_LABEL[item.category]}
            </MetadataListItem>
            <MetadataListItem label="Billing">
              {item.basis === 'hourly' ? 'Hourly' : 'Fixed fee'}
            </MetadataListItem>
            <MetadataListItem label="Calculation">
              {`${decimal.format(item.quantity)} \u00d7 ${formatCents(item.unitPriceCents)}`}
            </MetadataListItem>
            <MetadataListItem label="Amount">
              {formatCents(item.amountCents)}
            </MetadataListItem>
            <MetadataListItem label="Share of invoice">
              {`${share.toFixed(1)}%`}
            </MetadataListItem>
          </MetadataList>
          <Button label="Dispute this line" variant="secondary" width="100%" />
        </VStack>,
      )}
    </>
  );
}

// ============= COLUMNS =============

const columns: TableColumn<InvoiceRow>[] = [
  {
    key: 'description',
    header: 'Description',
    width: proportional(3),
    sortable: true,
    filter: 'description',
    renderCell: item => <DescriptionCell item={item} />,
  },
  {
    key: 'category',
    header: 'Category',
    width: pixel(160),
    sortable: true,
    filter: 'category',
    renderCell: item => (
      <Text color="secondary" maxLines={1}>
        {CATEGORY_LABEL[item.category]}
      </Text>
    ),
  },
  {
    key: 'quantity',
    header: 'Qty',
    width: pixel(80),
    align: 'end',
    sortable: true,
    filter: 'quantity',
    renderCell: item => <Figure>{decimal.format(item.quantity)}</Figure>,
  },
  {
    key: 'unitPrice',
    header: 'Rate',
    width: pixel(120),
    align: 'end',
    sortable: true,
    renderCell: item => <Figure>{formatCents(item.unitPriceCents)}</Figure>,
  },
  {
    key: 'amount',
    header: 'Amount',
    width: pixel(132),
    align: 'end',
    sortable: true,
    renderCell: item => <Figure>{formatCents(item.amountCents)}</Figure>,
  },
];

const COLUMN_WIDTHS = resolveColumnWidths(columns);

/**
 * Sort keys default to the column key. `unitPrice` and `amount` are display
 * names with no matching field, and the built-in fallback stringifies whatever
 * it finds — so every numeric column subtracts integers here instead.
 */
const COMPARATORS: Partial<Record<string, TableSortComparator<InvoiceRow>>> = {
  description: (a, b) => a.description.localeCompare(b.description),
  category: (a, b) =>
    CATEGORY_LABEL[a.category].localeCompare(CATEGORY_LABEL[b.category]),
  quantity: (a, b) => a.quantity - b.quantity,
  unitPrice: (a, b) => a.unitPriceCents - b.unitPriceCents,
  amount: (a, b) => a.amountCents - b.amountCents,
};

// ============= EDGE ALIGNMENT =============

/**
 * Table bleeds past its container by default: the scroll wrapper applies
 * negative inline margins equal to the container's padding, and the outer cells
 * add that padding back so text still lines up. That is right for a table that
 * owns its surface. Here the table shares a column with a MetadataList, so it
 * has to respect the same content line. Zeroing these cancels the bleed.
 */
type StyleWithVars = React.CSSProperties & Record<`--${string}`, string>;

const FLUSH_WRAPPER: StyleWithVars = {
  '--container-padding-inline-start': '0px',
  '--container-padding-inline-end': '0px',
};
const FLUSH_START: React.CSSProperties = {paddingInlineStart: 0};
const FLUSH_END: React.CSSProperties = {paddingInlineEnd: 0};

/** Inline padding override for a cell at either end of the row. */
function edgeStyle(
  index: number,
  total: number,
): React.CSSProperties | undefined {
  if (index === 0) {
    return FLUSH_START;
  }
  if (index === total - 1) {
    return FLUSH_END;
  }
  return undefined;
}

/**
 * Cancelling the bleed only moves the stripe; cell padding still resolves to
 * `max(var(--container-padding-inline-start), spacing-2)`, so the text keeps an
 * 8px indent. Children mode would fix that with an inline `style` on the outer
 * cells — this is the data-mode equivalent, and a demonstration that a plugin
 * is nothing more than an object of transforms.
 */
function useFlushEdges(): TablePlugin<InvoiceRow> {
  return useMemo(
    () => ({
      transformHeaderCell: (props, _column, columnIndex, cols) => {
        const style = edgeStyle(columnIndex, cols.length);
        return style == null
          ? props
          : {
              ...props,
              htmlProps: {
                ...props.htmlProps,
                style: {...props.htmlProps.style, ...style},
              },
            };
      },
      transformBodyCell: (props, _column, _item, columnIndex, cols) => {
        const style = edgeStyle(columnIndex, cols.length);
        return style == null
          ? props
          : {
              ...props,
              htmlProps: {
                ...props.htmlProps,
                style: {...props.htmlProps.style, ...style},
              },
            };
      },
    }),
    [],
  );
}

// Drawn per-cell because `dividers="none"` turns the divider system off. Three
// rules bracket the totals: one opening the block, one closing the arithmetic
// before the total, one under the amount owed. They are the only rules on the
// page, which is what lets them read as punctuation rather than as a grid.
const HAIRLINE = '1px solid var(--color-border, rgba(5, 54, 89, 0.1))';
const RULE_ABOVE: React.CSSProperties = {borderBlockStart: HAIRLINE};
const RULE_BOTH: React.CSSProperties = {
  borderBlockStart: HAIRLINE,
  borderBlockEnd: HAIRLINE,
};

// ============= PAGE =============

export default function InvoiceLineItemsTemplate() {
  const [queryFilters, setQueryFilters] = useState<PowerSearchFilter[]>([]);
  const [basis, setBasis] = useState<BillingBasis | 'all'>('all');

  // One config drives the query builder, the column popovers, and the predicate.
  const {config, applyFilters} = usePowerSearchConfig(SEARCH_FIELDS, 'Lines');
  const {
    filters: columnFilters,
    onFilterChange,
    clearAll,
  } = useTableFilterState();

  const filterPlugin = useTableFiltering<InvoiceRow>({
    filters: columnFilters,
    onFilterChange,
    searchConfig: config,
    variant: 'popover',
  });

  // Both surfaces produce PowerSearchFilters, so they concatenate into a single
  // pass. Filtering twice is what eventually disagrees with itself.
  const visible = useMemo(() => {
    const combined: PowerSearchFilter[] = [
      ...queryFilters,
      ...(toSearchFilters(
        columnFilters,
        columns,
        config,
      ) as PowerSearchFilter[]),
    ];
    const matched = applyFilters(combined, ROWS);
    return basis === 'all'
      ? matched
      : matched.filter(item => item.basis === basis);
  }, [applyFilters, queryFilters, columnFilters, config, basis]);

  const {sortedData, sortConfig} = useTableSortableState<InvoiceRow>({
    data: visible,
    comparators: COMPARATORS,
  });
  const sortPlugin = useTableSortable<InvoiceRow>(sortConfig);
  const flushPlugin = useFlushEdges();

  // Every figure below reads the same array the body does, so a filter retotals
  // the invoice instead of leaving a stale number under a shortened list.
  const subtotalCents = useMemo(
    () => visible.reduce((sum, item) => sum + item.amountCents, 0),
    [visible],
  );
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + taxCents;

  // Filter *presence*, not row count: a filter that happens to match every line
  // still means these totals are a view of the invoice rather than the invoice.
  const activeFilterCount =
    queryFilters.length +
    Object.keys(columnFilters).length +
    (basis === 'all' ? 0 : 1);

  const clearEverything = () => {
    setQueryFilters([]);
    setBasis('all');
    clearAll();
  };

  return (
    <Layout
      height="fill"
      contentWidth={960}
      header={
        <LayoutHeader padding={4}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <Heading level={1}>Invoice INV-2043</Heading>
            </StackItem>
            <Button
              label="Download PDF"
              variant="secondary"
              icon={<Icon icon={ArrowDownTrayIcon} size="sm" />}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={4}>
          <VStack gap={8}>
            {/* Extra block padding sets the document facts apart from the
                controls and the table without needing a rule to do it. */}
            <VStack paddingBlock={4}>
              <MetadataList columns="multi" label={{position: 'top'}}>
                {INVOICE_DETAILS.map(detail => (
                  <MetadataListItem key={detail.label} label={detail.label}>
                    {detail.value}
                  </MetadataListItem>
                ))}
              </MetadataList>
            </VStack>

            {/* Scope first, then query: the segments narrow what PowerSearch
                is searching over, which is the order the sentence reads in.
                The VStack is what makes PowerSearch fill its 300px and sit
                flush right — as a bare flex child it shrinks to content. */}
            <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
              <SegmentedControl
                label="Filter by billing basis"
                value={basis}
                onChange={value => setBasis(value as BillingBasis | 'all')}>
                {BASIS_FILTERS.map(filter => (
                  <SegmentedControlItem
                    key={filter.value}
                    value={filter.value}
                    label={filter.label}
                  />
                ))}
              </SegmentedControl>
              <VStack width={300}>
                <PowerSearch
                  config={config}
                  filters={queryFilters}
                  onChange={next => setQueryFilters([...next])}
                  placeholder="Filter…"
                />
              </VStack>
            </HStack>

            <VStack gap={6}>
              {visible.length === 0 ? (
                <EmptyState
                  title="No matching line items"
                  description="No line on this invoice matches the current filters."
                  actions={
                    <Button
                      label="Clear filters"
                      variant="secondary"
                      onClick={clearEverything}
                    />
                  }
                />
              ) : (
                // The two tables are one thing to a reader, so they are one
                // thing to assistive tech as well.
                <div
                  style={FLUSH_WRAPPER}
                  role="group"
                  aria-label="Invoice line items and totals">
                  <Table<InvoiceRow>
                    data={sortedData}
                    columns={columns}
                    idKey="id"
                    density="balanced"
                    dividers="none"
                    hasHover
                    textOverflow="truncate"
                    plugins={{
                      sort: sortPlugin,
                      filter: filterPlugin,
                      flush: flushPlugin,
                    }}
                  />

                  {/* Same columns, so the same colgroup — which is the only
                      reason these figures line up with the Amount column. */}
                  <Table density="balanced" dividers="none">
                    <colgroup>
                      {columns.map(column => (
                        <col
                          key={column.key}
                          style={COLUMN_WIDTHS.columns.get(column.key)?.style}
                        />
                      ))}
                    </colgroup>
                    <TableBody>
                      <TableRow isHeaderRow>
                        <TableCell
                          colSpan={4}
                          style={{...FLUSH_START, ...RULE_ABOVE}}>
                          <Text justify="end" display="block">
                            Subtotal
                          </Text>
                        </TableCell>
                        <TableCell style={{...FLUSH_END, ...RULE_ABOVE}}>
                          <Text justify="end" display="block" hasTabularNumbers>
                            {formatCents(subtotalCents)}
                          </Text>
                        </TableCell>
                      </TableRow>
                      <TableRow isHeaderRow>
                        <TableCell colSpan={4} style={FLUSH_START}>
                          <Text justify="end" display="block" color="secondary">
                            Tax (8.75%)
                          </Text>
                        </TableCell>
                        <TableCell style={FLUSH_END}>
                          <Text justify="end" display="block" hasTabularNumbers>
                            {formatCents(taxCents)}
                          </Text>
                        </TableCell>
                      </TableRow>
                      <TableRow isHeaderRow>
                        <TableCell
                          colSpan={4}
                          style={{...FLUSH_START, ...RULE_BOTH}}>
                          <Text justify="end" display="block" weight="semibold">
                            Total due
                          </Text>
                        </TableCell>
                        <TableCell style={{...FLUSH_END, ...RULE_BOTH}}>
                          <Text
                            justify="end"
                            display="block"
                            hasTabularNumbers
                            weight="semibold">
                            {formatCents(totalCents)}
                          </Text>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Mounted on a filter change rather than at first paint, so the
                  warning role actually announces. */}
              {visible.length > 0 && activeFilterCount > 0 && (
                <Banner
                  status="warning"
                  title="Filtered view — these totals are partial"
                  description={`Showing ${visible.length} of ${ROWS.length} lines. The subtotal, tax, and total due above cover only the lines currently visible.`}
                  endContent={
                    <Button
                      label="Clear all filters"
                      variant="secondary"
                      onClick={clearEverything}
                    />
                  }
                />
              )}
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
