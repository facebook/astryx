// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * The config-authoring surface moved to `@astryxdesign/core/config` so an app's
 * config file gets type feedback without depending on the CLI. Re-exported here
 * so existing `@astryxdesign/cli/config` type imports keep resolving.
 */
export type {
  PostCodemodCommand,
  PostCodemodHook,
  XleComponent,
  AstryxConfig,
} from '@astryxdesign/core/config';

export {createConfig} from '@astryxdesign/core/config';
