// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {usePathname} from 'next/navigation';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {CURRENT_TARGET, DOCS_VERSIONS, urlForTarget} from '../lib/docsVersions';

/**
 * Full-width notice shown ONLY on canary builds (the `main` deploy and every PR
 * preview), warning readers that they are viewing unreleased, work-in-progress
 * documentation whose components and props may not exist in the published
 * package yet. Links to the same page on the stable site.
 *
 * Rendered via AppShell's `banner` slot; callers gate the slot on
 * `CURRENT_TARGET === 'canary'` so production renders no banner region at all
 * (AppShell keys the region off `isRenderable`, and a bare `<CanaryBanner />`
 * element always counts as renderable even when it would return `null`). The
 * internal target guard is a belt-and-suspenders fallback.
 */
export function CanaryBanner() {
  const pathname = usePathname();

  if (CURRENT_TARGET !== 'canary') {
    return null;
  }

  const stableHref = urlForTarget('latest', pathname);
  const stableLabel = DOCS_VERSIONS.latest.label;

  return (
    <Banner
      container="section"
      status="warning"
      title="You're viewing unreleased docs (Canary)"
      description="This documents the canary release from main. Some components and props shown here may not exist in the latest published package yet — they ship on the @canary npm tag until the next stable release."
      endContent={
        stableHref ? (
          <Button
            label={`View ${stableLabel}`}
            variant="secondary"
            href={stableHref}
          />
        ) : undefined
      }
    />
  );
}
