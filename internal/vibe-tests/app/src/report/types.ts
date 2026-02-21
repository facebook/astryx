import type {
  UniversalScore,
  UniversalAggregate,
  UniversalComparison,
  UniversalDimension,
  ConcisenessMetrics,
  DimensionScore,
  UniversalFinding,
} from '../../../src/types';

export type {
  UniversalScore,
  UniversalAggregate,
  UniversalComparison,
  UniversalDimension,
  ConcisenessMetrics,
  DimensionScore,
  UniversalFinding,
};

export interface ReportData {
  universal: UniversalAggregate;
  comparison?: UniversalComparison;
  screenshots?: Record<string, string>;
  iterationId?: string;
  target?: string;
}

declare global {
  interface Window {
    __REPORT_DATA__?: ReportData;
  }
}
