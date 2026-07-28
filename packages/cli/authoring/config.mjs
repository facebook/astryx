// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Re-export of the config-authoring helper, which now lives in
 * `@astryxdesign/core/config` so an app's config file gets type feedback
 * without depending on the CLI. Kept here so existing
 * `@astryxdesign/cli/config` imports continue to work unchanged.
 */
export {createConfig} from '@astryxdesign/core/config';
