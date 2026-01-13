import * as tinyrainbow from 'tinyrainbow';
import { Formatter } from 'tinyrainbow';
import { stringify, Constructable } from '@vitest/utils';
import { diff, printDiffOrStringify } from '@vitest/utils/diff';
export { DiffOptions } from '@vitest/utils/diff';

declare function matcherHint(matcherName: string, received?: string, expected?: string, options?: MatcherHintOptions): string;
declare function printReceived(object: unknown): string;
declare function printExpected(value: unknown): string;
declare function getMatcherUtils(): {
    EXPECTED_COLOR: tinyrainbow.Formatter;
    RECEIVED_COLOR: tinyrainbow.Formatter;
    INVERTED_COLOR: tinyrainbow.Formatter;
    BOLD_WEIGHT: tinyrainbow.Formatter;
    DIM_COLOR: tinyrainbow.Formatter;
    diff: typeof diff;
    matcherHint: typeof matcherHint;
    printReceived: typeof printReceived;
    printExpected: typeof printExpected;
    printDiffOrStringify: typeof printDiffOrStringify;
};
declare function addCustomEqualityTesters(newTesters: Array<Tester>): void;

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

type ChaiPlugin = Chai.ChaiPlugin;
type Tester = (this: TesterContext, a: any, b: any, customTesters: Array<Tester>) => boolean | undefined;
interface TesterContext {
    equals: (a: unknown, b: unknown, customTesters?: Array<Tester>, strictCheck?: boolean) => boolean;
}

interface MatcherHintOptions {
    comment?: string;
    expectedColor?: Formatter;
    isDirectExpectCall?: boolean;
    isNot?: boolean;
    promise?: string;
    receivedColor?: Formatter;
    secondArgument?: string;
    secondArgumentColor?: Formatter;
}
interface MatcherState {
    customTesters: Array<Tester>;
    assertionCalls: number;
    currentTestName?: string;
    dontThrow?: () => void;
    error?: Error;
    equals: (a: unknown, b: unknown, customTesters?: Array<Tester>, strictCheck?: boolean) => boolean;
    expand?: boolean;
    expectedAssertionsNumber?: number | null;
    expectedAssertionsNumberErrorGen?: (() => Error) | null;
    isExpectingAssertions?: boolean;
    isExpectingAssertionsError?: Error | null;
    isNot: boolean;
    promise: string;
    suppressedErrors: Array<Error>;
    testPath?: string;
    utils: ReturnType<typeof getMatcherUtils> & {
        diff: typeof diff;
        stringify: typeof stringify;
        iterableEquality: Tester;
        subsetEquality: Tester;
    };
    soft?: boolean;
    poll?: boolean;
}
interface SyncExpectationResult {
    pass: boolean;
    message: () => string;
    actual?: any;
    expected?: any;
}
type AsyncExpectationResult = Promise<SyncExpectationResult>;
type ExpectationResult = SyncExpectationResult | AsyncExpectationResult;
interface RawMatcherFn<T extends MatcherState = MatcherState> {
    (this: T, received: any, expected: any, options?: any): ExpectationResult;
}
type MatchersObject<T extends MatcherState = MatcherState> = Record<string, RawMatcherFn<T>>;
interface ExpectStatic extends Chai.ExpectStatic, AsymmetricMatchersContaining {
    <T>(actual: T, message?: string): Assertion<T>;
    extend: (expects: MatchersObject) => void;
    anything: () => any;
    any: (constructor: unknown) => any;
    getState: () => MatcherState;
    setState: (state: Partial<MatcherState>) => void;
    not: AsymmetricMatchersContaining;
}
interface AsymmetricMatchersContaining {
    stringContaining: (expected: string) => any;
    objectContaining: <T = any>(expected: T) => any;
    arrayContaining: <T = unknown>(expected: Array<T>) => any;
    stringMatching: (expected: string | RegExp) => any;
    closeTo: (expected: number, precision?: number) => any;
}
interface JestAssertion<T = any> extends jest.Matchers<void, T> {
    toEqual: <E>(expected: E) => void;
    toStrictEqual: <E>(expected: E) => void;
    toBe: <E>(expected: E) => void;
    toMatch: (expected: string | RegExp) => void;
    toMatchObject: <E extends object | any[]>(expected: E) => void;
    toContain: <E>(item: E) => void;
    toContainEqual: <E>(item: E) => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toBeGreaterThan: (num: number | bigint) => void;
    toBeGreaterThanOrEqual: (num: number | bigint) => void;
    toBeLessThan: (num: number | bigint) => void;
    toBeLessThanOrEqual: (num: number | bigint) => void;
    toBeNaN: () => void;
    toBeUndefined: () => void;
    toBeNull: () => void;
    toBeDefined: () => void;
    toBeInstanceOf: <E>(expected: E) => void;
    toBeCalledTimes: (times: number) => void;
    toHaveLength: (length: number) => void;
    toHaveProperty: <E>(property: string | (string | number)[], value?: E) => void;
    toBeCloseTo: (number: number, numDigits?: number) => void;
    toHaveBeenCalledTimes: (times: number) => void;
    toHaveBeenCalled: () => void;
    toBeCalled: () => void;
    toHaveBeenCalledWith: <E extends any[]>(...args: E) => void;
    toBeCalledWith: <E extends any[]>(...args: E) => void;
    toHaveBeenNthCalledWith: <E extends any[]>(n: number, ...args: E) => void;
    nthCalledWith: <E extends any[]>(nthCall: number, ...args: E) => void;
    toHaveBeenLastCalledWith: <E extends any[]>(...args: E) => void;
    lastCalledWith: <E extends any[]>(...args: E) => void;
    toThrow: (expected?: string | Constructable | RegExp | Error) => void;
    toThrowError: (expected?: string | Constructable | RegExp | Error) => void;
    toReturn: () => void;
    toHaveReturned: () => void;
    toReturnTimes: (times: number) => void;
    toHaveReturnedTimes: (times: number) => void;
    toReturnWith: <E>(value: E) => void;
    toHaveReturnedWith: <E>(value: E) => void;
    toHaveLastReturnedWith: <E>(value: E) => void;
    lastReturnedWith: <E>(value: E) => void;
    toHaveNthReturnedWith: <E>(nthCall: number, value: E) => void;
    nthReturnedWith: <E>(nthCall: number, value: E) => void;
}
type VitestAssertion<A, T> = {
    [K in keyof A]: A[K] extends Chai.Assertion ? Assertion<T> : A[K] extends (...args: any[]) => any ? A[K] : VitestAssertion<A[K], T>;
} & ((type: string, message?: string) => Assertion);
type Promisify<O> = {
    [K in keyof O]: O[K] extends (...args: infer A) => infer R ? O extends R ? Promisify<O[K]> : (...args: A) => Promise<R> : O[K];
};
type PromisifyAssertion<T> = Promisify<Assertion<T>>;
interface Assertion<T = any> extends VitestAssertion<Chai.Assertion, T>, JestAssertion<T> {
    toBeTypeOf: (expected: 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined') => void;
    toHaveBeenCalledOnce: () => void;
    toSatisfy: <E>(matcher: (value: E) => boolean, message?: string) => void;
    toHaveResolved: () => void;
    toHaveResolvedWith: <E>(value: E) => void;
    toHaveResolvedTimes: (times: number) => void;
    toHaveLastResolvedWith: <E>(value: E) => void;
    toHaveNthResolvedWith: <E>(nthCall: number, value: E) => void;
    resolves: PromisifyAssertion<T>;
    rejects: PromisifyAssertion<T>;
}
declare global {
    namespace jest {
        interface Matchers<R, T = {}> {
        }
    }
}

interface AsymmetricMatcherInterface {
    asymmetricMatch: (other: unknown) => boolean;
    toString: () => string;
    getExpectedType?: () => string;
    toAsymmetricMatcher?: () => string;
}
declare abstract class AsymmetricMatcher<T, State extends MatcherState = MatcherState> implements AsymmetricMatcherInterface {
    protected sample: T;
    protected inverse: boolean;
    $$typeof: symbol;
    constructor(sample: T, inverse?: boolean);
    protected getMatcherContext(expect?: Chai.ExpectStatic): State;
    abstract asymmetricMatch(other: unknown): boolean;
    abstract toString(): string;
    getExpectedType?(): string;
    toAsymmetricMatcher?(): string;
}
declare class StringContaining extends AsymmetricMatcher<string> {
    constructor(sample: string, inverse?: boolean);
    asymmetricMatch(other: string): boolean;
    toString(): string;
    getExpectedType(): string;
}
declare class Anything extends AsymmetricMatcher<void> {
    asymmetricMatch(other: unknown): other is {};
    toString(): string;
    toAsymmetricMatcher(): string;
}
declare class ObjectContaining extends AsymmetricMatcher<Record<string, unknown>> {
    constructor(sample: Record<string, unknown>, inverse?: boolean);
    getPrototype(obj: object): any;
    hasProperty(obj: object | null, property: string): boolean;
    asymmetricMatch(other: any): boolean;
    toString(): string;
    getExpectedType(): string;
}
declare class ArrayContaining<T = unknown> extends AsymmetricMatcher<Array<T>> {
    constructor(sample: Array<T>, inverse?: boolean);
    asymmetricMatch(other: Array<T>): boolean;
    toString(): string;
    getExpectedType(): string;
}
declare class Any extends AsymmetricMatcher<any> {
    constructor(sample: unknown);
    fnNameFor(func: Function): string;
    asymmetricMatch(other: unknown): boolean;
    toString(): string;
    getExpectedType(): string;
    toAsymmetricMatcher(): string;
}
declare class StringMatching extends AsymmetricMatcher<RegExp> {
    constructor(sample: string | RegExp, inverse?: boolean);
    asymmetricMatch(other: string): boolean;
    toString(): string;
    getExpectedType(): string;
}
declare const JestAsymmetricMatchers: ChaiPlugin;

declare function equals(a: unknown, b: unknown, customTesters?: Array<Tester>, strictCheck?: boolean): boolean;
declare function isAsymmetric(obj: any): boolean;
declare function hasAsymmetric(obj: any, seen?: Set<unknown>): boolean;
declare function isA(typeName: string, value: unknown): boolean;
declare function fnNameFor(func: Function): string;
declare function hasProperty(obj: object | null, property: string): boolean;
declare function isImmutableUnorderedKeyed(maybeKeyed: any): boolean;
declare function isImmutableUnorderedSet(maybeSet: any): boolean;
declare function iterableEquality(a: any, b: any, customTesters?: Array<Tester>, aStack?: Array<any>, bStack?: Array<any>): boolean | undefined;
declare function subsetEquality(object: unknown, subset: unknown, customTesters?: Array<Tester>): boolean | undefined;
declare function typeEquality(a: any, b: any): boolean | undefined;
declare function arrayBufferEquality(a: unknown, b: unknown): boolean | undefined;
declare function sparseArrayEquality(a: unknown, b: unknown, customTesters?: Array<Tester>): boolean | undefined;
declare function generateToBeMessage(deepEqualityName: string, expected?: string, actual?: string): string;
declare function pluralize(word: string, count: number): string;
declare function getObjectKeys(object: object): Array<string | symbol>;
declare function getObjectSubset(object: any, subset: any, customTesters?: Array<Tester>): {
    subset: any;
    stripped: number;
};

declare const MATCHERS_OBJECT: unique symbol;
declare const JEST_MATCHERS_OBJECT: unique symbol;
declare const GLOBAL_EXPECT: unique symbol;
declare const ASYMMETRIC_MATCHERS_OBJECT: unique symbol;

declare function getState<State extends MatcherState = MatcherState>(expect: ExpectStatic): State;
declare function setState<State extends MatcherState = MatcherState>(state: Partial<State>, expect: ExpectStatic): void;

declare const JestChaiExpect: ChaiPlugin;

declare const JestExtend: ChaiPlugin;

export { ASYMMETRIC_MATCHERS_OBJECT, Any, Anything, ArrayContaining, type Assertion, AsymmetricMatcher, type AsymmetricMatcherInterface, type AsymmetricMatchersContaining, type AsyncExpectationResult, type ChaiPlugin, type ExpectStatic, type ExpectationResult, GLOBAL_EXPECT, JEST_MATCHERS_OBJECT, type JestAssertion, JestAsymmetricMatchers, JestChaiExpect, JestExtend, MATCHERS_OBJECT, type MatcherHintOptions, type MatcherState, type MatchersObject, ObjectContaining, type PromisifyAssertion, type RawMatcherFn, StringContaining, StringMatching, type SyncExpectationResult, type Tester, type TesterContext, addCustomEqualityTesters, arrayBufferEquality, equals, fnNameFor, generateToBeMessage, getObjectKeys, getObjectSubset, getState, hasAsymmetric, hasProperty, isA, isAsymmetric, isImmutableUnorderedKeyed, isImmutableUnorderedSet, iterableEquality, pluralize, setState, sparseArrayEquality, subsetEquality, typeEquality };
