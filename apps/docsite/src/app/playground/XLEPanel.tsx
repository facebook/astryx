// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Playground tab for XLE/XLO layout expressions.
 *
 * Lets you type a compressed layout expression (compact XLE or indented
 * outline XLO) and live-validate it against the @xds/core registry that
 * ships as build-time JSON (src/generated/xle-registry.json). "Expand to
 * code" pushes the generated TSX into the shared `code` state, so the
 * existing Monaco editor, preview iframe, and share-URL pipeline take over
 * with no extra plumbing — the same handoff the Templates dropdown uses.
 *
 * @input  user-typed expression + onApplyCode(tsx) from the playground
 * @output validity/errors/both-surface echo; applies expanded TSX on demand
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

const EXAMPLES: {label: string; expr: string}[] = [
  {
    label: 'Dashboard shell',
    expr: 'A[cp6 @topNav=TN @sideNav=SN] > L > LC > S[p6] > (G[c4 g4] > C{card-callout}*4) + T[striped]',
  },
  {
    label: 'Login card',
    expr:
      'Ctr[h="100dvh"] > C[w=400 p8] > V[g6] >\n  (F > TI"Email"[t=email req] + TI"Password"[t=password req]) +\n  B.primary"Sign in"',
  },
  {
    label: 'Outline form',
    expr:
      'AppShell cp=6\n  topNav: TN\n  Layout > LayoutContent\n    Section p=6\n      Grid cols=4 gap=4\n        Card {card-callout} x4',
  },
  {
    label: 'Table + overlay',
    expr:
      'V > B"Delete"[opens=#confirm] ;; AD#confirm"Delete item?"',
  },
];

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
    minHeight: 140,
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
  errorRow: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 'var(--text-xsm, 12px)',
  },
  examples: {
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
});

const REGISTRY = xleData.registry;
const BLOCKS = xleData.blocks;

export function XLEPanel({onApplyCode}: {onApplyCode: (code: string) => void}) {
  const [expr, setExpr] = useState(EXAMPLES[0].expr);
  const [surface, setSurface] = useState<Surface>('auto');

  const check = useMemo(
    () => checkExpression(expr, REGISTRY, {blocks: BLOCKS, form: surface}),
    [expr, surface],
  );

  const apply = () => {
    const result = expandExpression(expr, REGISTRY, {
      blocks: BLOCKS,
      form: surface,
      name: 'PlaygroundLayout',
    });
    if (result.ok) onApplyCode(result.code);
  };

  const valid = check.ok && check.valid;

  return (
    <div {...stylex.props(s.panel)}>
      <XDSVStack gap={1}>
        <XDSHeading level={4}>Layout expression (XLE / XLO)</XDSHeading>
        <XDSText type="supporting">
          Write a compressed layout. Validated live against @xds/core; expand
          to drive the preview.
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
          label="Expand to code"
          isDisabled={!valid}
          onClick={apply}
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

      {valid && (
        <XDSVStack gap={2}>
          <XDSText type="label">Compact</XDSText>
          <pre {...stylex.props(s.echo)}>{check.compact}</pre>
          <XDSText type="label">Outline</XDSText>
          <pre {...stylex.props(s.echo)}>{check.outline}</pre>
        </XDSVStack>
      )}

      <XDSVStack gap={2}>
        <XDSText type="label">Examples</XDSText>
        <XDSHStack xstyle={s.examples}>
          {EXAMPLES.map(ex => (
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
    </div>
  );
}
