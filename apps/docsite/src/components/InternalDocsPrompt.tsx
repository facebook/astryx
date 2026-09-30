// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input Positive reachability, session dismissal, and the current docs route
 * @output An optional, non-modal invitation to the internal documentation
 * @position Client leaf mounted once inside the docsite's server root layout
 */

import {usePathname, useSearchParams} from 'next/navigation';
import {BookOpen} from 'lucide-react';
import * as stylex from '@stylexjs/stylex';
import {Card} from '@astryxdesign/core/Card';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {Text} from '@astryxdesign/core/Text';
import {
  INTERNAL_DOCS_ORIGIN,
  useInternalDocsPrompt,
} from '../lib/useInternalDocsPrompt';

const styles = stylex.create({
  prompt: {
    position: 'fixed',
    bottom: 'max(var(--spacing-4), env(safe-area-inset-bottom))',
    right: 'max(var(--spacing-4), env(safe-area-inset-right))',
    width: 'calc(100% - var(--spacing-4) * 2)',
    maxWidth: 360,
    zIndex: 100,
    // On narrow screens the notice takes its own space above the page rather
    // than covering navigation, code examples, or the playground controls.
    '@media (max-width: 767px)': {
      position: 'static',
      margin: 'var(--spacing-4)',
      maxWidth: 'none',
    },
  },
  copy: {
    flex: 1,
    minWidth: 0,
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
      xstyle={styles.prompt}>
      <HStack gap={3} vAlign="start">
        <Icon icon={BookOpen} color="accent" />
        <VStack gap={2} xstyle={styles.copy}>
          <Text type="label">On Meta&apos;s network?</Text>
          <Text>
            Open the internal Astryx docs — includes Meta-specific components
            &amp; guidance.
          </Text>
          <Link
            href={internalDocsHref(pathname, searchParams.toString())}
            isStandalone
            isExternalLink>
            Open internal docs
          </Link>
        </VStack>
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
