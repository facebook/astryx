import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSTheme} from '@xds/core/theme';
import {XDSVStack} from '@xds/core/Stack';
import {XDSHStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSTabList} from '@xds/core/TabList';
import {XDSTab} from '@xds/core/TabList';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {defaultTheme} from '@xds/theme/default';
import {spacingVars, colorVars} from '@xds/core/theme/tokens.stylex';
import type {ReportData} from './types';
import {ALL_DIMENSIONS, DIMENSION_LABELS} from './utils';
import {ScoreCard} from './ScoreCard';
import {DimensionTable} from './DimensionTable';
import {PromptDetailCard} from './PromptDetailCard';
import {CodeModal} from './CodeModal';
import {CompareView} from './CompareView';
import {ScreenshotGallery} from './ScreenshotGallery';

const styles = stylex.create({
  root: {
    minHeight: '100vh',
    backgroundColor: colorVars['--color-wash'],
  },
  container: {
    maxWidth: '1200px',
    marginInline: 'auto',
    padding: spacingVars['--spacing-5'],
  },
  header: {
    paddingBlock: spacingVars['--spacing-3'],
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: spacingVars['--spacing-3'],
  },
  metricsCard: {
    padding: spacingVars['--spacing-3'],
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: spacingVars['--spacing-3'],
  },
  metricItem: {
    textAlign: 'center',
  },
  tabContent: {
    paddingBlockStart: spacingVars['--spacing-3'],
  },
  emptyState: {
    padding: spacingVars['--spacing-8'],
    textAlign: 'center',
  },
});

function MetricValue({label, value}: {label: string; value: string}) {
  return (
    <div {...stylex.props(styles.metricItem)}>
      <XDSVStack gap="space1">
        <XDSText type="label">{label}</XDSText>
        <XDSHeading level={3}>{value}</XDSHeading>
      </XDSVStack>
    </div>
  );
}

function EfficiencyMetricsCard({
  byPrompt,
}: {
  byPrompt: ReportData['universal']['byPrompt'];
}) {
  const entries = Object.values(byPrompt);
  if (entries.length === 0) return null;

  const metrics = entries.map(s => s.efficiency.metrics).filter(Boolean);
  if (metrics.length === 0) return null;

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
    <XDSCard>
      <div {...stylex.props(styles.metricsCard)}>
        <XDSVStack gap="space2">
          <XDSHeading level={4}>Efficiency Metrics</XDSHeading>
          <div {...stylex.props(styles.metricsGrid)}>
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
        </XDSVStack>
      </div>
    </XDSCard>
  );
}

function MaintainabilityMetricsCard({
  byPrompt,
}: {
  byPrompt: ReportData['universal']['byPrompt'];
}) {
  const entries = Object.values(byPrompt);
  if (entries.length === 0) return null;

  const metrics = entries.map(s => s.maintainability.metrics).filter(Boolean);
  if (metrics.length === 0) return null;

  const avgSemantic =
    metrics.reduce((s, m) => s + (m?.semanticRatio ?? 0), 0) / metrics.length;
  const totalMagic = metrics.reduce((s, m) => s + (m?.magicValueCount ?? 0), 0);
  const darkModeCount = metrics.filter(m => m?.darkModeSupport).length;

  return (
    <XDSCard>
      <div {...stylex.props(styles.metricsCard)}>
        <XDSVStack gap="space2">
          <XDSHeading level={4}>Maintainability Metrics</XDSHeading>
          <div {...stylex.props(styles.metricsGrid)}>
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
        </XDSVStack>
      </div>
    </XDSCard>
  );
}

function CostMetricsCard({cost}: {cost: ReportData['universal']['cost']}) {
  if (!cost) return null;

  return (
    <XDSCard>
      <div {...stylex.props(styles.metricsCard)}>
        <XDSVStack gap="space2">
          <XDSHeading level={4}>Cost</XDSHeading>
          <div {...stylex.props(styles.metricsGrid)}>
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
        </XDSVStack>
      </div>
    </XDSCard>
  );
}

export function Report() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState('overview');
  const [codeModal, setCodeModal] = useState<{
    promptId: string;
    target: 'xds' | 'baseline' | 'html';
  } | null>(null);

  const data: ReportData | undefined = window.__REPORT_DATA__;

  const hasScreenshots =
    data?.screenshots && Object.keys(data.screenshots).length > 0;

  if (!data) {
    return (
      <XDSTheme theme={defaultTheme} mode={themeMode}>
        <div {...stylex.props(styles.root)}>
          <div {...stylex.props(styles.container)}>
            <div {...stylex.props(styles.emptyState)}>
              <XDSVStack gap="space4">
                <XDSHeading level={2}>No Report Data</XDSHeading>
                <XDSText type="body">
                  No report data found. Run the vibe test harness to generate a
                  report.
                </XDSText>
              </XDSVStack>
            </div>
          </div>
        </div>
      </XDSTheme>
    );
  }

  const {universal, comparison, screenshots} = data;

  return (
    <XDSTheme theme={defaultTheme} mode={themeMode}>
      <div {...stylex.props(styles.root)}>
        <div {...stylex.props(styles.container)}>
          <XDSVStack gap="space5">
            {/* Header */}
            <div {...stylex.props(styles.header)}>
              <XDSHStack gap="space4" hAlign="between" vAlign="center">
                <XDSVStack gap="space1">
                  <XDSHeading level={1}>Vibe Test Report</XDSHeading>
                  {data.target && (
                    <XDSText type="supporting">Target: {data.target}</XDSText>
                  )}
                  {data.iterationId && (
                    <XDSText type="supporting">
                      Iteration: {data.iterationId}
                    </XDSText>
                  )}
                </XDSVStack>
                <XDSButton
                  variant="secondary"
                  onClick={() =>
                    setThemeMode(m => (m === 'light' ? 'dark' : 'light'))
                  }>
                  {themeMode === 'light' ? '🌙 Dark' : '☀️ Light'}
                </XDSButton>
              </XDSHStack>
            </div>

            {/* Tabs */}
            <XDSTabList value={activeTab} onChange={setActiveTab} hasDivider>
              <XDSTab value="overview" label="Overview" />
              <XDSTab value="byPrompt" label="By Prompt" />
              {hasScreenshots && (
                <XDSTab value="screenshots" label="Screenshots" />
              )}
            </XDSTabList>

            {/* Tab Content */}
            <div {...stylex.props(styles.tabContent)}>
              {activeTab === 'overview' && (
                <XDSVStack gap="space4">
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

                  {/* Dimension scores grid */}
                  <XDSVStack gap="space3">
                    <XDSHeading level={3}>Dimensions</XDSHeading>
                    <div {...stylex.props(styles.scoreGrid)}>
                      {ALL_DIMENSIONS.map(dim => (
                        <ScoreCard
                          key={dim}
                          label={DIMENSION_LABELS[dim]}
                          score={universal.averages[dim]}
                          compareScore={comparison?.baseline.averages[dim]}
                          compareLabel="Baseline"
                        />
                      ))}
                    </div>
                  </XDSVStack>

                  {/* Sub-metrics */}
                  <EfficiencyMetricsCard byPrompt={universal.byPrompt} />
                  <MaintainabilityMetricsCard byPrompt={universal.byPrompt} />
                  <CostMetricsCard cost={universal.cost} />

                  {/* Comparison view */}
                  {comparison && (
                    <XDSVStack gap="space3">
                      <XDSHeading level={3}>
                        {comparison.html
                          ? 'XDS vs Baseline vs HTML Comparison'
                          : 'XDS vs Baseline Comparison'}
                      </XDSHeading>
                      <CompareView comparison={comparison} />
                    </XDSVStack>
                  )}
                </XDSVStack>
              )}

              {activeTab === 'byPrompt' && (
                <XDSVStack gap="space4">
                  <DimensionTable byPrompt={universal.byPrompt} />

                  {/* Per-prompt detail cards */}
                  <XDSVStack gap="space3">
                    <XDSHeading level={3}>Prompt Details</XDSHeading>
                    {Object.keys(universal.byPrompt).map(promptId => (
                      <PromptDetailCard
                        key={promptId}
                        promptId={promptId}
                        promptText={data.prompts?.[promptId]}
                        xdsScore={universal.byPrompt[promptId]}
                        baselineScore={comparison?.baseline.byPrompt[promptId]}
                        htmlScore={comparison?.html?.byPrompt[promptId]}
                        hasXdsCode={!!data.sourceCode?.[promptId]}
                        hasBaselineCode={!!data.baselineSourceCode?.[promptId]}
                        hasHtmlCode={!!data.htmlSourceCode?.[promptId]}
                        onViewCode={target => setCodeModal({promptId, target})}
                        previewUrls={data.previews?.[promptId]}
                      />
                    ))}
                  </XDSVStack>
                </XDSVStack>
              )}

              {/* Code modal */}
              {codeModal &&
                (() => {
                  const code =
                    codeModal.target === 'xds'
                      ? data.sourceCode?.[codeModal.promptId]
                      : codeModal.target === 'baseline'
                        ? data.baselineSourceCode?.[codeModal.promptId]
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
          </XDSVStack>
        </div>
      </div>
    </XDSTheme>
  );
}
