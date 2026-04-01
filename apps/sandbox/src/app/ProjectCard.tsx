'use client';

import Link from 'next/link';
import {XDSText} from '@xds/core/Text';
import type {SandboxPage} from './sandboxPages';
import {ImageIcon} from './icons';

export function ProjectCard({page}: {page: SandboxPage}) {
  return (
    <Link
      href={page.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{textDecoration: 'none', color: 'inherit', display: 'flex'}}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          borderRadius: 12,
          border: '1px solid var(--color-border-emphasized)',
          backgroundColor: 'var(--color-background-card)',
          overflow: 'hidden',
        }}>
        <div
          style={{
            width: '100%',
            height: 160,
            backgroundColor: 'var(--color-background-body)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
          <ImageIcon
            style={{
              width: 48,
              height: 48,
              opacity: 0.3,
              color: 'var(--color-text-disabled)',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '12px 16px',
            flex: 1,
          }}>
          <XDSText type="body" weight="semibold" maxLines={1}>
            {page.name}
          </XDSText>
          <XDSText type="body" size="sm" color="secondary" maxLines={2}>
            {page.description}
          </XDSText>
        </div>
      </div>
    </Link>
  );
}
