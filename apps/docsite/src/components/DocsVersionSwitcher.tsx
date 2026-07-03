// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {usePathname} from 'next/navigation';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {
  DOCS_VERSIONS,
  CURRENT_TARGET,
  CURRENT_CORE_VERSION,
  urlForTarget,
  hasSwitchableTargets,
} from '../lib/docsVersions';
import type {DocsTarget} from '../generated/buildTarget';

/**
 * Version switcher shown in the top nav. Labels which content line the reader
 * is viewing (latest vs canary) and, when the sibling deploy is configured,
 * offers a one-click jump to the same page on the other version.
 *
 * Degrades gracefully: with no sibling URL configured (e.g. local dev), it
 * renders a static, non-actionable label so the chrome is identical everywhere.
 */
export function DocsVersionSwitcher() {
  const pathname = usePathname();
  const current = DOCS_VERSIONS[CURRENT_TARGET];

  const triggerLabel =
    CURRENT_TARGET === 'latest' && CURRENT_CORE_VERSION
      ? `v${CURRENT_CORE_VERSION}`
      : current.label;

  if (!hasSwitchableTargets()) {
    // Single-deploy context: show the label without a menu affordance.
    return (
      <DropdownMenu
        button={{label: triggerLabel, variant: 'ghost', size: 'md'}}
        items={[
          {
            label: `${current.label} — current`,
            isDisabled: true,
          },
        ]}
      />
    );
  }

  const order: DocsTarget[] = ['latest', 'canary'];
  const items = order.map(target => {
    const info = DOCS_VERSIONS[target];
    const isCurrent = target === CURRENT_TARGET;
    const href = isCurrent ? null : urlForTarget(target, pathname);
    return {
      label: isCurrent ? `${info.label} — current` : info.label,
      isDisabled: isCurrent || href == null,
      onClick:
        href != null
          ? () => {
              window.location.href = href;
            }
          : undefined,
    };
  });

  return (
    <DropdownMenu
      button={{label: triggerLabel, variant: 'ghost', size: 'md'}}
      hasChevron
      items={items}
    />
  );
}
