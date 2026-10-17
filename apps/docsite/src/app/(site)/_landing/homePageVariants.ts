// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Homepage experiment definitions.
 * @input Stable Astryx package and repository destinations
 * @output One control plus two isolated hero variants for direct-route testing
 * @position Pure configuration consumed by the shared homepage and its tests
 */

import {GITHUB_REPO} from '../../../constants';

export type HomePageVariant = 'control' | 'e1' | 'e2';

type SupportingContent = 'frameworks' | 'install-and-source';

type HomePageVariantConfig = {
  primaryHref: string;
  supportingContent: SupportingContent;
};

export const CORE_PACKAGE_URL =
  'https://www.npmjs.com/package/@astryxdesign/core';

export const HOME_PAGE_VARIANTS: Record<
  HomePageVariant,
  HomePageVariantConfig
> = {
  control: {
    primaryHref: '/docs/getting-started',
    supportingContent: 'frameworks',
  },
  e1: {
    primaryHref: '/docs/getting-started',
    supportingContent: 'install-and-source',
  },
  e2: {
    primaryHref: GITHUB_REPO,
    supportingContent: 'frameworks',
  },
};
