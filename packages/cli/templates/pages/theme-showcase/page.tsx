'use client';

import {useState} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavItem, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSTable} from '@xds/core/Table';
import {XDSBanner} from '@xds/core/Banner';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSDivider} from '@xds/core/Divider';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: 'var(--radius-container, 12px)',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  badgeOverlay: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
  },
  imageWrapper: {
    position: 'relative' as const,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-element, 8px)',
    border: '1px solid var(--color-border, rgba(0,0,0,0.1))',
  },
  fontSample: {
    fontFamily: 'inherit',
    fontSize: '4rem',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
});

const HERO_IMAGE =
  'https://lookaside.facebook.com/assets/xds_oss/illustrative-horizontal-1.jpg';

const PRODUCT_IMAGES = [
  'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-1.jpg',
  'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-2.jpg',
  'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-3.jpg',
];

const PRODUCTS = [
  {
    name: 'Spring blend',
    description: 'Seasonal blend with floral notes.',
    badge: 'Limited edition',
    badgeVariant: 'blue' as const,
  },
  {
    name: 'Vanilla classic',
    description: 'Vanilla with whole milk.',
    badge: 'New',
    badgeVariant: 'success' as const,
  },
  {
    name: 'House original',
    description: 'Classic drink with whole milk.',
    badge: 'Out of stock',
    badgeVariant: 'error' as const,
  },
];

const TABLE_DATA = [
  {name: 'Town art print', description: 'Art print of a little town. Limited edition.', price: '$80', stock: 10},
  {name: 'Flower art print', description: 'Art print of a meadow of flowers.', price: '$75', stock: 115},
  {name: 'Lavender art print', description: 'Art print of a meadow of lavender.', price: '$75', stock: 0},
  {name: 'Ocean art print', description: 'Art print of a calm ocean scene.', price: '$65', stock: 90},
  {name: 'Castle art print', description: 'Art print of a majestic castle by a river.', price: '$65', stock: 74},
] as {[key: string]: unknown}[];

const COLOR_ROWS: {label: string; swatches: {label: string; var: string}[]}[] = [
  {
    label: 'Semantic',
    swatches: [
      {label: 'Success', var: '--color-success'},
      {label: 'Warning', var: '--color-warning'},
      {label: 'Error', var: '--color-error'},
    ],
  },
  {
    label: 'Surface',
    swatches: [
      {label: 'Primary', var: '--color-accent'},
      {label: 'Surface', var: '--color-background-surface'},
      {label: 'Body', var: '--color-background-body'},
      {label: 'Neutral', var: '--color-neutral'},
    ],
  },
  {
    label: 'Category',
    swatches: [
      {label: 'Accent 1', var: '--color-category-green-bg'},
      {label: 'Accent 2', var: '--color-category-yellow-bg'},
      {label: 'Accent 3', var: '--color-category-orange-bg'},
      {label: 'Accent 4', var: '--color-category-teal-bg'},
    ],
  },
];

function ColorSwatches({
  swatches,
}: {
  swatches: {label: string; var: string}[];
}) {
  return (
    <XDSHStack gap={3}>
      {swatches.map(s => (
        <XDSVStack key={s.label} gap={1} hAlign="center">
          <div
            {...stylex.props(styles.swatch)}
            style={{backgroundColor: `var(${s.var})`}}
          />
          <XDSText type="supporting" color="secondary">
            {s.label}
          </XDSText>
        </XDSVStack>
      ))}
    </XDSHStack>
  );
}

export function ThemeShowcasePreview() {
  return (
    <XDSVStack gap={0}>
      <XDSTopNav
        heading={<XDSTopNavHeading heading="Theme Preview" />}
        endContent={
          <>
            <XDSTopNavItem label="Dashboard" />
            <XDSTopNavItem label="Analytics" />
            <XDSTopNavItem label="Settings" />
          </>
        }
      />

      <XDSSection maxWidth={960} padding={8}>
        <XDSVStack gap={10}>
          {/* Hero */}
          <XDSCenter>
            <XDSVStack gap={4} hAlign="center" style={{textAlign: 'center', maxWidth: 560}}>
              <XDSText type="display-3">
                Little joys,
                <br />
                everywhere you go
              </XDSText>
              <XDSText type="body" color="secondary">
                We believe the smallest details are the ones that matter most.
                Turn an ordinary day into something worth remembering.
              </XDSText>
              <XDSHStack gap={3} hAlign="center">
                <XDSButton label="Get started" variant="primary" />
                <XDSButton label="Learn more" variant="secondary" />
              </XDSHStack>
            </XDSVStack>
          </XDSCenter>

          {/* Cover image */}
          <XDSAspectRatio ratio={16 / 7}>
            <img
              src={HERO_IMAGE}
              alt="Cover"
              {...stylex.props(styles.coverImage)}
            />
          </XDSAspectRatio>

          {/* Product cards */}
          <XDSGrid columns={3} gap={4}>
            {PRODUCTS.map((p, i) => (
              <XDSCard key={p.name} padding={0}>
                <XDSVStack gap={0}>
                  <XDSAspectRatio ratio={4 / 3}>
                    <img
                      src={PRODUCT_IMAGES[i]}
                      alt={p.name}
                      {...stylex.props(styles.productImage)}
                    />
                  </XDSAspectRatio>
                  <XDSVStack gap={2} style={{padding: 'var(--spacing-4, 16px)'}}>
                    <XDSHStack>
                      <XDSBadge label={p.badge} variant={p.badgeVariant} />
                    </XDSHStack>
                    <XDSHeading level={4}>
                      {p.name}
                    </XDSHeading>
                    <XDSText type="supporting" color="secondary">
                      {p.description}
                    </XDSText>
                    <XDSButton
                      label="Learn more"
                      variant="secondary"
                    />
                  </XDSVStack>
                </XDSVStack>
              </XDSCard>
            ))}
          </XDSGrid>

          {/* Data table */}
          <XDSTable
            data={TABLE_DATA}
            columns={[
              {key: 'name', header: 'Name'},
              {key: 'description', header: 'Description'},
              {key: 'price', header: 'Price'},
              {key: 'stock', header: 'Stock'},
            ]}
            density="spacious"
            dividers="rows"
            hasHover
          />
        </XDSVStack>
      </XDSSection>
    </XDSVStack>
  );
}

export function ThemeShowcaseDetails() {
  const [radioValue, setRadioValue] = useState('a');

  return (
    <XDSVStack gap={4}>
          {/* Colors + Fonts */}
          <XDSGrid columns={2} gap={4}>
            <XDSCard padding={6}>
              <XDSVStack gap={4}>
                <XDSText type="label" weight="bold">
                  Colors
                </XDSText>
                {COLOR_ROWS.map(row => (
                  <ColorSwatches key={row.label} swatches={row.swatches} />
                ))}
              </XDSVStack>
            </XDSCard>

            <XDSCard padding={6}>
              <XDSVStack gap={4}>
                <XDSText type="label" weight="bold">
                  Fonts
                </XDSText>
                <XDSHStack gap={8}>
                  <XDSVStack gap={2} hAlign="center">
                    <XDSText
                      type="display-1"
                      style={{
                        fontFamily: 'var(--font-family-body, system-ui)',
                      }}>
                      Aa
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      Body
                    </XDSText>
                  </XDSVStack>
                  <XDSVStack gap={2} hAlign="center">
                    <XDSText
                      type="display-1"
                      style={{
                        fontFamily: 'var(--font-family-code, monospace)',
                      }}>
                      Aa
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      Code
                    </XDSText>
                  </XDSVStack>
                </XDSHStack>
              </XDSVStack>
            </XDSCard>
          </XDSGrid>

          {/* Components */}
          <XDSCard padding={6}>
            <XDSGrid columns={2} gap={6}>
              <XDSVStack gap={4}>
                <XDSText type="label" weight="bold">
                  Components
                </XDSText>
                <XDSHStack gap={2}>
                  <XDSButton label="Primary" variant="primary" size="sm" />
                  <XDSButton label="Secondary" variant="secondary" size="sm" />
                  <XDSButton label="Ghost" variant="ghost" size="sm" />
                </XDSHStack>
                <XDSHStack gap={2}>
                  <XDSBadge label="Badge" />
                  <XDSBadge label="Info" variant="info" />
                  <XDSBadge label="Success" variant="success" />
                  <XDSBadge label="Warning" variant="warning" />
                  <XDSBadge label="Error" variant="error" />
                </XDSHStack>
                <XDSGrid columns={2} gap={4}>
                  <XDSVStack gap={2}>
                    <XDSText type="supporting" weight="bold">
                      Label
                    </XDSText>
                    <XDSRadioList
                      label="Options"
                      value={radioValue}
                      onChange={setRadioValue}>
                      <XDSRadioListItem value="a" label="Option A" />
                      <XDSRadioListItem value="b" label="Option B" />
                      <XDSRadioListItem value="c" label="Option C" />
                    </XDSRadioList>
                  </XDSVStack>
                  <XDSVStack gap={2}>
                    <XDSText type="supporting" weight="bold">
                      List Header
                    </XDSText>
                    <XDSList density="compact">
                      <XDSListItem label="Notifications" />
                      <XDSListItem label="Privacy" />
                      <XDSListItem label="Security" />
                    </XDSList>
                  </XDSVStack>
                </XDSGrid>
                <XDSCard padding={4}>
                  <XDSVStack gap={2}>
                    <XDSHeading level={4}>Card Title</XDSHeading>
                    <XDSText type="body" color="secondary">
                      A flexible surface for grouping related content and
                      actions.
                    </XDSText>
                    <XDSButton
                      label="Action"
                      variant="secondary"
                      size="sm"
                    />
                  </XDSVStack>
                </XDSCard>
              </XDSVStack>

              <XDSVStack gap={4}>
                <XDSTextInput
                  label="Example"
                  placeholder="Type something..."
                  value=""
                  onChange={() => {}}
                />
                <XDSProgressBar value={75} label="Progress" />
                <XDSProgressBar value={60} label="Progress" />
                <XDSSwitch label="Toggle" value={true} onChange={() => {}} />
                <XDSBanner status="success" title="Banner Title" />
                <XDSBanner status="warning" title="Banner Title" />
                <XDSBanner status="error" title="Banner Title" />
              </XDSVStack>
            </XDSGrid>
          </XDSCard>
    </XDSVStack>
  );
}

export function ThemeShowcase() {
  return (
    <XDSVStack gap={10}>
      <ThemeShowcasePreview />
      <XDSSection maxWidth={960} padding={8}>
        <ThemeShowcaseDetails />
      </XDSSection>
    </XDSVStack>
  );
}

export default function ThemeShowcasePage() {
  return (
    <XDSAppShell>
      <ThemeShowcase />
    </XDSAppShell>
  );
}
