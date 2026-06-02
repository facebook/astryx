// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useRef} from 'react';
import {XDSOutline} from '@xds/core/Outline';
import type {OutlineItem} from '@xds/core/Outline';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';

const sections: OutlineItem[] = [
  {id: 'spy-overview', label: 'Overview', level: 2},
  {id: 'spy-installation', label: 'Installation', level: 2},
  {id: 'spy-theming', label: 'Theming', level: 2},
  {id: 'spy-tokens', label: 'Tokens', level: 3},
  {id: 'spy-overrides', label: 'Component overrides', level: 3},
  {id: 'spy-accessibility', label: 'Accessibility', level: 2},
];

export default function OutlineScrollSpy() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <XDSHStack gap={6} style={{width: 560, height: 360}}>
      <div style={{width: 180, flexShrink: 0}}>
        <XDSOutline items={sections} scrollContainerRef={containerRef} />
      </div>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingInlineEnd: 'var(--spacing-3)',
        }}>
        <XDSVStack gap={6}>
          {sections.map(section => (
            <section key={section.id} id={section.id}>
              <XDSVStack gap={2} style={{minHeight: 220}}>
                <XDSHeading level={section.level === 3 ? 4 : 3}>
                  {section.label}
                </XDSHeading>
                <XDSText type="body" color="secondary">
                  Scroll the content on the right — the outline indicator slides
                  to the section nearest the top of the viewport.
                </XDSText>
              </XDSVStack>
            </section>
          ))}
        </XDSVStack>
      </div>
    </XDSHStack>
  );
}
