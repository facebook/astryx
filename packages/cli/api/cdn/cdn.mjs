// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `cdn` command barrel — re-exports the template leaf so the CLI
 * (clients/cli/commands/cdn.mjs) and scripted callers import from one place.
 * `cdn` has real subcommands, so there is no flag-dispatch here.
 */

export {
  cdnTemplate,
  CDN_TEMPLATE_DEFAULT_PATH,
  CDN_TEMPLATE_SRC,
  CDN_VERSION_PLACEHOLDER,
} from './template/template.mjs';
