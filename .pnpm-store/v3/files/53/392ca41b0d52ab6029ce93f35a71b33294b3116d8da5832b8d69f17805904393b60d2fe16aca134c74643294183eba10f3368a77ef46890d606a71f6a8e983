import { S as Suite, F as File, T as Task, a as Test, C as Custom } from './tasks-3ZnPj1LR.js';
export { b as ChainableFunction, c as createChainable } from './tasks-3ZnPj1LR.js';
import { Arrayable } from '@vitest/utils';

/**
 * If any tasks been marked as `only`, mark all other tasks as `skip`.
 */
declare function interpretTaskModes(suite: Suite, namePattern?: string | RegExp, onlyMode?: boolean, parentIsOnly?: boolean, allowOnly?: boolean): void;
declare function someTasksAreOnly(suite: Suite): boolean;
declare function generateHash(str: string): string;
declare function calculateSuiteHash(parent: Suite): void;
declare function createFileTask(filepath: string, root: string, projectName: string | undefined, pool?: string): File;

/**
 * Return a function for running multiple async operations with limited concurrency.
 */
declare function limitConcurrency(concurrency?: number): <Args extends unknown[], T>(func: (...args: Args) => PromiseLike<T> | T, ...args: Args) => Promise<T>;

/**
 * Partition in tasks groups by consecutive concurrent
 */
declare function partitionSuiteChildren(suite: Suite): Task[][];

declare function isAtomTest(s: Task): s is Test | Custom;
declare function getTests(suite: Arrayable<Task>): (Test | Custom)[];
declare function getTasks(tasks?: Arrayable<Task>): Task[];
declare function getSuites(suite: Arrayable<Task>): Suite[];
declare function hasTests(suite: Arrayable<Suite>): boolean;
declare function hasFailed(suite: Arrayable<Task>): boolean;
declare function getNames(task: Task): string[];
declare function getFullName(task: Task, separator?: string): string;
declare function getTestName(task: Task, separator?: string): string;

export { calculateSuiteHash, createFileTask, generateHash, getFullName, getNames, getSuites, getTasks, getTestName, getTests, hasFailed, hasTests, interpretTaskModes, isAtomTest, limitConcurrency, partitionSuiteChildren, someTasksAreOnly };
