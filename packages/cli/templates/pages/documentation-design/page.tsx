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
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Stack';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTable, pixel} from '@xds/core/Table';
import {XDSGrid} from '@xds/core/Grid';
import {XDSSection} from '@xds/core/Section';

// ---------------------------------------------------------------------------
// Data — design foundation sections
// ---------------------------------------------------------------------------

const NAV_SECTIONS = [
  {
    label: 'Foundations',
    items: [
      {key: 'overview', name: 'Overview'},
      {key: 'typography', name: 'Typography'},
      {key: 'colors', name: 'Colors'},
      {key: 'spacing', name: 'Spacing'},
      {key: 'shape', name: 'Shape'},
      {key: 'elevation', name: 'Elevation'},
      {key: 'icons', name: 'Icons'},
    ],
  },
  {
    label: 'Patterns',
    items: [
      {key: 'layout-patterns', name: 'Layout Patterns'},
      {key: 'responsive', name: 'Responsive Design'},
      {key: 'motion', name: 'Motion & Animation'},
      {key: 'accessibility', name: 'Accessibility'},
    ],
  },
  {
    label: 'Theming',
    items: [
      {key: 'theme-overview', name: 'Theme System'},
      {key: 'custom-themes', name: 'Custom Themes'},
      {key: 'dark-mode', name: 'Dark Mode'},
    ],
  },
];

const TYPE_SCALE: {
  name: string;
  token: string;
  size: string;
  weight: string;
  lineHeight: string;
  usage: string;
}[] = [
  {name: 'Display 1', token: 'display-1', size: '36px', weight: '700', lineHeight: '1.2', usage: 'Page titles and hero headings'},
  {name: 'Display 2', token: 'display-2', size: '28px', weight: '700', lineHeight: '1.25', usage: 'Section headings'},
  {name: 'Large', token: 'large', size: '20px', weight: '400', lineHeight: '1.4', usage: 'Lead paragraphs and introductions'},
  {name: 'Body', token: 'body', size: '15px', weight: '400', lineHeight: '1.5', usage: 'Default body text'},
  {name: 'Label', token: 'label', size: '13px', weight: '600', lineHeight: '1.4', usage: 'Form labels and small headings'},
  {name: 'Supporting', token: 'supporting', size: '12px', weight: '400', lineHeight: '1.4', usage: 'Captions, timestamps, metadata'},
];

const COLOR_TOKENS: {
  name: string;
  token: string;
  value: string;
  usage: string;
}[] = [
  {name: 'Accent', token: '--color-accent', value: '#0066FF', usage: 'Primary actions, links, active states'},
  {name: 'Accent Muted', token: '--color-accent-muted', value: '#DBEAFE', usage: 'Accent backgrounds, hover highlights'},
  {name: 'Background', token: '--color-background', value: '#FFFFFF', usage: 'Page background'},
  {name: 'Surface', token: '--color-surface', value: '#F9FAFB', usage: 'Card backgrounds, elevated containers'},
  {name: 'Muted', token: '--color-muted', value: '#F3F4F6', usage: 'Subtle backgrounds, disabled states'},
  {name: 'Text Primary', token: '--color-text-primary', value: '#111827', usage: 'Primary text content'},
  {name: 'Text Secondary', token: '--color-text-secondary', value: '#6B7280', usage: 'Supporting text, labels, metadata'},
  {name: 'Border', token: '--color-border', value: '#E5E7EB', usage: 'Card borders, dividers, input outlines'},
  {name: 'Success', token: '--color-success', value: '#059669', usage: 'Success states, confirmations'},
  {name: 'Warning', token: '--color-warning', value: '#D97706', usage: 'Warning states, caution indicators'},
  {name: 'Error', token: '--color-error', value: '#DC2626', usage: 'Error states, destructive actions'},
];

const SPACING_SCALE: {
  step: string;
  value: string;
  px: string;
  usage: string;
}[] = [
  {step: '0', value: '0px', px: '0', usage: 'No spacing'},
  {step: '0.5', value: '2px', px: '2', usage: 'Tight inline spacing'},
  {step: '1', value: '4px', px: '4', usage: 'Compact gaps, icon margins'},
  {step: '2', value: '8px', px: '8', usage: 'Default inline spacing, small gaps'},
  {step: '3', value: '12px', px: '12', usage: 'Component padding, stack gaps'},
  {step: '4', value: '16px', px: '16', usage: 'Card padding, section margins'},
  {step: '5', value: '20px', px: '20', usage: 'Generous padding'},
  {step: '6', value: '24px', px: '24', usage: 'Section spacing'},
  {step: '8', value: '32px', px: '32', usage: 'Large section gaps'},
  {step: '10', value: '40px', px: '40', usage: 'Page-level spacing'},
];

const RADIUS_TOKENS: {
  name: string;
  token: string;
  value: string;
  usage: string;
}[] = [
  {name: 'None', token: '--radius-none', value: '0px', usage: 'Sharp corners for full-bleed elements'},
  {name: 'Small', token: '--radius-sm', value: '4px', usage: 'Badges, tokens, compact controls'},
  {name: 'Control', token: '--radius-control', value: '8px', usage: 'Buttons, inputs, selectors'},
  {name: 'Container', token: '--radius-container', value: '12px', usage: 'Cards, dialogs, panels'},
  {name: 'Large', token: '--radius-lg', value: '16px', usage: 'Hero sections, feature cards'},
  {name: 'Pill', token: '--radius-pill', value: '9999px', usage: 'Fully rounded pills, avatars'},
];

const ELEVATION_LEVELS: {
  name: string;
  token: string;
  value: string;
  usage: string;
}[] = [
  {name: 'None', token: '--elevation-0', value: 'none', usage: 'Flat elements on the surface'},
  {name: 'Low', token: '--elevation-1', value: '0 1px 3px rgba(0,0,0,0.08)', usage: 'Cards, subtle lift on hover'},
  {name: 'Medium', token: '--elevation-2', value: '0 4px 12px rgba(0,0,0,0.12)', usage: 'Dropdowns, popovers'},
  {name: 'High', token: '--elevation-3', value: '0 8px 24px rgba(0,0,0,0.16)', usage: 'Dialogs, modals'},
];

// ---------------------------------------------------------------------------
// Page content views
// ---------------------------------------------------------------------------

function OverviewPage() {
  return (
    <XDSLayout contentWidth={960} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={8}>
          <XDSVStack gap={2}>
            <XDSText type="display-1">Design Foundations</XDSText>
            <XDSText type="large" weight="normal" color="secondary">
              The design tokens and primitives that every component is built on.
              Use these foundations to create consistent, accessible interfaces.
            </XDSText>
          </XDSVStack>

          <XDSGrid columns={{minWidth: 280}} gap={4}>
            {[
              {title: 'Typography', desc: 'A type scale from display-1 down to supporting text, with weight and color options.', key: 'typography'},
              {title: 'Colors', desc: 'A semantic palette that adapts across themes. Surface, text, border, and accent tokens.', key: 'colors'},
              {title: 'Spacing', desc: 'A 4px-based scale for padding, margins, and gaps. Consistent rhythm across layouts.', key: 'spacing'},
              {title: 'Shape', desc: 'Border radius tokens from sharp (0px) to fully rounded (pill). Intentional corner rounding.', key: 'shape'},
              {title: 'Elevation', desc: 'Shadow tokens from flat to high elevation. Visual depth for layered interfaces.', key: 'elevation'},
              {title: 'Icons', desc: 'Consistent icon set with semantic and non-semantic color options in multiple sizes.', key: 'icons'},
            ].map(item => (
              <XDSCard key={item.key} padding={5}>
                <XDSVStack gap={1}>
                  <XDSText type="body" weight="bold">{item.title}</XDSText>
                  <XDSText type="body" color="secondary">{item.desc}</XDSText>
                </XDSVStack>
              </XDSCard>
            ))}
          </XDSGrid>

          <XDSDivider />

          <XDSVStack gap={4}>
            <XDSHeading level={2}>Design Principles</XDSHeading>
            <XDSList density="spacious" listStyle="disc">
              <XDSListItem label="Consistency — Use tokens instead of raw values. Components inherit from the theme automatically." />
              <XDSListItem label="Accessibility — WCAG AA contrast ratios. Keyboard navigable. Screen reader friendly." />
              <XDSListItem label="Composability — Small, focused components that combine into complex interfaces." />
              <XDSListItem label="Themeable — Every visual decision flows from tokens. Swap an entire look with one theme." />
            </XDSList>
          </XDSVStack>
        </XDSVStack>
      </XDSLayoutContent>
    } />
  );
}

function TypographyPage() {
  return (
    <XDSLayout contentWidth={960} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={8}>
          <XDSVStack gap={2}>
            <XDSText type="display-1">Typography</XDSText>
            <XDSText type="body" color="secondary">
              A type scale from display headings down to supporting text. Establishes
              visual hierarchy without guessing font sizes.
            </XDSText>
          </XDSVStack>

          {/* Visual preview */}
          <XDSCard variant="muted" padding={8}>
            <XDSVStack gap={6}>
              <XDSText type="display-1">Display 1</XDSText>
              <XDSText type="display-2">Display 2</XDSText>
              <XDSText type="large">Large text</XDSText>
              <XDSText type="body">Body text — the default for reading content.</XDSText>
              <XDSText type="label">Label text</XDSText>
              <XDSText type="supporting">Supporting text</XDSText>
            </XDSVStack>
          </XDSCard>

          {/* Scale table */}
          <XDSVStack gap={4}>
            <XDSHeading level={2}>Type Scale</XDSHeading>
            <XDSTable
              data={TYPE_SCALE as Record<string, unknown>[]}
              columns={[
                {key: 'name', header: 'Name', width: pixel(130)},
                {key: 'token', header: 'Token', width: pixel(120), renderCell: (item: Record<string, unknown>) => (
                  <XDSText type="supporting" style={{fontFamily: 'monospace', fontSize: 12}}>{item.token as string}</XDSText>
                )},
                {key: 'size', header: 'Size', width: pixel(80)},
                {key: 'weight', header: 'Weight', width: pixel(80)},
                {key: 'lineHeight', header: 'Line Height', width: pixel(100)},
                {key: 'usage', header: 'Usage'},
              ]}
              density="spacious"
              dividers="rows"
            />
          </XDSVStack>

          <XDSDivider />

          {/* Usage example */}
          <XDSVStack gap={4}>
            <XDSHeading level={2}>Usage</XDSHeading>
            <XDSCard padding={0}>
              <XDSCodeBlock
                code={`import { XDSHeading, XDSText } from '@xds/core/Text';

<XDSHeading level={1}>Page Title</XDSHeading>
<XDSText type="body" color="secondary">
  Supporting description text.
</XDSText>
<XDSText type="supporting">Metadata · Timestamp</XDSText>`}
                language="tsx"
              />
            </XDSCard>
          </XDSVStack>

          <XDSDivider />

          <XDSVStack gap={4}>
            <XDSHeading level={2}>Guidelines</XDSHeading>
            <XDSList density="spacious" listStyle="disc">
              <XDSListItem label="Use display-1 for page titles. Only one per page." />
              <XDSListItem label="Use display-2 for section headings within a page." />
              <XDSListItem label="Body text is the default. Use it for paragraphs and content." />
              <XDSListItem label="Supporting text for timestamps, captions, and metadata." />
              <XDSListItem label="Don't skip heading levels — go from h1 to h2, not h1 to h3." />
            </XDSList>
          </XDSVStack>
        </XDSVStack>
      </XDSLayoutContent>
    } />
  );
}

function ColorsPage() {
  return (
    <XDSLayout contentWidth={960} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={8}>
          <XDSVStack gap={2}>
            <XDSText type="display-1">Colors</XDSText>
            <XDSText type="body" color="secondary">
              A semantic palette that adapts across themes. Use surface, text,
              border, and accent tokens instead of raw hex values.
            </XDSText>
          </XDSVStack>

          {/* Color swatches */}
          <XDSGrid columns={{minWidth: 160}} gap={4}>
            {COLOR_TOKENS.map(color => (
              <XDSCard key={color.token} padding={0}>
                <div
                  style={{
                    height: 80,
                    backgroundColor: color.value,
                    borderRadius: '12px 12px 0 0',
                    border: color.value === '#FFFFFF' ? '1px solid #E5E7EB' : 'none',
                    borderBottom: 'none',
                  }}
                />
                <XDSSection padding={3}>
                  <XDSVStack gap={0.5}>
                    <XDSText type="body" weight="bold">{color.name}</XDSText>
                    <XDSText type="supporting" color="secondary" style={{fontFamily: 'monospace', fontSize: 11}}>
                      {color.value}
                    </XDSText>
                  </XDSVStack>
                </XDSSection>
              </XDSCard>
            ))}
          </XDSGrid>

          {/* Token reference table */}
          <XDSVStack gap={4}>
            <XDSHeading level={2}>Token Reference</XDSHeading>
            <XDSTable
              data={COLOR_TOKENS as Record<string, unknown>[]}
              columns={[
                {key: 'name', header: 'Name', width: pixel(140)},
                {key: 'token', header: 'Token', width: pixel(200), renderCell: (item: Record<string, unknown>) => (
                  <XDSText type="supporting" style={{fontFamily: 'monospace', fontSize: 12}}>{item.token as string}</XDSText>
                )},
                {key: 'value', header: 'Default', width: pixel(100), renderCell: (item: Record<string, unknown>) => (
                  <XDSHStack gap={2} vAlign="center">
                    <div style={{width: 16, height: 16, borderRadius: 4, backgroundColor: item.value as string, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0}} />
                    <XDSText type="supporting" style={{fontFamily: 'monospace', fontSize: 11}}>{item.value as string}</XDSText>
                  </XDSHStack>
                )},
                {key: 'usage', header: 'Usage'},
              ]}
              density="spacious"
              dividers="rows"
            />
          </XDSVStack>

          <XDSDivider />

          <XDSVStack gap={4}>
            <XDSHeading level={2}>Usage</XDSHeading>
            <XDSCard padding={0}>
              <XDSCodeBlock
                code={`// Use semantic tokens — they adapt across themes
<XDSText color="secondary">Muted text</XDSText>
<XDSButton variant="primary">Accent color</XDSButton>
<XDSCard variant="muted">Surface background</XDSCard>

// Never use raw hex values in component code
// ❌ style={{ color: '#6B7280' }}
// ✅ <XDSText color="secondary">`}
                language="tsx"
              />
            </XDSCard>
          </XDSVStack>
        </XDSVStack>
      </XDSLayoutContent>
    } />
  );
}

function SpacingPage() {
  return (
    <XDSLayout contentWidth={960} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={8}>
          <XDSVStack gap={2}>
            <XDSText type="display-1">Spacing</XDSText>
            <XDSText type="body" color="secondary">
              A 4px-based scale used for padding, margins, and gaps. Keeps
              layouts aligned to a consistent rhythm across every component.
            </XDSText>
          </XDSVStack>

          {/* Visual scale */}
          <XDSCard variant="muted" padding={6}>
            <XDSVStack gap={3}>
              {SPACING_SCALE.filter(s => parseInt(s.px) > 0).map(space => (
                <XDSHStack key={space.step} gap={4} vAlign="center">
                  <XDSText type="supporting" color="secondary" style={{fontFamily: 'monospace', width: 40, textAlign: 'right', flexShrink: 0}}>
                    {space.step}
                  </XDSText>
                  <div
                    style={{
                      width: parseInt(space.px),
                      height: 24,
                      backgroundColor: 'var(--color-accent, #0066FF)',
                      borderRadius: 4,
                      opacity: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  <XDSText type="supporting" color="secondary">{space.value}</XDSText>
                </XDSHStack>
              ))}
            </XDSVStack>
          </XDSCard>

          {/* Table */}
          <XDSVStack gap={4}>
            <XDSHeading level={2}>Scale Reference</XDSHeading>
            <XDSTable
              data={SPACING_SCALE as Record<string, unknown>[]}
              columns={[
                {key: 'step', header: 'Step', width: pixel(80)},
                {key: 'value', header: 'Value', width: pixel(100)},
                {key: 'usage', header: 'Usage'},
              ]}
              density="spacious"
              dividers="rows"
            />
          </XDSVStack>

          <XDSDivider />

          <XDSVStack gap={4}>
            <XDSHeading level={2}>Usage</XDSHeading>
            <XDSCard padding={0}>
              <XDSCodeBlock
                code={`// Use the gap prop on Stack and Grid components
<XDSVStack gap={4}>  {/* 16px gap */}
  <XDSHeading level={2}>Section</XDSHeading>
  <XDSText type="body">Content</XDSText>
</XDSVStack>

// Use the padding prop on Card and Section
<XDSCard padding={6}>  {/* 24px padding */}
  <XDSText type="body">Card content</XDSText>
</XDSCard>`}
                language="tsx"
              />
            </XDSCard>
          </XDSVStack>
        </XDSVStack>
      </XDSLayoutContent>
    } />
  );
}

function ShapePage() {
  return (
    <XDSLayout contentWidth={960} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={8}>
          <XDSVStack gap={2}>
            <XDSText type="display-1">Shape</XDSText>
            <XDSText type="body" color="secondary">
              Border radius tokens from sharp to fully rounded. Controls, cards,
              and containers each have a designated radius so shapes feel intentional.
            </XDSText>
          </XDSVStack>

          {/* Visual preview */}
          <XDSCard variant="muted" padding={8}>
            <XDSHStack gap={6} vAlign="end" style={{justifyContent: 'center'}}>
              {RADIUS_TOKENS.map(radius => (
                <XDSVStack key={radius.token} gap={2} hAlign="center">
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: radius.value === '9999px' ? 9999 : parseInt(radius.value),
                      backgroundColor: 'var(--color-accent, #0066FF)',
                      opacity: 0.8,
                    }}
                  />
                  <XDSText type="supporting" weight="semibold">{radius.name}</XDSText>
                  <XDSText type="supporting" color="secondary" style={{fontFamily: 'monospace', fontSize: 11}}>
                    {radius.value}
                  </XDSText>
                </XDSVStack>
              ))}
            </XDSHStack>
          </XDSCard>

          {/* Table */}
          <XDSVStack gap={4}>
            <XDSHeading level={2}>Radius Tokens</XDSHeading>
            <XDSTable
              data={RADIUS_TOKENS as Record<string, unknown>[]}
              columns={[
                {key: 'name', header: 'Name', width: pixel(120)},
                {key: 'token', header: 'Token', width: pixel(200), renderCell: (item: Record<string, unknown>) => (
                  <XDSText type="supporting" style={{fontFamily: 'monospace', fontSize: 12}}>{item.token as string}</XDSText>
                )},
                {key: 'value', header: 'Value', width: pixel(100)},
                {key: 'usage', header: 'Usage'},
              ]}
              density="spacious"
              dividers="rows"
            />
          </XDSVStack>
        </XDSVStack>
      </XDSLayoutContent>
    } />
  );
}

function ElevationPage() {
  return (
    <XDSLayout contentWidth={960} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={8}>
          <XDSVStack gap={2}>
            <XDSText type="display-1">Elevation</XDSText>
            <XDSText type="body" color="secondary">
              Shadow tokens that create visual depth. Higher elevation = more
              prominence. Use sparingly to maintain visual clarity.
            </XDSText>
          </XDSVStack>

          {/* Visual preview */}
          <XDSCard variant="muted" padding={8}>
            <XDSHStack gap={8} vAlign="center" style={{justifyContent: 'center'}}>
              {ELEVATION_LEVELS.map(level => (
                <XDSVStack key={level.token} gap={3} hAlign="center">
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 12,
                      backgroundColor: 'var(--color-background, #fff)',
                      boxShadow: level.value,
                      border: level.value === 'none' ? '1px solid var(--color-border, #E5E7EB)' : 'none',
                    }}
                  />
                  <XDSText type="supporting" weight="semibold">{level.name}</XDSText>
                </XDSVStack>
              ))}
            </XDSHStack>
          </XDSCard>

          {/* Table */}
          <XDSVStack gap={4}>
            <XDSHeading level={2}>Elevation Tokens</XDSHeading>
            <XDSTable
              data={ELEVATION_LEVELS as Record<string, unknown>[]}
              columns={[
                {key: 'name', header: 'Level', width: pixel(100)},
                {key: 'token', header: 'Token', width: pixel(160), renderCell: (item: Record<string, unknown>) => (
                  <XDSText type="supporting" style={{fontFamily: 'monospace', fontSize: 12}}>{item.token as string}</XDSText>
                )},
                {key: 'value', header: 'Value', width: pixel(260), renderCell: (item: Record<string, unknown>) => (
                  <XDSText type="supporting" style={{fontFamily: 'monospace', fontSize: 12}}>{item.value as string}</XDSText>
                )},
                {key: 'usage', header: 'Usage'},
              ]}
              density="spacious"
              dividers="rows"
            />
          </XDSVStack>
        </XDSVStack>
      </XDSLayoutContent>
    } />
  );
}

function PlaceholderPage({title, description}: {title: string; description: string}) {
  return (
    <XDSLayout contentWidth={960} content={
      <XDSLayoutContent padding={8}>
        <XDSVStack gap={8}>
          <XDSVStack gap={2}>
            <XDSText type="display-1">{title}</XDSText>
            <XDSText type="body" color="secondary">{description}</XDSText>
          </XDSVStack>
          <XDSCard variant="muted" padding={10}>
            <XDSVStack gap={3} hAlign="center" style={{textAlign: 'center'}}>
              <XDSText type="body" color="secondary">Documentation coming soon</XDSText>
              <XDSBadge label="In Progress" variant="info" />
            </XDSVStack>
          </XDSCard>
        </XDSVStack>
      </XDSLayoutContent>
    } />
  );
}

// ---------------------------------------------------------------------------
// Page content router
// ---------------------------------------------------------------------------

const PAGE_CONTENT: Record<string, {title: string; description: string}> = {
  icons: {title: 'Icons', description: 'Consistent icon set with semantic and non-semantic color options in multiple sizes.'},
  'layout-patterns': {title: 'Layout Patterns', description: 'Common layout compositions using Stack, Grid, AppShell, and responsive breakpoints.'},
  responsive: {title: 'Responsive Design', description: 'Breakpoint system, container queries, and mobile-first design patterns.'},
  motion: {title: 'Motion & Animation', description: 'Transition tokens, keyframes, and animation patterns for smooth, purposeful motion.'},
  accessibility: {title: 'Accessibility', description: 'WCAG AA compliance, keyboard navigation, screen reader support, and ARIA patterns.'},
  'theme-overview': {title: 'Theme System', description: 'How theming works: providers, tokens, and runtime theme switching.'},
  'custom-themes': {title: 'Custom Themes', description: 'Create and publish custom themes with your own colors, typography, and radius.'},
  'dark-mode': {title: 'Dark Mode', description: 'Implementing dark mode with theme switching and system preference detection.'},
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DesignDocumentationPage() {
  const [activePage, setActivePage] = useState<string>('overview');

  const renderContent = () => {
    switch (activePage) {
      case 'overview': return <OverviewPage />;
      case 'typography': return <TypographyPage />;
      case 'colors': return <ColorsPage />;
      case 'spacing': return <SpacingPage />;
      case 'shape': return <ShapePage />;
      case 'elevation': return <ElevationPage />;
      default: {
        const info = PAGE_CONTENT[activePage];
        if (info) return <PlaceholderPage title={info.title} description={info.description} />;
        return <OverviewPage />;
      }
    }
  };

  return (
    <XDSAppShell
      variant="section"
      height="fill"
      sideNav={
        <XDSSideNav
          header={<XDSSideNavHeading heading="Design System" />}>
          {NAV_SECTIONS.map(section => (
            <XDSSideNavSection key={section.label} title={section.label}>
              {section.items.map(item => (
                <XDSSideNavItem
                  key={item.key}
                  label={item.name}
                  isSelected={activePage === item.key}
                  onClick={() => setActivePage(item.key)}
                />
              ))}
            </XDSSideNavSection>
          ))}
        </XDSSideNav>
      }>
      {renderContent()}
    </XDSAppShell>
  );
}
