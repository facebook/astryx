import { W as WorkerGlobalState, C as ContextRPC, B as BirpcOptions, R as RuntimeRPC } from './chunks/worker.tN5KGIih.js';
import { Awaitable } from '@vitest/utils';
import * as v8 from 'v8';
import { S as SerializedConfig } from './chunks/config.Cy0C388Z.js';
import { W as WorkerContext } from './chunks/worker.B9FxPCaC.js';
import '@vitest/runner';
import 'vite-node';
import './chunks/environment.LoooBwUu.js';
import '@vitest/snapshot';
import '@vitest/pretty-format';
import '@vitest/snapshot/environment';
import 'node:worker_threads';

declare function provideWorkerState(context: any, state: WorkerGlobalState): WorkerGlobalState;

declare function run(ctx: ContextRPC): Promise<void>;
declare function collect(ctx: ContextRPC): Promise<void>;

declare function runBaseTests(method: 'run' | 'collect', state: WorkerGlobalState): Promise<void>;

type WorkerRpcOptions = Pick<BirpcOptions<RuntimeRPC>, 'on' | 'post' | 'serialize' | 'deserialize'>;
interface VitestWorker {
    getRpcOptions: (ctx: ContextRPC) => WorkerRpcOptions;
    runTests: (state: WorkerGlobalState) => Awaitable<unknown>;
    collectTests: (state: WorkerGlobalState) => Awaitable<unknown>;
}

declare function createThreadsRpcOptions({ port, }: WorkerContext): WorkerRpcOptions;
declare function createForksRpcOptions(nodeV8: typeof v8): WorkerRpcOptions;
/**
 * Reverts the wrapping done by `utils/config-helpers.ts`'s `wrapSerializableConfig`
 */
declare function unwrapSerializableConfig(config: SerializedConfig): SerializedConfig;

declare function runVmTests(method: 'run' | 'collect', state: WorkerGlobalState): Promise<void>;

export { type VitestWorker, type WorkerRpcOptions, collect as collectVitestWorkerTests, createForksRpcOptions, createThreadsRpcOptions, provideWorkerState, runBaseTests, run as runVitestWorker, runVmTests, unwrapSerializableConfig };
