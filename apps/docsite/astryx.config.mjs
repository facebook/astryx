// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Astryx CLI integrations the docsite documents. The canary site documents
 * every one; production documents one only once it has released stable
 * (src/lib/integrationTargets.mjs).
 */
export default {
  integrations: [
    '@astryxdesign/lab',
    '@astryxdesign/charts',
    '@astryxdesign/richtext',
    '@astryxdesign/vega',
  ],
};
