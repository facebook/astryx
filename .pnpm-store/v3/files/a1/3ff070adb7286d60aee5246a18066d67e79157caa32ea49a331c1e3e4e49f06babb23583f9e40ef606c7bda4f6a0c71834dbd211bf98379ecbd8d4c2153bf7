import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import timers from 'node:timers';
import util from 'node:util';
import { startTests, collectTests } from '@vitest/runner';
import { KNOWN_ASSET_TYPES } from 'vite-node/constants';
import { installSourcemapsSupport } from 'vite-node/source-map';
import { s as setupChaiConfig, r as resolveTestRunner, a as resolveSnapshotEnvironment } from '../chunks/index.nEwtF0bu.js';
import { s as startCoverageInsideWorker, a as stopCoverageInsideWorker } from '../chunks/coverage.BoMDb1ip.js';
import { V as VitestIndex } from '../chunks/index.ckWaX2gY.js';
import { c as closeInspector } from '../chunks/inspector.70d6emsh.js';
import { s as setupCommonEnv } from '../chunks/setup-common.Dj6BZI3u.js';
import { g as getWorkerState } from '../chunks/utils.C8RiOc4B.js';
import 'chai';
import 'node:path';
import '../path.js';
import 'node:url';
import '../chunks/rpc.C3q9uwRX.js';
import '@vitest/utils';
import '../chunks/index.68735LiX.js';
import '../chunks/vi.DgezovHB.js';
import '@vitest/expect';
import '@vitest/runner/utils';
import '../chunks/_commonjsHelpers.BFTU3MAI.js';
import '@vitest/snapshot';
import '@vitest/utils/error';
import '@vitest/utils/source-map';
import '../chunks/date.W2xKR2qe.js';
import '@vitest/spy';
import '../chunks/run-once.2ogXb3JV.js';
import '../chunks/benchmark.Cdu9hjj4.js';
import 'expect-type';

async function run(method, files, config, executor) {
  const workerState = getWorkerState();
  await setupCommonEnv(config);
  Object.defineProperty(globalThis, "__vitest_index__", {
    value: VitestIndex,
    enumerable: false
  });
  if (workerState.environment.transformMode === "web") {
    const _require = createRequire(import.meta.url);
    _require.extensions[".css"] = resolveCss;
    _require.extensions[".scss"] = resolveCss;
    _require.extensions[".sass"] = resolveCss;
    _require.extensions[".less"] = resolveCss;
    KNOWN_ASSET_TYPES.forEach((type) => {
      _require.extensions[`.${type}`] = resolveAsset;
    });
    process.env.SSR = "";
  } else {
    process.env.SSR = "1";
  }
  globalThis.__vitest_required__ = {
    util,
    timers
  };
  installSourcemapsSupport({
    getSourceMap: (source) => workerState.moduleCache.getSourceMap(source)
  });
  await startCoverageInsideWorker(config.coverage, executor);
  if (config.chaiConfig) {
    setupChaiConfig(config.chaiConfig);
  }
  const [runner, snapshotEnvironment] = await Promise.all([
    resolveTestRunner(config, executor),
    resolveSnapshotEnvironment(config, executor)
  ]);
  config.snapshotOptions.snapshotEnvironment = snapshotEnvironment;
  workerState.onCancel.then((reason) => {
    closeInspector(config);
    runner.onCancel?.(reason);
  });
  workerState.durations.prepare = performance.now() - workerState.durations.prepare;
  const { vi } = VitestIndex;
  for (const file of files) {
    workerState.filepath = file;
    if (method === "run") {
      await startTests([file], runner);
    } else {
      await collectTests([file], runner);
    }
    vi.resetConfig();
    vi.restoreAllMocks();
  }
  await stopCoverageInsideWorker(config.coverage, executor);
}
function resolveCss(mod) {
  mod.exports = "";
}
function resolveAsset(mod, url) {
  mod.exports = url;
}

export { run };
