// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// Minimal libdefs for the test toolchain (vitest + @testing-library/*).
// These packages ship TypeScript-only types that Flow cannot read, so without
// these stubs every value import in a test file reports [type-as-value].
//
// Idiom note: a bare `declare export var X: any` is imported by Flow as a TYPE
// binding, which then errors when X is used as a value. Declare callables as
// `declare export function` and objects with a concrete indexer type so the
// specifier binds as a value. Widen these to precise types as adoption grows.

type AnyObj = { [string]: any };

declare module 'vitest' {
  declare export function describe(name: string, fn: () => mixed): void;
  declare export function it(name: string, fn?: (...args: Array<any>) => mixed): void;
  declare export function test(name: string, fn?: (...args: Array<any>) => mixed): void;
  declare export function suite(name: string, fn: () => mixed): void;
  declare export function beforeEach(fn: (...args: Array<any>) => mixed): void;
  declare export function afterEach(fn: (...args: Array<any>) => mixed): void;
  declare export function beforeAll(fn: (...args: Array<any>) => mixed): void;
  declare export function afterAll(fn: (...args: Array<any>) => mixed): void;
  declare export function expect(actual: mixed): AnyObj;
  declare export var vi: AnyObj;
  declare export var assert: AnyObj;
}

declare module '@testing-library/react' {
  declare export function render(ui: mixed, options?: mixed): AnyObj;
  declare export function renderHook(cb: (...args: Array<any>) => mixed, options?: mixed): AnyObj;
  declare export function fireEvent(...args: Array<any>): any;
  declare export function waitFor(cb: () => mixed, options?: mixed): Promise<any>;
  declare export function within(el: mixed): AnyObj;
  declare export function cleanup(): void;
  declare export function act(cb: () => mixed): any;
  declare export var screen: AnyObj;
}

declare module '@testing-library/user-event' {
  declare export default AnyObj;
}

declare module '@testing-library/jest-dom' {
  declare module.exports: AnyObj;
}
