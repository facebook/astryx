import {useState, useMemo} from 'react';
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
import {ALL_DIMENSIONS, DIMENSION_LABELS, formatScore} from './utils';
import {ScoreCard} from './ScoreCard';
import {DimensionTable} from './DimensionTable';
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
    padding: spacingVars['--spacing-6'],
  },
  header: {
    paddingBlock: spacingVars['--spacing-4'],
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: spacingVars['--spacing-4'],
  },
  metricsCard: {
    padding: spacingVars['--spacing-4'],
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
    paddingBlock: spacingVars['--spacing-6'],
  },
  emptyState: {
    padding: spacingVars['--spacing-8'],
    textAlign: 'center',
  },
});

function ConcisenessMetricsCard({
  byPrompt,
}: {
  byPrompt: ReportData['universal']['byPrompt'];
}) {
  // Aggregate conciseness metrics across prompts
  const entries = Object.values(byPrompt);
  if (entries.length === 0) return null;

  const totals = entries.reduce(
    (acc, score) => {
      const m = score.conciseness.metrics;
      return {
        totalLines: acc.totalLines + m.totalLines,
        codeLines: acc.codeLines + m.codeLines,
        stylingRatio: acc.stylingRatio + m.stylingRatio,
        boilerplateRatio: acc.boilerplateRatio + m.boilerplateRatio,
        count: acc.count + 1,
      };
    },
    {
      totalLines: 0,
      codeLines: 0,
      stylingRatio: 0,
      boilerplateRatio: 0,
      count: 0,
    },
  );

  const avgStyling = (totals.stylingRatio / totals.count) * 100;
  const avgBoilerplate = (totals.boilerplateRatio / totals.count) * 100;

  return (
    <XDSCard>
      <div {...stylex.props(styles.metricsCard)}>
        <XDSVStack gap="space3">
          <XDSHeading level={4}>Conciseness Metrics</XDSHeading>
          <div {...stylex.props(styles.metricsGrid)}>
            <div {...stylex.props(styles.metricItem)}>
              <XDSVStack gap="space1">
                <XDSText type="label">Total Lines</XDSText>
                <XDSHeading level={3}>{totals.totalLines}</XDSHeading>
              </XDSVStack>
            </div>
            <div {...stylex.props(styles.metricItem)}>
              <XDSVStack gap="space1">
                <XDSText type="label">Code Lines</XDSText>
                <XDSHeading level={3}>{totals.codeLines}</XDSHeading>
              </XDSVStack>
            </div>
            <div {...stylex.props(styles.metricItem)}>
              <XDSVStack gap="space1">
                <XDSText type="label">Styling Ratio</XDSText>
                <XDSHeading level={3}>{avgStyling.toFixed(1)}%</XDSHeading>
              </XDSVStack>
            </div>
            <div {...stylex.props(styles.metricItem)}>
              <XDSVStack gap="space1">
                <XDSText type="label">Boilerplate Ratio</XDSText>
                <XDSHeading level={3}>{avgBoilerplate.toFixed(1)}%</XDSHeading>
              </XDSVStack>
            </div>
          </div>
        </XDSVStack>
      </div>
    </XDSCard>
  );
}

export function Report() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState('overview');

  const data: ReportData | undefined = window.__REPORT_DATA__;

  const hasScreenshots =
    data?.screenshots && Object.keys(data.screenshots).length > 0;

  const toggleTheme = () => {
    setThemeMode(m => (m === 'light' ? 'dark' : 'light'));
  };

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
          <XDSVStack gap="space6">
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
                <XDSButton variant="secondary" onClick={toggleTheme}>
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
                <XDSVStack gap="space6">
                  {/* Overall score */}
                  <ScoreCard
                    label="Overall Score"
                    score={universal.overall}
                    compareScore={comparison?.baseline.overall}
                    compareLabel="Baseline"
                  />

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

                  {/* Dark mode rate */}
                  <XDSCard>
                    <div {...stylex.props(styles.metricsCard)}>
                      <XDSHStack gap="space4" hAlign="center">
                        <XDSText type="label">Dark Mode Support Rate</XDSText>
                        <XDSHeading level={3}>
                          {(universal.darkModeRate * 100).toFixed(0)}%
                        </XDSHeading>
                      </XDSHStack>
                    </div>
                  </XDSCard>

                  {/* Conciseness metrics */}
                  <ConcisenessMetricsCard byPrompt={universal.byPrompt} />

                  {/* Comparison view */}
                  {comparison && (
                    <XDSVStack gap="space3">
                      <XDSHeading level={3}>
                        XDS vs Baseline Comparison
                      </XDSHeading>
                      <CompareView comparison={comparison} />
                    </XDSVStack>
                  )}
                </XDSVStack>
              )}

              {activeTab === 'byPrompt' && (
                <DimensionTable
                  byPrompt={universal.byPrompt}
                  categories={
                    Object.keys(universal.byCategory).length > 0
                      ? Object.entries(universal.byPrompt).reduce(
                          (acc, [promptId]) => {
                            // Find category for this prompt by checking byCategory
                            for (const [cat, dims] of Object.entries(
                              universal.byCategory,
                            )) {
                              acc[promptId] = acc[promptId] ?? cat;
                            }
                            return acc;
                          },
                          {} as Record<string, string>,
                        )
                      : undefined
                  }
                />
              )}

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
