import { UserConfig as UserConfig$1, ConfigEnv } from 'vite';
export { ConfigEnv, Plugin, UserConfig as ViteUserConfig, mergeConfig } from 'vite';
import { R as ResolvedCoverageOptions, c as CoverageV8Options, U as UserWorkspaceConfig, d as UserProjectConfigFn, e as UserProjectConfigExport, W as WorkspaceProjectConfiguration } from './chunks/reporters.nr4dxCkA.js';
import './chunks/vite.CzKp4x9w.js';
import '@vitest/runner';
import './chunks/environment.LoooBwUu.js';
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

declare const defaultBrowserPort = 63315;
declare const extraInlineDeps: RegExp[];

declare const defaultInclude: string[];
declare const defaultExclude: string[];
declare const coverageConfigDefaults: ResolvedCoverageOptions;
declare const configDefaults: Readonly<{
    allowOnly: boolean;
    isolate: true;
    watch: boolean;
    globals: false;
    environment: "node";
    pool: "forks";
    clearMocks: false;
    restoreMocks: false;
    mockReset: false;
    unstubGlobals: false;
    unstubEnvs: false;
    include: string[];
    exclude: string[];
    teardownTimeout: number;
    forceRerunTriggers: string[];
    update: false;
    reporters: never[];
    silent: false;
    hideSkippedTests: false;
    api: false;
    ui: false;
    uiBase: string;
    open: boolean;
    css: {
        include: never[];
    };
    coverage: CoverageV8Options;
    fakeTimers: {
        loopLimit: number;
        shouldClearNativeTimers: true;
        toFake: ("setTimeout" | "setInterval" | "clearInterval" | "clearTimeout" | "setImmediate" | "clearImmediate" | "Date")[];
    };
    maxConcurrency: number;
    dangerouslyIgnoreUnhandledErrors: false;
    typecheck: {
        checker: "tsc";
        include: string[];
        exclude: string[];
    };
    slowTestThreshold: number;
    disableConsoleIntercept: false;
}>;

/**
 * @deprecated Use `ViteUserConfig` instead
 */
type UserConfig = UserConfig$1;

type UserConfigFnObject = (env: ConfigEnv) => UserConfig$1;
type UserConfigFnPromise = (env: ConfigEnv) => Promise<UserConfig$1>;
type UserConfigFn = (env: ConfigEnv) => UserConfig$1 | Promise<UserConfig$1>;
type UserConfigExport = UserConfig$1 | Promise<UserConfig$1> | UserConfigFnObject | UserConfigFnPromise | UserConfigFn;
declare function defineConfig(config: UserConfig$1): UserConfig$1;
declare function defineConfig(config: Promise<UserConfig$1>): Promise<UserConfig$1>;
declare function defineConfig(config: UserConfigFnObject): UserConfigFnObject;
declare function defineConfig(config: UserConfigExport): UserConfigExport;
declare function defineProject(config: UserWorkspaceConfig): UserWorkspaceConfig;
declare function defineProject(config: Promise<UserWorkspaceConfig>): Promise<UserWorkspaceConfig>;
declare function defineProject(config: UserProjectConfigFn): UserProjectConfigFn;
declare function defineProject(config: UserProjectConfigExport): UserProjectConfigExport;
declare function defineWorkspace(config: WorkspaceProjectConfiguration[]): WorkspaceProjectConfiguration[];

export { type UserConfig, type UserConfigExport, type UserConfigFn, type UserConfigFnObject, type UserConfigFnPromise, UserProjectConfigExport, UserProjectConfigFn, UserWorkspaceConfig, WorkspaceProjectConfiguration, configDefaults, coverageConfigDefaults, defaultBrowserPort, defaultExclude, defaultInclude, defineConfig, defineProject, defineWorkspace, extraInlineDeps };
