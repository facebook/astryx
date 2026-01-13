interface MockResultReturn<T> {
    type: 'return';
    /**
     * The value that was returned from the function. If function returned a Promise, then this will be a resolved value.
     */
    value: T;
}
interface MockResultIncomplete {
    type: 'incomplete';
    value: undefined;
}
interface MockResultThrow {
    type: 'throw';
    /**
     * An error that was thrown during function execution.
     */
    value: any;
}
interface MockSettledResultFulfilled<T> {
    type: 'fulfilled';
    value: T;
}
interface MockSettledResultRejected {
    type: 'rejected';
    value: any;
}
type MockResult<T> = MockResultReturn<T> | MockResultThrow | MockResultIncomplete;
type MockSettledResult<T> = MockSettledResultFulfilled<T> | MockSettledResultRejected;
interface MockContext<T extends Procedure> {
    /**
     * This is an array containing all arguments for each call. One item of the array is the arguments of that call.
     *
     * @example
     * const fn = vi.fn()
     *
     * fn('arg1', 'arg2')
     * fn('arg3')
     *
     * fn.mock.calls === [
     *   ['arg1', 'arg2'], // first call
     *   ['arg3'], // second call
     * ]
     */
    calls: Parameters<T>[];
    /**
     * This is an array containing all instances that were instantiated when mock was called with a `new` keyword. Note that this is an actual context (`this`) of the function, not a return value.
     */
    instances: ReturnType<T>[];
    /**
     * An array of `this` values that were used during each call to the mock function.
     */
    contexts: ThisParameterType<T>[];
    /**
     * The order of mock's execution. This returns an array of numbers which are shared between all defined mocks.
     *
     * @example
     * const fn1 = vi.fn()
     * const fn2 = vi.fn()
     *
     * fn1()
     * fn2()
     * fn1()
     *
     * fn1.mock.invocationCallOrder === [1, 3]
     * fn2.mock.invocationCallOrder === [2]
     */
    invocationCallOrder: number[];
    /**
     * This is an array containing all values that were `returned` from the function.
     *
     * The `value` property contains the returned value or thrown error. If the function returned a `Promise`, then `result` will always be `'return'` even if the promise was rejected.
     *
     * @example
     * const fn = vi.fn()
     *   .mockReturnValueOnce('result')
     *   .mockImplementationOnce(() => { throw new Error('thrown error') })
     *
     * const result = fn()
     *
     * try {
     *   fn()
     * }
     * catch {}
     *
     * fn.mock.results === [
     *   {
     *     type: 'return',
     *     value: 'result',
     *   },
     *   {
     *     type: 'throw',
     *     value: Error,
     *   },
     * ]
     */
    results: MockResult<ReturnType<T>>[];
    /**
     * An array containing all values that were `resolved` or `rejected` from the function.
     *
     * This array will be empty if the function was never resolved or rejected.
     *
     * @example
     * const fn = vi.fn().mockResolvedValueOnce('result')
     *
     * const result = fn()
     *
     * fn.mock.settledResults === []
     * fn.mock.results === [
     *   {
     *     type: 'return',
     *     value: Promise<'result'>,
     *   },
     * ]
     *
     * await result
     *
     * fn.mock.settledResults === [
     *   {
     *     type: 'fulfilled',
     *     value: 'result',
     *   },
     * ]
     */
    settledResults: MockSettledResult<Awaited<ReturnType<T>>>[];
    /**
     * This contains the arguments of the last call. If spy wasn't called, will return `undefined`.
     */
    lastCall: Parameters<T> | undefined;
}
type Procedure = (...args: any[]) => any;
type NormalizedPrecedure<T extends Procedure> = (...args: Parameters<T>) => ReturnType<T>;
type Methods<T> = keyof {
    [K in keyof T as T[K] extends Procedure ? K : never]: T[K];
};
type Properties<T> = {
    [K in keyof T]: T[K] extends Procedure ? never : K;
}[keyof T] & (string | symbol);
type Classes<T> = {
    [K in keyof T]: T[K] extends new (...args: any[]) => any ? K : never;
}[keyof T] & (string | symbol);
interface MockInstance<T extends Procedure = Procedure> {
    /**
     * Use it to return the name given to mock with method `.mockName(name)`.
     */
    getMockName(): string;
    /**
     * Sets internal mock name. Useful to see the name of the mock if an assertion fails.
     */
    mockName(n: string): this;
    /**
     * Current context of the mock. It stores information about all invocation calls, instances, and results.
     */
    mock: MockContext<T>;
    /**
     * Clears all information about every call. After calling it, all properties on `.mock` will return an empty state. This method does not reset implementations.
     *
     * It is useful if you need to clean up mock between different assertions.
     */
    mockClear(): this;
    /**
     * Does what `mockClear` does and makes inner implementation an empty function (returning `undefined` when invoked). This also resets all "once" implementations.
     *
     * This is useful when you want to completely reset a mock to the default state.
     */
    mockReset(): this;
    /**
     * Does what `mockReset` does and restores inner implementation to the original function.
     *
     * Note that restoring mock from `vi.fn()` will set implementation to an empty function that returns `undefined`. Restoring a `vi.fn(impl)` will restore implementation to `impl`.
     */
    mockRestore(): void;
    /**
     * Returns current mock implementation if there is one.
     *
     * If mock was created with `vi.fn`, it will consider passed down method as a mock implementation.
     *
     * If mock was created with `vi.spyOn`, it will return `undefined` unless a custom implementation was provided.
     */
    getMockImplementation(): NormalizedPrecedure<T> | undefined;
    /**
     * Accepts a function that will be used as an implementation of the mock.
     * @example
     * const increment = vi.fn().mockImplementation(count => count + 1);
     * expect(increment(3)).toBe(4);
     */
    mockImplementation(fn: NormalizedPrecedure<T>): this;
    /**
     * Accepts a function that will be used as a mock implementation during the next call. Can be chained so that multiple function calls produce different results.
     * @example
     * const fn = vi.fn(count => count).mockImplementationOnce(count => count + 1);
     * expect(fn(3)).toBe(4);
     * expect(fn(3)).toBe(3);
     */
    mockImplementationOnce(fn: NormalizedPrecedure<T>): this;
    /**
     * Overrides the original mock implementation temporarily while the callback is being executed.
     * @example
     * const myMockFn = vi.fn(() => 'original')
     *
     * myMockFn.withImplementation(() => 'temp', () => {
     *   myMockFn() // 'temp'
     * })
     *
     * myMockFn() // 'original'
     */
    withImplementation<T2>(fn: NormalizedPrecedure<T>, cb: () => T2): T2 extends Promise<unknown> ? Promise<this> : this;
    /**
     * Use this if you need to return `this` context from the method without invoking actual implementation.
     */
    mockReturnThis(): this;
    /**
     * Accepts a value that will be returned whenever the mock function is called.
     */
    mockReturnValue(obj: ReturnType<T>): this;
    /**
     * Accepts a value that will be returned during the next function call. If chained, every consecutive call will return the specified value.
     *
     * When there are no more `mockReturnValueOnce` values to use, mock will fallback to the previously defined implementation if there is one.
     * @example
     * const myMockFn = vi
     *   .fn()
     *   .mockReturnValue('default')
     *   .mockReturnValueOnce('first call')
     *   .mockReturnValueOnce('second call')
     *
     * // 'first call', 'second call', 'default'
     * console.log(myMockFn(), myMockFn(), myMockFn())
     */
    mockReturnValueOnce(obj: ReturnType<T>): this;
    /**
     * Accepts a value that will be resolved when async function is called.
     * @example
     * const asyncMock = vi.fn().mockResolvedValue(42)
     * asyncMock() // Promise<42>
     */
    mockResolvedValue(obj: Awaited<ReturnType<T>>): this;
    /**
     * Accepts a value that will be resolved during the next function call. If chained, every consecutive call will resolve specified value.
     * @example
     * const myMockFn = vi
     *   .fn()
     *   .mockResolvedValue('default')
     *   .mockResolvedValueOnce('first call')
     *   .mockResolvedValueOnce('second call')
     *
     * // Promise<'first call'>, Promise<'second call'>, Promise<'default'>
     * console.log(myMockFn(), myMockFn(), myMockFn())
     */
    mockResolvedValueOnce(obj: Awaited<ReturnType<T>>): this;
    /**
     * Accepts an error that will be rejected when async function is called.
     * @example
     * const asyncMock = vi.fn().mockRejectedValue(new Error('Async error'))
     * await asyncMock() // throws 'Async error'
     */
    mockRejectedValue(obj: any): this;
    /**
     * Accepts a value that will be rejected during the next function call. If chained, every consecutive call will reject specified value.
     * @example
     * const asyncMock = vi
     *   .fn()
     *   .mockResolvedValueOnce('first call')
     *   .mockRejectedValueOnce(new Error('Async error'))
     *
     * await asyncMock() // first call
     * await asyncMock() // throws "Async error"
     */
    mockRejectedValueOnce(obj: any): this;
}
interface Mock<T extends Procedure = Procedure> extends MockInstance<T> {
    new (...args: Parameters<T>): ReturnType<T>;
    (...args: Parameters<T>): ReturnType<T>;
}
type PartialMaybePromise<T> = T extends Promise<Awaited<T>> ? Promise<Partial<Awaited<T>>> : Partial<T>;
interface PartialMock<T extends Procedure = Procedure> extends MockInstance<(...args: Parameters<T>) => PartialMaybePromise<ReturnType<T>>> {
    new (...args: Parameters<T>): ReturnType<T>;
    (...args: Parameters<T>): ReturnType<T>;
}
type MaybeMockedConstructor<T> = T extends new (...args: Array<any>) => infer R ? Mock<(...args: ConstructorParameters<T>) => R> : T;
type MockedFunction<T extends Procedure> = Mock<T> & {
    [K in keyof T]: T[K];
};
type PartiallyMockedFunction<T extends Procedure> = PartialMock<T> & {
    [K in keyof T]: T[K];
};
type MockedFunctionDeep<T extends Procedure> = Mock<T> & MockedObjectDeep<T>;
type PartiallyMockedFunctionDeep<T extends Procedure> = PartialMock<T> & MockedObjectDeep<T>;
type MockedObject<T> = MaybeMockedConstructor<T> & {
    [K in Methods<T>]: T[K] extends Procedure ? MockedFunction<T[K]> : T[K];
} & {
    [K in Properties<T>]: T[K];
};
type MockedObjectDeep<T> = MaybeMockedConstructor<T> & {
    [K in Methods<T>]: T[K] extends Procedure ? MockedFunctionDeep<T[K]> : T[K];
} & {
    [K in Properties<T>]: MaybeMockedDeep<T[K]>;
};
type MaybeMockedDeep<T> = T extends Procedure ? MockedFunctionDeep<T> : T extends object ? MockedObjectDeep<T> : T;
type MaybePartiallyMockedDeep<T> = T extends Procedure ? PartiallyMockedFunctionDeep<T> : T extends object ? MockedObjectDeep<T> : T;
type MaybeMocked<T> = T extends Procedure ? MockedFunction<T> : T extends object ? MockedObject<T> : T;
type MaybePartiallyMocked<T> = T extends Procedure ? PartiallyMockedFunction<T> : T extends object ? MockedObject<T> : T;
interface Constructable {
    new (...args: any[]): any;
}
type MockedClass<T extends Constructable> = MockInstance<(...args: ConstructorParameters<T>) => InstanceType<T>> & {
    prototype: T extends {
        prototype: any;
    } ? Mocked<T['prototype']> : never;
} & T;
type Mocked<T> = {
    [P in keyof T]: T[P] extends Procedure ? MockInstance<T[P]> : T[P] extends Constructable ? MockedClass<T[P]> : T[P];
} & T;
declare const mocks: Set<MockInstance>;
declare function isMockFunction(fn: any): fn is MockInstance;
declare function spyOn<T, S extends Properties<Required<T>>>(obj: T, methodName: S, accessType: 'get'): MockInstance<() => T[S]>;
declare function spyOn<T, G extends Properties<Required<T>>>(obj: T, methodName: G, accessType: 'set'): MockInstance<(arg: T[G]) => void>;
declare function spyOn<T, M extends Classes<Required<T>> | Methods<Required<T>>>(obj: T, methodName: M): Required<T>[M] extends {
    new (...args: infer A): infer R;
} ? MockInstance<(this: R, ...args: A) => R> : T[M] extends Procedure ? MockInstance<T[M]> : never;
declare function fn<T extends Procedure = Procedure>(implementation?: T): Mock<T>;

export { type MaybeMocked, type MaybeMockedConstructor, type MaybeMockedDeep, type MaybePartiallyMocked, type MaybePartiallyMockedDeep, type Mock, type MockContext, type MockInstance, type MockResult, type MockSettledResult, type Mocked, type MockedClass, type MockedFunction, type MockedFunctionDeep, type MockedObject, type MockedObjectDeep, type PartialMock, type PartiallyMockedFunction, type PartiallyMockedFunctionDeep, fn, isMockFunction, mocks, spyOn };
