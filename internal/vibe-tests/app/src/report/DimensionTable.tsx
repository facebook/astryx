import {XDSTable} from '@xds/core/Table';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSHStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import type {XDSTableColumn} from '@xds/core/Table/types';
import type {UniversalScore} from './types';
import {
  ALL_DIMENSIONS,
  DIMENSION_LABELS,
  computeOverall,
  formatScore,
  scoreToStatusVariant,
} from './utils';

interface DimensionTableProps {
  byPrompt: Record<string, UniversalScore>;
}

interface RowData extends Record<string, unknown> {
  id: string;
  promptId: string;
  correctness: number;
  accessibility: number;
  codeQuality: number;
  efficiency: number;
  maintainability: number;
  overall: number;
}

function ScoreCell({score}: {score: number}) {
  return (
    <XDSHStack gap="space1" hAlign="center">
      <XDSStatusDot
        variant={scoreToStatusVariant(score)}
        label={`Score: ${formatScore(score)}`}
        size="sm"
      />
      <XDSText type="body">{formatScore(score)}</XDSText>
    </XDSHStack>
  );
}

export function DimensionTable({byPrompt}: DimensionTableProps) {
  const data: RowData[] = Object.entries(byPrompt).map(([promptId, score]) => ({
    id: promptId,
    promptId,
    correctness: score.correctness.score,
    accessibility: score.accessibility.score,
    codeQuality: score.codeQuality.score,
    efficiency: score.efficiency.score,
    maintainability: score.maintainability.score,
    overall: computeOverall(score),
  }));

  const columns: XDSTableColumn<RowData>[] = [
    {
      key: 'promptId',
      header: 'Prompt',
      renderCell: row => <XDSText type="body">{row.promptId}</XDSText>,
    },
    ...ALL_DIMENSIONS.map(
      (dim): XDSTableColumn<RowData> => ({
        key: dim,
        header: DIMENSION_LABELS[dim],
        renderCell: row => <ScoreCell score={row[dim] as number} />,
      }),
    ),
    {
      key: 'overall',
      header: 'Overall',
      renderCell: row => <ScoreCell score={row.overall} />,
    },
  ];

  return (
    <XDSTable<RowData>
      data={data}
      columns={columns}
      idKey="id"
      density="compact"
      dividers="rows"
      isStriped
    />
  );
}
