import { ModuleCacheMap } from 'vite-node/client';
import { g as getDefaultRequestStubs, s as startVitestExecutor } from './execute.2pr0rHgK.js';
import { p as provideWorkerState } from './utils.C8RiOc4B.js';

let _viteNode;
const moduleCache = new ModuleCacheMap();
async function startViteNode(options) {
  if (_viteNode) {
    return _viteNode;
  }
  _viteNode = await startVitestExecutor(options);
  return _viteNode;
}
async function runBaseTests(method, state) {
  const { ctx } = state;
  state.moduleCache = moduleCache;
  provideWorkerState(globalThis, state);
  if (ctx.invalidates) {
    ctx.invalidates.forEach((fsPath) => {
      moduleCache.delete(fsPath);
      moduleCache.delete(`mock:${fsPath}`);
    });
  }
  ctx.files.forEach((i) => state.moduleCache.delete(i));
  const [executor, { run }] = await Promise.all([
    startViteNode({ state, requestStubs: getDefaultRequestStubs() }),
    import('./runBaseTests.3qpJUEJM.js')
  ]);
  await run(
    method,
    ctx.files,
    ctx.config,
    { environment: state.environment, options: ctx.environment.options },
    executor
  );
}

export { runBaseTests as r };
