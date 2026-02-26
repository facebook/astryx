import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTable} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table/types';
import {spacingVars, colorVars} from '@xds/core/theme/tokens.stylex';
import type {
  UniversalComparison,
  UniversalDimension,
  CostMetrics,
} from './types';
import {ALL_DIMENSIONS, DIMENSION_LABELS, formatScore} from './utils';

const styles = stylex.create({
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacingVars['--spacing-3'],
  },
  summaryGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: spacingVars['--spacing-3'],
  },
  winCard: {
    padding: spacingVars['--spacing-3'],
    textAlign: 'center',
  },
  positive: {
    color: colorVars['--color-positive'],
  },
  negative: {
    color: colorVars['--color-negative'],
  },
  neutral: {
    color: colorVars['--color-text-secondary'],
  },
  warning: {
    color: colorVars['--color-warning'],
  },
  costGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: spacingVars['--spacing-3'],
  },
  costCard: {
    padding: spacingVars['--spacing-3'],
  },
  costLabel: {
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  costValues: {
    display: 'flex',
    gap: spacingVars['--spacing-3'],
    alignItems: 'baseline',
  },
});

type WinnerType = 'xds' | 'baseline' | 'html' | 'tie';

interface CompareViewProps {
  comparison: UniversalComparison;
}

interface DimRow extends Record<string, unknown> {
  id: string;
  dimension: string;
  xdsScore: number;
  baselineScore: number;
  htmlScore?: number;
  delta: number;
  winner: string;
}

interface CatRow extends Record<string, unknown> {
  id: string;
  category: string;
  xdsOverall: number;
  baselineOverall: number;
  htmlOverall?: number;
  delta: number;
}

interface CostRow extends Record<string, unknown> {
  id: string;
  metric: string;
  xds: string;
  baseline: string;
  html?: string;
  winner: string;
}

function costWinner(
  xdsVal: number,
  baseVal: number,
  lowerIsBetter: boolean,
  htmlVal?: number,
): WinnerType {
  if (htmlVal != null) {
    const vals = [xdsVal, baseVal, htmlVal];
    const best = lowerIsBetter ? Math.min(...vals) : Math.max(...vals);
    const atBest = vals.filter(v => v === best).length;
    if (atBest > 1) return 'tie';
    if (xdsVal === best) return 'xds';
    if (baseVal === best) return 'baseline';
    return 'html';
  }
  if (xdsVal === baseVal) return 'tie';
  if (lowerIsBetter) return xdsVal < baseVal ? 'xds' : 'baseline';
  return xdsVal > baseVal ? 'xds' : 'baseline';
}

function winnerBadgeVariant(
  w: string,
): 'success' | 'error' | 'warning' | 'neutral' {
  switch (w) {
    case 'xds':
      return 'success';
    case 'baseline':
      return 'error';
    case 'html':
      return 'warning';
    default:
      return 'neutral';
  }
}

function winnerLabel(w: string): string {
  switch (w) {
    case 'xds':
      return 'XDS';
    case 'baseline':
      return 'Baseline';
    case 'html':
      return 'HTML';
    default:
      return 'Tie';
  }
}

function CostComparisonSection({
  xdsCost,
  baselineCost,
  htmlCost,
}: {
  xdsCost: CostMetrics;
  baselineCost: CostMetrics;
  htmlCost?: CostMetrics;
}) {
  const isThreeWay = !!htmlCost;
  const hasDuration =
    xdsCost.avgDurationMs > 0 || baselineCost.avgDurationMs > 0;

  const costData: CostRow[] = [
    ...(hasDuration
      ? [
          {
            id: 'duration',
            metric: 'Avg Duration',
            xds: `${(xdsCost.avgDurationMs / 1000).toFixed(1)}s`,
            baseline: `${(baselineCost.avgDurationMs / 1000).toFixed(1)}s`,
            ...(isThreeWay
              ? {html: `${(htmlCost!.avgDurationMs / 1000).toFixed(1)}s`}
              : {}),
            winner: costWinner(
              xdsCost.avgDurationMs,
              baselineCost.avgDurationMs,
              true,
              htmlCost?.avgDurationMs,
            ),
          },
        ]
      : []),
    {
      id: 'input-tokens',
      metric: 'Input Tokens',
      xds: `~${xdsCost.estimatedInputTokens.toLocaleString()}`,
      baseline: `~${baselineCost.estimatedInputTokens.toLocaleString()}`,
      ...(isThreeWay
        ? {html: `~${htmlCost!.estimatedInputTokens.toLocaleString()}`}
        : {}),
      winner: costWinner(
        xdsCost.estimatedInputTokens,
        baselineCost.estimatedInputTokens,
        true,
        htmlCost?.estimatedInputTokens,
      ),
    },
    {
      id: 'output-tokens',
      metric: 'Output Tokens',
      xds: `~${xdsCost.estimatedOutputTokens.toLocaleString()}`,
      baseline: `~${baselineCost.estimatedOutputTokens.toLocaleString()}`,
      ...(isThreeWay
        ? {html: `~${htmlCost!.estimatedOutputTokens.toLocaleString()}`}
        : {}),
      winner: costWinner(
        xdsCost.estimatedOutputTokens,
        baselineCost.estimatedOutputTokens,
        true,
        htmlCost?.estimatedOutputTokens,
      ),
    },
    {
      id: 'total-tokens',
      metric: 'Total Tokens',
      xds: `~${(xdsCost.estimatedInputTokens + xdsCost.estimatedOutputTokens).toLocaleString()}`,
      baseline: `~${(baselineCost.estimatedInputTokens + baselineCost.estimatedOutputTokens).toLocaleString()}`,
      ...(isThreeWay
        ? {
            html: `~${(htmlCost!.estimatedInputTokens + htmlCost!.estimatedOutputTokens).toLocaleString()}`,
          }
        : {}),
      winner: costWinner(
        xdsCost.estimatedInputTokens + xdsCost.estimatedOutputTokens,
        baselineCost.estimatedInputTokens + baselineCost.estimatedOutputTokens,
        true,
        htmlCost
          ? htmlCost.estimatedInputTokens + htmlCost.estimatedOutputTokens
          : undefined,
      ),
    },
    {
      id: 'output-lines',
      metric: 'Avg Output Lines',
      xds: String(xdsCost.avgOutputLines),
      baseline: String(baselineCost.avgOutputLines),
      ...(isThreeWay ? {html: String(htmlCost!.avgOutputLines)} : {}),
      winner: costWinner(
        xdsCost.avgOutputLines,
        baselineCost.avgOutputLines,
        true,
        htmlCost?.avgOutputLines,
      ),
    },
    {
      id: 'docs-read',
      metric: 'Avg Docs Read',
      xds: String(xdsCost.avgDocsRead),
      baseline: String(baselineCost.avgDocsRead),
      ...(isThreeWay ? {html: String(htmlCost!.avgDocsRead)} : {}),
      winner: 'tie', // not inherently better or worse
    },
  ];

  const costColumns: XDSTableColumn<CostRow>[] = [
    {key: 'metric', header: 'Metric'},
    {
      key: 'xds',
      header: 'XDS',
      renderCell: row => <XDSText type="body">{row.xds}</XDSText>,
    },
    {
      key: 'baseline',
      header: 'Baseline',
      renderCell: row => <XDSText type="body">{row.baseline}</XDSText>,
    },
    ...(isThreeWay
      ? [
          {
            key: 'html' as const,
            header: 'HTML',
            renderCell: (row: CostRow) => (
              <XDSText type="body">{row.html ?? '—'}</XDSText>
            ),
          } satisfies XDSTableColumn<CostRow>,
        ]
      : []),
    {
      key: 'winner',
      header: 'Lower Cost',
      renderCell: row => (
        <XDSBadge variant={winnerBadgeVariant(row.winner)}>
          {row.winner === 'tie' ? '—' : winnerLabel(row.winner)}
        </XDSBadge>
      ),
    },
  ];

  return (
    <XDSTable<CostRow>
      data={costData}
      columns={costColumns}
      idKey="id"
      density="balanced"
      dividers="rows"
    />
  );
}

export function CompareView({comparison}: CompareViewProps) {
  const {xds, baseline, html, winners} = comparison;
  const isThreeWay = !!html;

  let xdsWins = 0;
  let baselineWins = 0;
  let htmlWins = 0;
  let ties = 0;
  for (const dim of ALL_DIMENSIONS) {
    const w = winners[dim];
    if (w === 'xds') xdsWins++;
    else if (w === 'baseline') baselineWins++;
    else if (w === 'html') htmlWins++;
    else ties++;
  }

  const dimData: DimRow[] = ALL_DIMENSIONS.map(dim => ({
    id: dim,
    dimension: DIMENSION_LABELS[dim],
    xdsScore: xds.averages[dim],
    baselineScore: baseline.averages[dim],
    ...(isThreeWay ? {htmlScore: html!.averages[dim]} : {}),
    delta: xds.averages[dim] - baseline.averages[dim],
    winner: winners[dim],
  }));

  const dimColumns: XDSTableColumn<DimRow>[] = [
    {key: 'dimension', header: 'Dimension'},
    {
      key: 'xdsScore',
      header: 'XDS',
      renderCell: row => (
        <XDSText type="body">{formatScore(row.xdsScore)}</XDSText>
      ),
    },
    {
      key: 'baselineScore',
      header: 'Baseline',
      renderCell: row => (
        <XDSText type="body">{formatScore(row.baselineScore)}</XDSText>
      ),
    },
    ...(isThreeWay
      ? [
          {
            key: 'htmlScore' as const,
            header: 'HTML',
            renderCell: (row: DimRow) => (
              <XDSText type="body">
                {row.htmlScore != null ? formatScore(row.htmlScore) : '—'}
              </XDSText>
            ),
          } satisfies XDSTableColumn<DimRow>,
        ]
      : []),
    {
      key: 'delta',
      header: 'Delta (XDS−Base)',
      renderCell: row => (
        <XDSText
          type="body"
          xstyle={
            row.delta > 0
              ? styles.positive
              : row.delta < 0
                ? styles.negative
                : styles.neutral
          }>
          {row.delta > 0 ? '+' : ''}
          {formatScore(row.delta)}
        </XDSText>
      ),
    },
    {
      key: 'winner',
      header: 'Winner',
      renderCell: row => (
        <XDSBadge variant={winnerBadgeVariant(row.winner)}>
          {winnerLabel(row.winner)}
        </XDSBadge>
      ),
    },
  ];

  const allCategories = new Set([
    ...Object.keys(xds.byCategory),
    ...Object.keys(baseline.byCategory),
    ...(html ? Object.keys(html.byCategory) : []),
  ]);

  const catData: CatRow[] = [...allCategories].map(cat => {
    const xdsCat = xds.byCategory[cat] ?? {};
    const baseCat = baseline.byCategory[cat] ?? {};
    const htmlCat =
      html?.byCategory[cat] ?? ({} as Record<UniversalDimension, number>);
    const xdsAvg =
      ALL_DIMENSIONS.reduce(
        (s, d) => s + ((xdsCat[d as UniversalDimension] as number) ?? 0),
        0,
      ) / ALL_DIMENSIONS.length;
    const baseAvg =
      ALL_DIMENSIONS.reduce(
        (s, d) => s + ((baseCat[d as UniversalDimension] as number) ?? 0),
        0,
      ) / ALL_DIMENSIONS.length;
    const htmlAvg = isThreeWay
      ? ALL_DIMENSIONS.reduce(
          (s, d) => s + ((htmlCat[d as UniversalDimension] as number) ?? 0),
          0,
        ) / ALL_DIMENSIONS.length
      : undefined;
    return {
      id: cat,
      category: cat,
      xdsOverall: xdsAvg,
      baselineOverall: baseAvg,
      ...(htmlAvg != null ? {htmlOverall: htmlAvg} : {}),
      delta: xdsAvg - baseAvg,
    };
  });

  const catColumns: XDSTableColumn<CatRow>[] = [
    {key: 'category', header: 'Category'},
    {
      key: 'xdsOverall',
      header: 'XDS',
      renderCell: row => (
        <XDSText type="body">{formatScore(row.xdsOverall)}</XDSText>
      ),
    },
    {
      key: 'baselineOverall',
      header: 'Baseline',
      renderCell: row => (
        <XDSText type="body">{formatScore(row.baselineOverall)}</XDSText>
      ),
    },
    ...(isThreeWay
      ? [
          {
            key: 'htmlOverall' as const,
            header: 'HTML',
            renderCell: (row: CatRow) => (
              <XDSText type="body">
                {row.htmlOverall != null ? formatScore(row.htmlOverall) : '—'}
              </XDSText>
            ),
          } satisfies XDSTableColumn<CatRow>,
        ]
      : []),
    {
      key: 'delta',
      header: 'Delta (XDS−Base)',
      renderCell: row => (
        <XDSText
          type="body"
          xstyle={
            row.delta > 0
              ? styles.positive
              : row.delta < 0
                ? styles.negative
                : styles.neutral
          }>
          {row.delta > 0 ? '+' : ''}
          {formatScore(row.delta)}
        </XDSText>
      ),
    },
  ];

  return (
    <XDSVStack gap="space4">
      <div
        {...stylex.props(
          isThreeWay ? styles.summaryGrid4 : styles.summaryGrid,
        )}>
        <XDSCard>
          <div {...stylex.props(styles.winCard)}>
            <XDSVStack gap="space2">
              <XDSText type="label">XDS Wins</XDSText>
              <XDSHeading level={2}>
                <span {...stylex.props(styles.positive)}>{xdsWins}</span>
              </XDSHeading>
            </XDSVStack>
          </div>
        </XDSCard>
        <XDSCard>
          <div {...stylex.props(styles.winCard)}>
            <XDSVStack gap="space2">
              <XDSText type="label">Baseline Wins</XDSText>
              <XDSHeading level={2}>
                <span {...stylex.props(styles.negative)}>{baselineWins}</span>
              </XDSHeading>
            </XDSVStack>
          </div>
        </XDSCard>
        {isThreeWay && (
          <XDSCard>
            <div {...stylex.props(styles.winCard)}>
              <XDSVStack gap="space2">
                <XDSText type="label">HTML Wins</XDSText>
                <XDSHeading level={2}>
                  <span {...stylex.props(styles.warning)}>{htmlWins}</span>
                </XDSHeading>
              </XDSVStack>
            </div>
          </XDSCard>
        )}
        <XDSCard>
          <div {...stylex.props(styles.winCard)}>
            <XDSVStack gap="space2">
              <XDSText type="label">Ties</XDSText>
              <XDSHeading level={2}>
                <span {...stylex.props(styles.neutral)}>{ties}</span>
              </XDSHeading>
            </XDSVStack>
          </div>
        </XDSCard>
      </div>

      <XDSVStack gap="space3">
        <XDSHeading level={3}>Dimension Comparison</XDSHeading>
        <XDSTable<DimRow>
          data={dimData}
          columns={dimColumns}
          idKey="id"
          density="balanced"
          dividers="rows"
        />
      </XDSVStack>

      {catData.length > 0 && (
        <XDSVStack gap="space3">
          <XDSHeading level={3}>Category Breakdown</XDSHeading>
          <XDSTable<CatRow>
            data={catData}
            columns={catColumns}
            idKey="id"
            density="balanced"
            dividers="rows"
          />
        </XDSVStack>
      )}

      {xds.cost && baseline.cost && (
        <XDSVStack gap="space3">
          <XDSHeading level={3}>Cost Comparison</XDSHeading>
          <CostComparisonSection
            xdsCost={xds.cost}
            baselineCost={baseline.cost}
            htmlCost={html?.cost}
          />
        </XDSVStack>
      )}
    </XDSVStack>
  );
}
