import * as vite from 'vite';
import { R as ResolvedCoverageOptions, V as Vitest, a as ReportContext } from './chunks/reporters.nr4dxCkA.js';
import { A as AfterSuiteRunMeta } from './chunks/environment.LoooBwUu.js';
import '@vitest/runner';
import 'node:stream';
import '@vitest/utils';
import './chunks/config.Cy0C388Z.js';
import '@vitest/pretty-format';
import '@vitest/snapshot';
import '@vitest/snapshot/environment';
import 'vite-node';
import 'chai';
import '@vitest/utils/source-map';
import 'vite-node/client';
import 'vite-node/server';
import './chunks/benchmark.geERunq4.js';
import '@vitest/runner/utils';
import 'tinybench';
import '@vitest/snapshot/manager';
import 'node:fs';

interface CoverageSummaryData {
    lines: Totals;
    statements: Totals;
    branches: Totals;
    functions: Totals;
}

declare class CoverageSummary {
    constructor(data: CoverageSummary | CoverageSummaryData);
    merge(obj: CoverageSummary): CoverageSummary;
    toJSON(): CoverageSummaryData;
    isEmpty(): boolean;
    data: CoverageSummaryData;
    lines: Totals;
    statements: Totals;
    branches: Totals;
    functions: Totals;
}

interface CoverageMapData {
    [key: string]: FileCoverage | FileCoverageData;
}

declare class CoverageMap {
    constructor(data: CoverageMapData | CoverageMap);
    addFileCoverage(pathOrObject: string | FileCoverage | FileCoverageData): void;
    files(): string[];
    fileCoverageFor(filename: string): FileCoverage;
    filter(callback: (key: string) => boolean): void;
    getCoverageSummary(): CoverageSummary;
    merge(data: CoverageMapData | CoverageMap): void;
    toJSON(): CoverageMapData;
    data: CoverageMapData;
}

interface Location {
    line: number;
    column: number;
}

interface Range {
    start: Location;
    end: Location;
}

interface BranchMapping {
    loc: Range;
    type: string;
    locations: Range[];
    line: number;
}

interface FunctionMapping {
    name: string;
    decl: Range;
    loc: Range;
    line: number;
}

interface FileCoverageData {
    path: string;
    statementMap: { [key: string]: Range };
    fnMap: { [key: string]: FunctionMapping };
    branchMap: { [key: string]: BranchMapping };
    s: { [key: string]: number };
    f: { [key: string]: number };
    b: { [key: string]: number[] };
}

interface Totals {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
}

interface Coverage {
    covered: number;
    total: number;
    coverage: number;
}

declare class FileCoverage implements FileCoverageData {
    constructor(data: string | FileCoverage | FileCoverageData);
    merge(other: FileCoverageData): void;
    getBranchCoverageByLine(): { [line: number]: Coverage };
    getLineCoverage(): { [line: number]: number };
    getUncoveredLines(): number[];
    resetHits(): void;
    computeBranchTotals(): Totals;
    computeSimpleTotals(): Totals;
    toSummary(): CoverageSummary;
    toJSON(): object;

    data: FileCoverageData;
    path: string;
    statementMap: { [key: string]: Range };
    fnMap: { [key: string]: FunctionMapping };
    branchMap: { [key: string]: BranchMapping };
    s: { [key: string]: number };
    f: { [key: string]: number };
    b: { [key: string]: number[] };
}

type Threshold = 'lines' | 'functions' | 'statements' | 'branches';
interface ResolvedThreshold {
    coverageMap: CoverageMap;
    name: string;
    thresholds: Partial<Record<Threshold, number | undefined>>;
}
/**
 * Holds info about raw coverage results that are stored on file system:
 *
 * ```json
 * "project-a": {
 *   "web": {
 *     "tests/math.test.ts": "coverage-1.json",
 *     "tests/utils.test.ts": "coverage-2.json",
 * //                          ^^^^^^^^^^^^^^^ Raw coverage on file system
 *   },
 *   "ssr": { ... },
 *   "browser": { ... },
 * },
 * "project-b": ...
 * ```
 */
type CoverageFiles = Map<NonNullable<AfterSuiteRunMeta['projectName']> | symbol, Record<AfterSuiteRunMeta['transformMode'], {
    [TestFilenames: string]: string;
}>>;
declare class BaseCoverageProvider<Options extends ResolvedCoverageOptions<'istanbul' | 'v8'>> {
    ctx: Vitest;
    readonly name: 'v8' | 'istanbul';
    version: string;
    options: Options;
    coverageFiles: CoverageFiles;
    pendingPromises: Promise<void>[];
    coverageFilesDirectory: string;
    _initialize(ctx: Vitest): void;
    createCoverageMap(): CoverageMap;
    generateReports(_: CoverageMap, __: boolean | undefined): Promise<void>;
    parseConfigModule(_: string): Promise<{
        generate: () => {
            code: string;
        };
    }>;
    resolveOptions(): Options;
    clean(clean?: boolean): Promise<void>;
    onAfterSuiteRun({ coverage, transformMode, projectName, testFiles }: AfterSuiteRunMeta): void;
    readCoverageFiles<CoverageType>({ onFileRead, onFinished, onDebug }: {
        /** Callback invoked with a single coverage result */
        onFileRead: (data: CoverageType) => void;
        /** Callback invoked once all results of a project for specific transform mode are read */
        onFinished: (project: Vitest['projects'][number], transformMode: AfterSuiteRunMeta['transformMode']) => Promise<void>;
        onDebug: ((...logs: any[]) => void) & {
            enabled: boolean;
        };
    }): Promise<void>;
    cleanAfterRun(): Promise<void>;
    onTestFailure(): Promise<void>;
    reportCoverage(coverageMap: unknown, { allTestsRun }: ReportContext): Promise<void>;
    reportThresholds(coverageMap: CoverageMap, allTestsRun: boolean | undefined): Promise<void>;
    /**
     * Constructs collected coverage and users' threshold options into separate sets
     * where each threshold set holds their own coverage maps. Threshold set is either
     * for specific files defined by glob pattern or global for all other files.
     */
    private resolveThresholds;
    /**
     * Check collected coverage against configured thresholds. Sets exit code to 1 when thresholds not reached.
     */
    private checkThresholds;
    /**
     * Check if current coverage is above configured thresholds and bump the thresholds if needed
     */
    updateThresholds({ thresholds: allThresholds, onUpdate, configurationFile }: {
        thresholds: ResolvedThreshold[];
        configurationFile: unknown;
        onUpdate: () => void;
    }): Promise<void>;
    mergeReports(coverageMaps: unknown[]): Promise<void>;
    hasTerminalReporter(reporters: ResolvedCoverageOptions['reporter']): boolean;
    toSlices<T>(array: T[], size: number): T[][];
    createUncoveredFileTransformer(ctx: Vitest): (filename: string) => Promise<vite.TransformResult | null | undefined>;
}

export { BaseCoverageProvider };
