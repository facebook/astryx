'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Stack';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTable, pixel} from '@xds/core/Table';
import {XDSGrid} from '@xds/core/Grid';
import {radiusVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  previewCard: {
    borderRadius: radiusVars['--radius-container'],
    cursor: 'pointer',
  },
});

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const FOUNDATION_SECTIONS = [
  {key: 'typography', name: 'Typography', desc: 'A type scale from display-1 down to supporting text, with weight and color options. Establishes visual hierarchy without guessing font sizes.'},
  {key: 'colors', name: 'Colors', desc: 'A semantic palette that adapts across themes. Use surface, text, border, and accent tokens instead of raw hex values so your UI stays consistent.'},
  {key: 'spacing', name: 'Spacing', desc: 'A 4px-based scale (0–10) used for padding, margins, and gaps. Keeps layouts aligned to a consistent rhythm across every component and page.'},
  {key: 'shape', name: 'Shape', desc: 'Border radius tokens from sharp (2px) to fully rounded (pill). Controls, cards, and containers each have a designated radius so shapes feel intentional.'},
  {key: 'icons', name: 'Icons', desc: 'A consistent icon set built for XDS components. Semantic and non-semantic color options with multiple sizes.'},
];

// ---------------------------------------------------------------------------
// Sub-views
// ---------------------------------------------------------------------------

function OverviewView({
  onSelectSection,
}: {
  onSelectSection: (key: string) => void;
}) {
  return (
    <XDSLayout contentWidth={1200} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={10}>
          <XDSCard variant="cyan" padding={10}>
            <XDSHStack gap={8} vAlign="center">
              <XDSStackItem size="fill">
                <XDSVStack gap={4}>
                  <XDSText type="display-1">Design foundations</XDSText>
                  <XDSText type="large" weight="normal" color="secondary">
                    The design tokens and primitives that every component is
                    built on. Use these foundations to create consistent,
                    accessible interfaces.
                  </XDSText>
                </XDSVStack>
              </XDSStackItem>
              <XDSStackItem size="fill" />
            </XDSHStack>
          </XDSCard>

          <XDSGrid columns={{minWidth: 260}} gap={8}>
            {FOUNDATION_SECTIONS.map(item => (
              <XDSVStack key={item.key} gap={3}>
                <XDSCard
                  variant="muted"
                  padding={0}
                  minHeight={160}
                  xstyle={styles.previewCard}
                  onClick={() => onSelectSection(item.key)}
                />
                <XDSVStack gap={0.5}>
                  <XDSText type="body" weight="bold">
                    {item.name}
                  </XDSText>
                  <XDSText type="body" color="secondary">
                    {item.desc}
                  </XDSText>
                </XDSVStack>
              </XDSVStack>
            ))}
          </XDSGrid>
        </XDSVStack>
      </XDSLayoutContent>
    } />
  );
}

function FoundationDetailView({activeNav}: {activeNav: string}) {
  const item = FOUNDATION_SECTIONS.find(s => s.key === activeNav);
  if (!item) return null;

  return (
    <XDSLayout contentWidth={960} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={8}>
          <XDSVStack gap={2}>
            <XDSText type="display-1">{item.name}</XDSText>
            <XDSText type="body" color="secondary">{item.desc}</XDSText>
          </XDSVStack>

          <XDSDivider />

          <XDSCard variant="muted" padding={10}>
            <XDSVStack gap={3} hAlign="center" style={{textAlign: 'center'}}>
              <XDSText type="body" color="secondary">
                Documentation coming soon
              </XDSText>
            </XDSVStack>
          </XDSCard>
        </XDSVStack>
      </XDSLayoutContent>
    } />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DesignDocumentationPage() {
  const [activePage, setActivePage] = useState<string>('home');

  return (
    <XDSAppShell
      variant="section"
      height="fill"
      sideNav={
        <XDSSideNav
          header={
            <XDSSideNavHeading heading="Product Name" />
          }>
          <XDSSideNavSection title="Navigation" isHeaderHidden>
            <XDSSideNavItem
              label="Home"
              isSelected={activePage === 'home'}
              onClick={() => setActivePage('home')}
            />
          </XDSSideNavSection>
          <XDSSideNavSection title="Foundations">
            {FOUNDATION_SECTIONS.map(item => (
              <XDSSideNavItem
                key={item.key}
                label={item.name}
                isSelected={activePage === item.key}
                onClick={() => setActivePage(item.key)}
              />
            ))}
          </XDSSideNavSection>
        </XDSSideNav>
      }>
      {activePage === 'home' ? (
        <OverviewView onSelectSection={setActivePage} />
      ) : (
        <FoundationDetailView activeNav={activePage} />
      )}
    </XDSAppShell>
  );
}
