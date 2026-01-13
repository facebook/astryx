import { cdp } from '@vitest/browser/context';
import { l as loadProvider } from './load-provider-Bl5rgjsL.js';

const session = cdp();
var browser = {
  async startCoverage() {
    await session.send("Profiler.enable");
    await session.send("Profiler.startPreciseCoverage", {
      callCount: true,
      detailed: true
    });
  },
  async takeCoverage() {
    const coverage = await session.send("Profiler.takePreciseCoverage");
    const result = [];
    for (const entry of coverage.result) {
      if (filterResult(entry)) {
        result.push({
          ...entry,
          url: decodeURIComponent(entry.url.replace(window.location.origin, ""))
        });
      }
    }
    return { result };
  },
  async stopCoverage() {
    await session.send("Profiler.stopPreciseCoverage");
    await session.send("Profiler.disable");
  },
  async getProvider() {
    return loadProvider();
  }
};
function filterResult(coverage) {
  if (!coverage.url.startsWith(window.location.origin)) {
    return false;
  }
  if (coverage.url.includes("/node_modules/")) {
    return false;
  }
  if (coverage.url.includes("__vitest_browser__")) {
    return false;
  }
  if (coverage.url.includes("__vitest__/assets")) {
    return false;
  }
  return true;
}

export { browser as default };
