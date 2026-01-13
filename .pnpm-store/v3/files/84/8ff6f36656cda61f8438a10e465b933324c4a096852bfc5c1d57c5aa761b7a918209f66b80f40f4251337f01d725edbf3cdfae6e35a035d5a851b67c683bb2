import * as _vitest_runner from '@vitest/runner';
import { File, TaskResultPack, Task, Test, Suite, CancelReason, Custom, TaskMeta, SequenceHooks, SequenceSetupFiles } from '@vitest/runner';
import { b as Awaitable, U as UserConsoleLog, P as ProvidedContext, A as AfterSuiteRunMeta, c as Arrayable$1, f as EnvironmentOptions, d as ArgumentsType, O as OnServerRestartHandler } from './environment.LoooBwUu.js';
import { Writable } from 'node:stream';
import * as vite from 'vite';
import { ViteDevServer, TransformResult as TransformResult$1, ServerOptions, DepOptimizationConfig, AliasOptions, UserConfig as UserConfig$1, ConfigEnv } from 'vite';
import { ParsedStack, Awaitable as Awaitable$1, ErrorWithDiff, TestError, Arrayable } from '@vitest/utils';
import { S as SerializedConfig, F as FakeTimerInstallOpts } from './config.Cy0C388Z.js';
import { PrettyFormatOptions } from '@vitest/pretty-format';
import { SnapshotSummary, SnapshotStateOptions } from '@vitest/snapshot';
import { RawSourceMap, ViteNodeServerOptions } from 'vite-node';
import * as chai from 'chai';
import { StackTraceParserOptions } from '@vitest/utils/source-map';
import { ViteNodeRunner } from 'vite-node/client';
import { ViteNodeServer } from 'vite-node/server';
import { B as BenchmarkResult } from './benchmark.geERunq4.js';
import { SnapshotManager } from '@vitest/snapshot/manager';
import { Stats } from 'node:fs';

type SerializedTestSpecification = [
    project: {
        name: string | undefined;
        root: string;
    },
    file: string,
    options: {
        pool: string;
    }
];

type ChaiConfig = Omit<Partial<typeof chai.config>, 'useProxy' | 'proxyExcludedKeys'>;

interface Reporter {
    onInit?: (ctx: Vitest) => void;
    onPathsCollected?: (paths?: string[]) => Awaitable<void>;
    onSpecsCollected?: (specs?: SerializedTestSpecification[]) => Awaitable<void>;
    onCollected?: (files?: File[]) => Awaitable<void>;
    onFinished?: (files: File[], errors: unknown[], coverage?: unknown) => Awaitable<void>;
    onTaskUpdate?: (packs: TaskResultPack[]) => Awaitable<void>;
    onTestRemoved?: (trigger?: string) => Awaitable<void>;
    onWatcherStart?: (files?: File[], errors?: unknown[]) => Awaitable<void>;
    onWatcherRerun?: (files: string[], trigger?: string) => Awaitable<void>;
    onServerRestart?: (reason?: string) => Awaitable<void>;
    onUserConsoleLog?: (log: UserConsoleLog) => Awaitable<void>;
    onProcessTimeout?: () => Awaitable<void>;
}

interface BaseOptions {
    isTTY?: boolean;
}
declare abstract class BaseReporter implements Reporter {
    start: number;
    end: number;
    watchFilters?: string[];
    failedUnwatchedFiles: Task[];
    isTTY: boolean;
    ctx: Vitest;
    protected verbose: boolean;
    private _filesInWatchMode;
    private _timeStart;
    private _lastRunTimeout;
    private _lastRunTimer;
    private _lastRunCount;
    constructor(options?: BaseOptions);
    onInit(ctx: Vitest): void;
    log(...messages: any): void;
    error(...messages: any): void;
    relative(path: string): string;
    onFinished(files?: File[], errors?: unknown[]): void;
    onTaskUpdate(packs: TaskResultPack[]): void;
    protected printTask(task: Task): void;
    private getDurationPrefix;
    onWatcherStart(files?: File[], errors?: unknown[]): void;
    private resetLastRunLog;
    onWatcherRerun(files: string[], trigger?: string): void;
    onUserConsoleLog(log: UserConsoleLog): void;
    onTestRemoved(trigger?: string): void;
    shouldLog(log: UserConsoleLog): boolean;
    onServerRestart(reason?: string): void;
    reportSummary(files: File[], errors: unknown[]): void;
    reportTestSummary(files: File[], errors: unknown[]): void;
    private printErrorsSummary;
    reportBenchmarkSummary(files: File[]): void;
    private printTaskErrors;
}

interface ParsedFile extends File {
    start: number;
    end: number;
}
interface ParsedTest extends Test {
    start: number;
    end: number;
}
interface ParsedSuite extends Suite {
    start: number;
    end: number;
}
interface LocalCallDefinition {
    start: number;
    end: number;
    name: string;
    type: 'suite' | 'test';
    mode: 'run' | 'skip' | 'only' | 'todo';
    task: ParsedSuite | ParsedFile | ParsedTest;
}
interface FileInformation {
    file: File;
    filepath: string;
    parsed: string;
    map: RawSourceMap | null;
    definitions: LocalCallDefinition[];
}

type RawErrsMap = Map<string, TscErrorInfo[]>;
interface TscErrorInfo {
    filePath: string;
    errCode: number;
    errMsg: string;
    line: number;
    column: number;
}
interface CollectLineNumbers {
    target: number;
    next: number;
    prev?: number;
}
type CollectLines = {
    [key in keyof CollectLineNumbers]: string;
};
interface RootAndTarget {
    root: string;
    targetAbsPath: string;
}
type Context = RootAndTarget & {
    rawErrsMap: RawErrsMap;
    openedDirs: Set<string>;
    lastActivePath?: string;
};

declare class TypeCheckError extends Error {
    message: string;
    stacks: ParsedStack[];
    name: string;
    constructor(message: string, stacks: ParsedStack[]);
}
interface TypecheckResults {
    files: File[];
    sourceErrors: TypeCheckError[];
    time: number;
}
type Callback<Args extends Array<any> = []> = (...args: Args) => Awaitable<void>;
declare class Typechecker {
    protected ctx: WorkspaceProject;
    private _onParseStart?;
    private _onParseEnd?;
    private _onWatcherRerun?;
    private _result;
    private _startTime;
    private _output;
    private _tests;
    private tempConfigPath?;
    private allowJs?;
    private process?;
    protected files: string[];
    constructor(ctx: WorkspaceProject);
    setFiles(files: string[]): void;
    onParseStart(fn: Callback): void;
    onParseEnd(fn: Callback<[TypecheckResults]>): void;
    onWatcherRerun(fn: Callback): void;
    protected collectFileTests(filepath: string): Promise<FileInformation | null>;
    protected getFiles(): string[];
    collectTests(): Promise<Record<string, FileInformation>>;
    protected markPassed(file: File): void;
    protected prepareResults(output: string): Promise<{
        files: File[];
        sourceErrors: TypeCheckError[];
        time: number;
    }>;
    protected parseTscLikeOutput(output: string): Promise<Map<string, {
        error: TypeCheckError;
        originalError: TscErrorInfo;
    }[]>>;
    clear(): Promise<void>;
    stop(): Promise<void>;
    protected ensurePackageInstalled(ctx: Vitest, checker: string): Promise<void>;
    prepare(): Promise<void>;
    getExitCode(): number | false;
    getOutput(): string;
    start(): Promise<void>;
    getResult(): TypecheckResults;
    getTestFiles(): File[];
    getTestPacks(): TaskResultPack[];
}

interface PrintErrorResult {
    nearest?: ParsedStack;
}

interface Options {
	/**
	Show the cursor. This can be useful when a CLI accepts input from a user.

	@example
	```
	import {createLogUpdate} from 'log-update';

	// Write output but don't hide the cursor
	const log = createLogUpdate(process.stdout, {
		showCursor: true
	});
	```
	*/
	readonly showCursor?: boolean;
}

type LogUpdateMethods = {
	/**
	Clear the logged output.
	*/
	clear(): void;

	/**
	Persist the logged output. Useful if you want to start a new log session below the current one.
	*/
	done(): void;
};

/**
Log to `stdout` by overwriting the previous output in the terminal.

@param text - The text to log to `stdout`.

@example
```
import logUpdate from 'log-update';

const frames = ['-', '\\', '|', '/'];
let index = 0;

setInterval(() => {
	const frame = frames[index = ++index % frames.length];

	logUpdate(
`
		♥♥
${frame} unicorns ${frame}
		♥♥
`
	);
}, 80);
```
*/
declare const logUpdate: ((...text: string[]) => void) & LogUpdateMethods;


/**
Get a `logUpdate` method that logs to the specified stream.

@param stream - The stream to log to.

@example
```
import {createLogUpdate} from 'log-update';

// Write output but don't hide the cursor
const log = createLogUpdate(process.stdout);
```
*/
declare function createLogUpdate(
	stream: NodeJS.WritableStream,
	options?: Options
): typeof logUpdate;

interface ErrorOptions {
    type?: string;
    fullStack?: boolean;
    project?: WorkspaceProject;
    verbose?: boolean;
    screenshotPaths?: string[];
    task?: Task;
    showCodeFrame?: boolean;
}
declare class Logger {
    ctx: Vitest;
    outputStream: NodeJS.WriteStream | Writable;
    errorStream: NodeJS.WriteStream | Writable;
    logUpdate: ReturnType<typeof createLogUpdate>;
    private _clearScreenPending;
    private _highlights;
    console: Console;
    constructor(ctx: Vitest, outputStream?: NodeJS.WriteStream | Writable, errorStream?: NodeJS.WriteStream | Writable);
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    clearFullScreen(message?: string): void;
    clearScreen(message: string, force?: boolean): void;
    private _clearScreen;
    printError(err: unknown, options?: ErrorOptions): PrintErrorResult | undefined;
    clearHighlightCache(filename?: string): void;
    highlight(filename: string, source: string): string;
    printNoTestFound(filters?: string[]): void;
    printBanner(): void;
    printBrowserBanner(project: WorkspaceProject): void;
    printUnhandledErrors(errors: unknown[]): void;
    printSourceTypeErrors(errors: TypeCheckError[]): void;
    private registerUnhandledRejection;
}

interface BrowserProviderInitializationOptions {
    browser: string;
    options?: BrowserProviderOptions;
}
interface CDPSession {
    send: (method: string, params?: Record<string, unknown>) => Promise<unknown>;
    on: (event: string, listener: (...args: unknown[]) => void) => void;
    once: (event: string, listener: (...args: unknown[]) => void) => void;
    off: (event: string, listener: (...args: unknown[]) => void) => void;
}
interface BrowserProvider {
    name: string;
    /**
     * @experimental opt-in into file parallelisation
     */
    supportsParallelism: boolean;
    getSupportedBrowsers: () => readonly string[];
    beforeCommand?: (command: string, args: unknown[]) => Awaitable$1<void>;
    afterCommand?: (command: string, args: unknown[]) => Awaitable$1<void>;
    getCommandsContext: (contextId: string) => Record<string, unknown>;
    openPage: (contextId: string, url: string, beforeNavigate?: () => Promise<void>) => Promise<void>;
    getCDPSession?: (contextId: string) => Promise<CDPSession>;
    close: () => Awaitable$1<void>;
    initialize(ctx: WorkspaceProject, options: BrowserProviderInitializationOptions): Awaitable$1<void>;
}
interface BrowserProviderModule {
    new (): BrowserProvider;
}
interface BrowserProviderOptions {
}
type BrowserBuiltinProvider = 'webdriverio' | 'playwright' | 'preview';
interface BrowserConfigOptions {
    /**
     * if running tests in the browser should be the default
     *
     * @default false
     */
    enabled?: boolean;
    /**
     * Name of the browser
     */
    name: string;
    /**
     * Browser provider
     *
     * @default 'preview'
     */
    provider?: BrowserBuiltinProvider | (string & {});
    /**
     * Options that are passed down to a browser provider.
     * To support type hinting, add one of the types to your tsconfig.json "compilerOptions.types" field:
     *
     * - for webdriverio: `@vitest/browser/providers/webdriverio`
     * - for playwright: `@vitest/browser/providers/playwright`
     *
     * @example
     * { playwright: { launch: { devtools: true } }
     */
    providerOptions?: BrowserProviderOptions;
    /**
     * enable headless mode
     *
     * @default process.env.CI
     */
    headless?: boolean;
    /**
     * Serve API options.
     *
     * The default port is 63315.
     */
    api?: ApiConfig | number;
    /**
     * Isolate test environment after each test
     *
     * @default true
     */
    isolate?: boolean;
    /**
     * Run test files in parallel if provider supports this option
     * This option only has effect in headless mode (enabled in CI by default)
     *
     * @default // Same as "test.fileParallelism"
     */
    fileParallelism?: boolean;
    /**
     * Show Vitest UI
     *
     * @default !process.env.CI
     */
    ui?: boolean;
    /**
     * Default viewport size
     */
    viewport?: {
        /**
         * Width of the viewport
         * @default 414
         */
        width: number;
        /**
         * Height of the viewport
         * @default 896
         */
        height: number;
    };
    /**
     * Locator options
     */
    locators?: {
        /**
         * Attribute used to locate elements by test id
         * @default 'data-testid'
         */
        testIdAttribute?: string;
    };
    /**
     * Directory where screenshots will be saved when page.screenshot() is called
     * If not set, all screenshots are saved to __screenshots__ directory in the same folder as the test file.
     * If this is set, it will be resolved relative to the project root.
     * @default __screenshots__
     */
    screenshotDirectory?: string;
    /**
     * Should Vitest take screenshots if the test fails
     * @default !browser.ui
     */
    screenshotFailures?: boolean;
    /**
     * Scripts injected into the tester iframe.
     * @deprecated Will be removed in the future, use `testerHtmlPath` instead.
     */
    testerScripts?: BrowserScript[];
    /**
     * Path to the index.html file that will be used to run tests.
     */
    testerHtmlPath?: string;
    /**
     * Scripts injected into the main window.
     */
    orchestratorScripts?: BrowserScript[];
    /**
     * Commands that will be executed on the server
     * via the browser `import("@vitest/browser/context").commands` API.
     * @see {@link https://vitest.dev/guide/browser/commands}
     */
    commands?: Record<string, BrowserCommand<any>>;
}
interface BrowserCommandContext {
    testPath: string | undefined;
    provider: BrowserProvider;
    project: WorkspaceProject;
    contextId: string;
}
interface BrowserServerStateContext {
    files: string[];
    method: 'run' | 'collect';
    resolve: () => void;
    reject: (v: unknown) => void;
}
interface BrowserOrchestrator {
    createTesters: (files: string[]) => Promise<void>;
    onCancel: (reason: CancelReason) => Promise<void>;
    $close: () => void;
}
interface BrowserServerState {
    orchestrators: Map<string, BrowserOrchestrator>;
    getContext: (contextId: string) => BrowserServerStateContext | undefined;
    createAsyncContext: (method: 'collect' | 'run', contextId: string, files: string[]) => Promise<void>;
}
interface BrowserServer {
    vite: ViteDevServer;
    state: BrowserServerState;
    provider: BrowserProvider;
    close: () => Promise<void>;
    initBrowserProvider: () => Promise<void>;
    parseStacktrace: (stack: string) => ParsedStack[];
    parseErrorStacktrace: (error: ErrorWithDiff, options?: StackTraceParserOptions) => ParsedStack[];
}
interface BrowserCommand<Payload extends unknown[]> {
    (context: BrowserCommandContext, ...payload: Payload): Awaitable$1<any>;
}
interface BrowserScript {
    /**
     * If "content" is provided and type is "module", this will be its identifier.
     *
     * If you are using TypeScript, you can add `.ts` extension here for example.
     * @default `injected-${index}.js`
     */
    id?: string;
    /**
     * JavaScript content to be injected. This string is processed by Vite plugins if type is "module".
     *
     * You can use `id` to give Vite a hint about the file extension.
     */
    content?: string;
    /**
     * Path to the script. This value is resolved by Vite so it can be a node module or a file path.
     */
    src?: string;
    /**
     * If the script should be loaded asynchronously.
     */
    async?: boolean;
    /**
     * Script type.
     * @default 'module'
     */
    type?: string;
}
interface ResolvedBrowserOptions extends BrowserConfigOptions {
    enabled: boolean;
    headless: boolean;
    isolate: boolean;
    fileParallelism: boolean;
    api: ApiConfig;
    ui: boolean;
    viewport: {
        width: number;
        height: number;
    };
    screenshotFailures: boolean;
    locators: {
        testIdAttribute: string;
    };
}

interface InitializeProjectOptions extends UserWorkspaceConfig {
    workspaceConfigPath: string;
    extends?: string;
}
declare class WorkspaceProject {
    path: string | number;
    ctx: Vitest;
    options?: InitializeProjectOptions | undefined;
    configOverride: Partial<ResolvedConfig> | undefined;
    config: ResolvedConfig;
    server: ViteDevServer;
    vitenode: ViteNodeServer;
    runner: ViteNodeRunner;
    browser?: BrowserServer;
    typechecker?: Typechecker;
    closingPromise: Promise<unknown> | undefined;
    testFilesList: string[] | null;
    typecheckFilesList: string[] | null;
    testProject: TestProject;
    readonly id: string;
    readonly tmpDir: string;
    private _globalSetups;
    private _provided;
    constructor(path: string | number, ctx: Vitest, options?: InitializeProjectOptions | undefined);
    getName(): string;
    isCore(): boolean;
    provide<T extends keyof ProvidedContext & string>(key: T, value: ProvidedContext[T]): void;
    getProvidedContext(): ProvidedContext;
    createSpec(moduleId: string, pool: string): WorkspaceSpec;
    initializeGlobalSetup(): Promise<void>;
    teardownGlobalSetup(): Promise<void>;
    get logger(): Logger;
    getModulesByFilepath(file: string): Set<vite.ModuleNode>;
    getModuleById(id: string): vite.ModuleNode | undefined;
    getSourceMapModuleById(id: string): TransformResult$1['map'] | undefined;
    get reporters(): Reporter[];
    globTestFiles(filters?: string[]): Promise<{
        testFiles: string[];
        typecheckTestFiles: string[];
    }>;
    globAllTestFiles(include: string[], exclude: string[], includeSource: string[] | undefined, cwd: string): Promise<string[]>;
    isTestFile(id: string): boolean | null;
    isTypecheckFile(id: string): boolean | null;
    globFiles(include: string[], exclude: string[], cwd: string): Promise<string[]>;
    isTargetFile(id: string, source?: string): Promise<boolean>;
    isInSourceTestFile(code: string): boolean;
    filterFiles(testFiles: string[], filters: string[], dir: string): string[];
    initBrowserServer(): Promise<void>;
    static createBasicProject(ctx: Vitest): WorkspaceProject;
    static createCoreProject(ctx: Vitest): Promise<WorkspaceProject>;
    setServer(options: UserConfig, server: ViteDevServer): Promise<void>;
    isBrowserEnabled(): boolean;
    getSerializableConfig(): SerializedConfig;
    close(): Promise<unknown>;
    private clearTmpDir;
    initBrowserProvider(): Promise<void>;
}

interface BlobOptions {
    outputFile?: string;
}
declare class BlobReporter implements Reporter {
    ctx: Vitest;
    options: BlobOptions;
    constructor(options: BlobOptions);
    onInit(ctx: Vitest): void;
    onFinished(files: File[] | undefined, errors: unknown[] | undefined, coverage: unknown): Promise<void>;
}

interface HTMLOptions {
    outputFile?: string;
}

declare class ReportedTaskImplementation {
    /**
     * Task instance.
     * @experimental Public runner task API is experimental and does not follow semver.
     */
    readonly task: Task;
    /**
     * The project assosiacted with the test or suite.
     */
    readonly project: TestProject;
    /**
     * Unique identifier.
     * This ID is deterministic and will be the same for the same test across multiple runs.
     * The ID is based on the project name, module url and test position.
     */
    readonly id: string;
    /**
     * Location in the module where the test or suite is defined.
     */
    readonly location: {
        line: number;
        column: number;
    } | undefined;
    protected constructor(task: Task, project: WorkspaceProject);
    /**
     * Creates a new reported task instance and stores it in the project's state for future use.
     */
    static register(task: Task, project: WorkspaceProject): TestCase | TestSuite | TestModule;
}
declare class TestCase extends ReportedTaskImplementation {
    #private;
    readonly task: Test | Custom;
    readonly type = "test";
    /**
     * Direct reference to the test module where the test or suite is defined.
     */
    readonly module: TestModule;
    /**
     * Name of the test.
     */
    readonly name: string;
    /**
     * Options that the test was initiated with.
     */
    readonly options: TaskOptions;
    /**
     * Parent suite. If the test was called directly inside the module, the parent will be the module itself.
     */
    readonly parent: TestSuite | TestModule;
    protected constructor(task: Test | Custom, project: WorkspaceProject);
    /**
     * Full name of the test including all parent suites separated with `>`.
     */
    get fullName(): string;
    /**
     * Test results. Will be `undefined` if test is not finished yet or was just collected.
     */
    result(): TestResult | undefined;
    /**
     * Checks if the test did not fail the suite.
     * If the test is not finished yet or was skipped, it will return `true`.
     */
    ok(): boolean;
    /**
     * Custom metadata that was attached to the test during its execution.
     */
    meta(): TaskMeta;
    /**
     * Useful information about the test like duration, memory usage, etc.
     * Diagnostic is only available after the test has finished.
     */
    diagnostic(): TestDiagnostic | undefined;
}
declare class TestCollection {
    #private;
    constructor(task: Suite | File, project: WorkspaceProject);
    /**
     * Returns the test or suite at a specific index in the array.
     */
    at(index: number): TestCase | TestSuite | undefined;
    /**
     * The number of tests and suites in the collection.
     */
    get size(): number;
    /**
     * Returns the collection in array form for easier manipulation.
     */
    array(): (TestCase | TestSuite)[];
    /**
     * Filters all tests that are part of this collection and its children.
     */
    allTests(state?: TestResult['state'] | 'running'): Generator<TestCase, undefined, void>;
    /**
     * Filters only the tests that are part of this collection.
     */
    tests(state?: TestResult['state'] | 'running'): Generator<TestCase, undefined, void>;
    /**
     * Filters only the suites that are part of this collection.
     */
    suites(): Generator<TestSuite, undefined, void>;
    /**
     * Filters all suites that are part of this collection and its children.
     */
    allSuites(): Generator<TestSuite, undefined, void>;
    [Symbol.iterator](): Generator<TestSuite | TestCase, undefined, void>;
}

declare abstract class SuiteImplementation extends ReportedTaskImplementation {
    readonly task: Suite | File;
    /**
     * Collection of suites and tests that are part of this suite.
     */
    readonly children: TestCollection;
    protected constructor(task: Suite | File, project: WorkspaceProject);
}
declare class TestSuite extends SuiteImplementation {
    #private;
    readonly task: Suite;
    readonly type = "suite";
    /**
     * Name of the test or the suite.
     */
    readonly name: string;
    /**
     * Direct reference to the test module where the test or suite is defined.
     */
    readonly module: TestModule;
    /**
     * Parent suite. If suite was called directly inside the module, the parent will be the module itself.
     */
    readonly parent: TestSuite | TestModule;
    /**
     * Options that suite was initiated with.
     */
    readonly options: TaskOptions;
    protected constructor(task: Suite, project: WorkspaceProject);
    /**
     * Full name of the suite including all parent suites separated with `>`.
     */
    get fullName(): string;
}
declare class TestModule extends SuiteImplementation {
    readonly task: File;
    readonly location: undefined;
    readonly type = "module";
    /**
     * This is usually an absolute UNIX file path.
     * It can be a virtual id if the file is not on the disk.
     * This value corresponds to Vite's `ModuleGraph` id.
     */
    readonly moduleId: string;
    protected constructor(task: File, project: WorkspaceProject);
    /**
     * Useful information about the module like duration, memory usage, etc.
     * If the module was not executed yet, all diagnostic values will return `0`.
     */
    diagnostic(): ModuleDiagnostic;
}
interface TaskOptions {
    each: boolean | undefined;
    concurrent: boolean | undefined;
    shuffle: boolean | undefined;
    retry: number | undefined;
    repeats: number | undefined;
    mode: 'run' | 'only' | 'skip' | 'todo';
}
type TestResult = TestResultPassed | TestResultFailed | TestResultSkipped;
interface TestResultPassed {
    /**
     * The test passed successfully.
     */
    state: 'passed';
    /**
     * Errors that were thrown during the test execution.
     *
     * **Note**: If test was retried successfully, errors will still be reported.
     */
    errors: TestError[] | undefined;
}
interface TestResultFailed {
    /**
     * The test failed to execute.
     */
    state: 'failed';
    /**
     * Errors that were thrown during the test execution.
     */
    errors: TestError[];
}
interface TestResultSkipped {
    /**
     * The test was skipped with `only`, `skip` or `todo` flag.
     * You can see which one was used in the `mode` option.
     */
    state: 'skipped';
    /**
     * Skipped tests have no errors.
     */
    errors: undefined;
}
interface TestDiagnostic {
    /**
     * If the duration of the test is above `slowTestThreshold`.
     */
    slow: boolean;
    /**
     * The amount of memory used by the test in bytes.
     * This value is only available if the test was executed with `logHeapUsage` flag.
     */
    heap: number | undefined;
    /**
     * The time it takes to execute the test in ms.
     */
    duration: number;
    /**
     * The time in ms when the test started.
     */
    startTime: number;
    /**
     * The amount of times the test was retried.
     */
    retryCount: number;
    /**
     * The amount of times the test was repeated as configured by `repeats` option.
     * This value can be lower if the test failed during the repeat and no `retry` is configured.
     */
    repeatCount: number;
    /**
     * If test passed on a second retry.
     */
    flaky: boolean;
}
interface ModuleDiagnostic {
    /**
     * The time it takes to import and initiate an environment.
     */
    environmentSetupDuration: number;
    /**
     * The time it takes Vitest to setup test harness (runner, mocks, etc.).
     */
    prepareDuration: number;
    /**
     * The time it takes to import the test module.
     * This includes importing everything in the module and executing suite callbacks.
     */
    collectDuration: number;
    /**
     * The time it takes to import the setup module.
     */
    setupDuration: number;
    /**
     * Accumulated duration of all tests and hooks in the module.
     */
    duration: number;
}

declare class BasicReporter extends BaseReporter {
    constructor();
    reportSummary(files: File[], errors: unknown[]): void;
}

interface ListRendererOptions {
    renderSucceed?: boolean;
    logger: Logger;
    showHeap: boolean;
    slowTestThreshold: number;
    mode: VitestRunMode;
}
declare function createListRenderer(_tasks: Task[], options: ListRendererOptions): {
    start(): any;
    update(_tasks: Task[]): any;
    stop(): any;
    clear(): void;
};

declare class DefaultReporter extends BaseReporter {
    renderer?: ReturnType<typeof createListRenderer>;
    rendererOptions: ListRendererOptions;
    private renderSucceedDefault?;
    onPathsCollected(paths?: string[]): void;
    onTestRemoved(trigger?: string): Promise<void>;
    onCollected(): void;
    onFinished(files?: _vitest_runner.File[], errors?: unknown[]): void;
    onWatcherStart(files?: _vitest_runner.File[], errors?: unknown[]): Promise<void>;
    stopListRender(): void;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
}

interface DotRendererOptions {
    logger: Logger;
}
declare function createDotRenderer(_tasks: Task[], options: DotRendererOptions): {
    start(): any;
    update(_tasks: Task[]): any;
    stop(): Promise<any>;
    clear(): void;
};

declare class DotReporter extends BaseReporter {
    renderer?: ReturnType<typeof createDotRenderer>;
    onCollected(): void;
    onFinished(files?: _vitest_runner.File[], errors?: unknown[]): Promise<void>;
    onWatcherStart(): Promise<void>;
    stopListRender(): Promise<void>;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
}

declare class GithubActionsReporter implements Reporter {
    ctx: Vitest;
    onInit(ctx: Vitest): void;
    onFinished(files?: File[], errors?: unknown[]): void;
}

declare class HangingProcessReporter implements Reporter {
    whyRunning: (() => void) | undefined;
    onInit(): void;
    onProcessTimeout(): void;
}

type Status = 'passed' | 'failed' | 'skipped' | 'pending' | 'todo' | 'disabled';
type Milliseconds = number;
interface Callsite {
    line: number;
    column: number;
}
interface JsonAssertionResult {
    ancestorTitles: Array<string>;
    fullName: string;
    status: Status;
    title: string;
    meta: TaskMeta;
    duration?: Milliseconds | null;
    failureMessages: Array<string> | null;
    location?: Callsite | null;
}
interface JsonTestResult {
    message: string;
    name: string;
    status: 'failed' | 'passed';
    startTime: number;
    endTime: number;
    assertionResults: Array<JsonAssertionResult>;
}
interface JsonTestResults {
    numFailedTests: number;
    numFailedTestSuites: number;
    numPassedTests: number;
    numPassedTestSuites: number;
    numPendingTests: number;
    numPendingTestSuites: number;
    numTodoTests: number;
    numTotalTests: number;
    numTotalTestSuites: number;
    startTime: number;
    success: boolean;
    testResults: Array<JsonTestResult>;
    snapshot: SnapshotSummary;
}
interface JsonOptions$1 {
    outputFile?: string;
}
declare class JsonReporter implements Reporter {
    start: number;
    ctx: Vitest;
    options: JsonOptions$1;
    constructor(options: JsonOptions$1);
    onInit(ctx: Vitest): void;
    protected logTasks(files: File[]): Promise<void>;
    onFinished(files?: File[]): Promise<void>;
    /**
     * Writes the report to an output file if specified in the config,
     * or logs it to the console otherwise.
     * @param report
     */
    writeReport(report: string): Promise<void>;
}

interface JUnitOptions {
    outputFile?: string;
    classname?: string;
    suiteName?: string;
    /**
     * Write <system-out> and <system-err> for console output
     * @default true
     */
    includeConsoleOutput?: boolean;
    /**
     * Add <testcase file="..."> attribute (validated on CIRCLE CI and GitLab CI)
     * @default false
     */
    addFileAttribute?: boolean;
}
declare class JUnitReporter implements Reporter {
    private ctx;
    private reportFile?;
    private baseLog;
    private logger;
    private _timeStart;
    private fileFd?;
    private options;
    constructor(options: JUnitOptions);
    onInit(ctx: Vitest): Promise<void>;
    writeElement(name: string, attrs: Record<string, any>, children: () => Promise<void>): Promise<void>;
    writeLogs(task: Task, type: 'err' | 'out'): Promise<void>;
    writeTasks(tasks: Task[], filename: string): Promise<void>;
    onFinished(files?: _vitest_runner.File[]): Promise<void>;
}

declare class TapReporter implements Reporter {
    protected ctx: Vitest;
    private logger;
    onInit(ctx: Vitest): void;
    static getComment(task: Task): string;
    private logErrorDetails;
    protected logTasks(tasks: Task[]): void;
    onFinished(files?: _vitest_runner.File[]): void;
}

declare class TapFlatReporter extends TapReporter {
    onInit(ctx: Vitest): void;
    onFinished(files?: _vitest_runner.File[]): void;
}

declare class VerboseReporter extends DefaultReporter {
    protected verbose: boolean;
    constructor();
    onTaskUpdate(packs: TaskResultPack[]): void;
}

interface TableRendererOptions {
    renderSucceed?: boolean;
    logger: Logger;
    showHeap: boolean;
    slowTestThreshold: number;
    compare?: FlatBenchmarkReport;
}
declare function createTableRenderer(_tasks: Task[], options: TableRendererOptions): {
    start(): any;
    update(_tasks: Task[]): any;
    stop(): any;
    clear(): void;
};

declare class TableReporter extends BaseReporter {
    renderer?: ReturnType<typeof createTableRenderer>;
    rendererOptions: TableRendererOptions;
    onTestRemoved(trigger?: string): void;
    onCollected(): Promise<void>;
    onTaskUpdate(packs: TaskResultPack[]): void;
    onFinished(files?: File[], errors?: unknown[]): Promise<void>;
    onWatcherStart(): Promise<void>;
    stopListRender(): void;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
}
interface FlatBenchmarkReport {
    [id: string]: FormattedBenchmarkResult;
}
type FormattedBenchmarkResult = BenchmarkResult & {
    id: string;
};

declare const BenchmarkReportsMap: {
    default: typeof TableReporter;
    verbose: typeof VerboseReporter;
};
type BenchmarkBuiltinReporters = keyof typeof BenchmarkReportsMap;

/**
 * @deprecated Use `TestModule` instead
 */
declare const TestFile: typeof TestModule;

/**
 * @deprecated Use `ModuleDiagnostic` instead
 */
type FileDiagnostic = ModuleDiagnostic;

declare const ReportersMap: {
    default: typeof DefaultReporter;
    basic: typeof BasicReporter;
    blob: typeof BlobReporter;
    verbose: typeof VerboseReporter;
    dot: typeof DotReporter;
    json: typeof JsonReporter;
    tap: typeof TapReporter;
    'tap-flat': typeof TapFlatReporter;
    junit: typeof JUnitReporter;
    'hanging-process': typeof HangingProcessReporter;
    'github-actions': typeof GithubActionsReporter;
};
type BuiltinReporters = keyof typeof ReportersMap;
interface BuiltinReporterOptions {
    'default': BaseOptions;
    'basic': BaseOptions;
    'verbose': never;
    'dot': BaseOptions;
    'json': JsonOptions$1;
    'blob': BlobOptions;
    'tap': never;
    'tap-flat': never;
    'junit': JUnitOptions;
    'hanging-process': never;
    'html': HTMLOptions;
}

interface TestSequencer {
    /**
     * Slicing tests into shards. Will be run before `sort`.
     * Only run, if `shard` is defined.
     */
    shard: (files: WorkspaceSpec[]) => Awaitable<WorkspaceSpec[]>;
    sort: (files: WorkspaceSpec[]) => Awaitable<WorkspaceSpec[]>;
}
interface TestSequencerConstructor {
    new (ctx: Vitest): TestSequencer;
}

interface BenchmarkUserOptions {
    /**
     * Include globs for benchmark test files
     *
     * @default ['**\/*.{bench,benchmark}.?(c|m)[jt]s?(x)']
     */
    include?: string[];
    /**
     * Exclude globs for benchmark test files
     * @default ['**\/node_modules/**', '**\/dist/**', '**\/cypress/**', '**\/.{idea,git,cache,output,temp}/**', '**\/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*']
     */
    exclude?: string[];
    /**
     * Include globs for in-source benchmark test files
     *
     * @default []
     */
    includeSource?: string[];
    /**
     * Custom reporter for output. Can contain one or more built-in report names, reporter instances,
     * and/or paths to custom reporters
     *
     * @default ['default']
     */
    reporters?: Arrayable<BenchmarkBuiltinReporters | Reporter>;
    /**
     * @deprecated Use `benchmark.outputJson` instead
     */
    outputFile?: string | (Partial<Record<BenchmarkBuiltinReporters, string>> & Record<string, string>);
    /**
     * benchmark output file to compare against
     */
    compare?: string;
    /**
     * benchmark output file
     */
    outputJson?: string;
    /**
     * Include `samples` array of benchmark results for API or custom reporter usages.
     * This is disabled by default to reduce memory usage.
     * @default false
     */
    includeSamples?: boolean;
}

interface Node {
    isRoot(): boolean;
    visit(visitor: Visitor, state: any): void;
}

interface Visitor<N extends Node = Node> {
    onStart(root: N, state: any): void;
    onSummary(root: N, state: any): void;
    onDetail(root: N, state: any): void;
    onSummaryEnd(root: N, state: any): void;
    onEnd(root: N, state: any): void;
}

interface FileOptions {
    file: string;
}

interface ProjectOptions {
    projectRoot: string;
}

interface ReportOptions {
    clover: CloverOptions;
    cobertura: CoberturaOptions;
    "html-spa": HtmlSpaOptions;
    html: HtmlOptions;
    json: JsonOptions;
    "json-summary": JsonSummaryOptions;
    lcov: LcovOptions;
    lcovonly: LcovOnlyOptions;
    none: never;
    teamcity: TeamcityOptions;
    text: TextOptions;
    "text-lcov": TextLcovOptions;
    "text-summary": TextSummaryOptions;
}

interface CloverOptions extends FileOptions, ProjectOptions {}

interface CoberturaOptions extends FileOptions, ProjectOptions {}

interface HtmlSpaOptions extends HtmlOptions {
    metricsToShow: Array<"lines" | "branches" | "functions" | "statements">;
}
interface HtmlOptions {
    verbose: boolean;
    skipEmpty: boolean;
    subdir: string;
    linkMapper: LinkMapper;
}

type JsonOptions = FileOptions;
type JsonSummaryOptions = FileOptions;

interface LcovOptions extends FileOptions, ProjectOptions {}
interface LcovOnlyOptions extends FileOptions, ProjectOptions {}

interface TeamcityOptions extends FileOptions {
    blockName: string;
}

interface TextOptions extends FileOptions {
    maxCols: number;
    skipEmpty: boolean;
    skipFull: boolean;
}
type TextLcovOptions = ProjectOptions;
type TextSummaryOptions = FileOptions;

interface LinkMapper {
    getPath(node: string | Node): string;
    relativePath(source: string | Node, target: string | Node): string;
    assetPath(node: Node, name: string): string;
}

type TransformResult = string | Partial<TransformResult$1> | undefined | null | void;
type CoverageResults = unknown;
interface CoverageProvider {
    name: string;
    /** Called when provider is being initialized before tests run */
    initialize: (ctx: Vitest) => Promise<void> | void;
    /** Called when setting coverage options for Vitest context (`ctx.config.coverage`) */
    resolveOptions: () => ResolvedCoverageOptions;
    /** Callback to clean previous reports */
    clean: (clean?: boolean) => void | Promise<void>;
    /** Called with coverage results after a single test file has been run */
    onAfterSuiteRun: (meta: AfterSuiteRunMeta) => void | Promise<void>;
    /** Callback called when test run fails */
    onTestFailure?: () => void | Promise<void>;
    /** Callback to generate final coverage results */
    generateCoverage: (reportContext: ReportContext) => CoverageResults | Promise<CoverageResults>;
    /** Callback to convert coverage results to coverage reports. Called with results returned from `generateCoverage` */
    reportCoverage: (coverage: CoverageResults, reportContext: ReportContext) => void | Promise<void>;
    /** Callback for `--merge-reports` options. Called with multiple coverage results generated by `generateCoverage`. */
    mergeReports?: (coverages: CoverageResults[]) => void | Promise<void>;
    /** Callback called for instrumenting files with coverage counters. */
    onFileTransform?: (sourceCode: string, id: string, pluginCtx: any) => TransformResult | Promise<TransformResult>;
}
interface ReportContext {
    /** Indicates whether all tests were run. False when only specific tests were run. */
    allTestsRun?: boolean;
}
interface CoverageProviderModule {
    /**
     * Factory for creating a new coverage provider
     */
    getProvider: () => CoverageProvider | Promise<CoverageProvider>;
    /**
     * Executed before tests are run in the worker thread.
     */
    startCoverage?: () => unknown | Promise<unknown>;
    /**
     * Executed on after each run in the worker thread. Possible to return a payload passed to the provider
     */
    takeCoverage?: () => unknown | Promise<unknown>;
    /**
     * Executed after all tests have been run in the worker thread.
     */
    stopCoverage?: () => unknown | Promise<unknown>;
}
type CoverageReporter = keyof ReportOptions | (string & {});
type CoverageReporterWithOptions<ReporterName extends CoverageReporter = CoverageReporter> = ReporterName extends keyof ReportOptions ? ReportOptions[ReporterName] extends never ? [ReporterName, object] : [ReporterName, Partial<ReportOptions[ReporterName]>] : [ReporterName, Record<string, unknown>];
type CoverageProviderName = 'v8' | 'istanbul' | 'custom' | undefined;
type CoverageOptions<T extends CoverageProviderName = CoverageProviderName> = T extends 'istanbul' ? {
    provider: T;
} & CoverageIstanbulOptions : T extends 'v8' ? {
    /**
     * Provider to use for coverage collection.
     *
     * @default 'v8'
     */
    provider: T;
} & CoverageV8Options : T extends 'custom' ? {
    provider: T;
} & CustomProviderOptions : {
    provider?: T;
} & CoverageV8Options;
/** Fields that have default values. Internally these will always be defined. */
type FieldsWithDefaultValues = 'enabled' | 'clean' | 'cleanOnRerun' | 'reportsDirectory' | 'exclude' | 'extension' | 'reportOnFailure' | 'allowExternal' | 'processingConcurrency';
type ResolvedCoverageOptions<T extends CoverageProviderName = CoverageProviderName> = CoverageOptions<T> & Required<Pick<CoverageOptions<T>, FieldsWithDefaultValues>> & {
    reporter: CoverageReporterWithOptions[];
};
interface BaseCoverageOptions {
    /**
     * Enables coverage collection. Can be overridden using `--coverage` CLI option.
     *
     * @default false
     */
    enabled?: boolean;
    /**
     * List of files included in coverage as glob patterns
     *
     * @default ['**']
     */
    include?: string[];
    /**
     * Extensions for files to be included in coverage
     *
     * @default ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.vue', '.svelte', '.marko']
     */
    extension?: string | string[];
    /**
     * List of files excluded from coverage as glob patterns
     *
     * @default ['coverage/**', 'dist/**', '**\/[.]**', 'packages/*\/test?(s)/**', '**\/*.d.ts', '**\/virtual:*', '**\/__x00__*', '**\/\x00*', 'cypress/**', 'test?(s)/**', 'test?(-*).?(c|m)[jt]s?(x)', '**\/*{.,-}{test,spec}?(-d).?(c|m)[jt]s?(x)', '**\/__tests__/**', '**\/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*', '**\/vitest.{workspace,projects}.[jt]s?(on)', '**\/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}']
     */
    exclude?: string[];
    /**
     * Whether to include all files, including the untested ones into report
     *
     * @default true
     */
    all?: boolean;
    /**
     * Clean coverage results before running tests
     *
     * @default true
     */
    clean?: boolean;
    /**
     * Clean coverage report on watch rerun
     *
     * @default true
     */
    cleanOnRerun?: boolean;
    /**
     * Directory to write coverage report to
     *
     * @default './coverage'
     */
    reportsDirectory?: string;
    /**
     * Coverage reporters to use.
     * See [istanbul documentation](https://istanbul.js.org/docs/advanced/alternative-reporters/) for detailed list of all reporters.
     *
     * @default ['text', 'html', 'clover', 'json']
     */
    reporter?: Arrayable$1<CoverageReporter> | (CoverageReporter | [CoverageReporter] | CoverageReporterWithOptions)[];
    /**
     * Do not show files with 100% statement, branch, and function coverage
     *
     * @default false
     */
    skipFull?: boolean;
    /**
     * Configurations for thresholds
     *
     * @example
     *
     * ```ts
     * {
     *   // Thresholds for all files
     *   functions: 95,
     *   branches: 70,
     *   perFile: true,
     *   autoUpdate: true,
     *
     *   // Thresholds for utilities
     *   'src/utils/**.ts': {
     *     lines: 100,
     *     statements: 95,
     *   }
     * }
     * ```
     */
    thresholds?: Thresholds | ({
        [glob: string]: Pick<Thresholds, 100 | 'statements' | 'functions' | 'branches' | 'lines'>;
    } & Thresholds);
    /**
     * Watermarks for statements, lines, branches and functions.
     *
     * Default value is `[50,80]` for each property.
     */
    watermarks?: {
        statements?: [number, number];
        functions?: [number, number];
        branches?: [number, number];
        lines?: [number, number];
    };
    /**
     * Generate coverage report even when tests fail.
     *
     * @default false
     */
    reportOnFailure?: boolean;
    /**
     * Collect coverage of files outside the project `root`.
     *
     * @default false
     */
    allowExternal?: boolean;
    /**
     * Apply exclusions again after coverage has been remapped to original sources.
     * This is useful when your source files are transpiled and may contain source maps
     * of non-source files.
     *
     * Use this option when you are seeing files that show up in report even if they
     * match your `coverage.exclude` patterns.
     *
     * @default false
     */
    excludeAfterRemap?: boolean;
    /**
     * Concurrency limit used when processing the coverage results.
     * Defaults to `Math.min(20, os.availableParallelism?.() ?? os.cpus().length)`
     */
    processingConcurrency?: number;
}
interface CoverageIstanbulOptions extends BaseCoverageOptions {
    /**
     * Set to array of class method names to ignore for coverage
     *
     * @default []
     */
    ignoreClassMethods?: string[];
}
interface CoverageV8Options extends BaseCoverageOptions {
    /**
     * Ignore empty lines, comments and other non-runtime code, e.g. Typescript types
     */
    ignoreEmptyLines?: boolean;
}
interface CustomProviderOptions extends Pick<BaseCoverageOptions, FieldsWithDefaultValues> {
    /** Name of the module or path to a file to load the custom provider from */
    customProviderModule: string;
}
interface Thresholds {
    /** Set global thresholds to `100` */
    100?: boolean;
    /** Check thresholds per file. */
    perFile?: boolean;
    /**
     * Update threshold values automatically when current coverage is higher than earlier thresholds
     *
     * @default false
     */
    autoUpdate?: boolean;
    /** Thresholds for statements */
    statements?: number;
    /** Thresholds for functions */
    functions?: number;
    /** Thresholds for branches */
    branches?: number;
    /** Thresholds for lines */
    lines?: number;
}

type BuiltinPool = 'browser' | 'threads' | 'forks' | 'vmThreads' | 'vmForks' | 'typescript';
type Pool = BuiltinPool | (string & {});
interface PoolOptions extends Record<string, unknown> {
    /**
     * Run tests in `node:worker_threads`.
     *
     * Test isolation (when enabled) is done by spawning a new thread for each test file.
     *
     * This pool is used by default.
     */
    threads?: ThreadsOptions & WorkerContextOptions;
    /**
     * Run tests in `node:child_process` using [`fork()`](https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options)
     *
     * Test isolation (when enabled) is done by spawning a new child process for each test file.
     */
    forks?: ForksOptions & WorkerContextOptions;
    /**
     * Run tests in isolated `node:vm`.
     * Test files are run parallel using `node:worker_threads`.
     *
     * This makes tests run faster, but VM module is unstable. Your tests might leak memory.
     */
    vmThreads?: ThreadsOptions & VmOptions;
    /**
     * Run tests in isolated `node:vm`.
     *
     * Test files are run parallel using `node:child_process` [`fork()`](https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options)
     *
     * This makes tests run faster, but VM module is unstable. Your tests might leak memory.
     */
    vmForks?: ForksOptions & VmOptions;
}
interface ResolvedPoolOptions extends PoolOptions {
    threads?: ResolvedThreadsOptions & WorkerContextOptions;
    forks?: ResolvedForksOptions & WorkerContextOptions;
    vmThreads?: ResolvedThreadsOptions & VmOptions;
    vmForks?: ResolvedForksOptions & VmOptions;
}
interface ThreadsOptions {
    /** Minimum amount of threads to use */
    minThreads?: number | string;
    /** Maximum amount of threads to use */
    maxThreads?: number | string;
    /**
     * Run tests inside a single thread.
     *
     * @default false
     */
    singleThread?: boolean;
    /**
     * Use Atomics to synchronize threads
     *
     * This can improve performance in some cases, but might cause segfault in older Node versions.
     *
     * @default false
     */
    useAtomics?: boolean;
}
interface ResolvedThreadsOptions extends ThreadsOptions {
    minThreads?: number;
    maxThreads?: number;
}
interface ForksOptions {
    /** Minimum amount of child processes to use */
    minForks?: number | string;
    /** Maximum amount of child processes to use */
    maxForks?: number | string;
    /**
     * Run tests inside a single fork.
     *
     * @default false
     */
    singleFork?: boolean;
}
interface ResolvedForksOptions extends ForksOptions {
    minForks?: number;
    maxForks?: number;
}
interface WorkerContextOptions {
    /**
     * Isolate test environment by recycling `worker_threads` or `child_process` after each test
     *
     * @default true
     */
    isolate?: boolean;
    /**
     * Pass additional arguments to `node` process when spawning `worker_threads` or `child_process`.
     *
     * See [Command-line API | Node.js](https://nodejs.org/docs/latest/api/cli.html) for more information.
     *
     * Set to `process.execArgv` to pass all arguments of the current process.
     *
     * Be careful when using, it as some options may crash worker, e.g. --prof, --title. See https://github.com/nodejs/node/issues/41103
     *
     * @default [] // no execution arguments are passed
     */
    execArgv?: string[];
}
interface VmOptions {
    /**
     * Specifies the memory limit for `worker_thread` or `child_process` before they are recycled.
     * If you see memory leaks, try to tinker this value.
     */
    memoryLimit?: string | number;
    /** Isolation is always enabled */
    isolate?: true;
    /**
     * Pass additional arguments to `node` process when spawning `worker_threads` or `child_process`.
     *
     * See [Command-line API | Node.js](https://nodejs.org/docs/latest/api/cli.html) for more information.
     *
     * Set to `process.execArgv` to pass all arguments of the current process.
     *
     * Be careful when using, it as some options may crash worker, e.g. --prof, --title. See https://github.com/nodejs/node/issues/41103
     *
     * @default [] // no execution arguments are passed
     */
    execArgv?: string[];
}

type BuiltinEnvironment = 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime';
type VitestEnvironment = BuiltinEnvironment | (string & Record<never, never>);

type CSSModuleScopeStrategy = 'stable' | 'scoped' | 'non-scoped';
type ApiConfig = Pick<ServerOptions, 'port' | 'strictPort' | 'host' | 'middlewareMode'>;

type VitestRunMode = 'test' | 'benchmark';
interface SequenceOptions {
    /**
     * Class that handles sorting and sharding algorithm.
     * If you only need to change sorting, you can extend
     * your custom sequencer from `BaseSequencer` from `vitest/node`.
     * @default BaseSequencer
     */
    sequencer?: TestSequencerConstructor;
    /**
     * Should files and tests run in random order.
     * @default false
     */
    shuffle?: boolean | {
        /**
         * Should files run in random order. Long running tests will not start
         * earlier if you enable this option.
         * @default false
         */
        files?: boolean;
        /**
         * Should tests run in random order.
         * @default false
         */
        tests?: boolean;
    };
    /**
     * Should tests run in parallel.
     * @default false
     */
    concurrent?: boolean;
    /**
     * Defines how setup files should be ordered
     * - 'parallel' will run all setup files in parallel
     * - 'list' will run all setup files in the order they are defined in the config file
     * @default 'parallel'
     */
    setupFiles?: SequenceSetupFiles;
    /**
     * Seed for the random number generator.
     * @default Date.now()
     */
    seed?: number;
    /**
     * Defines how hooks should be ordered
     * - `stack` will order "after" hooks in reverse order, "before" hooks will run sequentially
     * - `list` will order hooks in the order they are defined
     * - `parallel` will run hooks in a single group in parallel
     * @default 'parallel'
     */
    hooks?: SequenceHooks;
}
type DepsOptimizationOptions = Omit<DepOptimizationConfig, 'disabled' | 'noDiscovery'> & {
    enabled?: boolean;
};
interface TransformModePatterns {
    /**
     * Use SSR transform pipeline for all modules inside specified tests.
     * Vite plugins will receive `ssr: true` flag when processing those files.
     *
     * @default tests with node or edge environment
     */
    ssr?: string[];
    /**
     * First do a normal transform pipeline (targeting browser),
     * then then do a SSR rewrite to run the code in Node.
     * Vite plugins will receive `ssr: false` flag when processing those files.
     *
     * @default tests with jsdom or happy-dom environment
     */
    web?: string[];
}
interface DepsOptions {
    /**
     * Enable dependency optimization. This can improve the performance of your tests.
     */
    optimizer?: {
        web?: DepsOptimizationOptions;
        ssr?: DepsOptimizationOptions;
    };
    web?: {
        /**
         * Should Vitest process assets (.png, .svg, .jpg, etc) files and resolve them like Vite does in the browser.
         *
         * These module will have a default export equal to the path to the asset, if no query is specified.
         *
         * **At the moment, this option only works with `{ pool: 'vmThreads' }`.**
         *
         * @default true
         */
        transformAssets?: boolean;
        /**
         * Should Vitest process CSS (.css, .scss, .sass, etc) files and resolve them like Vite does in the browser.
         *
         * If CSS files are disabled with `css` options, this option will just silence UNKNOWN_EXTENSION errors.
         *
         * **At the moment, this option only works with `{ pool: 'vmThreads' }`.**
         *
         * @default true
         */
        transformCss?: boolean;
        /**
         * Regexp pattern to match external files that should be transformed.
         *
         * By default, files inside `node_modules` are externalized and not transformed.
         *
         * **At the moment, this option only works with `{ pool: 'vmThreads' }`.**
         *
         * @default []
         */
        transformGlobPattern?: RegExp | RegExp[];
    };
    /**
     * Externalize means that Vite will bypass the package to native Node.
     *
     * Externalized dependencies will not be applied Vite's transformers and resolvers.
     * And does not support HMR on reload.
     *
     * Typically, packages under `node_modules` are externalized.
     *
     * @deprecated If you rely on vite-node directly, use `server.deps.external` instead. Otherwise, consider using `deps.optimizer.{web,ssr}.exclude`.
     */
    external?: (string | RegExp)[];
    /**
     * Vite will process inlined modules.
     *
     * This could be helpful to handle packages that ship `.js` in ESM format (that Node can't handle).
     *
     * If `true`, every dependency will be inlined
     *
     * @deprecated If you rely on vite-node directly, use `server.deps.inline` instead. Otherwise, consider using `deps.optimizer.{web,ssr}.include`.
     */
    inline?: (string | RegExp)[] | true;
    /**
     * Interpret CJS module's default as named exports
     *
     * @default true
     */
    interopDefault?: boolean;
    /**
     * When a dependency is a valid ESM package, try to guess the cjs version based on the path.
     * This will significantly improve the performance in huge repo, but might potentially
     * cause some misalignment if a package have different logic in ESM and CJS mode.
     *
     * @default false
     *
     * @deprecated Use `server.deps.fallbackCJS` instead.
     */
    fallbackCJS?: boolean;
    /**
     * A list of directories relative to the config file that should be treated as module directories.
     *
     * @default ['node_modules']
     */
    moduleDirectories?: string[];
}
type InlineReporter = Reporter;
type ReporterName = BuiltinReporters | 'html' | (string & {});
type ReporterWithOptions<Name extends ReporterName = ReporterName> = Name extends keyof BuiltinReporterOptions ? BuiltinReporterOptions[Name] extends never ? [Name, object] : [Name, Partial<BuiltinReporterOptions[Name]>] : [Name, Record<string, unknown>];
interface InlineConfig {
    /**
     * Name of the project. Will be used to display in the reporter.
     */
    name?: string;
    /**
     * Benchmark options.
     *
     * @default {}
     */
    benchmark?: BenchmarkUserOptions;
    /**
     * Include globs for test files
     *
     * @default ['**\/*.{test,spec}.?(c|m)[jt]s?(x)']
     */
    include?: string[];
    /**
     * Exclude globs for test files
     * @default ['**\/node_modules/**', '**\/dist/**', '**\/cypress/**', '**\/.{idea,git,cache,output,temp}/**', '**\/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*']
     */
    exclude?: string[];
    /**
     * Include globs for in-source test files
     *
     * @default []
     */
    includeSource?: string[];
    /**
     * Handling for dependencies inlining or externalizing
     *
     */
    deps?: DepsOptions;
    /**
     * Vite-node server options
     */
    server?: Omit<ViteNodeServerOptions, 'transformMode'>;
    /**
     * Base directory to scan for the test files
     *
     * @default `config.root`
     */
    dir?: string;
    /**
     * Register apis globally
     *
     * @default false
     */
    globals?: boolean;
    /**
     * Running environment
     *
     * Supports 'node', 'jsdom', 'happy-dom', 'edge-runtime'
     *
     * If used unsupported string, will try to load the package `vitest-environment-${env}`
     *
     * @default 'node'
     */
    environment?: VitestEnvironment;
    /**
     * Environment options.
     */
    environmentOptions?: EnvironmentOptions;
    /**
     * Automatically assign environment based on globs. The first match will be used.
     * This has effect only when running tests inside Node.js.
     *
     * Format: [glob, environment-name]
     *
     * @default []
     * @example [
     *   // all tests in tests/dom will run in jsdom
     *   ['tests/dom/**', 'jsdom'],
     *   // all tests in tests/ with .edge.test.ts will run in edge-runtime
     *   ['**\/*.edge.test.ts', 'edge-runtime'],
     *   // ...
     * ]
     */
    environmentMatchGlobs?: [string, VitestEnvironment][];
    /**
     * Run tests in an isolated environment. This option has no effect on vmThreads pool.
     *
     * Disabling this option might improve performance if your code doesn't rely on side effects.
     *
     * @default true
     */
    isolate?: boolean;
    /**
     * Pool used to run tests in.
     *
     * Supports 'threads', 'forks', 'vmThreads'
     *
     * @default 'forks'
     */
    pool?: Exclude<Pool, 'browser'>;
    /**
     * Pool options
     */
    poolOptions?: PoolOptions;
    /**
     * Maximum number or percentage of workers to run tests in. `poolOptions.{threads,vmThreads}.maxThreads`/`poolOptions.forks.maxForks` has higher priority.
     */
    maxWorkers?: number | string;
    /**
     * Minimum number or percentage of workers to run tests in. `poolOptions.{threads,vmThreads}.minThreads`/`poolOptions.forks.minForks` has higher priority.
     */
    minWorkers?: number | string;
    /**
     * Should all test files run in parallel. Doesn't affect tests running in the same file.
     * Setting this to `false` will override `maxWorkers` and `minWorkers` options to `1`.
     *
     * @default true
     */
    fileParallelism?: boolean;
    /**
     * Automatically assign pool based on globs. The first match will be used.
     *
     * Format: [glob, pool-name]
     *
     * @default []
     * @example [
     *   // all tests in "forks" directory will run using "poolOptions.forks" API
     *   ['tests/forks/**', 'forks'],
     *   // all other tests will run based on "poolOptions.threads" option, if you didn't specify other globs
     *   // ...
     * ]
     */
    poolMatchGlobs?: [string, Exclude<Pool, 'browser'>][];
    /**
     * Path to a workspace configuration file
     */
    workspace?: string;
    /**
     * Update snapshot
     *
     * @default false
     */
    update?: boolean;
    /**
     * Watch mode
     *
     * @default !process.env.CI
     */
    watch?: boolean;
    /**
     * Project root
     *
     * @default process.cwd()
     */
    root?: string;
    /**
     * Custom reporter for output. Can contain one or more built-in report names, reporter instances,
     * and/or paths to custom reporters.
     *
     * @default []
     */
    reporters?: Arrayable$1<ReporterName | InlineReporter> | ((ReporterName | InlineReporter) | [ReporterName] | ReporterWithOptions)[];
    /**
     * Write test results to a file when the --reporter=json` or `--reporter=junit` option is also specified.
     * Also definable individually per reporter by using an object instead.
     */
    outputFile?: string | (Partial<Record<BuiltinReporters, string>> & Record<string, string>);
    /**
     * Default timeout of a test in milliseconds
     *
     * @default 5000
     */
    testTimeout?: number;
    /**
     * Default timeout of a hook in milliseconds
     *
     * @default 10000
     */
    hookTimeout?: number;
    /**
     * Default timeout to wait for close when Vitest shuts down, in milliseconds
     *
     * @default 10000
     */
    teardownTimeout?: number;
    /**
     * Silent mode
     *
     * @default false
     */
    silent?: boolean;
    /**
     * Hide logs for skipped tests
     *
     * @default false
     */
    hideSkippedTests?: boolean;
    /**
     * Path to setup files
     */
    setupFiles?: string | string[];
    /**
     * Path to global setup files
     */
    globalSetup?: string | string[];
    /**
     * Glob patter of file paths that will trigger the whole suite rerun
     *
     * Useful if you are testing calling CLI commands
     *
     * @default ['**\/package.json/**', '**\/{vitest,vite}.config.*\/**']
     */
    forceRerunTriggers?: string[];
    /**
     * Coverage options
     */
    coverage?: CoverageOptions;
    /**
     * run test names with the specified pattern
     */
    testNamePattern?: string | RegExp;
    /**
     * Will call `.mockClear()` on all spies before each test
     * @default false
     */
    clearMocks?: boolean;
    /**
     * Will call `.mockReset()` on all spies before each test
     * @default false
     */
    mockReset?: boolean;
    /**
     * Will call `.mockRestore()` on all spies before each test
     * @default false
     */
    restoreMocks?: boolean;
    /**
     * Will restore all global stubs to their original values before each test
     * @default false
     */
    unstubGlobals?: boolean;
    /**
     * Will restore all env stubs to their original values before each test
     * @default false
     */
    unstubEnvs?: boolean;
    /**
     * Serve API options.
     *
     * When set to true, the default port is 51204.
     *
     * @default false
     */
    api?: boolean | number | ApiConfig;
    /**
     * Enable Vitest UI
     *
     * @default false
     */
    ui?: boolean;
    /**
     * options for test in a browser environment
     * @experimental
     *
     * @default false
     */
    browser?: BrowserConfigOptions;
    /**
     * Open UI automatically.
     *
     * @default !process.env.CI
     */
    open?: boolean;
    /**
     * Base url for the UI
     *
     * @default '/__vitest__/'
     */
    uiBase?: string;
    /**
     * Determine the transform method for all modules imported inside a test that matches the glob pattern.
     */
    testTransformMode?: TransformModePatterns;
    /**
     * Format options for snapshot testing.
     */
    snapshotFormat?: Omit<PrettyFormatOptions, 'plugins'>;
    /**
     * Path to a module which has a default export of diff config.
     */
    diff?: string;
    /**
     * Paths to snapshot serializer modules.
     */
    snapshotSerializers?: string[];
    /**
     * Resolve custom snapshot path
     */
    resolveSnapshotPath?: (path: string, extension: string) => string;
    /**
     * Path to a custom snapshot environment module that has a default export of `SnapshotEnvironment` object.
     */
    snapshotEnvironment?: string;
    /**
     * Pass with no tests
     */
    passWithNoTests?: boolean;
    /**
     * Allow tests and suites that are marked as only
     *
     * @default !process.env.CI
     */
    allowOnly?: boolean;
    /**
     * Show heap usage after each test. Useful for debugging memory leaks.
     */
    logHeapUsage?: boolean;
    /**
     * Custom environment variables assigned to `process.env` before running tests.
     */
    env?: Partial<NodeJS.ProcessEnv>;
    /**
     * Options for @sinon/fake-timers
     */
    fakeTimers?: FakeTimerInstallOpts;
    /**
     * Custom handler for console.log in tests.
     *
     * Return `false` to ignore the log.
     */
    onConsoleLog?: (log: string, type: 'stdout' | 'stderr') => boolean | void;
    /**
     * Enable stack trace filtering. If absent, all stack trace frames
     * will be shown.
     *
     * Return `false` to omit the frame.
     */
    onStackTrace?: (error: ErrorWithDiff, frame: ParsedStack) => boolean | void;
    /**
     * Indicates if CSS files should be processed.
     *
     * When excluded, the CSS files will be replaced with empty strings to bypass the subsequent processing.
     *
     * @default { include: [], modules: { classNameStrategy: false } }
     */
    css?: boolean | {
        include?: RegExp | RegExp[];
        exclude?: RegExp | RegExp[];
        modules?: {
            classNameStrategy?: CSSModuleScopeStrategy;
        };
    };
    /**
     * A number of tests that are allowed to run at the same time marked with `test.concurrent`.
     * @default 5
     */
    maxConcurrency?: number;
    /**
     * Options for configuring cache policy.
     * @default { dir: 'node_modules/.vite/vitest' }
     */
    cache?: false | {
        /**
         * @deprecated Use Vite's "cacheDir" instead if you want to change the cache director. Note caches will be written to "cacheDir\/vitest".
         */
        dir: string;
    };
    /**
     * Options for configuring the order of running tests.
     */
    sequence?: SequenceOptions;
    /**
     * Specifies an `Object`, or an `Array` of `Object`,
     * which defines aliases used to replace values in `import` or `require` statements.
     * Will be merged with the default aliases inside `resolve.alias`.
     */
    alias?: AliasOptions;
    /**
     * Ignore any unhandled errors that occur
     *
     * @default false
     */
    dangerouslyIgnoreUnhandledErrors?: boolean;
    /**
     * Options for configuring typechecking test environment.
     */
    typecheck?: Partial<TypecheckConfig>;
    /**
     * The number of milliseconds after which a test is considered slow and reported as such in the results.
     *
     * @default 300
     */
    slowTestThreshold?: number;
    /**
     * Path to a custom test runner.
     */
    runner?: string;
    /**
     * Debug tests by opening `node:inspector` in worker / child process.
     * Provides similar experience as `--inspect` Node CLI argument.
     *
     * Requires `poolOptions.threads.singleThread: true` OR `poolOptions.forks.singleFork: true`.
     */
    inspect?: boolean | string;
    /**
     * Debug tests by opening `node:inspector` in worker / child process and wait for debugger to connect.
     * Provides similar experience as `--inspect-brk` Node CLI argument.
     *
     * Requires `poolOptions.threads.singleThread: true` OR `poolOptions.forks.singleFork: true`.
     */
    inspectBrk?: boolean | string;
    /**
     * Inspector options. If `--inspect` or `--inspect-brk` is enabled, these options will be passed to the inspector.
     */
    inspector?: {
        /**
         * Enable inspector
         */
        enabled?: boolean;
        /**
         * Port to run inspector on
         */
        port?: number;
        /**
         * Host to run inspector on
         */
        host?: string;
        /**
         * Wait for debugger to connect before running tests
         */
        waitForDebugger?: boolean;
    };
    /**
     * Define variables that will be returned from `inject` in the test environment.
     * @example
     * ```ts
     * // vitest.config.ts
     * export default defineConfig({
     *   test: {
     *     provide: {
     *       someKey: 'someValue'
     *     }
     *   }
     * })
     * ```
     * ```ts
     * // test file
     * import { inject } from 'vitest'
     * const value = inject('someKey') // 'someValue'
     * ```
     */
    provide?: Partial<ProvidedContext>;
    /**
     * Configuration options for expect() matches.
     */
    expect?: {
        /**
         * Throw an error if tests don't have any expect() assertions.
         */
        requireAssertions?: boolean;
        /**
         * Default options for expect.poll()
         */
        poll?: {
            /**
             * Timeout in milliseconds
             * @default 1000
             */
            timeout?: number;
            /**
             * Polling interval in milliseconds
             * @default 50
             */
            interval?: number;
        };
    };
    /**
     * Modify default Chai config. Vitest uses Chai for `expect` and `assert` matches.
     * https://github.com/chaijs/chai/blob/4.x.x/lib/chai/config.js
     */
    chaiConfig?: ChaiConfig;
    /**
     * Stop test execution when given number of tests have failed.
     */
    bail?: number;
    /**
     * Retry the test specific number of times if it fails.
     *
     * @default 0
     */
    retry?: number;
    /**
     * Show full diff when snapshot fails instead of a patch.
     */
    expandSnapshotDiff?: boolean;
    /**
     * By default, Vitest automatically intercepts console logging during tests for extra formatting of test file, test title, etc...
     * This is also required for console log preview on Vitest UI.
     * However, disabling such interception might help when you want to debug a code with normal synchronus terminal console logging.
     *
     * This option has no effect on browser pool since Vitest preserves original logging on browser devtools.
     *
     * @default false
     */
    disableConsoleIntercept?: boolean;
    /**
     * Always print console stack traces.
     *
     * @default false
     */
    printConsoleTrace?: boolean;
    /**
     * Include "location" property inside the test definition
     *
     * @default false
     */
    includeTaskLocation?: boolean;
}
interface TypecheckConfig {
    /**
     * Run typechecking tests alongisde regular tests.
     */
    enabled?: boolean;
    /**
     * When typechecking is enabled, only run typechecking tests.
     */
    only?: boolean;
    /**
     * What tools to use for type checking.
     *
     * @default 'tsc'
     */
    checker: 'tsc' | 'vue-tsc' | (string & Record<never, never>);
    /**
     * Pattern for files that should be treated as test files
     *
     * @default ['**\/*.{test,spec}-d.?(c|m)[jt]s?(x)']
     */
    include: string[];
    /**
     * Pattern for files that should not be treated as test files
     *
     * @default ['**\/node_modules/**', '**\/dist/**', '**\/cypress/**', '**\/.{idea,git,cache,output,temp}/**', '**\/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*']
     */
    exclude: string[];
    /**
     * Check JS files that have `@ts-check` comment.
     * If you have it enabled in tsconfig, this will not overwrite it.
     */
    allowJs?: boolean;
    /**
     * Do not fail, if Vitest found errors outside the test files.
     */
    ignoreSourceErrors?: boolean;
    /**
     * Path to tsconfig, relative to the project root.
     */
    tsconfig?: string;
}
interface UserConfig extends InlineConfig {
    /**
     * Path to the config file.
     *
     * Default resolving to `vitest.config.*`, `vite.config.*`
     *
     * Setting to `false` will disable config resolving.
     */
    config?: string | false | undefined;
    /**
     * Do not run tests when Vitest starts.
     *
     * Vitest will only run tests if it's called programmatically or the test file changes.
     *
     * CLI file filters will be ignored.
     */
    standalone?: boolean;
    /**
     * Use happy-dom
     */
    dom?: boolean;
    /**
     * Run tests that cover a list of source files
     */
    related?: string[] | string;
    /**
     * Overrides Vite mode
     * @default 'test'
     */
    mode?: string;
    /**
     * Runs tests that are affected by the changes in the repository, or between specified branch or commit hash
     * Requires initialized git repository
     * @default false
     */
    changed?: boolean | string;
    /**
     * Test suite shard to execute in a format of <index>/<count>.
     * Will divide tests into a `count` numbers, and run only the `indexed` part.
     * Cannot be used with enabled watch.
     * @example --shard=2/3
     */
    shard?: string;
    /**
     * Name of the project or projects to run.
     */
    project?: string | string[];
    /**
     * Additional exclude patterns
     */
    cliExclude?: string[];
    /**
     * Override vite config's clearScreen from cli
     */
    clearScreen?: boolean;
    /**
     * benchmark.compare option exposed at the top level for cli
     */
    compare?: string;
    /**
     * benchmark.outputJson option exposed at the top level for cli
     */
    outputJson?: string;
    /**
     * Directory of blob reports to merge
     * @default '.vitest-reports'
     */
    mergeReports?: string;
}
interface ResolvedConfig extends Omit<Required<UserConfig>, 'config' | 'filters' | 'browser' | 'coverage' | 'testNamePattern' | 'related' | 'api' | 'reporters' | 'resolveSnapshotPath' | 'benchmark' | 'shard' | 'cache' | 'sequence' | 'typecheck' | 'runner' | 'poolOptions' | 'pool' | 'cliExclude' | 'diff' | 'setupFiles' | 'snapshotEnvironment' | 'bail'> {
    mode: VitestRunMode;
    base?: string;
    diff?: string;
    bail?: number;
    setupFiles: string[];
    snapshotEnvironment?: string;
    config?: string;
    filters?: string[];
    testNamePattern?: RegExp;
    related?: string[];
    coverage: ResolvedCoverageOptions;
    snapshotOptions: SnapshotStateOptions;
    browser: ResolvedBrowserOptions;
    pool: Pool;
    poolOptions?: ResolvedPoolOptions;
    reporters: (InlineReporter | ReporterWithOptions)[];
    defines: Record<string, any>;
    api: ApiConfig & {
        token: string;
    };
    cliExclude?: string[];
    benchmark?: Required<Omit<BenchmarkUserOptions, 'outputFile' | 'compare' | 'outputJson'>> & Pick<BenchmarkUserOptions, 'outputFile' | 'compare' | 'outputJson'>;
    shard?: {
        index: number;
        count: number;
    };
    cache: {
        /**
         * @deprecated
         */
        dir: string;
    } | false;
    sequence: {
        sequencer: TestSequencerConstructor;
        hooks: SequenceHooks;
        setupFiles: SequenceSetupFiles;
        shuffle?: boolean;
        concurrent?: boolean;
        seed: number;
    };
    typecheck: Omit<TypecheckConfig, 'enabled'> & {
        enabled: boolean;
    };
    runner?: string;
    maxWorkers: number;
    minWorkers: number;
}
type NonProjectOptions = 'shard' | 'watch' | 'run' | 'cache' | 'update' | 'reporters' | 'outputFile' | 'teardownTimeout' | 'silent' | 'forceRerunTriggers' | 'testNamePattern' | 'ui' | 'open' | 'uiBase' | 'snapshotFormat' | 'resolveSnapshotPath' | 'passWithNoTests' | 'onConsoleLog' | 'onStackTrace' | 'dangerouslyIgnoreUnhandledErrors' | 'slowTestThreshold' | 'inspect' | 'inspectBrk' | 'coverage' | 'maxWorkers' | 'minWorkers' | 'fileParallelism';
type ProjectConfig = Omit<UserConfig, NonProjectOptions | 'sequencer' | 'deps' | 'poolOptions'> & {
    sequencer?: Omit<SequenceOptions, 'sequencer' | 'seed'>;
    deps?: Omit<DepsOptions, 'moduleDirectories'>;
    poolOptions?: {
        threads?: Pick<NonNullable<PoolOptions['threads']>, 'singleThread' | 'isolate'>;
        vmThreads?: Pick<NonNullable<PoolOptions['vmThreads']>, 'singleThread'>;
        forks?: Pick<NonNullable<PoolOptions['forks']>, 'singleFork' | 'isolate'>;
    };
};
type ResolvedProjectConfig = Omit<ResolvedConfig, NonProjectOptions>;
interface UserWorkspaceConfig extends UserConfig$1 {
    test?: ProjectConfig;
}
type UserProjectConfigFn = (env: ConfigEnv) => UserWorkspaceConfig | Promise<UserWorkspaceConfig>;
type UserProjectConfigExport = UserWorkspaceConfig | Promise<UserWorkspaceConfig> | UserProjectConfigFn;
type WorkspaceProjectConfiguration = string | (UserProjectConfigExport & {
    /**
     * Relative path to the extendable config. All other options will be merged with this config.
     * @example '../vite.config.ts'
     */
    extends?: string;
});

declare class TestProject {
    /**
     * The global vitest instance.
     * @experimental The public Vitest API is experimental and does not follow semver.
     */
    readonly vitest: Vitest;
    /**
     * The workspace project this test project is associated with.
     * @experimental The public Vitest API is experimental and does not follow semver.
     */
    readonly workspaceProject: WorkspaceProject;
    /**
     * Vite's dev server instance. Every workspace project has its own server.
     */
    readonly vite: ViteDevServer;
    /**
     * Resolved project configuration.
     */
    readonly config: ResolvedProjectConfig;
    /**
     * Resolved global configuration. If there are no workspace projects, this will be the same as `config`.
     */
    readonly globalConfig: ResolvedConfig;
    /**
     * The name of the project or an empty string if not set.
     */
    readonly name: string;
    constructor(workspaceProject: WorkspaceProject);
    /**
     * Serialized project configuration. This is the config that tests receive.
     */
    get serializedConfig(): SerializedConfig;
    /**
     * Custom context provided to the project.
     */
    context(): ProvidedContext;
    /**
     * Provide a custom serializable context to the project. This context will be available for tests once they run.
     */
    provide<T extends keyof ProvidedContext & string>(key: T, value: ProvidedContext[T]): void;
    toJSON(): SerializedTestProject;
}
interface SerializedTestProject {
    name: string;
    serializedConfig: SerializedConfig;
    context: ProvidedContext;
}

declare class TestSpecification {
    /**
     * @deprecated use `project` instead
     */
    readonly 0: WorkspaceProject;
    /**
     * @deprecated use `moduleId` instead
     */
    readonly 1: string;
    /**
     * @deprecated use `pool` instead
     */
    readonly 2: {
        pool: Pool;
    };
    readonly project: TestProject;
    readonly moduleId: string;
    readonly pool: Pool;
    constructor(workspaceProject: WorkspaceProject, moduleId: string, pool: Pool);
    toJSON(): SerializedTestSpecification;
    /**
     * for backwards compatibility
     * @deprecated
     */
    [Symbol.iterator](): Generator<string | WorkspaceProject, void, unknown>;
}

/**
 * @deprecated use TestSpecification instead
 */
type WorkspaceSpec = TestSpecification & [
    /**
     * @deprecated use spec.project instead
     */
    project: WorkspaceProject,
    /**
     * @deprecated use spec.moduleId instead
     */
    file: string,
    /**
     * @deprecated use spec.pool instead
     */
    options: {
        pool: Pool;
    }
];
type RunWithFiles = (files: WorkspaceSpec[], invalidates?: string[]) => Awaitable$1<void>;
interface ProcessPool {
    name: string;
    runTests: RunWithFiles;
    collectTests: RunWithFiles;
    close?: () => Awaitable$1<void>;
}
declare function getFilePoolName(project: WorkspaceProject, file: string): Pool;

interface SuiteResultCache {
    failed: boolean;
    duration: number;
}
declare class ResultsCache {
    private cache;
    private workspacesKeyMap;
    private cachePath;
    private version;
    private root;
    constructor(version: string);
    getCachePath(): string | null;
    setConfig(root: string, config: ResolvedConfig['cache']): void;
    getResults(key: string): SuiteResultCache | undefined;
    readFromCache(): Promise<void>;
    updateResults(files: File[]): void;
    removeFromCache(filepath: string): void;
    writeToCache(): Promise<void>;
}

type FileStatsCache = Pick<Stats, 'size'>;
declare class FilesStatsCache {
    cache: Map<string, FileStatsCache>;
    getStats(key: string): FileStatsCache | undefined;
    populateStats(root: string, specs: WorkspaceSpec[]): Promise<void>;
    updateStats(fsPath: string, key: string): Promise<void>;
    removeStats(fsPath: string): void;
}

declare class VitestCache {
    results: ResultsCache;
    stats: FilesStatsCache;
    constructor(version: string);
    getFileTestResults(key: string): SuiteResultCache | undefined;
    getFileStats(key: string): {
        size: number;
    } | undefined;
    static resolveCacheDir(root: string, dir?: string, projectName?: string): string;
}

declare class VitestPackageInstaller {
    isPackageExists(name: string, options?: {
        paths?: string[];
    }): boolean;
    ensureInstalled(dependency: string, root: string, version?: string): Promise<boolean>;
}

declare class StateManager {
    filesMap: Map<string, File[]>;
    pathsSet: Set<string>;
    idMap: Map<string, Task>;
    taskFileMap: WeakMap<Task, File>;
    errorsSet: Set<unknown>;
    processTimeoutCauses: Set<string>;
    reportedTasksMap: WeakMap<Task, TestCase | TestSuite | TestModule>;
    catchError(err: unknown, type: string): void;
    clearErrors(): void;
    getUnhandledErrors(): unknown[];
    addProcessTimeoutCause(cause: string): void;
    getProcessTimeoutCauses(): string[];
    getPaths(): string[];
    /**
     * Return files that were running or collected.
     */
    getFiles(keys?: string[]): File[];
    getFilepaths(): string[];
    getFailedFilepaths(): string[];
    collectPaths(paths?: string[]): void;
    collectFiles(project: WorkspaceProject, files?: File[]): void;
    clearFiles(project: WorkspaceProject, paths?: string[]): void;
    updateId(task: Task, project: WorkspaceProject): void;
    getReportedEntity(task: Task): TestCase | TestSuite | TestModule | undefined;
    updateTasks(packs: TaskResultPack[]): void;
    updateUserLog(log: UserConsoleLog): void;
    getCountOfFailedTests(): number;
    cancelFiles(files: string[], project: WorkspaceProject): void;
}

interface VitestOptions {
    packageInstaller?: VitestPackageInstaller;
    stdin?: NodeJS.ReadStream;
    stdout?: NodeJS.WriteStream | Writable;
    stderr?: NodeJS.WriteStream | Writable;
}
declare class Vitest {
    readonly mode: VitestRunMode;
    version: string;
    config: ResolvedConfig;
    configOverride: Partial<ResolvedConfig>;
    server: ViteDevServer;
    state: StateManager;
    snapshot: SnapshotManager;
    cache: VitestCache;
    reporters: Reporter[];
    coverageProvider: CoverageProvider | null | undefined;
    logger: Logger;
    pool: ProcessPool | undefined;
    vitenode: ViteNodeServer;
    invalidates: Set<string>;
    changedTests: Set<string>;
    watchedTests: Set<string>;
    filenamePattern?: string;
    runningPromise?: Promise<void>;
    closingPromise?: Promise<void>;
    isCancelling: boolean;
    isFirstRun: boolean;
    restartsCount: number;
    runner: ViteNodeRunner;
    packageInstaller: VitestPackageInstaller;
    private coreWorkspaceProject;
    /** @private */
    resolvedProjects: WorkspaceProject[];
    projects: WorkspaceProject[];
    distPath: string;
    private _cachedSpecs;
    private _workspaceConfigPath?;
    /** @deprecated use `_cachedSpecs` */
    projectTestFiles: Map<string, WorkspaceSpec[]>;
    /** @private */
    _browserLastPort: number;
    constructor(mode: VitestRunMode, options?: VitestOptions);
    private _onRestartListeners;
    private _onClose;
    private _onSetServer;
    private _onCancelListeners;
    setServer(options: UserConfig, server: ViteDevServer, cliOptions: UserConfig): Promise<void>;
    provide<T extends keyof ProvidedContext & string>(key: T, value: ProvidedContext[T]): void;
    /**
     * @deprecated internal, use `_createCoreProject` instead
     */
    createCoreProject(): Promise<WorkspaceProject>;
    /**
     * @internal
     */
    _createCoreProject(): Promise<WorkspaceProject>;
    getCoreWorkspaceProject(): WorkspaceProject;
    /**
     * @deprecated use Reported Task API instead
     */
    getProjectByTaskId(taskId: string): WorkspaceProject;
    getProjectByName(name?: string): WorkspaceProject;
    private getWorkspaceConfigPath;
    private resolveWorkspace;
    private initCoverageProvider;
    mergeReports(): Promise<void>;
    collect(filters?: string[]): Promise<{
        tests: File[];
        errors: unknown[];
    }>;
    listFiles(filters?: string[]): Promise<WorkspaceSpec[]>;
    start(filters?: string[]): Promise<void>;
    init(): Promise<void>;
    private getTestDependencies;
    filterTestsBySource(specs: WorkspaceSpec[]): Promise<WorkspaceSpec[]>;
    /**
     * @deprecated remove when vscode extension supports "getFileWorkspaceSpecs"
     */
    getProjectsByTestFile(file: string): WorkspaceSpec[];
    getFileWorkspaceSpecs(file: string): WorkspaceSpec[];
    initializeGlobalSetup(paths: TestSpecification[]): Promise<void>;
    runFiles(specs: TestSpecification[], allTestsRun: boolean): Promise<void>;
    collectFiles(specs: WorkspaceSpec[]): Promise<void>;
    cancelCurrentRun(reason: CancelReason): Promise<void>;
    initBrowserServers(): Promise<void>;
    rerunFiles(files?: string[], trigger?: string, allTestsRun?: boolean): Promise<void>;
    changeProjectName(pattern: string): Promise<void>;
    changeNamePattern(pattern: string, files?: string[], trigger?: string): Promise<void>;
    changeFilenamePattern(pattern: string, files?: string[]): Promise<void>;
    rerunFailed(): Promise<void>;
    updateSnapshot(files?: string[]): Promise<void>;
    private _rerunTimer;
    private scheduleRerun;
    getModuleProjects(filepath: string): WorkspaceProject[];
    /**
     * Watch only the specified tests. If no tests are provided, all tests will be watched.
     */
    watchTests(tests: string[]): void;
    private updateLastChanged;
    onChange: (id: string) => void;
    onUnlink: (id: string) => void;
    onAdd: (id: string) => Promise<void>;
    checkUnhandledErrors(errors: unknown[]): void;
    private unregisterWatcher;
    private registerWatcher;
    /**
     * @returns A value indicating whether rerun is needed (changedTests was mutated)
     */
    private handleFileChanged;
    private reportCoverage;
    close(): Promise<void>;
    /**
     * Close the thread pool and exit the process
     */
    exit(force?: boolean): Promise<void>;
    report<T extends keyof Reporter>(name: T, ...args: ArgumentsType<Reporter[T]>): Promise<void>;
    getTestFilepaths(): Promise<string[]>;
    globTestSpecs(filters?: string[]): Promise<WorkspaceSpec[]>;
    /**
     * @deprecated use globTestSpecs instead
     */
    globTestFiles(filters?: string[]): Promise<WorkspaceSpec[]>;
    private ensureSpecCached;
    shouldKeepServer(): boolean;
    onServerRestart(fn: OnServerRestartHandler): void;
    onAfterSetServer(fn: OnServerRestartHandler): void;
    onCancel(fn: (reason: CancelReason) => void): void;
    onClose(fn: () => void): void;
}

export { type HTMLOptions as $, type ApiConfig as A, type BaseCoverageOptions as B, type CoverageProvider as C, type DepsOptimizationOptions as D, type ResolvedConfig as E, type ProjectConfig as F, type BenchmarkUserOptions as G, type VitestOptions as H, type InlineConfig as I, WorkspaceProject as J, type TestSequencer as K, Logger as L, type WorkspaceSpec as M, TestModule as N, type ModuleDiagnostic as O, type Pool as P, VitestPackageInstaller as Q, type ResolvedCoverageOptions as R, type SerializedTestSpecification as S, type TscErrorInfo as T, type UserWorkspaceConfig as U, Vitest as V, type WorkspaceProjectConfiguration as W, type ProcessPool as X, getFilePoolName as Y, TestProject as Z, type SerializedTestProject as _, type ReportContext as a, type JsonOptions$1 as a0, type JUnitOptions as a1, TestCase as a2, TestSuite as a3, type TaskOptions as a4, TestCollection as a5, type TestDiagnostic as a6, type TestResult as a7, type TestResultFailed as a8, type TestResultPassed as a9, VerboseReporter as aA, BaseReporter as aB, TestFile as aC, type FileDiagnostic as aD, ReportersMap as aE, type BuiltinReporters as aF, type BuiltinReporterOptions as aG, type JsonAssertionResult as aH, type JsonTestResult as aI, type JsonTestResults as aJ, BenchmarkReportsMap as aK, type BenchmarkBuiltinReporters as aL, type TestResultSkipped as aa, type TestSequencerConstructor as ab, TestSpecification as ac, type BrowserBuiltinProvider as ad, type BrowserCommand as ae, type BrowserCommandContext as af, type BrowserOrchestrator as ag, type BrowserProvider as ah, type BrowserProviderInitializationOptions as ai, type BrowserProviderModule as aj, type BrowserProviderOptions as ak, type BrowserServer as al, type BrowserServerState as am, type BrowserServerStateContext as an, type CDPSession as ao, type ResolvedBrowserOptions as ap, type ResolvedProjectConfig as aq, BasicReporter as ar, DefaultReporter as as, DotReporter as at, GithubActionsReporter as au, HangingProcessReporter as av, JsonReporter as aw, JUnitReporter as ax, TapFlatReporter as ay, TapReporter as az, type CoverageProviderModule as b, type CoverageV8Options as c, type UserProjectConfigFn as d, type UserProjectConfigExport as e, type VitestEnvironment as f, type RawErrsMap as g, type CollectLineNumbers as h, type CollectLines as i, type RootAndTarget as j, type Context as k, type CoverageReporter as l, type CoverageProviderName as m, type CoverageOptions as n, type CoverageIstanbulOptions as o, type CustomProviderOptions as p, type Reporter as q, type BrowserScript as r, type BrowserConfigOptions as s, type BuiltinEnvironment as t, type PoolOptions as u, type CSSModuleScopeStrategy as v, type VitestRunMode as w, type TransformModePatterns as x, type TypecheckConfig as y, type UserConfig as z };
