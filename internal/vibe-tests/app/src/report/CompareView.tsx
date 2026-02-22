import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSHStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTable} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table/types';
import {spacingVars, colorVars} from '@xds/core/theme/tokens.stylex';
import type {UniversalComparison, UniversalDimension, CostMetrics} from './types';
import {ALL_DIMENSIONS, DIMENSION_LABELS, formatScore} from './utils';

const styles = stylex.create({
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
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

interface CompareViewProps {
  comparison: UniversalComparison;
}

interface DimRow extends Record<string, unknown> {
  id: string;
  dimension: string;
  xdsScore: number;
  baselineScore: number;
  delta: number;
  winner: string;
}

interface CatRow extends Record<string, unknown> {
  id: string;
  category: string;
  xdsOverall: number;
  baselineOverall: number;
  delta: number;
}

interface CostRow extends Record<string, unknown> {
  id: string;
  metric: string;
  xds: string;
  baseline: string;
  winner: string;
}

function costWinner(
  xdsVal: number,
  baseVal: number,
  lowerIsBetter: boolean,
): 'xds' | 'baseline' | 'tie' {
  if (xdsVal === baseVal) return 'tie';
  if (lowerIsBetter) return xdsVal < baseVal ? 'xds' : 'baseline';
  return xdsVal > baseVal ? 'xds' : 'baseline';
}

function CostComparisonSection({
  xdsCost,
  baselineCost,
}: {
  xdsCost: CostMetrics;
  baselineCost: CostMetrics;
}) {
  const costData: CostRow[] = [
    {
      id: 'duration',
      metric: 'Avg Duration',
      xds: `${(xdsCost.avgDurationMs / 1000).toFixed(1)}s`,
      baseline: `${(baselineCost.avgDurationMs / 1000).toFixed(1)}s`,
      winner: costWinner(
        xdsCost.avgDurationMs,
        baselineCost.avgDurationMs,
        true,
      ),
    },
    {
      id: 'input-tokens',
      metric: 'Input Tokens',
      xds: `~${xdsCost.estimatedInputTokens.toLocaleString()}`,
      baseline: `~${baselineCost.estimatedInputTokens.toLocaleString()}`,
      winner: costWinner(
        xdsCost.estimatedInputTokens,
        baselineCost.estimatedInputTokens,
        true,
      ),
    },
    {
      id: 'output-tokens',
      metric: 'Output Tokens',
      xds: `~${xdsCost.estimatedOutputTokens.toLocaleString()}`,
      baseline: `~${baselineCost.estimatedOutputTokens.toLocaleString()}`,
      winner: costWinner(
        xdsCost.estimatedOutputTokens,
        baselineCost.estimatedOutputTokens,
        true,
      ),
    },
    {
      id: 'total-tokens',
      metric: 'Total Tokens',
      xds: `~${(xdsCost.estimatedInputTokens + xdsCost.estimatedOutputTokens).toLocaleString()}`,
      baseline: `~${(baselineCost.estimatedInputTokens + baselineCost.estimatedOutputTokens).toLocaleString()}`,
      winner: costWinner(
        xdsCost.estimatedInputTokens + xdsCost.estimatedOutputTokens,
        baselineCost.estimatedInputTokens + baselineCost.estimatedOutputTokens,
        true,
      ),
    },
    {
      id: 'output-lines',
      metric: 'Avg Output Lines',
      xds: String(xdsCost.avgOutputLines),
      baseline: String(baselineCost.avgOutputLines),
      winner: costWinner(
        xdsCost.avgOutputLines,
        baselineCost.avgOutputLines,
        true,
      ),
    },
    {
      id: 'docs-read',
      metric: 'Avg Docs Read',
      xds: String(xdsCost.avgDocsRead),
      baseline: String(baselineCost.avgDocsRead),
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
    {
      key: 'winner',
      header: 'Lower Cost',
      renderCell: row => (
        <XDSBadge
          variant={
            row.winner === 'xds'
              ? 'success'
              : row.winner === 'baseline'
                ? 'error'
                : 'neutral'
          }>
          {row.winner === 'xds'
            ? 'XDS'
            : row.winner === 'baseline'
              ? 'Baseline'
              : '—'}
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
  const {xds, baseline, winners} = comparison;

  let xdsWins = 0;
  let baselineWins = 0;
  let ties = 0;
  for (const dim of ALL_DIMENSIONS) {
    const w = winners[dim];
    if (w === 'xds') xdsWins++;
    else if (w === 'baseline') baselineWins++;
    else ties++;
  }

  const dimData: DimRow[] = ALL_DIMENSIONS.map(dim => ({
    id: dim,
    dimension: DIMENSION_LABELS[dim],
    xdsScore: xds.averages[dim],
    baselineScore: baseline.averages[dim],
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
    {
      key: 'delta',
      header: 'Delta',
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
        <XDSBadge
          variant={
            row.winner === 'xds'
              ? 'success'
              : row.winner === 'baseline'
                ? 'error'
                : 'neutral'
          }>
          {row.winner === 'xds'
            ? 'XDS'
            : row.winner === 'baseline'
              ? 'Baseline'
              : 'Tie'}
        </XDSBadge>
      ),
    },
  ];

  const allCategories = new Set([
    ...Object.keys(xds.byCategory),
    ...Object.keys(baseline.byCategory),
  ]);

  const catData: CatRow[] = [...allCategories].map(cat => {
    const xdsCat = xds.byCategory[cat] ?? {};
    const baseCat = baseline.byCategory[cat] ?? {};
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
    return {
      id: cat,
      category: cat,
      xdsOverall: xdsAvg,
      baselineOverall: baseAvg,
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
    {
      key: 'delta',
      header: 'Delta',
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
      <div {...stylex.props(styles.summaryGrid)}>
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
          />
        </XDSVStack>
      )}
    </XDSVStack>
  );
}
