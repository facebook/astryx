// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `layout` command barrel — re-exports the expand/check/grammar leaves so
 * the CLI (cli/commands/layout.mjs) and scripted callers import from one place.
 * Each leaf is also importable directly (e.g. api/layout/expand/expand.mjs). The
 * shared analysis core lives in ./_adapter.mjs. `layout` has real subcommands,
 * so there is no flag-dispatch here — the CLI calls the leaf it wants.
 *
 * @input  layout expressions (+ options), per leaf
 * @output {type, data} envelopes: layout.expand / layout.check / layout.grammar
 * @position api — command barrel over the expand/check/grammar leaves
 */

export {layoutExpand} from './expand/expand.mjs';
export {layoutCheck} from './check/check.mjs';
export {layoutGrammar, ALIAS_TABLE} from './grammar/grammar.mjs';
