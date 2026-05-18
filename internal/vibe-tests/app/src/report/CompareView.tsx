// Copyright (c) Meta Platforms, Inc. and affiliates.

import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTable} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import type {
  UniversalComparison,
  UniversalDimension,
  CostMetrics,
} from './types';
import {
  ALL_DIMENSIONS,
  CODE_DIMENSIONS,
  DIMENSION_LABELS,
  formatScore,
} from './utils';
import './report.css';

type WinnerType = 'xds' | 'xds-tailwind' | 'baseline' | 'html' | 'tie';

interface CompareViewProps {
  comparison: UniversalComparison;
}

interface DimRow extends Record<string, unknown> {
  id: string;
  dimension: string;
  xdsScore: number;
  baselineScore: number;
  htmlScore?: number;
  xdsTailwindScore?: number;
  delta: number;
  winner: string;
}

interface CatRow extends Record<string, unknown> {
  id: string;
  category: string;
  xdsOverall: number;
  baselineOverall: number;
  htmlOverall?: number;
  xdsTailwindOverall?: number;
  delta: number;
}

interface CostRow extends Record<string, unknown> {
  id: string;
  metric: string;
  xds: string;
  baseline: string;
  html?: string;
  xdsTailwind?: string;
  winner: string;
}

function costWinner(
  xdsVal: number,
  baseVal: number,
  lowerIsBetter: boolean,
  htmlVal?: number,
  twVal?: number,
): WinnerType {
  const entries: [WinnerType, number][] = [
    ['xds', xdsVal],
    ['baseline', baseVal],
  ];
  if (htmlVal != null) entries.push(['html', htmlVal]);
  if (twVal != null) entries.push(['xds-tailwind', twVal]);

  const best = lowerIsBetter
    ? Math.min(...entries.map(([, v]) => v))
    : Math.max(...entries.map(([, v]) => v));
  const atBest = entries.filter(([, v]) => v === best);
  if (atBest.length > 1) return 'tie';
  return atBest[0][0];
}

function winnerBadgeVariant(
  w: string,
): 'success' | 'error' | 'warning' | 'neutral' | 'info' {
  switch (w) {
    case 'xds':
      return 'success';
    case 'baseline':
      return 'error';
    case 'html':
      return 'warning';
    case 'xds-tailwind':
      return 'info';
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
    case 'xds-tailwind':
      return 'XDS+TW';
    default:
      return 'Tie';
  }
}

function deltaClassName(delta: number): string {
  if (delta > 0) return 'report-color-positive';
  if (delta < 0) return 'report-color-negative';
  return 'report-color-neutral';
}

function CostComparisonSection({
  xdsCost,
  baselineCost,
  htmlCost,
  xdsTailwindCost,
}: {
  xdsCost: CostMetrics;
  baselineCost: CostMetrics;
  htmlCost?: CostMetrics;
  xdsTailwindCost?: CostMetrics;
}) {
  const isThreeWay = !!htmlCost;
  const isFourWay = !!xdsTailwindCost;
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
            ...(isFourWay
              ? {
                  xdsTailwind: `${(xdsTailwindCost!.avgDurationMs / 1000).toFixed(1)}s`,
                }
              : {}),
            winner: costWinner(
              xdsCost.avgDurationMs,
              baselineCost.avgDurationMs,
              true,
              htmlCost?.avgDurationMs,
              xdsTailwindCost?.avgDurationMs,
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
      ...(isFourWay
        ? {
            xdsTailwind: `~${xdsTailwindCost!.estimatedInputTokens.toLocaleString()}`,
          }
        : {}),
      winner: costWinner(
        xdsCost.estimatedInputTokens,
        baselineCost.estimatedInputTokens,
        true,
        htmlCost?.estimatedInputTokens,
        xdsTailwindCost?.estimatedInputTokens,
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
      ...(isFourWay
        ? {
            xdsTailwind: `~${xdsTailwindCost!.estimatedOutputTokens.toLocaleString()}`,
          }
        : {}),
      winner: costWinner(
        xdsCost.estimatedOutputTokens,
        baselineCost.estimatedOutputTokens,
        true,
        htmlCost?.estimatedOutputTokens,
        xdsTailwindCost?.estimatedOutputTokens,
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
      ...(isFourWay
        ? {
            xdsTailwind: `~${(xdsTailwindCost!.estimatedInputTokens + xdsTailwindCost!.estimatedOutputTokens).toLocaleString()}`,
          }
        : {}),
      winner: costWinner(
        xdsCost.estimatedInputTokens + xdsCost.estimatedOutputTokens,
        baselineCost.estimatedInputTokens + baselineCost.estimatedOutputTokens,
        true,
        htmlCost
          ? htmlCost.estimatedInputTokens + htmlCost.estimatedOutputTokens
          : undefined,
        xdsTailwindCost
          ? xdsTailwindCost.estimatedInputTokens +
              xdsTailwindCost.estimatedOutputTokens
          : undefined,
      ),
    },
    {
      id: 'output-lines',
      metric: 'Avg Output Lines',
      xds: String(xdsCost.avgOutputLines),
      baseline: String(baselineCost.avgOutputLines),
      ...(isThreeWay ? {html: String(htmlCost!.avgOutputLines)} : {}),
      ...(isFourWay
        ? {xdsTailwind: String(xdsTailwindCost!.avgOutputLines)}
        : {}),
      winner: costWinner(
        xdsCost.avgOutputLines,
        baselineCost.avgOutputLines,
        true,
        htmlCost?.avgOutputLines,
        xdsTailwindCost?.avgOutputLines,
      ),
    },
    {
      id: 'docs-read',
      metric: 'Avg Docs Read',
      xds: String(xdsCost.avgDocsRead),
      baseline: String(baselineCost.avgDocsRead),
      ...(isThreeWay ? {html: String(htmlCost!.avgDocsRead)} : {}),
      ...(isFourWay
        ? {xdsTailwind: String(xdsTailwindCost!.avgDocsRead)}
        : {}),
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
    ...(isFourWay
      ? [
          {
            key: 'xdsTailwind' as const,
            header: 'XDS+TW',
            renderCell: (row: CostRow) => (
              <XDSText type="body">{row.xdsTailwind ?? '—'}</XDSText>
            ),
          } satisfies XDSTableColumn<CostRow>,
        ]
      : []),
    {
      key: 'winner',
      header: 'Lower Cost',
      renderCell: row => (
        <XDSBadge
          variant={winnerBadgeVariant(row.winner)}
          label={row.winner === 'tie' ? '—' : winnerLabel(row.winner)}
        />
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
  const {xds, baseline, html, xdsTailwind, winners} = comparison;
  const isThreeWay = !!html;
  const isFourWay = !!xdsTailwind;

  let xdsWins = 0;
  let baselineWins = 0;
  let htmlWins = 0;
  let xdsTailwindWins = 0;
  let ties = 0;
  for (const dim of ALL_DIMENSIONS) {
    const w = winners[dim];
    if (w === 'xds') xdsWins++;
    else if (w === 'baseline') baselineWins++;
    else if (w === 'html') htmlWins++;
    else if (w === 'xds-tailwind') xdsTailwindWins++;
    else ties++;
  }

  const dimData: DimRow[] = ALL_DIMENSIONS.filter(
    dim => xds.averages[dim] != null || baseline.averages[dim] != null,
  ).map(dim => ({
    id: dim,
    dimension: DIMENSION_LABELS[dim],
    xdsScore: xds.averages[dim] ?? 0,
    baselineScore: baseline.averages[dim] ?? 0,
    ...(isThreeWay ? {htmlScore: html!.averages[dim] ?? 0} : {}),
    ...(isFourWay ? {xdsTailwindScore: xdsTailwind!.averages[dim] ?? 0} : {}),
    delta: (xds.averages[dim] ?? 0) - (baseline.averages[dim] ?? 0),
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
    ...(isFourWay
      ? [
          {
            key: 'xdsTailwindScore' as const,
            header: 'XDS+TW',
            renderCell: (row: DimRow) => (
              <XDSText type="body">
                {row.xdsTailwindScore != null
                  ? formatScore(row.xdsTailwindScore)
                  : '—'}
              </XDSText>
            ),
          } satisfies XDSTableColumn<DimRow>,
        ]
      : []),
    {
      key: 'delta',
      header: 'Delta (XDS−Base)',
      renderCell: row => (
        <XDSText type="body" className={deltaClassName(row.delta)}>
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
          variant={winnerBadgeVariant(row.winner)}
          label={winnerLabel(row.winner)}
        />
      ),
    },
  ];

  const allCategories = new Set([
    ...Object.keys(xds.byCategory),
    ...Object.keys(baseline.byCategory),
    ...(html ? Object.keys(html.byCategory) : []),
    ...(xdsTailwind ? Object.keys(xdsTailwind.byCategory) : []),
  ]);

  const catData: CatRow[] = [...allCategories].map(cat => {
    const xdsCat = xds.byCategory[cat] ?? {};
    const baseCat = baseline.byCategory[cat] ?? {};
    const htmlCat =
      html?.byCategory[cat] ?? ({} as Record<UniversalDimension, number>);
    const twCat =
      xdsTailwind?.byCategory[cat] ??
      ({} as Record<UniversalDimension, number>);
    const xdsAvg =
      CODE_DIMENSIONS.reduce(
        (s, d) => s + ((xdsCat[d as UniversalDimension] as number) ?? 0),
        0,
      ) / CODE_DIMENSIONS.length;
    const baseAvg =
      CODE_DIMENSIONS.reduce(
        (s, d) => s + ((baseCat[d as UniversalDimension] as number) ?? 0),
        0,
      ) / CODE_DIMENSIONS.length;
    const htmlAvg = isThreeWay
      ? CODE_DIMENSIONS.reduce(
          (s, d) => s + ((htmlCat[d as UniversalDimension] as number) ?? 0),
          0,
        ) / CODE_DIMENSIONS.length
      : undefined;
    const twAvg = isFourWay
      ? CODE_DIMENSIONS.reduce(
          (s, d) => s + ((twCat[d as UniversalDimension] as number) ?? 0),
          0,
        ) / CODE_DIMENSIONS.length
      : undefined;
    return {
      id: cat,
      category: cat,
      xdsOverall: xdsAvg,
      baselineOverall: baseAvg,
      ...(htmlAvg != null ? {htmlOverall: htmlAvg} : {}),
      ...(twAvg != null ? {xdsTailwindOverall: twAvg} : {}),
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
    ...(isFourWay
      ? [
          {
            key: 'xdsTailwindOverall' as const,
            header: 'XDS+TW',
            renderCell: (row: CatRow) => (
              <XDSText type="body">
                {row.xdsTailwindOverall != null
                  ? formatScore(row.xdsTailwindOverall)
                  : '—'}
              </XDSText>
            ),
          } satisfies XDSTableColumn<CatRow>,
        ]
      : []),
    {
      key: 'delta',
      header: 'Delta (XDS−Base)',
      renderCell: row => (
        <XDSText type="body" className={deltaClassName(row.delta)}>
          {row.delta > 0 ? '+' : ''}
          {formatScore(row.delta)}
        </XDSText>
      ),
    },
  ];

  // Determine grid class based on number of win cards
  const winCardCount =
    2 + (isThreeWay ? 1 : 0) + (isFourWay ? 1 : 0) + 1; // targets + ties
  const summaryGridClass =
    winCardCount >= 5
      ? 'report-compare-summaryGrid5'
      : winCardCount === 4
        ? 'report-compare-summaryGrid4'
        : 'report-compare-summaryGrid';

  return (
    <XDSVStack gap={4}>
      <div className={summaryGridClass}>
        <XDSCard>
          <div className="report-compare-winCard">
            <XDSVStack gap={2}>
              <XDSText type="label">XDS Wins</XDSText>
              <XDSHeading level={2}>
                <span className="report-color-positive">{xdsWins}</span>
              </XDSHeading>
            </XDSVStack>
          </div>
        </XDSCard>
        <XDSCard>
          <div className="report-compare-winCard">
            <XDSVStack gap={2}>
              <XDSText type="label">Baseline Wins</XDSText>
              <XDSHeading level={2}>
                <span className="report-color-negative">{baselineWins}</span>
              </XDSHeading>
            </XDSVStack>
          </div>
        </XDSCard>
        {isThreeWay && (
          <XDSCard>
            <div className="report-compare-winCard">
              <XDSVStack gap={2}>
                <XDSText type="label">HTML Wins</XDSText>
                <XDSHeading level={2}>
                  <span className="report-color-warning">{htmlWins}</span>
                </XDSHeading>
              </XDSVStack>
            </div>
          </XDSCard>
        )}
        {isFourWay && (
          <XDSCard>
            <div className="report-compare-winCard">
              <XDSVStack gap={2}>
                <XDSText type="label">XDS+TW Wins</XDSText>
                <XDSHeading level={2}>
                  <span className="report-color-info">{xdsTailwindWins}</span>
                </XDSHeading>
              </XDSVStack>
            </div>
          </XDSCard>
        )}
        <XDSCard>
          <div className="report-compare-winCard">
            <XDSVStack gap={2}>
              <XDSText type="label">Ties</XDSText>
              <XDSHeading level={2}>
                <span className="report-color-neutral">{ties}</span>
              </XDSHeading>
            </XDSVStack>
          </div>
        </XDSCard>
      </div>

      <XDSVStack gap={3}>
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
        <XDSVStack gap={3}>
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
        <XDSVStack gap={3}>
          <XDSHeading level={3}>Cost Comparison</XDSHeading>
          <CostComparisonSection
            xdsCost={xds.cost}
            baselineCost={baseline.cost}
            htmlCost={html?.cost}
            xdsTailwindCost={xdsTailwind?.cost}
          />
        </XDSVStack>
      )}
    </XDSVStack>
  );
}
