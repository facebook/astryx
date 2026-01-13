import { C as CoverageProvider, b as CoverageProviderModule } from './chunks/reporters.nr4dxCkA.js';
import { a as SerializedCoverageConfig, S as SerializedConfig } from './chunks/config.Cy0C388Z.js';
import * as spy$1 from '@vitest/spy';
import { DiffOptions } from '@vitest/expect';
import { VitestExecutor } from './execute.js';
export { collectTests, processError, startTests } from '@vitest/runner';
import './chunks/environment.LoooBwUu.js';
import 'node:stream';
import 'vite';
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
import '@vitest/snapshot/environment';
import './chunks/worker.tN5KGIih.js';
import 'node:vm';
import '@vitest/mocker';
import './chunks/mocker.cRtM890J.js';

function _mergeNamespaces(n, m) {
  m.forEach(function (e) {
    e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
      if (k !== 'default' && !(k in n)) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  });
  return Object.freeze(n);
}

var spy = /*#__PURE__*/_mergeNamespaces({
  __proto__: null
}, [spy$1]);

interface Loader {
    executeId: (id: string) => Promise<{
        default: CoverageProviderModule;
    }>;
    isBrowser?: boolean;
}
declare function getCoverageProvider(options: SerializedCoverageConfig | undefined, loader: Loader): Promise<CoverageProvider | null>;
declare function startCoverageInsideWorker(options: SerializedCoverageConfig | undefined, loader: Loader): Promise<unknown>;
declare function takeCoverageInsideWorker(options: SerializedCoverageConfig | undefined, loader: Loader): Promise<unknown>;
declare function stopCoverageInsideWorker(options: SerializedCoverageConfig | undefined, loader: Loader): Promise<unknown>;

declare function setupCommonEnv(config: SerializedConfig): Promise<void>;
declare function loadDiffConfig(config: SerializedConfig, executor: VitestExecutor): Promise<DiffOptions | undefined>;
declare function loadSnapshotSerializers(config: SerializedConfig, executor: VitestExecutor): Promise<void>;

export { spy as SpyModule, getCoverageProvider, loadDiffConfig, loadSnapshotSerializers, setupCommonEnv, startCoverageInsideWorker, stopCoverageInsideWorker, takeCoverageInsideWorker };
