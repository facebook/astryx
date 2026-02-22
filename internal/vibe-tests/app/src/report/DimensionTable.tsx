import {useState} from 'react';
import {XDSTable} from '@xds/core/Table';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSHStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import type {XDSTableColumn} from '@xds/core/Table/types';
import type {UniversalScore} from './types';
import {
  ALL_DIMENSIONS,
  DIMENSION_LABELS,
  computeOverall,
  formatScore,
  scoreToStatusVariant,
} from './utils';
import {CodeModal} from './CodeModal';

interface DimensionTableProps {
  byPrompt: Record<string, UniversalScore>;
  categories?: Record<string, string>;
  sourceCode?: Record<string, string>;
  baselineSourceCode?: Record<string, string>;
  baselineByPrompt?: Record<string, UniversalScore>;
}

interface RowData extends Record<string, unknown> {
  id: string;
  promptId: string;
  category: string;
  correctness: number;
  accessibility: number;
  codeQuality: number;
  efficiency: number;
  maintainability: number;
  overall: number;
  hasCode: boolean;
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

export function DimensionTable({
  byPrompt,
  categories,
  sourceCode,
  baselineSourceCode,
  baselineByPrompt,
}: DimensionTableProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const data: RowData[] = Object.entries(byPrompt).map(([promptId, score]) => ({
    id: promptId,
    promptId,
    category: categories?.[promptId] ?? '—',
    correctness: score.correctness.score,
    accessibility: score.accessibility.score,
    codeQuality: score.codeQuality.score,
    efficiency: score.efficiency.score,
    maintainability: score.maintainability.score,
    overall: computeOverall(score),
    hasCode: !!(sourceCode?.[promptId] || baselineSourceCode?.[promptId]),
  }));

  const columns: XDSTableColumn<RowData>[] = [
    {
      key: 'promptId',
      header: 'Prompt',
      renderCell: row =>
        row.hasCode ? (
          <XDSButton
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPrompt(row.promptId)}>
            {row.promptId}
          </XDSButton>
        ) : (
          <XDSText type="body">{row.promptId}</XDSText>
        ),
    },
    {key: 'category', header: 'Category'},
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
    <>
      <XDSTable<RowData>
        data={data}
        columns={columns}
        idKey="id"
        density="compact"
        dividers="rows"
        isStriped
      />
      {selectedPrompt && (
        <CodeModal
          isShown={!!selectedPrompt}
          onHide={() => setSelectedPrompt(null)}
          promptId={selectedPrompt}
          xdsCode={sourceCode?.[selectedPrompt]}
          baselineCode={baselineSourceCode?.[selectedPrompt]}
          xdsScore={byPrompt[selectedPrompt]}
          baselineScore={baselineByPrompt?.[selectedPrompt]}
        />
      )}
    </>
  );
}
