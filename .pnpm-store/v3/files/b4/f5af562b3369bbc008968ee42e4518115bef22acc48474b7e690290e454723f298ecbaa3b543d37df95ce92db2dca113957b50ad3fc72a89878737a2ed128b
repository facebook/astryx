import { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import { AsymmetricMatchersContaining, MatchersObject, MatcherState, JestAssertion, ExpectStatic } from '@vitest/expect';
import * as domTestingLibrary from '@testing-library/dom';
import { BoundFunctions } from '@testing-library/dom';
import _userEvent from '@testing-library/user-event';
import { spyOn as spyOn$1, Mock as Mock$1, MaybeMocked, MaybeMockedDeep, MaybePartiallyMocked, MaybePartiallyMockedDeep, MockInstance } from '@vitest/spy';
export * from '@vitest/spy';
export { isMockFunction, mocks } from '@vitest/spy';

type Promisify<Fn> = Fn extends (...args: infer A) => infer R ? (...args: A) => R extends Promise<any> ? R : Promise<R> : Fn;
type PromisifyObject<O> = {
    [K in keyof O]: Promisify<O[K]>;
};

type Matchers<T> = PromisifyObject<JestAssertion<T>> & TestingLibraryMatchers<ReturnType<ExpectStatic['stringContaining']>, Promise<void>>;
interface Assertion<T> extends Matchers<T> {
    toHaveBeenCalledOnce(): Promise<void>;
    toSatisfy<E>(matcher: (value: E) => boolean, message?: string): Promise<void>;
    resolves: Assertion<T>;
    rejects: Assertion<T>;
    not: Assertion<T>;
}
interface Expect extends AsymmetricMatchersContaining {
    <T>(actual: T, message?: string): Assertion<T>;
    unreachable(message?: string): Promise<never>;
    soft<T>(actual: T, message?: string): Assertion<T>;
    extend(expects: MatchersObject): void;
    assertions(expected: number): Promise<void>;
    hasAssertions(): Promise<void>;
    anything(): any;
    any(constructor: unknown): any;
    getState(): MatcherState;
    setState(state: Partial<MatcherState>): void;
    not: AsymmetricMatchersContaining;
}

declare const buildQueries: typeof domTestingLibrary.buildQueries;
declare const configure: typeof domTestingLibrary.configure;
declare const createEvent: domTestingLibrary.CreateObject & domTestingLibrary.CreateFunction;
declare const fireEvent: ((element: Element | Node | Document | Window, event: Event) => Promise<false> | Promise<true>) & PromisifyObject<domTestingLibrary.FireObject>;
declare const findAllByAltText: typeof domTestingLibrary.findAllByAltText;
declare const findAllByDisplayValue: typeof domTestingLibrary.findAllByDisplayValue;
declare const findAllByLabelText: typeof domTestingLibrary.findAllByLabelText;
declare const findAllByPlaceholderText: typeof domTestingLibrary.findAllByPlaceholderText;
declare const findAllByRole: typeof domTestingLibrary.findAllByRole;
declare const findAllByTestId: typeof domTestingLibrary.findAllByTestId;
declare const findAllByText: typeof domTestingLibrary.findAllByText;
declare const findAllByTitle: typeof domTestingLibrary.findAllByTitle;
declare const findByAltText: typeof domTestingLibrary.findByAltText;
declare const findByDisplayValue: typeof domTestingLibrary.findByDisplayValue;
declare const findByLabelText: typeof domTestingLibrary.findByLabelText;
declare const findByPlaceholderText: typeof domTestingLibrary.findByPlaceholderText;
declare const findByRole: typeof domTestingLibrary.findByRole;
declare const findByTestId: typeof domTestingLibrary.findByTestId;
declare const findByText: typeof domTestingLibrary.findByText;
declare const findByTitle: typeof domTestingLibrary.findByTitle;
declare const getAllByAltText: typeof domTestingLibrary.getAllByAltText;
declare const getAllByDisplayValue: typeof domTestingLibrary.getAllByDisplayValue;
declare const getAllByLabelText: typeof domTestingLibrary.getAllByLabelText;
declare const getAllByPlaceholderText: typeof domTestingLibrary.getAllByPlaceholderText;
declare const getAllByRole: typeof domTestingLibrary.getAllByRole;
declare const getAllByTestId: typeof domTestingLibrary.getAllByTestId;
declare const getAllByText: typeof domTestingLibrary.getAllByText;
declare const getAllByTitle: typeof domTestingLibrary.getAllByTitle;
declare const getByAltText: typeof domTestingLibrary.getByAltText;
declare const getByDisplayValue: typeof domTestingLibrary.getByDisplayValue;
declare const getByLabelText: typeof domTestingLibrary.getByLabelText;
declare const getByPlaceholderText: typeof domTestingLibrary.getByPlaceholderText;
declare const getByRole: typeof domTestingLibrary.getByRole;
declare const getByTestId: typeof domTestingLibrary.getByTestId;
declare const getByText: typeof domTestingLibrary.getByText;
declare const getByTitle: typeof domTestingLibrary.getByTitle;
declare const getConfig: typeof domTestingLibrary.getConfig;
declare const getDefaultNormalizer: typeof domTestingLibrary.getDefaultNormalizer;
declare const getElementError: typeof domTestingLibrary.getElementError;
declare const getNodeText: typeof domTestingLibrary.getNodeText;
declare const getQueriesForElement: typeof domTestingLibrary.getQueriesForElement;
declare const getRoles: typeof domTestingLibrary.getRoles;
declare const getSuggestedQuery: typeof domTestingLibrary.getSuggestedQuery;
declare const isInaccessible: typeof domTestingLibrary.isInaccessible;
declare const logDOM: typeof domTestingLibrary.logDOM;
declare const logRoles: typeof domTestingLibrary.logRoles;
declare const prettyDOM: typeof domTestingLibrary.prettyDOM;
declare const queries: typeof domTestingLibrary.queries;
declare const queryAllByAltText: typeof domTestingLibrary.queryAllByAltText;
declare const queryAllByAttribute: domTestingLibrary.AllByAttribute;
declare const queryAllByDisplayValue: typeof domTestingLibrary.queryAllByDisplayValue;
declare const queryAllByLabelText: typeof domTestingLibrary.queryAllByLabelText;
declare const queryAllByPlaceholderText: typeof domTestingLibrary.queryAllByPlaceholderText;
declare const queryAllByRole: typeof domTestingLibrary.queryAllByRole;
declare const queryAllByTestId: typeof domTestingLibrary.queryAllByTestId;
declare const queryAllByText: typeof domTestingLibrary.queryAllByText;
declare const queryAllByTitle: typeof domTestingLibrary.queryAllByTitle;
declare const queryByAltText: typeof domTestingLibrary.queryByAltText;
declare const queryByAttribute: domTestingLibrary.QueryByAttribute;
declare const queryByDisplayValue: typeof domTestingLibrary.queryByDisplayValue;
declare const queryByLabelText: typeof domTestingLibrary.queryByLabelText;
declare const queryByPlaceholderText: typeof domTestingLibrary.queryByPlaceholderText;
declare const queryByRole: typeof domTestingLibrary.queryByRole;
declare const queryByTestId: typeof domTestingLibrary.queryByTestId;
declare const queryByText: typeof domTestingLibrary.queryByText;
declare const queryByTitle: typeof domTestingLibrary.queryByTitle;
declare const queryHelpers: typeof domTestingLibrary.queryHelpers;
declare const screen: domTestingLibrary.Screen<typeof domTestingLibrary.queries>;
declare const waitFor: typeof domTestingLibrary.waitFor;
declare const waitForElementToBeRemoved: typeof domTestingLibrary.waitForElementToBeRemoved;
declare const within: typeof domTestingLibrary.getQueriesForElement;
declare const prettyFormat: typeof domTestingLibrary.prettyFormat;
type _UserEvent = typeof _userEvent;
interface UserEvent extends _UserEvent {
}
declare const userEvent: UserEvent;

type Listener = (mock: MockInstance, args: unknown[]) => void;
declare function onMockCall(callback: Listener): () => void;
declare const spyOn: typeof spyOn$1;
type Procedure = (...args: any[]) => any;
type Mock<T extends Procedure | any[] = any[], R = any> = T extends Procedure ? Mock$1<T> : T extends any[] ? Mock$1<(...args: T) => R> : never;
declare function fn<T extends Procedure = Procedure>(implementation?: T): Mock<T>;
declare function fn<TArgs extends any[] = any, R = any>(): Mock<(...args: TArgs) => R>;
declare function fn<TArgs extends any[] = any[], R = any>(implementation: (...args: TArgs) => R): Mock<(...args: TArgs) => R>;
declare function fn<TArgs extends any[] = any[], R = any>(implementation?: (...args: TArgs) => R): Mock<(...args: TArgs) => R>;
/**
 * Calls [`.mockClear()`](https://vitest.dev/api/mock#mockclear) on every mocked function. This will
 * only empty `.mock` state, it will not reset implementation.
 *
 * It is useful if you need to clean up mock between different assertions.
 */
declare function clearAllMocks(): void;
/**
 * Calls [`.mockReset()`](https://vitest.dev/api/mock#mockreset) on every mocked function. This will
 * empty `.mock` state, reset "once" implementations and force the base implementation to return
 * `undefined` when invoked.
 *
 * This is useful when you want to completely reset a mock to the default state.
 */
declare function resetAllMocks(): void;
/**
 * Calls [`.mockRestore()`](https://vitest.dev/api/mock#mockrestore) on every mocked function. This
 * will restore all original implementations.
 */
declare function restoreAllMocks(): void;
/**
 * Type helper for TypeScript. Just returns the object that was passed.
 *
 * When `partial` is `true` it will expect a `Partial<T>` as a return value. By default, this will
 * only make TypeScript believe that the first level values are mocked. You can pass down `{ deep:
 * true }` as a second argument to tell TypeScript that the whole object is mocked, if it actually
 * is.
 *
 * @param item Anything that can be mocked
 * @param deep If the object is deeply mocked
 * @param options If the object is partially or deeply mocked
 */
declare function mocked<T>(item: T, deep?: false): MaybeMocked<T>;
declare function mocked<T>(item: T, deep: true): MaybeMockedDeep<T>;
declare function mocked<T>(item: T, options: {
    partial?: false;
    deep?: false;
}): MaybeMocked<T>;
declare function mocked<T>(item: T, options: {
    partial?: false;
    deep: true;
}): MaybeMockedDeep<T>;
declare function mocked<T>(item: T, options: {
    partial: true;
    deep?: false;
}): MaybePartiallyMocked<T>;
declare function mocked<T>(item: T, options: {
    partial: true;
    deep: true;
}): MaybePartiallyMockedDeep<T>;
declare function mocked<T>(item: T): MaybeMocked<T>;

type Queries = BoundFunctions<typeof queries>;
declare module '@storybook/core/csf' {
    interface Canvas extends Queries {
    }
    interface StoryContext {
    }
}
declare const expect: Expect;

declare const traverseArgs: (value: unknown, depth?: number, key?: string) => unknown;

export { Mock, UserEvent, buildQueries, clearAllMocks, configure, createEvent, expect, findAllByAltText, findAllByDisplayValue, findAllByLabelText, findAllByPlaceholderText, findAllByRole, findAllByTestId, findAllByText, findAllByTitle, findByAltText, findByDisplayValue, findByLabelText, findByPlaceholderText, findByRole, findByTestId, findByText, findByTitle, fireEvent, fn, getAllByAltText, getAllByDisplayValue, getAllByLabelText, getAllByPlaceholderText, getAllByRole, getAllByTestId, getAllByText, getAllByTitle, getByAltText, getByDisplayValue, getByLabelText, getByPlaceholderText, getByRole, getByTestId, getByText, getByTitle, getConfig, getDefaultNormalizer, getElementError, getNodeText, getQueriesForElement, getRoles, getSuggestedQuery, isInaccessible, logDOM, logRoles, mocked, onMockCall, prettyDOM, prettyFormat, queries, queryAllByAltText, queryAllByAttribute, queryAllByDisplayValue, queryAllByLabelText, queryAllByPlaceholderText, queryAllByRole, queryAllByTestId, queryAllByText, queryAllByTitle, queryByAltText, queryByAttribute, queryByDisplayValue, queryByLabelText, queryByPlaceholderText, queryByRole, queryByTestId, queryByText, queryByTitle, queryHelpers, resetAllMocks, restoreAllMocks, screen, spyOn, traverseArgs, userEvent, waitFor, waitForElementToBeRemoved, within };
