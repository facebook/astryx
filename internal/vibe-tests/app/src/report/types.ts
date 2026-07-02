// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {
  UniversalScore,
  UniversalAggregate,
  UniversalComparison,
  UniversalDimension,
  EfficiencyMetrics,
  MaintainabilityMetrics,
  CostMetrics,
  DimensionScore,
  UniversalFinding,
} from '../../../src/types';

export type {
  UniversalScore,
  UniversalAggregate,
  UniversalComparison,
  UniversalDimension,
  EfficiencyMetrics,
  MaintainabilityMetrics,
  CostMetrics,
  DimensionScore,
  UniversalFinding,
};

export interface ReportData {
  universal: UniversalAggregate;
  comparison?: UniversalComparison;
  screenshots?: Record<string, string>;
  sourceCode?: Record<string, string>;
  baselineSourceCode?: Record<string, string>;
  htmlSourceCode?: Record<string, string>;
  astryxTailwindSourceCode?: Record<string, string>;
  /** Map of promptId → { target → relative URL } */
  previews?: Record<string, Record<string, string>>;
  /** Map of promptId → prompt text */
  prompts?: Record<string, string>;
  iterationId?: string;
  target?: string;
}

declare global {
  interface Window {
    __REPORT_DATA__?: ReportData;
  }
}
