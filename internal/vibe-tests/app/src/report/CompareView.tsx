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
import type {UniversalComparison, UniversalDimension} from './types';
import {ALL_DIMENSIONS, DIMENSION_LABELS, formatScore} from './utils';

const styles = stylex.create({
  section: {
    padding: spacingVars['--spacing-4'],
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacingVars['--spacing-4'],
  },
  winCard: {
    padding: spacingVars['--spacing-4'],
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

export function CompareView({comparison}: CompareViewProps) {
  const {xds, baseline, winners} = comparison;

  // Count wins
  let xdsWins = 0;
  let baselineWins = 0;
  let ties = 0;
  for (const dim of ALL_DIMENSIONS) {
    const w = winners[dim];
    if (w === 'xds') xdsWins++;
    else if (w === 'baseline') baselineWins++;
    else ties++;
  }

  // Dimension comparison rows
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

  // Category breakdown
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
    <XDSVStack gap="space6">
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
    </XDSVStack>
  );
}
