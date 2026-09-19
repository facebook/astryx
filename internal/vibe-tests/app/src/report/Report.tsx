// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {VStack} from '@astryxdesign/core/Stack';
import {HStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Text';
import {TabList} from '@astryxdesign/core/TabList';
import {Tab} from '@astryxdesign/core/TabList';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {neutralTheme} from '@astryxdesign/theme-neutral';
import type {ReportData} from './types';
import {ALL_DIMENSIONS, DIMENSION_LABELS} from './utils';
import {ScoreCard} from './ScoreCard';
import {DimensionTable} from './DimensionTable';
import {PromptDetailCard} from './PromptDetailCard';
import {CodeModal} from './CodeModal';
import {CompareView} from './CompareView';
import {ScreenshotGallery} from './ScreenshotGallery';
import './report.css';

function MetricValue({label, value}: {label: string; value: string}) {
  return (
    <div className="report-metricItem">
      <VStack gap={1}>
        <Text type="label">{label}</Text>
        <Heading level={3}>{value}</Heading>
      </VStack>
    </div>
  );
}

function EfficiencyMetricsCard({
  byPrompt,
}: {
  byPrompt: ReportData['universal']['byPrompt'];
}) {
  const entries = Object.values(byPrompt);
  if (entries.length === 0) {
    return null;
  }

  const metrics = entries.map(s => s.efficiency.metrics).filter(Boolean);
  if (metrics.length === 0) {
    return null;
  }

  const avgDecisions =
    metrics.reduce((s, m) => s + (m?.decisionsPerElement ?? 0), 0) /
    metrics.length;
  const avgLines =
    metrics.reduce((s, m) => s + (m?.codeLines ?? 0), 0) / metrics.length;
  const avgStylingRatio =
    metrics.reduce((s, m) => s + (m?.stylingRatio ?? 0), 0) / metrics.length;
  const avgBoilerplate =
    metrics.reduce((s, m) => s + (m?.boilerplateRatio ?? 0), 0) /
    metrics.length;

  return (
    <Card>
      <div className="report-metricsCard">
        <VStack gap={2}>
          <Heading level={4}>Efficiency Metrics</Heading>
          <div className="report-metricsGrid">
            <MetricValue
              label="Decisions / Element"
              value={avgDecisions.toFixed(1)}
            />
            <MetricValue
              label="Avg Code Lines"
              value={String(Math.round(avgLines))}
            />
            <MetricValue
              label="Styling Ratio"
              value={`${(avgStylingRatio * 100).toFixed(1)}%`}
            />
            <MetricValue
              label="Boilerplate"
              value={`${(avgBoilerplate * 100).toFixed(1)}%`}
            />
          </div>
        </VStack>
      </div>
    </Card>
  );
}

function MaintainabilityMetricsCard({
  byPrompt,
}: {
  byPrompt: ReportData['universal']['byPrompt'];
}) {
  const entries = Object.values(byPrompt);
  if (entries.length === 0) {
    return null;
  }

  const metrics = entries.map(s => s.maintainability.metrics).filter(Boolean);
  if (metrics.length === 0) {
    return null;
  }

  const avgSemantic =
    metrics.reduce((s, m) => s + (m?.semanticRatio ?? 0), 0) / metrics.length;
  const totalMagic = metrics.reduce((s, m) => s + (m?.magicValueCount ?? 0), 0);
  const darkModeCount = metrics.filter(m => m?.darkModeSupport).length;

  return (
    <Card>
      <div className="report-metricsCard">
        <VStack gap={2}>
          <Heading level={4}>Maintainability Metrics</Heading>
          <div className="report-metricsGrid">
            <MetricValue
              label="Semantic Ratio"
              value={`${(avgSemantic * 100).toFixed(0)}%`}
            />
            <MetricValue label="Magic Values" value={String(totalMagic)} />
            <MetricValue
              label="Dark Mode"
              value={`${darkModeCount}/${entries.length}`}
            />
          </div>
        </VStack>
      </div>
    </Card>
  );
}

function CostMetricsCard({cost}: {cost: ReportData['universal']['cost']}) {
  if (!cost) {
    return null;
  }

  return (
    <Card>
      <div className="report-metricsCard">
        <VStack gap={2}>
          <Heading level={4}>Cost</Heading>
          <div className="report-metricsGrid">
            {cost.avgDurationMs > 0 && (
              <MetricValue
                label="Avg Duration"
                value={`${(cost.avgDurationMs / 1000).toFixed(1)}s`}
              />
            )}
            <MetricValue
              label="Avg Output"
              value={`${cost.avgOutputLines} lines`}
            />
            <MetricValue label="Docs Read" value={String(cost.avgDocsRead)} />
            <MetricValue
              label="Input Tokens"
              value={`~${cost.estimatedInputTokens.toLocaleString()}`}
            />
            <MetricValue
              label="Output Tokens"
              value={`~${cost.estimatedOutputTokens.toLocaleString()}`}
            />
          </div>
        </VStack>
      </div>
    </Card>
  );
}

export function Report() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState('overview');
  const [codeModal, setCodeModal] = useState<{
    promptId: string;
    target: 'astryx' | 'baseline' | 'html' | 'astryx-tailwind';
  } | null>(null);

  const data: ReportData | undefined = window.__REPORT_DATA__;

  const hasScreenshots =
    data?.screenshots && Object.keys(data.screenshots).length > 0;

  if (!data) {
    return (
      <Theme theme={neutralTheme} mode={themeMode}>
        <div className="report-root">
          <div className="report-container">
            <div className="report-emptyState">
              <VStack gap={4}>
                <Heading level={2}>No Report Data</Heading>
                <Text type="body">
                  No report data found. Run the vibe test harness to generate a
                  report.
                </Text>
              </VStack>
            </div>
          </div>
        </div>
      </Theme>
    );
  }

  const {universal, comparison, screenshots} = data;

  return (
    <Theme theme={neutralTheme} mode={themeMode}>
      <div className="report-root">
        <div className="report-container">
          <VStack gap={5}>
            {/* Header */}
            <div className="report-header">
              <HStack gap={4} hAlign="between" vAlign="center">
                <VStack gap={1}>
                  <Heading level={1}>Vibe Test Report</Heading>
                  {data.target && (
                    <Text type="supporting">Target: {data.target}</Text>
                  )}
                  {data.iterationId && (
                    <Text type="supporting">Iteration: {data.iterationId}</Text>
                  )}
                </VStack>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setThemeMode(m => (m === 'light' ? 'dark' : 'light'))
                  }
                  label={themeMode === 'light' ? '🌙 Dark' : '☀️ Light'}
                />
              </HStack>
            </div>

            {/* Tabs */}
            <TabList value={activeTab} onChange={setActiveTab} hasDivider>
              <Tab value="overview" label="Overview" />
              <Tab value="byPrompt" label="By Prompt" />
              {hasScreenshots && (
                <Tab value="screenshots" label="Screenshots" />
              )}
            </TabList>

            {/* Tab Content */}
            <div className="report-tabContent">
              {activeTab === 'overview' && (
                <VStack gap={4}>
                  {/* Overall score */}
                  <ScoreCard
                    label="Overall Score"
                    score={universal.overall}
                    compareScore={comparison?.baseline.overall}
                    compareLabel="Baseline"
                  />
                  {comparison?.html && (
                    <ScoreCard
                      label="Overall Score vs HTML"
                      score={universal.overall}
                      compareScore={comparison.html.overall}
                      compareLabel="HTML"
                    />
                  )}
                  {comparison?.astryxTailwind && (
                    <ScoreCard
                      label="Overall Score vs Astryx+TW"
                      score={universal.overall}
                      compareScore={comparison.astryxTailwind.overall}
                      compareLabel="Astryx+TW"
                    />
                  )}

                  {/* Dimension scores grid */}
                  <VStack gap={3}>
                    <Heading level={3}>Dimensions</Heading>
                    <div className="report-scoreGrid">
                      {ALL_DIMENSIONS.filter(
                        dim => universal.averages[dim] != null,
                      ).map(dim => (
                        <ScoreCard
                          key={dim}
                          label={DIMENSION_LABELS[dim]}
                          score={universal.averages[dim]}
                          compareScore={comparison?.baseline.averages[dim]}
                          compareLabel="Baseline"
                        />
                      ))}
                    </div>
                  </VStack>

                  {/* Sub-metrics */}
                  <EfficiencyMetricsCard byPrompt={universal.byPrompt} />
                  <MaintainabilityMetricsCard byPrompt={universal.byPrompt} />
                  <CostMetricsCard cost={universal.cost} />

                  {/* Comparison view */}
                  {comparison && (
                    <VStack gap={3}>
                      <Heading level={3}>
                        {[
                          'Astryx',
                          'Baseline',
                          comparison.html ? 'HTML' : null,
                          comparison.astryxTailwind ? 'Astryx+TW' : null,
                        ]
                          .filter(Boolean)
                          .join(' vs ')}{' '}
                        Comparison
                      </Heading>
                      <CompareView comparison={comparison} />
                    </VStack>
                  )}
                </VStack>
              )}

              {activeTab === 'byPrompt' && (
                <VStack gap={4}>
                  <DimensionTable byPrompt={universal.byPrompt} />

                  {/* Per-prompt detail cards */}
                  <VStack gap={3}>
                    <Heading level={3}>Prompt Details</Heading>
                    {Object.keys(universal.byPrompt).map(promptId => (
                      <PromptDetailCard
                        key={promptId}
                        promptId={promptId}
                        promptText={data.prompts?.[promptId]}
                        astryxScore={universal.byPrompt[promptId]}
                        baselineScore={comparison?.baseline.byPrompt[promptId]}
                        htmlScore={comparison?.html?.byPrompt[promptId]}
                        astryxTailwindScore={
                          comparison?.astryxTailwind?.byPrompt[promptId]
                        }
                        hasXdsCode={!!data.sourceCode?.[promptId]}
                        hasBaselineCode={!!data.baselineSourceCode?.[promptId]}
                        hasHtmlCode={!!data.htmlSourceCode?.[promptId]}
                        hasXdsTailwindCode={
                          !!data.astryxTailwindSourceCode?.[promptId]
                        }
                        onViewCode={target => setCodeModal({promptId, target})}
                        previewUrls={data.previews?.[promptId]}
                      />
                    ))}
                  </VStack>
                </VStack>
              )}

              {/* Code modal */}
              {codeModal &&
                (() => {
                  const code =
                    codeModal.target === 'astryx'
                      ? data.sourceCode?.[codeModal.promptId]
                      : codeModal.target === 'baseline'
                        ? data.baselineSourceCode?.[codeModal.promptId]
                        : codeModal.target === 'astryx-tailwind'
                          ? data.astryxTailwindSourceCode?.[codeModal.promptId]
                          : data.htmlSourceCode?.[codeModal.promptId];
                  return code ? (
                    <CodeModal
                      isOpen
                      onHide={() => setCodeModal(null)}
                      promptId={codeModal.promptId}
                      target={codeModal.target}
                      code={code}
                    />
                  ) : null;
                })()}

              {activeTab === 'screenshots' && screenshots && (
                <ScreenshotGallery screenshots={screenshots} />
              )}
            </div>
          </VStack>
        </div>
      </div>
    </Theme>
  );
}
