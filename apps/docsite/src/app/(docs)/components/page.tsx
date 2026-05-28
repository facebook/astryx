// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Components gallery index — browse all showcases.
 */ import * as stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {blocks, type BlockEntry} from '../../../generated/blockRegistry';
import {groupedComponents} from '../../../generated/groupedComponentRegistry';
import {ShowcaseThumbnail} from '../../../components/ShowcaseThumbnail';

const showcases = blocks.filter(b => b.isShowcase);

const ACTION_COMPONENTS = new Set([
  'Button',
  'ButtonGroup',
  'IconButton',
  'ToggleButton',
  'ToggleButtonGroup',
  'Link',
]);

const INPUT_COMPONENTS = new Set([
  'TextInput',
  'NumberInput',
  'FileInput',
  'DateInput',
  'DateRangeInput',
  'DateTimeInput',
  'TimeInput',
  'TextArea',
  'Tokenizer',
]);

const TYPOGRAPHY_COMPONENTS = new Set(['Text', 'Heading']);

const COMMUNICATION_COMPONENTS = new Set([
  'Badge',
  'Banner',
  'StatusDot',
  'Timestamp',
  'Toast',
  'Token',
  'Tooltip',
]);

const CONTAINER_COMPONENTS = new Set([
  'Card',
  'ClickableCard',
  'SelectableCard',
  'Dialog',
]);

const NAV_COMPONENTS = new Set([
  'SideNav',
  'TopNav',
  'TopNavMegaMenu',
  'Breadcrumbs',
  'TabList',
  'Outline',
  'Pagination',
]);

const styles = stylex.create({
  page: {
    marginInline: 'auto',
  },
  heroTitle: {
    textAlign: 'center' as const,
  },
  cardImage: {
    display: 'block',
    width: '100%',
    aspectRatio: '16/10',
    backgroundColor: 'var(--color-background-muted)',
  },
  cardLabel: {
    padding: 'var(--spacing-3)',
  },
});

const componentDisplayNames = new Map<string, string>();
for (const item of groupedComponents['@xds/core']?.items ?? []) {
  if (item.type === 'entry') {
    componentDisplayNames.set(item.name, item.displayName);
  } else {
    for (const entry of item.entries) {
      componentDisplayNames.set(entry.name, entry.displayName);
    }
  }
}

function itemsInOrder(components: Set<string>) {
  return [...components].flatMap(name => {
    const match = showcases.find(b => b.dirName === `${name}Showcase`);
    return match ? [toItem(name, match)] : [];
  });
}

function toItem(name: string, b: BlockEntry) {
  return {
    name: componentDisplayNames.get(name) ?? name,
    slug: b.dirName,
    category: b.category,
    href: `/components/${name}`,
  };
}

function ComponentGrid({items}: {items: ReturnType<typeof toItem>[]}) {
  return (
    <XDSGrid columns={{minWidth: 240, repeat: 'fill'}} gap={4}>
      {items.map(item => (
        <XDSClickableCard
          key={item.slug}
          label={item.name}
          href={item.href}
          padding={0}>
          {item.category ? (
            <ShowcaseThumbnail dirName={item.slug} category={item.category} />
          ) : (
            <div {...stylex.props(styles.cardImage)} />
          )}
          <XDSText display="block" type="body" xstyle={styles.cardLabel}>
            {item.name}
          </XDSText>
        </XDSClickableCard>
      ))}
    </XDSGrid>
  );
}

export default function ComponentsGalleryPage() {
  const buttonItems = itemsInOrder(ACTION_COMPONENTS);
  const inputItems = itemsInOrder(INPUT_COMPONENTS);
  const navItems = itemsInOrder(NAV_COMPONENTS);
  const communicationItems = itemsInOrder(COMMUNICATION_COMPONENTS);
  const containerItems = itemsInOrder(CONTAINER_COMPONENTS);
  const typographyItems = itemsInOrder(TYPOGRAPHY_COMPONENTS);

  return (
    <XDSSection maxWidth={1200} padding={6} xstyle={styles.page}>
      <XDSVStack gap={10}>
        <XDSVStack gap={2} style={{alignItems: 'center'}}>
          <XDSText type="display-2" xstyle={styles.heroTitle}>
            Browse the library
          </XDSText>
          <XDSText type="body" color="secondary" xstyle={styles.heroTitle}>
            Every component, with copy-ready examples for every variant, state,
            and pattern.
          </XDSText>
        </XDSVStack>

        <XDSVStack gap={10}>
          <XDSVStack gap={4}>
            <XDSHeading level={1}>Actions</XDSHeading>
            <ComponentGrid items={buttonItems} />
          </XDSVStack>

          <XDSVStack gap={4}>
            <XDSHeading level={1}>Input Fields</XDSHeading>
            <ComponentGrid items={inputItems} />
          </XDSVStack>

          <XDSVStack gap={4}>
            <XDSHeading level={1}>Navigation</XDSHeading>
            <ComponentGrid items={navItems} />
          </XDSVStack>

          <XDSVStack gap={4}>
            <XDSHeading level={1}>Communication</XDSHeading>
            <ComponentGrid items={communicationItems} />
          </XDSVStack>

          <XDSVStack gap={4}>
            <XDSHeading level={1}>Containers</XDSHeading>
            <ComponentGrid items={containerItems} />
          </XDSVStack>

          <XDSVStack gap={4}>
            <XDSHeading level={1}>Typography</XDSHeading>
            <ComponentGrid items={typographyItems} />
          </XDSVStack>
        </XDSVStack>
      </XDSVStack>
    </XDSSection>
  );
}
