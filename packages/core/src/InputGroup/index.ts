// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from InputGroup.tsx, InputGroupText.tsx, InputGroupContext.ts
 * @output Exports InputGroup, InputGroupText, context hook, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {InputGroup} from './InputGroup';
export type {InputGroupProps, InputGroupSize} from './InputGroup';

export {InputGroupText} from './InputGroupText';
export type {InputGroupTextProps} from './InputGroupText';

export {useInputGroup} from './InputGroupContext';
export type {InputGroupContextValue} from './InputGroupContext';

/**
 * Exported for group-compatible controls built outside core. A control inside
 * an `InputGroup` has to drop its own outer radii and overlap its neighbour's
 * border; without these exact styles it renders as a separate box sitting
 * inside the group rather than as a segment of it.
 */
export {groupStyles} from './groupStyles';
