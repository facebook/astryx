'use client';

import Link from 'next/link';
import {XDSText} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import type {SandboxPage} from './sandboxPages';

export function ProjectCard({page}: {page: SandboxPage}) {
  return (
    <Link
      href={page.href}
      style={{textDecoration: 'none', color: 'inherit', display: 'flex'}}>
      <XDSCard padding={4} style={{width: '100%'}}>
        <XDSVStack gap={1}>
          <XDSText type="body" weight="semibold" maxLines={1}>
            {page.name}
          </XDSText>
          <XDSText type="body" size="sm" color="secondary" maxLines={2}>
            {page.description}
          </XDSText>
        </XDSVStack>
      </XDSCard>
    </Link>
  );
}
