// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Playground tab for XLE/XLO layout expressions.
 *
 * Type a compressed layout expression (compact XLE or indented outline XLO),
 * see it live-validated against the @xds/core registry shipped as build-time
 * JSON, watch the expanded TSX render inline with input/output token counts,
 * browse a searchable example library, and "Expand to code" to push it into
 * the shared editor/preview. The whole pipeline runs in-browser via the pure
 * @xds/cli/xle barrel.
 *
 * @input  user-typed expression + onApplyCode(tsx) from the playground
 * @output validity/errors, token metrics, live expanded TSX, example browser
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
import {XLE_EXAMPLES, XLE_CATEGORIES} from './xleExamples';

type Surface = 'auto' | 'compact' | 'outline';

/**
 * Rough token estimate: words + individual symbols. Not a real BPE count, but
 * a deterministic, intuitive proxy for comparing input vs output size.
 */
function estTokens(src: string): number {
  return (src.match(/\w+|[^\s\w]/g) || []).length;
}

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
  metrics: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  metric: {
    flex: 1,
    minWidth: 96,
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-inner)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  metricValue: {fontVariantNumeric: 'tabular-nums'},
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
  // Example browser
  search: {
    width: '100%',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-inner)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-base)',
    color: 'var(--color-content-primary)',
    fontSize: 'var(--text-sm, 13px)',
  },
  browser: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-inner)',
    maxHeight: 320,
    overflowY: 'auto',
  },
  catHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--color-background-muted)',
    paddingBlock: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-2)',
    fontSize: 'var(--text-2xs, 10px)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-content-secondary)',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    textAlign: 'start',
    paddingBlock: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-2)',
    border: 'none',
    backgroundColor: {default: 'transparent', ':hover': 'var(--color-background-hover, var(--color-background-muted))'},
    cursor: 'pointer',
    color: 'var(--color-content-primary)',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border-subtle, var(--color-border))',
  },
  rowActive: {
    backgroundColor: 'var(--color-background-active, var(--color-background-muted))',
  },
  rowLabel: {fontSize: 'var(--text-sm, 13px)', fontWeight: 600},
  rowExpr: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 'var(--text-2xs, 11px)',
    color: 'var(--color-content-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  rowTok: {
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--text-2xs, 11px)',
    color: 'var(--color-content-secondary)',
  },
  min0: {minWidth: 0},
});

function Metric({label, value, sub}: {label: string; value: string; sub?: string}) {
  return (
    <div {...stylex.props(s.metric)}>
      <XDSText type="supporting">{label}</XDSText>
      <XDSText weight="semibold" xstyle={s.metricValue}>
        {value}
      </XDSText>
      {sub && <XDSText type="supporting">{sub}</XDSText>}
    </div>
  );
}

export function XLEPanel({onApplyCode}: {onApplyCode: (code: string) => void}) {
  const [expr, setExpr] = useState(XLE_EXAMPLES[0].expr);
  const [surface, setSurface] = useState<Surface>('auto');
  const [query, setQuery] = useState('');
  const [activeLabel, setActiveLabel] = useState(XLE_EXAMPLES[0].label);

  const check = useMemo(
    () => checkExpression(expr, xleData.registry, {blocks: xleData.blocks, form: surface}),
    [expr, surface],
  );

  const valid = check.ok && check.valid;

  const expanded = useMemo(
    () =>
      valid
        ? expandExpression(expr, xleData.registry, {
            blocks: xleData.blocks,
            form: surface,
            name: 'PlaygroundLayout',
          })
        : null,
    [expr, surface, valid],
  );

  const inTokens = estTokens(expr);
  const outCode = expanded?.ok ? expanded.code : '';
  const outTokens = estTokens(outCode);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return XLE_EXAMPLES;
    return XLE_EXAMPLES.filter(
      e =>
        e.label.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.expr.toLowerCase().includes(q),
    );
  }, [query]);

  const pick = (label: string, exprText: string) => {
    setActiveLabel(label);
    setExpr(exprText);
    const r = expandExpression(exprText, xleData.registry, {
      blocks: xleData.blocks,
      form: surface,
      name: 'PlaygroundLayout',
    });
    if (r.ok) onApplyCode(r.code);
  };

  return (
    <div {...stylex.props(s.panel)}>
      <XDSVStack gap={1}>
        <XDSHeading level={4}>Layout expression (XLE / XLO)</XDSHeading>
        <XDSText type="supporting">
          Write a compressed layout. Validated live against @xds/core; the
          expanded TSX and token counts update below.
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

      {/* Token economics */}
      <div {...stylex.props(s.metrics)}>
        <Metric label="XLE input" value={`${inTokens} tok`} sub={`${expr.length} chars`} />
        <Metric
          label="Output TSX"
          value={`${outTokens} tok`}
          sub={outCode ? `${outCode.length} chars` : '—'}
        />
        <Metric
          label="Expansion"
          value={inTokens > 0 && outTokens > 0 ? `${(outTokens / inTokens).toFixed(1)}×` : '—'}
          sub="output ÷ input"
        />
      </div>

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
        <XDSVStack gap={1}>
          <XDSText type="label">Canonical forms</XDSText>
          <pre {...stylex.props(s.echo)}>{`compact:\n${check.compact}\n\noutline:\n${check.outline}`}</pre>
        </XDSVStack>
      )}

      {/* Example browser */}
      <XDSVStack gap={1}>
        <XDSHStack gap={2} align="center" justify="between">
          <XDSText type="label">Examples</XDSText>
          <XDSText type="supporting">
            {filtered.length} of {XLE_EXAMPLES.length}
          </XDSText>
        </XDSHStack>
        <input
          {...stylex.props(s.search)}
          type="search"
          placeholder="Search examples (label, category, or expression)…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search examples"
        />
        <div {...stylex.props(s.browser)}>
          {XLE_CATEGORIES.map(cat => {
            const rows = filtered.filter(e => e.category === cat);
            if (rows.length === 0) return null;
            return (
              <div key={cat}>
                <div {...stylex.props(s.catHeader)}>{cat}</div>
                {rows.map(ex => (
                  <button
                    key={ex.label}
                    type="button"
                    {...stylex.props(s.row, ex.label === activeLabel && s.rowActive)}
                    onClick={() => pick(ex.label, ex.expr)}>
                    <XDSVStack gap={0} xstyle={s.min0}>
                      <span {...stylex.props(s.rowLabel)}>{ex.label}</span>
                      <span {...stylex.props(s.rowExpr)}>{ex.expr.replace(/\n/g, ' ⏎ ')}</span>
                    </XDSVStack>
                    <span {...stylex.props(s.rowTok)}>{estTokens(ex.expr)} tok</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </XDSVStack>
    </div>
  );
}
