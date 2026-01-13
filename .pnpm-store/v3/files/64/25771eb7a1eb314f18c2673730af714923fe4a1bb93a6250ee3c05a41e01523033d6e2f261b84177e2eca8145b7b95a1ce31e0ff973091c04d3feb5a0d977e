import { V8CoverageProvider } from './provider.js';
import { Profiler } from 'node:inspector';
import 'magicast';
import 'istanbul-lib-coverage';
import 'vitest/node';
import 'test-exclude';
import 'vitest/coverage';

declare const _default: {
    startCoverage(): void;
    takeCoverage(): Promise<{
        result: Profiler.ScriptCoverage[];
    }>;
    stopCoverage(): void;
    getProvider(): Promise<V8CoverageProvider>;
};

export { _default as default };
