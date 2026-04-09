'use client';

import {useState} from 'react';
import Link from 'next/link';
import {XDSText} from '@xds/core/Text';
import type {SandboxPage} from './sandboxPages';
import {ImageIcon} from './icons';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function ProjectCard({page}: {page: SandboxPage}) {
  const [iframeError, setIframeError] = useState(false);

  return (
    <Link
      href={page.href}
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
            overflow: 'hidden',
            position: 'relative',
          }}>
          {iframeError ? (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
              <ImageIcon style={{width: 48, height: 48, opacity: 0.3, color: 'var(--color-text-disabled)'}} />
            </div>
          ) : (
            <iframe
              src={`${basePath}${page.href}`}
              title={page.name}
              onError={() => setIframeError(true)}
              style={{
                width: 1280,
                height: 800,
                border: 'none',
                transform: 'scale(0.2)',
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
              }}
              tabIndex={-1}
              loading="lazy"
            />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '12px 16px',
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
