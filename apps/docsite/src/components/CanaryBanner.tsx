// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {usePathname} from 'next/navigation';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {CURRENT_TARGET, DOCS_VERSIONS, urlForTarget} from '../lib/docsVersions';

/**
 * Full-width notice shown ONLY on canary (main) builds, warning readers that
 * they are viewing unreleased, work-in-progress documentation whose components
 * may not exist in the published package yet. Offers a jump to the same page on
 * the stable build when that deploy is configured.
 *
 * Rendered via AppShell's `banner` slot. Callers gate the slot on
 * `CURRENT_TARGET === 'canary'` so latest builds render no banner wrapper at
 * all (AppShell keys its banner region off `isRenderable`, and a bare
 * `<CanaryBanner />` element always counts as renderable even when it would
 * return `null`). The internal target guard below is a belt-and-suspenders
 * fallback for any caller that passes it unconditionally.
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
      title="You're viewing unreleased docs (main)"
      description="This documents work in progress. Some components and props shown here may not exist in the latest published package yet."
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
