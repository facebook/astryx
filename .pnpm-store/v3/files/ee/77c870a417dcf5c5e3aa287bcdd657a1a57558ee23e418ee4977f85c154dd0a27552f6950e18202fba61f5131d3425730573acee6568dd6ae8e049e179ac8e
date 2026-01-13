export { DeferPromise, assertTypes, clone, createDefer, createSimpleStackTrace, deepClone, getCallLastIndex, getOwnProperties, getType, isNegativeNaN, isObject, isPrimitive, noop, notNullish, objectAttr, parseRegexp, slash, toArray } from './helpers.js';
import { PrettyFormatOptions } from '@vitest/pretty-format';
import { Colors } from 'tinyrainbow';
export { ArgumentsType, Arrayable, Awaitable, Constructable, DeepMerge, ErrorWithDiff, MergeInsertions, MutableArray, Nullable, ParsedStack, SerializedError, TestError } from './types.js';

interface SafeTimers {
    nextTick: (cb: () => void) => void;
    setTimeout: typeof setTimeout;
    setInterval: typeof setInterval;
    clearInterval: typeof clearInterval;
    clearTimeout: typeof clearTimeout;
    setImmediate: typeof setImmediate;
    clearImmediate: typeof clearImmediate;
}
declare function getSafeTimers(): SafeTimers;
declare function setSafeTimers(): void;

declare function shuffle<T>(array: T[], seed?: number): T[];

type Inspect = (value: unknown, options: Options) => string;
interface Options {
    showHidden: boolean;
    depth: number;
    colors: boolean;
    customInspect: boolean;
    showProxy: boolean;
    maxArrayLength: number;
    breakLength: number;
    truncate: number;
    seen: unknown[];
    inspect: Inspect;
    stylize: (value: string, styleType: string) => string;
}
type LoupeOptions = Partial<Options>;
declare function stringify(object: unknown, maxDepth?: number, { maxLength, ...options }?: PrettyFormatOptions & {
    maxLength?: number;
}): string;
declare function format(...args: unknown[]): string;
declare function inspect(obj: unknown, options?: LoupeOptions): string;
declare function objDisplay(obj: unknown, options?: LoupeOptions): string;

declare const lineSplitRE: RegExp;
declare function positionToOffset(source: string, lineNumber: number, columnNumber: number): number;
declare function offsetToLineNumber(source: string, offset: number): number;

interface HighlightOptions {
    jsx?: boolean;
    colors?: Colors;
}
declare function highlight(code: string, options?: HighlightOptions): string;

export { type SafeTimers, format, getSafeTimers, highlight, inspect, lineSplitRE, objDisplay, offsetToLineNumber, positionToOffset, setSafeTimers, shuffle, stringify };
