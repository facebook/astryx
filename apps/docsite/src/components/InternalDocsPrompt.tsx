// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input Positive reachability, mounted-view dismissal, and the current docs route
 * @output A compact, non-modal utility bar fixed at the bottom center
 * @position Client leaf mounted once inside the docsite's server root layout
 */

import {useState} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';
import * as stylex from '@stylexjs/stylex';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
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
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'fit-content',
    maxWidth:
      'calc(100vw - max(var(--spacing-4), env(safe-area-inset-left)) - max(var(--spacing-4), env(safe-area-inset-right)))',
    borderRadius: 'var(--radius-element)',
    overflow: 'visible',
    zIndex: 100,
    whiteSpace: 'nowrap',
  },
  link: {
    minHeight: 'var(--size-element-sm)',
    paddingInline: 'var(--spacing-2)',
  },
  divider: {
    height: 'var(--spacing-4)',
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
  const isReachable = useInternalDocsPrompt();
  const pathname = usePathname();
  const search = useSearchParams().toString();

  // Keep detection mounted across navigation, but reset only the indicator's
  // local dismissal state when the current path/query changes.
  return isReachable ? (
    <InternalDocsUtilityBar
      key={`${pathname}?${search}`}
      href={internalDocsHref(pathname, search)}
    />
  ) : null;
}

function InternalDocsUtilityBar({href}: {href: string}) {
  const [isDismissed, setIsDismissed] = useState(false);
  if (isDismissed) {
    return null;
  }

  return (
    <Card
      role="complementary"
      aria-label="Meta internal docs"
      elevation="none"
      padding={0.5}
      xstyle={styles.prompt}>
      <HStack gap={1} vAlign="center">
        <Link
          href={href}
          isStandalone
          isExternalLink
          color="primary"
          xstyle={styles.link}>
          Meta internal docs
        </Link>
        <Divider orientation="vertical" xstyle={styles.divider} />
        <IconButton
          label="Dismiss Meta internal docs for this page view"
          tooltip="Dismiss for this page view"
          icon={<Icon icon="close" size="xsm" color="secondary" />}
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
        />
      </HStack>
    </Card>
  );
}
