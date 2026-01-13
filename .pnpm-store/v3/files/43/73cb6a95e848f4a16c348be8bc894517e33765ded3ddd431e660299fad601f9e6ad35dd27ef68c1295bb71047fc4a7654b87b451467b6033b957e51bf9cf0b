import { S as SnapshotStateOptions, a as SnapshotMatchOptions, b as SnapshotResult, R as RawSnapshotInfo } from './rawSnapshot-CPNkto81.js';
export { c as SnapshotData, d as SnapshotSerializer, e as SnapshotSummary, f as SnapshotUpdateState, U as UncheckedSnapshot } from './rawSnapshot-CPNkto81.js';
import { S as SnapshotEnvironment } from './environment-Ddx0EDtY.js';
import { Plugin, Plugins } from '@vitest/pretty-format';

interface ParsedStack {
    method: string;
    file: string;
    line: number;
    column: number;
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

interface SnapshotReturnOptions {
    actual: string;
    count: number;
    expected?: string;
    key: string;
    pass: boolean;
}
interface SaveStatus {
    deleted: boolean;
    saved: boolean;
}
declare class SnapshotState {
    testFilePath: string;
    snapshotPath: string;
    private _counters;
    private _dirty;
    private _updateSnapshot;
    private _snapshotData;
    private _initialData;
    private _inlineSnapshots;
    private _inlineSnapshotStacks;
    private _rawSnapshots;
    private _uncheckedKeys;
    private _snapshotFormat;
    private _environment;
    private _fileExists;
    added: number;
    expand: boolean;
    matched: number;
    unmatched: number;
    updated: number;
    private constructor();
    static create(testFilePath: string, options: SnapshotStateOptions): Promise<SnapshotState>;
    get environment(): SnapshotEnvironment;
    markSnapshotsAsCheckedForTest(testName: string): void;
    protected _inferInlineSnapshotStack(stacks: ParsedStack[]): ParsedStack | null;
    private _addSnapshot;
    clear(): void;
    save(): Promise<SaveStatus>;
    getUncheckedCount(): number;
    getUncheckedKeys(): Array<string>;
    removeUncheckedKeys(): void;
    match({ testName, received, key, inlineSnapshot, isInline, error, rawSnapshot, }: SnapshotMatchOptions): SnapshotReturnOptions;
    pack(): Promise<SnapshotResult>;
}

interface AssertOptions {
    received: unknown;
    filepath?: string;
    name?: string;
    message?: string;
    isInline?: boolean;
    properties?: object;
    inlineSnapshot?: string;
    error?: Error;
    errorMessage?: string;
    rawSnapshot?: RawSnapshotInfo;
}
interface SnapshotClientOptions {
    isEqual?: (received: unknown, expected: unknown) => boolean;
}
declare class SnapshotClient {
    private options;
    filepath?: string;
    name?: string;
    snapshotState: SnapshotState | undefined;
    snapshotStateMap: Map<string, SnapshotState>;
    constructor(options?: SnapshotClientOptions);
    startCurrentRun(filepath: string, name: string, options: SnapshotStateOptions): Promise<void>;
    getSnapshotState(filepath: string): SnapshotState;
    clearTest(): void;
    skipTestSnapshots(name: string): void;
    assert(options: AssertOptions): void;
    assertRaw(options: AssertOptions): Promise<void>;
    finishCurrentRun(): Promise<SnapshotResult | null>;
    clear(): void;
}

declare function stripSnapshotIndentation(inlineSnapshot: string): string;

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare function addSerializer(plugin: Plugin): void;
declare function getSerializers(): Plugins;

export { SnapshotClient, SnapshotMatchOptions, SnapshotResult, SnapshotState, SnapshotStateOptions, addSerializer, getSerializers, stripSnapshotIndentation };
