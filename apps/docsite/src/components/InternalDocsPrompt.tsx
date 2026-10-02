// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input Positive reachability, session dismissal, and the current docs route
 * @output A compact, non-modal pill floating above the page at every width
 * @position Client leaf mounted once inside the docsite's server root layout
 */

import {usePathname, useSearchParams} from 'next/navigation';
import {BookOpen} from 'lucide-react';
import * as stylex from '@stylexjs/stylex';
import {Card} from '@astryxdesign/core/Card';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {HStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {
  INTERNAL_DOCS_ORIGIN,
  useInternalDocsPrompt,
} from '../lib/useInternalDocsPrompt';

const styles = stylex.create({
  prompt: {
    position: 'fixed',
    bottom: 'max(var(--spacing-4), env(safe-area-inset-bottom))',
    right: 'max(var(--spacing-4), env(safe-area-inset-right))',
    width: 'fit-content',
    maxWidth: 'calc(100vw - var(--spacing-4) * 2)',
    borderRadius: 'var(--radius-full)',
    zIndex: 100,
    whiteSpace: 'nowrap',
  },
});

export function internalDocsHref(pathname: string, search: string): string {
  // Shared route families use the same topic/name/slug semantics. Public-only
  // pages (blog, community, changelog, preview) have no same-path counterpart.
  const hasCounterpart =
    pathname === '/' ||
    /^\/(docs|components|templates)(\/[^/]+)?\/?$/.test(pathname) ||
    /^\/(themes|playground)\/?$/.test(pathname);
  const url = new URL(INTERNAL_DOCS_ORIGIN);
  if (hasCounterpart) {
    url.pathname = pathname;
    url.search = search;
  }
  return url.href;
}

export function InternalDocsPrompt() {
  const {isVisible, dismiss} = useInternalDocsPrompt();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!isVisible) {
    return null;
  }

  return (
    <Card
      role="complementary"
      aria-label="Internal Astryx documentation"
      elevation="high"
      padding={2}
      xstyle={styles.prompt}>
      <HStack gap={2} vAlign="center">
        <Icon icon={BookOpen} size="sm" color="accent" />
        <Link
          href={internalDocsHref(pathname, searchParams.toString())}
          label="Internal docs — open Astryx documentation (Meta network detected, opens in a new tab)"
          isStandalone
          target="_blank"
          rel="noopener noreferrer">
          Internal docs
        </Link>
        <IconButton
          label="Dismiss internal docs prompt"
          tooltip="Dismiss internal docs prompt"
          icon={<Icon icon="close" />}
          variant="ghost"
          onClick={dismiss}
        />
      </HStack>
    </Card>
  );
}
