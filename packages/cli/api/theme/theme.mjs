// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `theme` command barrel — re-exports the build/add/list/template/targets
 * leaves so the CLI
 * (cli/commands/build-theme.mjs) and scripted callers import from one place.
 * Each leaf is also importable directly (e.g. api/theme/add/add.mjs). `theme`
 * has real subcommands, so there is no flag-dispatch here — the CLI calls the
 * leaf it wants.
 */

export {themeBuild, importSpecifier} from './build/build.mjs';
export {themeAdd} from './add/add.mjs';
export {themeTemplate} from './template/template.mjs';
export {themeTargets} from './targets/targets.mjs';
export {themeList} from './list/list.mjs';
export {listThemes} from './_adapter.mjs';
