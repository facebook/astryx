// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Playground tab for XLE/XLO layout expressions.
 *
 * Type a compressed layout expression (compact XLE or indented outline XLO),
 * see it live-validated against the @xds/core registry shipped as build-time
 * JSON (src/generated/xle-registry.json), watch the expanded TSX render
 * inline, and "Expand to code" to push it into the shared editor/preview.
 * The whole pipeline runs in-browser via the pure @xds/cli/xle barrel.
 *
 * @input  user-typed expression + onApplyCode(tsx) from the playground
 * @output validity/errors/both-surface echo, live expanded TSX, applies on demand
 * @position playground left-panel tab (LeftView 'layout')
 */

'use client';

import {useMemo, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Heading';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSSegmentedControl, XDSSegmentedControlItem} from '@xds/core/SegmentedControl';
import {XDSBanner} from '@xds/core/Banner';
import {checkExpression, expandExpression} from '@xds/cli/xle';
import xleData from '@/generated/xle-registry.json';

type Surface = 'auto' | 'compact' | 'outline';

const EXAMPLES: {category: string; label: string; expr: string}[] = [
  {category: 'Layout', label: 'Centered box', expr: 'Ctr[h="100dvh"] > C[w=400 p8] > Tx"Hello world"'},
  {category: 'Layout', label: 'App shell', expr: 'A[cp6 @topNav=TN @sideNav=SN] > L > LC > S[p6] > Tx"Page content"'},
  {category: 'Layout', label: 'App shell + header', expr: 'A[cp4 @topNav=TN] > L > LH"Page header" + LC > S[p4] > Tx"Body"'},
  {category: 'Layout', label: 'Vertical stack', expr: 'V[g4] > Tx"One" + Tx"Two" + Tx"Three"'},
  {category: 'Layout', label: 'Spread row', expr: 'H[j=between a=center] > Tx.lg"Title" + B.primary"Action"'},
  {category: 'Layout', label: 'Grid 4-up', expr: 'G[c4 g4] > C[p6]*4'},
  {category: 'Layout', label: 'Responsive grid', expr: 'G[c{min:320} g4] > C{card-callout}*3'},
  {category: 'Layout', label: 'Section muted', expr: 'S[p6 v=muted] > Tx"Muted section"'},
  {category: 'Layout', label: 'Nested stacks', expr: 'V[g6] > (H[j=between] > Tx.lg"Header" + B"Edit") + (G[c3 g4] > C[p4]*3)'},
  {category: 'Layout', label: 'Layout regions', expr: 'L > LH"Header" + LC > S[p4] > Tx"Body"'},
  {category: 'Layout', label: 'Divider between', expr: 'V[g4] > Tx"Above" + D + Tx"Below"'},
  {category: 'Layout', label: 'Fill stack item', expr: 'H[g4] > Tx"Fixed" + (SI[size=fill] > Tx"Grows")'},
  {category: 'Layout', label: 'Toolbar + content', expr: 'V[g4] > (Tbar"Actions" > B"Filter" + B.primary"New") + S[p4] > Tx"Below toolbar"'},
  {category: 'Cards', label: 'Titled card', expr: 'C[p6] > V[g2] > Hd"Card title"[level=3] + Tx[t=supporting]"Supporting copy"'},
  {category: 'Cards', label: 'KPI tile', expr: 'C[p6] > V[g1] > Tx.lg"1,284" + Tx[t=supporting]"Active users"'},
  {category: 'Cards', label: 'KPI grid', expr: 'G[c4 g4] > (C[p6] > V[g1] > Tx.lg"\\$42k" + Tx[t=supporting]"Revenue")*4'},
  {category: 'Cards', label: 'Clickable card', expr: 'CC[p6] > H[j=between a=center] > Tx"Open project" + Ic[icon=arrow-right]'},
  {category: 'Cards', label: 'Card grid', expr: 'G[c3 g4] > (C[p6] > V[g2] > Hd"A"[level=4] + Tx"text")*3'},
  {category: 'Cards', label: 'Callout block', expr: 'S[p6] > C{card-callout}'},
  {category: 'Cards', label: 'Badge row', expr: 'H[g2] > Bd.success"Active" + Bd.warning"Pending" + Bd.error"Failed" + Bd.info"New"'},
  {category: 'Cards', label: 'Avatar row', expr: 'H[g2 a=center] > Av + (V[g0.5] > Tx"Jane Doe" + Tx[t=supporting]"Admin")'},
  {category: 'Cards', label: 'Metadata list', expr: 'C[p6] > ML > MLI"Status":"Active" + MLI"Owner":"Jane" + MLI"Region":"us-east"'},
  {category: 'Content', label: 'List', expr: 'UL > LI"First item" + LI"Second item" + LI"Third item"'},
  {category: 'Content', label: 'Kbd hint', expr: 'H[g2 a=center] > Tx"Press" + K"mod+k" + Tx"to search"'},
  {category: 'Content', label: 'Headings scale', expr: 'V[g3] > Hd"H1"[level=1] + Hd"H2"[level=2] + Hd"H3"[level=3]'},
  {category: 'Content', label: 'Text + link', expr: 'H[g1] > Tx"Read" + Lk[href="/docs"]"the docs"'},
  {category: 'Content', label: 'Tokens', expr: 'H[g2] > Tk"react" + Tk"typescript" + Tk"stylex"'},
  {category: 'Tables', label: 'Simple table', expr: 'C[p0] > T[striped] > (TR > THC"Name" + THC"Email") + (TR > TC"Alice" + TC"alice@x.com")*5'},
  {category: 'Tables', label: 'Table + status cell', expr: 'T > (TR > THC"Service" + THC"Status") + (TR > TC"api-gateway" + (TC > Bd.success"Up"))*4'},
  {category: 'Tables', label: 'Dense table', expr: 'T[density=compact dividers=rows] > (TR > THC"ID" + THC"Value") + (TR > TC"row-$" + TC"\\$12.00")*6'},
  {category: 'Tables', label: 'Table in card', expr: 'C[p0] > T[striped] > (TR>THC"Item"+THC"Qty") + (TR>TC"Widget"+TC"3")*3'},
  {category: 'Forms', label: 'Login form', expr: 'Ctr[h="100dvh"] > C[w=400 p8] > V[g6] > (F > TI"Email"[t=email req] + TI"Password"[t=password req]) + B.primary"Sign in"'},
  {category: 'Forms', label: 'Field set', expr: 'F > TI"Full name"[req] + TI"Email"[t=email req] + TA"Bio" + B.primary"Save"'},
  {category: 'Forms', label: 'Inline controls', expr: 'H[j=between a=center] > CB"Remember me" + Lk[href="/forgot"]"Forgot password?"'},
  {category: 'Forms', label: 'Number + switch', expr: 'V[g4] > NI"Quantity" + (H[j=between a=center] > Tx"Notifications" + SW"Enable notifications")'},
  {category: 'Forms', label: 'Two column form', expr: 'G[c2 g4] > TI"First name"[req] + TI"Last name"[req] + TI"Email"[t=email req] + TI"Phone"'},
  {category: 'Forms', label: 'Checkbox list', expr: 'CL"Permissions" > CLI"Read" + CLI"Write" + CLI"Admin"'},
  {category: 'Forms', label: 'Radio list', expr: 'RL"Plan" > RLI"Free" + RLI"Pro" + RLI"Enterprise"'},
  {category: 'Forms', label: 'Slider', expr: 'V[g4] > SL"Volume" + SL"Brightness"'},
  {category: 'Forms', label: 'Date input', expr: 'F > DI"Start date" + DI"End date"'},
  {category: 'Forms', label: 'Search field', expr: 'TI"Search"[t=text]'},
  {category: 'Nav', label: 'Tabs', expr: 'TL > Tab"Overview"! + Tab"Activity" + Tab"Settings"'},
  {category: 'Nav', label: 'Breadcrumbs', expr: 'BC > BCI"Home"[href="/"] + BCI"Projects"[href="/projects"] + BCI"Detail"'},
  {category: 'Nav', label: 'Segmented control', expr: 'SG > SGI"Day" + SGI"Week" + SGI"Month"'},
  {category: 'Nav', label: 'Top nav', expr: 'TN > TNH"Acme" + TNI"Docs" + TNI"Pricing"'},
  {category: 'Nav', label: 'Side nav', expr: 'SN > (SNS"Main" > SNI"Dashboard" + SNI"Reports") + (SNS"Settings" > SNI"Profile")'},
  {category: 'Nav', label: 'Pagination', expr: 'PG[variant=count]'},
  {category: 'Nav', label: 'Tabs + content', expr: 'V[g4] > (TL > Tab"All"! + Tab"Active") + S[p4] > Tx"Tab body"'},
  {category: 'Feedback', label: 'Success banner', expr: 'Bn.success"Changes saved successfully"'},
  {category: 'Feedback', label: 'Empty state', expr: 'ES"No results found"[description="Try adjusting your filters"]'},
  {category: 'Feedback', label: 'Spinner', expr: 'Ctr[h=200] > Sp'},
  {category: 'Feedback', label: 'Progress bar', expr: 'V[g4] > PB[value=60] + PB[value=90]'},
  {category: 'Feedback', label: 'Skeletons', expr: 'V[g2] > Sk*4'},
  {category: 'Feedback', label: 'Delete dialog', expr: 'V > B.destructive"Delete"[opens=#confirm] ;; AD#confirm"Delete this item?"'},
  {category: 'Feedback', label: 'Status dots', expr: 'V[g2] > (H[g2 a=center] > SD.success + Tx"Operational") + (H[g2 a=center] > SD.error + Tx"Outage")'},
  {category: 'Feedback', label: 'Toolbar actions', expr: 'Tbar"Actions" > B"Filter" + B"Export" + B.primary"New"'},
  {category: 'Blocks', label: 'Splice block', expr: 'S[p6] > C{card-callout}'},
  {category: 'Blocks', label: 'Block grid', expr: 'G[c2 g4] > {card-callout}*2'},
  {category: 'Blocks', label: 'Standalone block', expr: '{card-callout}'},
  {category: 'Outline', label: 'Outline app shell', expr: 'AppShell cp=6\n  topNav: TN\n  Layout > LayoutContent\n    Section p=6\n      Grid cols=4 gap=4\n        Card p=6 x4'},
  {category: 'Outline', label: 'Outline form', expr: 'Center h="100dvh"\n  Card w=400 p=8\n    VStack g=6\n      FormLayout\n        TextInput "Email" t=email req\n        TextInput "Password" t=password req\n      Button.primary "Sign in"'},
  {category: 'Outline', label: 'Outline dashboard', expr: 'Section p=6\n  VStack g=6\n    HStack j=between a=center\n      Heading "Dashboard" level=2\n      Button.primary "New"\n    Grid c=4 g=4\n      Card {card-callout} x4'},
  {category: 'Outline', label: 'Outline table', expr: 'Card p=0\n  Table striped\n    TableRow\n      TableHeaderCell "Name"\n      TableHeaderCell "Role"\n    repeat 4:\n      TableRow\n        TableCell "Person"\n        TableCell "Engineer"'},
  {category: 'Outline', label: 'Outline with overlay', expr: 'VStack g=4\n  Button.destructive "Delete" opens=#confirm\n\noverlays:\n  AlertDialog#confirm "Delete this item?"'},
  {category: 'Outline', label: 'Outline tabs', expr: 'VStack g=4\n  TabList\n    Tab "Overview" !\n    Tab "Activity"\n    Tab "Settings"\n  Section p=4\n    Text "Tab content"'},
  {category: 'Chat', label: 'Chat layout', expr: 'ChL > ChML > ChS"Today" + (ChM > ChB"Hello there") + (ChM > ChB"Hi, how can I help?")'},
];

const CATEGORY_ORDER = [...new Set(EXAMPLES.map(e => e.category))];

const s = stylex.create({
  panel: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    gap: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
  },
  editor: {
    width: '100%',
    minHeight: 120,
    resize: 'vertical',
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 'var(--text-sm, 13px)',
    lineHeight: 1.6,
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-inner)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-base)',
    color: 'var(--color-content-primary)',
    tabSize: 2,
  },
  echo: {
    whiteSpace: 'pre-wrap',
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 'var(--text-xsm, 12px)',
    color: 'var(--color-content-secondary)',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-inner)',
    padding: 'var(--spacing-2)',
    margin: 0,
    overflowX: 'auto',
  },
  source: {
    whiteSpace: 'pre',
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 'var(--text-xsm, 12px)',
    color: 'var(--color-content-primary)',
    backgroundColor: 'var(--color-background-base)',
    borderRadius: 'var(--radius-inner)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    padding: 'var(--spacing-3)',
    margin: 0,
    maxHeight: 360,
    overflow: 'auto',
  },
  errorRow: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 'var(--text-xsm, 12px)',
  },
  chips: {flexWrap: 'wrap', gap: 'var(--spacing-1)'},
});

export function XLEPanel({onApplyCode}: {onApplyCode: (code: string) => void}) {
  const [expr, setExpr] = useState(EXAMPLES[0].expr);
  const [surface, setSurface] = useState<Surface>('auto');

  const check = useMemo(
    () => checkExpression(expr, xleData.registry, {blocks: xleData.blocks, form: surface}),
    [expr, surface],
  );

  // Live expanded TSX — the "rendered source" of the expression.
  const expanded = useMemo(
    () =>
      check.ok && check.valid
        ? expandExpression(expr, xleData.registry, {
            blocks: xleData.blocks,
            form: surface,
            name: 'PlaygroundLayout',
          })
        : null,
    [expr, surface, check.ok, check.valid],
  );

  const valid = check.ok && check.valid;

  return (
    <div {...stylex.props(s.panel)}>
      <XDSVStack gap={1}>
        <XDSHeading level={4}>Layout expression (XLE / XLO)</XDSHeading>
        <XDSText type="supporting">
          Write a compressed layout. Validated live against @xds/core; the
          expanded TSX renders below.
        </XDSText>
      </XDSVStack>

      <XDSSegmentedControl
        label="Surface"
        size="sm"
        value={surface}
        onChange={v => setSurface(v as Surface)}>
        <XDSSegmentedControlItem value="auto" label="Auto" />
        <XDSSegmentedControlItem value="compact" label="Compact (XLE)" />
        <XDSSegmentedControlItem value="outline" label="Outline (XLO)" />
      </XDSSegmentedControl>

      <textarea
        {...stylex.props(s.editor)}
        value={expr}
        spellCheck={false}
        onChange={e => setExpr(e.target.value)}
        aria-label="Layout expression"
      />

      <XDSHStack gap={2} align="center">
        <XDSButton
          variant="primary"
          size="sm"
          label="Expand to code → preview"
          isDisabled={!valid}
          onClick={() => expanded?.ok && onApplyCode(expanded.code)}
        />
        <XDSBadge
          variant={valid ? 'success' : 'error'}
          label={
            check.ok
              ? valid
                ? `Valid · ${check.form}`
                : `${check.errors.length} error${check.errors.length === 1 ? '' : 's'}`
              : 'Parse error'
          }
        />
        {valid && check.warnings.length > 0 && (
          <XDSBadge variant="warning" label={`${check.warnings.length} warning`} />
        )}
      </XDSHStack>

      {!valid && check.errors.length > 0 && (
        <XDSVStack gap={1}>
          {check.errors.map((e, i) => (
            <XDSBanner
              key={i}
              status="error"
              title={
                <span {...stylex.props(s.errorRow)}>
                  {e.formatted}
                  {e.suggestions && e.suggestions.length > 0
                    ? ` — did you mean: ${e.suggestions.join(', ')}?`
                    : ''}
                </span>
              }
            />
          ))}
        </XDSVStack>
      )}

      {valid && expanded?.ok && (
        <XDSVStack gap={1}>
          <XDSHStack gap={2} align="center">
            <XDSText type="label">Rendered source (TSX)</XDSText>
            {expanded.componentsUsed.length > 0 && (
              <XDSText type="supporting">
                {expanded.componentsUsed.length} components
                {expanded.states ? ` · ${expanded.states} state hooks` : ''}
                {expanded.todos.length ? ` · ${expanded.todos.length} TODO` : ''}
              </XDSText>
            )}
          </XDSHStack>
          <pre {...stylex.props(s.source)}>{expanded.code}</pre>
        </XDSVStack>
      )}

      {valid && (
        <XDSVStack gap={2}>
          <XDSText type="label">Canonical forms</XDSText>
          <pre {...stylex.props(s.echo)}>{`compact:\n${check.compact}\n\noutline:\n${check.outline}`}</pre>
        </XDSVStack>
      )}

      <XDSVStack gap={2}>
        <XDSText type="label">Examples ({EXAMPLES.length})</XDSText>
        {CATEGORY_ORDER.map(cat => (
          <XDSVStack key={cat} gap={1}>
            <XDSText type="supporting">{cat}</XDSText>
            <XDSHStack xstyle={s.chips}>
              {EXAMPLES.filter(e => e.category === cat).map(ex => (
                <XDSButton
                  key={ex.label}
                  variant="secondary"
                  size="sm"
                  label={ex.label}
                  onClick={() => setExpr(ex.expr)}
                />
              ))}
            </XDSHStack>
          </XDSVStack>
        ))}
      </XDSVStack>
    </div>
  );
}
