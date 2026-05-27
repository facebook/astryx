// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useRef, type ReactNode} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSOutline,
  useOutlineFromDOM,
  useOutlineFromMarkdown,
} from '@xds/core/Outline';
import type {OutlineItem} from '@xds/core/Outline';
import {XDSBadge} from '@xds/core/Badge';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSHeading, XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSOutline> = {
  title: 'Core/Outline',
  component: XDSOutline,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label for the nav landmark',
    },
    activeId: {
      control: 'text',
      description: 'Controlled active item id',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md'],
      description: 'Size variant',
    },
    offset: {
      control: 'number',
      description: 'Scroll-spy offset in pixels',
    },
    hasScrollOnClick: {
      control: 'boolean',
      description: 'Whether clicking scrolls to the target',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSOutline>;

const outlineItems: OutlineItem[] = [
  {id: 'overview', label: 'Overview', level: 2},
  {id: 'installation', label: 'Installation', level: 2},
  {id: 'theming', label: 'Theming', level: 2},
  {id: 'tokens', label: 'Tokens', level: 3},
  {id: 'component-overrides', label: 'Component overrides', level: 3},
  {id: 'accessibility', label: 'Accessibility', level: 2},
];

const markdownContent = [
  '## Overview',
  '',
  'XDS gives teams a consistent foundation for internal product surfaces.',
  '',
  '## Installation',
  '',
  'Install the package and wrap the app in an XDSTheme provider.',
  '',
  '### Package setup',
  '',
  'Import components from their component subpaths for clear ownership.',
  '',
  '### Theme setup',
  '',
  'Use a built theme in production so component overrides are present at first paint.',
  '',
  '## Accessibility',
  '',
  'Components include semantic roles, labels, and focus behavior where applicable.',
].join('\n');

function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(nodeText).join('');
  }
  return '';
}

function storySlug(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/['\u201C\u201D"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

export const Basic: Story = {
  args: {
    items: outlineItems,
  },
};

export const Controlled: Story = {
  args: {
    items: outlineItems,
    activeId: 'tokens',
  },
};

/** Small size variant — compact spacing for dense UIs */
export const Small: Story = {
  args: {
    items: outlineItems,
    activeId: 'installation',
    size: 'sm',
  },
};

/** Interactive scroll-spy demo with scrollable container */
export const ScrollSpy: Story = {
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const sections: OutlineItem[] = [
      {id: 'spy-overview', label: 'Overview', level: 2},
      {id: 'spy-features', label: 'Features', level: 2},
      {id: 'spy-usage', label: 'Usage', level: 3},
      {id: 'spy-props', label: 'Props', level: 3},
      {id: 'spy-advanced', label: 'Advanced', level: 2},
      {id: 'spy-changelog', label: 'Changelog', level: 2},
    ];

    return (
      <div style={{display: 'flex', gap: 24, height: 400}}>
        <div style={{width: 200, position: 'sticky', top: 0}}>
          <XDSOutline
            items={sections}
            scrollContainerRef={containerRef}
            offset={0}
          />
        </div>
        <div
          ref={containerRef}
          style={{flex: 1, overflow: 'auto', paddingInlineEnd: 16}}>
          {sections.map(section => (
            <div
              key={section.id}
              id={section.id}
              style={{
                minHeight: 300,
                padding: 16,
                borderBottom: '1px solid #eee',
              }}>
              <h2>{section.label}</h2>
              <p style={{color: '#666'}}>
                Content for the {section.label} section. Scroll to see the
                indicator slide to the active section.
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/** Navigate callbacks — custom flash highlight on scroll arrival */
export const NavigateCallbacks: Story = {
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const sections: OutlineItem[] = [
      {id: 'nav-intro', label: 'Intro', level: 2},
      {id: 'nav-body', label: 'Body', level: 2},
      {id: 'nav-outro', label: 'Outro', level: 2},
    ];

    return (
      <div style={{display: 'flex', gap: 24, height: 400}}>
        <div style={{width: 180}}>
          <XDSOutline
            items={sections}
            scrollContainerRef={containerRef}
            onNavigateEnd={id => {
              const el = document.getElementById(id);
              if (!el) {
                return;
              }
              el.style.transition = 'none';
              el.style.backgroundColor =
                'var(--color-accent-muted, rgba(0,130,251,0.15))';
              el.style.borderRadius = '8px';
              requestAnimationFrame(() => {
                el.style.transition = 'background-color 800ms ease-out';
                el.style.backgroundColor = '';
              });
            }}
          />
        </div>
        <div
          ref={containerRef}
          style={{flex: 1, overflow: 'auto', paddingInlineEnd: 16}}>
          {sections.map(section => (
            <div
              key={section.id}
              id={section.id}
              style={{
                minHeight: 300,
                padding: 16,
                borderBottom: '1px solid #eee',
              }}>
              <h2>{section.label}</h2>
              <p style={{color: '#666'}}>
                Click an item to see the custom flash highlight via
                onNavigateEnd.
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const WithDocument: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 220px',
        gap: 32,
        maxWidth: 960,
      }}>
      <article style={{display: 'grid', gap: 24}}>
        <section>
          <h2 id="overview">Overview</h2>
          <p>
            XDS components provide consistent interaction, styling, and theme
            behavior for internal tools.
          </p>
        </section>
        <section>
          <h2 id="installation">Installation</h2>
          <p>
            Install the package, wrap the app with XDSTheme, and import
            components from their subpaths.
          </p>
        </section>
        <section>
          <h2 id="theming">Theming</h2>
          <p>
            Themes define semantic tokens and component overrides without
            changing app code.
          </p>
          <h3 id="tokens">Tokens</h3>
          <p>
            Use semantic color, spacing, typography, radius, elevation, and
            motion tokens.
          </p>
          <h3 id="component-overrides">Component overrides</h3>
          <p>
            Component overrides target stable xds-* class names emitted by each
            component.
          </p>
        </section>
        <section>
          <h2 id="accessibility">Accessibility</h2>
          <p>
            Components include landmark, keyboard, focus, and ARIA behavior
            where applicable.
          </p>
        </section>
      </article>
      <aside style={{position: 'sticky', top: 24, alignSelf: 'start'}}>
        <XDSOutline items={outlineItems} />
      </aside>
    </div>
  ),
};

export const ExtractFromMarkdown: Story = {
  render: () => {
    const items = useOutlineFromMarkdown(markdownContent);

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 220px',
          gap: 32,
          maxWidth: 960,
        }}>
        <XDSMarkdown
          components={{
            heading: ({level, children}) => {
              const Tag = `h${level}` as
                | 'h1'
                | 'h2'
                | 'h3'
                | 'h4'
                | 'h5'
                | 'h6';
              return <Tag id={storySlug(nodeText(children))}>{children}</Tag>;
            },
          }}>
          {markdownContent}
        </XDSMarkdown>
        <aside style={{position: 'sticky', top: 24, alignSelf: 'start'}}>
          <XDSOutline items={items} />
        </aside>
      </div>
    );
  },
};

export const ExtractFromHTML: Story = {
  render: () => {
    const contentRef = useRef<HTMLElement | null>(null);
    const items = useOutlineFromDOM(contentRef);

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 220px',
          gap: 32,
          maxWidth: 960,
        }}>
        <article ref={contentRef} style={{display: 'grid', gap: 24}}>
          <section>
            <XDSHeading id="account-settings" level={2}>
              Account settings
            </XDSHeading>
            <XDSText type="body">
              Manage profile, authentication, and workspace preferences.
            </XDSText>
            <div style={{display: 'flex', gap: 8, marginTop: 12}}>
              <XDSBadge variant="success" label="Active" />
              <XDSBadge variant="neutral" label="Workspace" />
            </div>
          </section>
          <section>
            <XDSHeading id="notifications" level={2}>
              Notifications
            </XDSHeading>
            <XDSText type="body">
              Choose which product events should notify the team.
            </XDSText>
            <XDSHeading id="email-alerts" level={3}>
              Email alerts
            </XDSHeading>
            <XDSText type="body">
              Use email for low-frequency summaries and approvals.
            </XDSText>
            <XDSHeading id="push-alerts" level={3}>
              Push alerts
            </XDSHeading>
            <XDSText type="body">
              Use push for time-sensitive updates and incidents.
            </XDSText>
          </section>
          <section>
            <XDSHeading id="billing" level={2}>
              Billing
            </XDSHeading>
            <XDSText type="body">
              Review invoices, payment methods, and usage limits.
            </XDSText>
          </section>
        </article>
        <aside style={{position: 'sticky', top: 24, alignSelf: 'start'}}>
          <XDSOutline items={items} />
        </aside>
      </div>
    );
  },
};

/** Deep nesting with multiple indent levels */
export const DeepNesting: Story = {
  render: () => {
    const items: OutlineItem[] = [
      {id: 'chapter-1', label: 'Chapter 1', level: 1},
      {id: 'section-1-1', label: 'Section 1.1', level: 2},
      {id: 'subsection-1-1-1', label: 'Subsection 1.1.1', level: 3},
      {id: 'subsection-1-1-2', label: 'Subsection 1.1.2', level: 3},
      {id: 'section-1-2', label: 'Section 1.2', level: 2},
      {id: 'chapter-2', label: 'Chapter 2', level: 1},
      {id: 'section-2-1', label: 'Section 2.1', level: 2},
    ];

    return (
      <div style={{width: 240}}>
        <XDSOutline items={items} activeId="subsection-1-1-1" />
      </div>
    );
  },
};
