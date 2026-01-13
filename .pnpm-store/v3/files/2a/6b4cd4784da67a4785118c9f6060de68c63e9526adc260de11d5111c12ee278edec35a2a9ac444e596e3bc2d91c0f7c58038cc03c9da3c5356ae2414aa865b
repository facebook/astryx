import { E as ResolvedConfig, w as VitestRunMode, H as VitestOptions, V as Vitest, z as UserConfig$1, A as ApiConfig, L as Logger, J as WorkspaceProject, K as TestSequencer, M as WorkspaceSpec, N as TestModule, O as ModuleDiagnostic } from './chunks/reporters.nr4dxCkA.js';
export { B as BaseCoverageOptions, G as BenchmarkUserOptions, ad as BrowserBuiltinProvider, ae as BrowserCommand, af as BrowserCommandContext, s as BrowserConfigOptions, ag as BrowserOrchestrator, ah as BrowserProvider, ai as BrowserProviderInitializationOptions, aj as BrowserProviderModule, ak as BrowserProviderOptions, r as BrowserScript, al as BrowserServer, am as BrowserServerState, an as BrowserServerStateContext, t as BuiltinEnvironment, ao as CDPSession, v as CSSModuleScopeStrategy, o as CoverageIstanbulOptions, n as CoverageOptions, C as CoverageProvider, b as CoverageProviderModule, l as CoverageReporter, c as CoverageV8Options, p as CustomProviderOptions, D as DepsOptimizationOptions, $ as HTMLOptions, I as InlineConfig, a1 as JUnitOptions, a0 as JsonOptions, P as Pool, u as PoolOptions, X as ProcessPool, F as ProjectConfig, a as ReportContext, ap as ResolvedBrowserOptions, R as ResolvedCoverageOptions, aq as ResolvedProjectConfig, _ as SerializedTestProject, a4 as TaskOptions, a2 as TestCase, a5 as TestCollection, a6 as TestDiagnostic, Z as TestProject, a7 as TestResult, a8 as TestResultFailed, a9 as TestResultPassed, aa as TestResultSkipped, ab as TestSequencerConstructor, ac as TestSpecification, a3 as TestSuite, x as TransformModePatterns, h as TypeCheckCollectLineNumbers, i as TypeCheckCollectLines, k as TypeCheckContext, T as TypeCheckErrorInfo, g as TypeCheckRawErrorsMap, j as TypeCheckRootAndTarget, y as TypecheckConfig, U as UserWorkspaceConfig, f as VitestEnvironment, Q as VitestPackageInstaller, Y as getFilePoolName } from './chunks/reporters.nr4dxCkA.js';
import { UserConfig, ResolvedConfig as ResolvedConfig$1, Plugin, LogLevel, LoggerOptions, Logger as Logger$1, createServer as createServer$1 } from 'vite';
import * as vite from 'vite';
export { vite as Vite };
export { isFileServingAllowed, parseAst, parseAstAsync } from 'vite';
import { IncomingMessage } from 'node:http';
import { P as ProvidedContext } from './chunks/environment.LoooBwUu.js';
export { f as EnvironmentOptions, H as HappyDOMOptions, J as JSDOMOptions, O as OnServerRestartHandler } from './chunks/environment.LoooBwUu.js';
import { R as RuntimeRPC } from './chunks/worker.tN5KGIih.js';
import { Writable } from 'node:stream';
export { W as WorkerContext } from './chunks/worker.B9FxPCaC.js';
import createDebug from 'debug';
export { b as RuntimeConfig } from './chunks/config.Cy0C388Z.js';
export { SequenceHooks, SequenceSetupFiles } from '@vitest/runner';
import '@vitest/utils';
import '@vitest/pretty-format';
import '@vitest/snapshot';
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
import 'node:worker_threads';
import '@vitest/snapshot/environment';

declare function isValidApiRequest(config: ResolvedConfig, req: IncomingMessage): boolean;

interface CliOptions extends UserConfig$1 {
    /**
     * Override the watch mode
     */
    run?: boolean;
    /**
     * Removes colors from the console output
     */
    color?: boolean;
    /**
     * Output collected tests as JSON or to a file
     */
    json?: string | boolean;
    /**
     * Output collected test files only
     */
    filesOnly?: boolean;
}
/**
 * Start Vitest programmatically
 *
 * Returns a Vitest instance if initialized successfully.
 */
declare function startVitest(mode: VitestRunMode, cliFilters?: string[], options?: CliOptions, viteOverrides?: UserConfig, vitestOptions?: VitestOptions): Promise<Vitest | undefined>;

interface CLIOptions {
    allowUnknownOptions?: boolean;
}
declare function parseCLI(argv: string | string[], config?: CLIOptions): {
    filter: string[];
    options: CliOptions;
};

declare function resolveApiServerConfig<Options extends ApiConfig & UserConfig$1>(options: Options, defaultPort: number): ApiConfig | undefined;
declare function resolveConfig(mode: VitestRunMode, options: UserConfig$1, viteConfig: ResolvedConfig$1, logger: Logger): ResolvedConfig;

declare function createVitest(mode: VitestRunMode, options: UserConfig$1, viteOverrides?: UserConfig, vitestOptions?: VitestOptions): Promise<Vitest>;

declare class FilesNotFoundError extends Error {
    code: string;
    constructor(mode: 'test' | 'benchmark');
}
declare class GitNotFoundError extends Error {
    code: string;
    constructor();
}

interface GlobalSetupContext {
    config: ResolvedConfig;
    provide: <T extends keyof ProvidedContext & string>(key: T, value: ProvidedContext[T]) => void;
}

declare function VitestPlugin(options?: UserConfig$1, ctx?: Vitest): Promise<Plugin[]>;

declare function resolveFsAllow(projectRoot: string, rootConfigFile: string | false | undefined): string[];

interface MethodsOptions {
    cacheFs?: boolean;
}
declare function createMethodsRPC(project: WorkspaceProject, options?: MethodsOptions): RuntimeRPC;

declare class BaseSequencer implements TestSequencer {
    protected ctx: Vitest;
    constructor(ctx: Vitest);
    shard(files: WorkspaceSpec[]): Promise<WorkspaceSpec[]>;
    sort(files: WorkspaceSpec[]): Promise<WorkspaceSpec[]>;
}

declare function registerConsoleShortcuts(ctx: Vitest, stdin: NodeJS.ReadStream | undefined, stdout: NodeJS.WriteStream | Writable): () => void;

declare function createViteLogger(console: Logger, level?: LogLevel, options?: LoggerOptions): Logger$1;

declare const rootDir: string;
declare const distDir: string;

declare function createDebugger(namespace: `vitest:${string}`): createDebug.Debugger | undefined;

/** @deprecated use `createViteServer` instead */
declare const createServer: typeof createServer$1;
declare const createViteServer: typeof createServer$1;

/**
 * @deprecated Use `TestModule` instead
 */
declare const TestFile: typeof TestModule;

/**
 * @deprecated Use `ModuleDiagnostic` instead
 */
type FileDiagnostic = ModuleDiagnostic;

export { ApiConfig, BaseSequencer, type FileDiagnostic, GitNotFoundError, type GlobalSetupContext, ModuleDiagnostic, ResolvedConfig, TestFile, TestModule, TestSequencer, FilesNotFoundError as TestsNotFoundError, UserConfig$1 as UserConfig, Vitest, VitestPlugin, VitestRunMode, WorkspaceProject, WorkspaceSpec, createDebugger, createMethodsRPC, createServer, createViteLogger, createViteServer, createVitest, distDir, isValidApiRequest, parseCLI, registerConsoleShortcuts, resolveApiServerConfig, resolveConfig, resolveFsAllow, rootDir, startVitest };
