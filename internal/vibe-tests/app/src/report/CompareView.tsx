// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Table} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
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

type WinnerType = 'astryx' | 'astryx-tailwind' | 'baseline' | 'html' | 'tie';

interface CompareViewProps {
  comparison: UniversalComparison;
}

interface DimRow extends Record<string, unknown> {
  id: string;
  dimension: string;
  astryxScore: number;
  baselineScore: number;
  htmlScore?: number;
  astryxTailwindScore?: number;
  delta: number;
  winner: string;
}

interface CatRow extends Record<string, unknown> {
  id: string;
  category: string;
  astryxOverall: number;
  baselineOverall: number;
  htmlOverall?: number;
  astryxTailwindOverall?: number;
  delta: number;
}

interface CostRow extends Record<string, unknown> {
  id: string;
  metric: string;
  astryx: string;
  baseline: string;
  html?: string;
  astryxTailwind?: string;
  winner: string;
}

function costWinner(
  astryxVal: number,
  baseVal: number,
  lowerIsBetter: boolean,
  htmlVal?: number,
  twVal?: number,
): WinnerType {
  const entries: [WinnerType, number][] = [
    ['astryx', astryxVal],
    ['baseline', baseVal],
  ];
  if (htmlVal != null) {
    entries.push(['html', htmlVal]);
  }
  if (twVal != null) {
    entries.push(['astryx-tailwind', twVal]);
  }

  const best = lowerIsBetter
    ? Math.min(...entries.map(([, v]) => v))
    : Math.max(...entries.map(([, v]) => v));
  const atBest = entries.filter(([, v]) => v === best);
  if (atBest.length > 1) {
    return 'tie';
  }
  return atBest[0][0];
}

function winnerBadgeVariant(
  w: string,
): 'success' | 'error' | 'warning' | 'neutral' | 'info' {
  switch (w) {
    case 'astryx':
      return 'success';
    case 'baseline':
      return 'error';
    case 'html':
      return 'warning';
    case 'astryx-tailwind':
      return 'info';
    default:
      return 'neutral';
  }
}

function winnerLabel(w: string): string {
  switch (w) {
    case 'astryx':
      return 'Astryx';
    case 'baseline':
      return 'Baseline';
    case 'html':
      return 'HTML';
    case 'astryx-tailwind':
      return 'Astryx+TW';
    default:
      return 'Tie';
  }
}

function deltaClassName(delta: number): string {
  if (delta > 0) {
    return 'report-color-positive';
  }
  if (delta < 0) {
    return 'report-color-negative';
  }
  return 'report-color-neutral';
}

function CostComparisonSection({
  astryxCost,
  baselineCost,
  htmlCost,
  astryxTailwindCost,
}: {
  astryxCost: CostMetrics;
  baselineCost: CostMetrics;
  htmlCost?: CostMetrics;
  astryxTailwindCost?: CostMetrics;
}) {
  const isThreeWay = !!htmlCost;
  const isFourWay = !!astryxTailwindCost;
  const hasDuration =
    astryxCost.avgDurationMs > 0 || baselineCost.avgDurationMs > 0;

  const costData: CostRow[] = [
    ...(hasDuration
      ? [
          {
            id: 'duration',
            metric: 'Avg Duration',
            astryx: `${(astryxCost.avgDurationMs / 1000).toFixed(1)}s`,
            baseline: `${(baselineCost.avgDurationMs / 1000).toFixed(1)}s`,
            ...(isThreeWay
              ? {html: `${((htmlCost?.avgDurationMs ?? 0) / 1000).toFixed(1)}s`}
              : {}),
            ...(isFourWay
              ? {
                  astryxTailwind: `${((astryxTailwindCost?.avgDurationMs ?? 0) / 1000).toFixed(1)}s`,
                }
              : {}),
            winner: costWinner(
              astryxCost.avgDurationMs,
              baselineCost.avgDurationMs,
              true,
              htmlCost?.avgDurationMs,
              astryxTailwindCost?.avgDurationMs,
            ),
          },
        ]
      : []),
    {
      id: 'input-tokens',
      metric: 'Input Tokens',
      astryx: `~${astryxCost.estimatedInputTokens.toLocaleString()}`,
      baseline: `~${baselineCost.estimatedInputTokens.toLocaleString()}`,
      ...(isThreeWay
        ? {html: `~${htmlCost?.estimatedInputTokens.toLocaleString()}`}
        : {}),
      ...(isFourWay
        ? {
            astryxTailwind: `~${astryxTailwindCost?.estimatedInputTokens.toLocaleString()}`,
          }
        : {}),
      winner: costWinner(
        astryxCost.estimatedInputTokens,
        baselineCost.estimatedInputTokens,
        true,
        htmlCost?.estimatedInputTokens,
        astryxTailwindCost?.estimatedInputTokens,
      ),
    },
    {
      id: 'output-tokens',
      metric: 'Output Tokens',
      astryx: `~${astryxCost.estimatedOutputTokens.toLocaleString()}`,
      baseline: `~${baselineCost.estimatedOutputTokens.toLocaleString()}`,
      ...(isThreeWay
        ? {html: `~${htmlCost?.estimatedOutputTokens.toLocaleString()}`}
        : {}),
      ...(isFourWay
        ? {
            astryxTailwind: `~${astryxTailwindCost?.estimatedOutputTokens.toLocaleString()}`,
          }
        : {}),
      winner: costWinner(
        astryxCost.estimatedOutputTokens,
        baselineCost.estimatedOutputTokens,
        true,
        htmlCost?.estimatedOutputTokens,
        astryxTailwindCost?.estimatedOutputTokens,
      ),
    },
    {
      id: 'total-tokens',
      metric: 'Total Tokens',
      astryx: `~${(astryxCost.estimatedInputTokens + astryxCost.estimatedOutputTokens).toLocaleString()}`,
      baseline: `~${(baselineCost.estimatedInputTokens + baselineCost.estimatedOutputTokens).toLocaleString()}`,
      ...(isThreeWay
        ? {
            html: `~${((htmlCost?.estimatedInputTokens ?? 0) + (htmlCost?.estimatedOutputTokens ?? 0)).toLocaleString()}`,
          }
        : {}),
      ...(isFourWay
        ? {
            astryxTailwind: `~${((astryxTailwindCost?.estimatedInputTokens ?? 0) + (astryxTailwindCost?.estimatedOutputTokens ?? 0)).toLocaleString()}`,
          }
        : {}),
      winner: costWinner(
        astryxCost.estimatedInputTokens + astryxCost.estimatedOutputTokens,
        baselineCost.estimatedInputTokens + baselineCost.estimatedOutputTokens,
        true,
        htmlCost
          ? htmlCost.estimatedInputTokens + htmlCost.estimatedOutputTokens
          : undefined,
        astryxTailwindCost
          ? astryxTailwindCost.estimatedInputTokens +
              astryxTailwindCost.estimatedOutputTokens
          : undefined,
      ),
    },
    {
      id: 'output-lines',
      metric: 'Avg Output Lines',
      astryx: String(astryxCost.avgOutputLines),
      baseline: String(baselineCost.avgOutputLines),
      ...(isThreeWay ? {html: String(htmlCost?.avgOutputLines)} : {}),
      ...(isFourWay
        ? {astryxTailwind: String(astryxTailwindCost?.avgOutputLines)}
        : {}),
      winner: costWinner(
        astryxCost.avgOutputLines,
        baselineCost.avgOutputLines,
        true,
        htmlCost?.avgOutputLines,
        astryxTailwindCost?.avgOutputLines,
      ),
    },
    {
      id: 'docs-read',
      metric: 'Avg Docs Read',
      astryx: String(astryxCost.avgDocsRead),
      baseline: String(baselineCost.avgDocsRead),
      ...(isThreeWay ? {html: String(htmlCost?.avgDocsRead)} : {}),
      ...(isFourWay
        ? {astryxTailwind: String(astryxTailwindCost?.avgDocsRead)}
        : {}),
      winner: 'tie', // not inherently better or worse
    },
  ];

  const costColumns: TableColumn<CostRow>[] = [
    {key: 'metric', header: 'Metric'},
    {
      key: 'astryx',
      header: 'Astryx',
      renderCell: row => <Text type="body">{row.astryx}</Text>,
    },
    {
      key: 'baseline',
      header: 'Baseline',
      renderCell: row => <Text type="body">{row.baseline}</Text>,
    },
    ...(isThreeWay
      ? [
          {
            key: 'html' as const,
            header: 'HTML',
            renderCell: (row: CostRow) => (
              <Text type="body">{row.html ?? '—'}</Text>
            ),
          } satisfies TableColumn<CostRow>,
        ]
      : []),
    ...(isFourWay
      ? [
          {
            key: 'astryxTailwind' as const,
            header: 'Astryx+TW',
            renderCell: (row: CostRow) => (
              <Text type="body">{row.astryxTailwind ?? '—'}</Text>
            ),
          } satisfies TableColumn<CostRow>,
        ]
      : []),
    {
      key: 'winner',
      header: 'Lower Cost',
      renderCell: row => (
        <Badge
          variant={winnerBadgeVariant(row.winner)}
          label={row.winner === 'tie' ? '—' : winnerLabel(row.winner)}
        />
      ),
    },
  ];

  return (
    <Table<CostRow>
      data={costData}
      columns={costColumns}
      idKey="id"
      density="balanced"
      dividers="rows"
    />
  );
}

export function CompareView({comparison}: CompareViewProps) {
  const {astryx, baseline, html, astryxTailwind, winners} = comparison;
  const isThreeWay = !!html;
  const isFourWay = !!astryxTailwind;

  let astryxWins = 0;
  let baselineWins = 0;
  let htmlWins = 0;
  let astryxTailwindWins = 0;
  let ties = 0;
  for (const dim of ALL_DIMENSIONS) {
    const w = winners[dim];
    if (w === 'astryx') {
      astryxWins++;
    } else if (w === 'baseline') {
      baselineWins++;
    } else if (w === 'html') {
      htmlWins++;
    } else if (w === 'astryx-tailwind') {
      astryxTailwindWins++;
    } else {
      ties++;
    }
  }

  const dimData: DimRow[] = ALL_DIMENSIONS.filter(
    dim => astryx.averages[dim] != null || baseline.averages[dim] != null,
  ).map(dim => ({
    id: dim,
    dimension: DIMENSION_LABELS[dim],
    astryxScore: astryx.averages[dim] ?? 0,
    baselineScore: baseline.averages[dim] ?? 0,
    ...(isThreeWay ? {htmlScore: html?.averages[dim] ?? 0} : {}),
    ...(isFourWay
      ? {astryxTailwindScore: astryxTailwind?.averages[dim] ?? 0}
      : {}),
    delta: (astryx.averages[dim] ?? 0) - (baseline.averages[dim] ?? 0),
    winner: winners[dim],
  }));

  const dimColumns: TableColumn<DimRow>[] = [
    {key: 'dimension', header: 'Dimension'},
    {
      key: 'astryxScore',
      header: 'Astryx',
      renderCell: row => (
        <Text type="body">{formatScore(row.astryxScore)}</Text>
      ),
    },
    {
      key: 'baselineScore',
      header: 'Baseline',
      renderCell: row => (
        <Text type="body">{formatScore(row.baselineScore)}</Text>
      ),
    },
    ...(isThreeWay
      ? [
          {
            key: 'htmlScore' as const,
            header: 'HTML',
            renderCell: (row: DimRow) => (
              <Text type="body">
                {row.htmlScore != null ? formatScore(row.htmlScore) : '—'}
              </Text>
            ),
          } satisfies TableColumn<DimRow>,
        ]
      : []),
    ...(isFourWay
      ? [
          {
            key: 'astryxTailwindScore' as const,
            header: 'Astryx+TW',
            renderCell: (row: DimRow) => (
              <Text type="body">
                {row.astryxTailwindScore != null
                  ? formatScore(row.astryxTailwindScore)
                  : '—'}
              </Text>
            ),
          } satisfies TableColumn<DimRow>,
        ]
      : []),
    {
      key: 'delta',
      header: 'Delta (Astryx−Base)',
      renderCell: row => (
        <Text type="body" className={deltaClassName(row.delta)}>
          {row.delta > 0 ? '+' : ''}
          {formatScore(row.delta)}
        </Text>
      ),
    },
    {
      key: 'winner',
      header: 'Winner',
      renderCell: row => (
        <Badge
          variant={winnerBadgeVariant(row.winner)}
          label={winnerLabel(row.winner)}
        />
      ),
    },
  ];

  const allCategories = new Set([
    ...Object.keys(astryx.byCategory),
    ...Object.keys(baseline.byCategory),
    ...(html ? Object.keys(html.byCategory) : []),
    ...(astryxTailwind ? Object.keys(astryxTailwind.byCategory) : []),
  ]);

  const catData: CatRow[] = [...allCategories].map(cat => {
    const astryxCat = astryx.byCategory[cat] ?? {};
    const baseCat = baseline.byCategory[cat] ?? {};
    const htmlInit = {};
    const htmlCat =
      html?.byCategory[cat] ?? (htmlInit as Record<UniversalDimension, number>);
    const twInit = {};
    const twCat =
      astryxTailwind?.byCategory[cat] ??
      (twInit as Record<UniversalDimension, number>);
    const astryxAvg =
      CODE_DIMENSIONS.reduce(
        (s, d) => s + ((astryxCat[d as UniversalDimension] as number) ?? 0),
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
      astryxOverall: astryxAvg,
      baselineOverall: baseAvg,
      ...(htmlAvg != null ? {htmlOverall: htmlAvg} : {}),
      ...(twAvg != null ? {astryxTailwindOverall: twAvg} : {}),
      delta: astryxAvg - baseAvg,
    };
  });

  const catColumns: TableColumn<CatRow>[] = [
    {key: 'category', header: 'Category'},
    {
      key: 'astryxOverall',
      header: 'Astryx',
      renderCell: row => (
        <Text type="body">{formatScore(row.astryxOverall)}</Text>
      ),
    },
    {
      key: 'baselineOverall',
      header: 'Baseline',
      renderCell: row => (
        <Text type="body">{formatScore(row.baselineOverall)}</Text>
      ),
    },
    ...(isThreeWay
      ? [
          {
            key: 'htmlOverall' as const,
            header: 'HTML',
            renderCell: (row: CatRow) => (
              <Text type="body">
                {row.htmlOverall != null ? formatScore(row.htmlOverall) : '—'}
              </Text>
            ),
          } satisfies TableColumn<CatRow>,
        ]
      : []),
    ...(isFourWay
      ? [
          {
            key: 'astryxTailwindOverall' as const,
            header: 'Astryx+TW',
            renderCell: (row: CatRow) => (
              <Text type="body">
                {row.astryxTailwindOverall != null
                  ? formatScore(row.astryxTailwindOverall)
                  : '—'}
              </Text>
            ),
          } satisfies TableColumn<CatRow>,
        ]
      : []),
    {
      key: 'delta',
      header: 'Delta (Astryx−Base)',
      renderCell: row => (
        <Text type="body" className={deltaClassName(row.delta)}>
          {row.delta > 0 ? '+' : ''}
          {formatScore(row.delta)}
        </Text>
      ),
    },
  ];

  // Determine grid class based on number of win cards
  const winCardCount = 2 + (isThreeWay ? 1 : 0) + (isFourWay ? 1 : 0) + 1; // targets + ties
  const summaryGridClass =
    winCardCount >= 5
      ? 'report-compare-summaryGrid5'
      : winCardCount === 4
        ? 'report-compare-summaryGrid4'
        : 'report-compare-summaryGrid';

  return (
    <VStack gap={4}>
      <div className={summaryGridClass}>
        <Card>
          <div className="report-compare-winCard">
            <VStack gap={2}>
              <Text type="label">Astryx Wins</Text>
              <Heading level={2}>
                <span className="report-color-positive">{astryxWins}</span>
              </Heading>
            </VStack>
          </div>
        </Card>
        <Card>
          <div className="report-compare-winCard">
            <VStack gap={2}>
              <Text type="label">Baseline Wins</Text>
              <Heading level={2}>
                <span className="report-color-negative">{baselineWins}</span>
              </Heading>
            </VStack>
          </div>
        </Card>
        {isThreeWay && (
          <Card>
            <div className="report-compare-winCard">
              <VStack gap={2}>
                <Text type="label">HTML Wins</Text>
                <Heading level={2}>
                  <span className="report-color-warning">{htmlWins}</span>
                </Heading>
              </VStack>
            </div>
          </Card>
        )}
        {isFourWay && (
          <Card>
            <div className="report-compare-winCard">
              <VStack gap={2}>
                <Text type="label">Astryx+TW Wins</Text>
                <Heading level={2}>
                  <span className="report-color-info">
                    {astryxTailwindWins}
                  </span>
                </Heading>
              </VStack>
            </div>
          </Card>
        )}
        <Card>
          <div className="report-compare-winCard">
            <VStack gap={2}>
              <Text type="label">Ties</Text>
              <Heading level={2}>
                <span className="report-color-neutral">{ties}</span>
              </Heading>
            </VStack>
          </div>
        </Card>
      </div>

      <VStack gap={3}>
        <Heading level={3}>Dimension Comparison</Heading>
        <Table<DimRow>
          data={dimData}
          columns={dimColumns}
          idKey="id"
          density="balanced"
          dividers="rows"
        />
      </VStack>

      {catData.length > 0 && (
        <VStack gap={3}>
          <Heading level={3}>Category Breakdown</Heading>
          <Table<CatRow>
            data={catData}
            columns={catColumns}
            idKey="id"
            density="balanced"
            dividers="rows"
          />
        </VStack>
      )}

      {astryx.cost && baseline.cost && (
        <VStack gap={3}>
          <Heading level={3}>Cost Comparison</Heading>
          <CostComparisonSection
            astryxCost={astryx.cost}
            baselineCost={baseline.cost}
            htmlCost={html?.cost}
            astryxTailwindCost={astryxTailwind?.cost}
          />
        </VStack>
      )}
    </VStack>
  );
}
