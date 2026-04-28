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
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  colorSwatch: {
    aspectRatio: '1',
    borderRadius: 'var(--radius-element, 8px)',
    border: '1px solid var(--color-border, rgba(0,0,0,0.1))',
  },
  fontSample: {
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
    price: '$80',
    stock: 10,
  },
  {
    name: 'Vanilla classic',
    description: 'Vanilla with whole milk.',
    badge: 'New',
    badgeVariant: 'success' as const,
    price: '$75',
    stock: 0,
  },
  {
    name: 'House original',
    description: 'Classic drink with whole milk.',
    badge: 'Out of stock',
    badgeVariant: 'error' as const,
    price: '$65',
    stock: 74,
  },
];

const TABLE_DATA = [
  {name: 'House original', description: 'Classic drink with whole milk.', price: '$80', stock: 10},
  {name: 'Strawberry blend', description: 'Strawberry with whole milk.', price: '$75', stock: 115},
  {name: 'Vanilla classic', description: 'Vanilla with whole milk.', price: '$75', stock: 0},
  {name: 'Ube special', description: 'Ube and cream with whole milk.', price: '$60', stock: 90},
  {name: 'Chocolate hazelnut', description: 'Chocolate hazelnut with whole milk.', price: '$65', stock: 74},
] as {[key: string]: unknown}[];

const SEMANTIC_COLORS = [
  {label: 'Success', var: '--color-success'},
  {label: 'Warning', var: '--color-warning'},
  {label: 'Error', var: '--color-error'},
];

const SURFACE_COLORS = [
  {label: 'Primary', var: '--color-accent'},
  {label: 'Surface', var: '--color-background-surface'},
  {label: 'Body', var: '--color-background-body'},
  {label: 'Neutral', var: '--color-neutral'},
];

const CATEGORY_COLORS = [
  {label: 'Accent 1', var: '--color-category-green-bg'},
  {label: 'Accent 2', var: '--color-category-yellow-bg'},
  {label: 'Accent 3', var: '--color-category-orange-bg'},
  {label: 'Accent 4', var: '--color-category-teal-bg'},
];

function ColorSwatches({
  swatches,
}: {
  swatches: {label: string; var: string}[];
}) {
  return (
    <XDSHStack gap={3}>
      {swatches.map(s => (
        <XDSVStack key={s.label} gap={1} style={{alignItems: 'center'}}>
          <div
            {...stylex.props(styles.colorSwatch)}
            style={{
              width: 40,
              height: 40,
              backgroundColor: `var(${s.var})`,
              borderRadius: 'var(--radius-element, 8px)',
              border: '1px solid var(--color-border, rgba(0,0,0,0.1))',
            }}
          />
          <XDSText type="supporting" color="secondary">
            {s.label}
          </XDSText>
        </XDSVStack>
      ))}
    </XDSHStack>
  );
}

export function ThemeShowcase() {
  const [radioValue, setRadioValue] = useState('a');

  return (
    <XDSVStack gap={0}>
      {/* Top Nav */}
      <XDSTopNav
        heading={<XDSTopNavHeading heading="Theme Preview" />}
        centerContent={
          <>
            <XDSTopNavItem label="Dashboard" />
            <XDSTopNavItem label="Analytics" />
            <XDSTopNavItem label="Settings" />
          </>
        }
      />

      <XDSSection maxWidth={960} padding={8} style={{marginInline: 'auto'}}>
        <XDSVStack gap={10}>
          {/* Hero */}
          <XDSCenter>
            <XDSVStack gap={4} style={{textAlign: 'center', maxWidth: 560}}>
              <XDSHeading level={1}>
                Little joys,
                <br />
                everywhere you go
              </XDSHeading>
              <XDSText type="body" color="secondary">
                We believe the smallest details are the ones that matter most.
                Turn an ordinary day into something worth remembering.
              </XDSText>
              <XDSHStack gap={3} style={{justifyContent: 'center'}}>
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
              {...stylex.props(styles.image)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 'var(--radius-container, 12px)',
              }}
            />
          </XDSAspectRatio>

          {/* Product cards */}
          <XDSGrid columns={3} gap={4}>
            {PRODUCTS.map((p, i) => (
              <XDSCard key={p.name} padding={0}>
                <XDSVStack gap={0}>
                  <div style={{position: 'relative'}}>
                    <XDSAspectRatio ratio={4 / 3}>
                      <img
                        src={PRODUCT_IMAGES[i]}
                        alt={p.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </XDSAspectRatio>
                    <div style={{position: 'absolute', top: 12, left: 12}}>
                      <XDSBadge label={p.badge} variant={p.badgeVariant} />
                    </div>
                  </div>
                  <XDSVStack gap={2} style={{padding: 16}}>
                    <XDSText type="body" weight="bold">
                      {p.name}
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      {p.description}
                    </XDSText>
                    <XDSButton
                      label="Learn more"
                      variant="secondary"
                      size="sm"
                      style={{alignSelf: 'flex-start'}}
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
          />

          <XDSDivider />

          {/* Bottom grid: Colors + Components + Fonts */}
          <XDSGrid columns={2} gap={6}>
            {/* Colors */}
            <XDSVStack gap={4}>
              <XDSText type="label" weight="bold">
                Colors
              </XDSText>
              <ColorSwatches swatches={SEMANTIC_COLORS} />
              <ColorSwatches swatches={SURFACE_COLORS} />
              <ColorSwatches swatches={CATEGORY_COLORS} />
            </XDSVStack>

            {/* Components */}
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
            </XDSVStack>
          </XDSGrid>

          <XDSGrid columns={2} gap={6}>
            {/* More components */}
            <XDSVStack gap={4}>
              <XDSTextInput
                label="Example"
                placeholder="Description text"
                value=""
                onChange={() => {}}
              />
              <XDSProgressBar value={70} label="Progress" />
              <XDSSwitch label="Toggle" value={true} onChange={() => {}} />
            </XDSVStack>

            {/* Card + Banners */}
            <XDSVStack gap={4}>
              <XDSCard padding={4}>
                <XDSVStack gap={2}>
                  <XDSHeading level={4}>Card Title</XDSHeading>
                  <XDSText type="body" color="secondary">
                    A flexible surface for grouping related content and actions.
                  </XDSText>
                  <XDSButton
                    label="Action"
                    variant="secondary"
                    size="sm"
                    style={{alignSelf: 'flex-start'}}
                  />
                </XDSVStack>
              </XDSCard>
              <XDSBanner status="success" title="Banner Title" />
              <XDSBanner status="warning" title="Banner Title" />
              <XDSBanner status="error" title="Banner Title" />
            </XDSVStack>
          </XDSGrid>

          <XDSDivider />

          {/* Fonts */}
          <XDSVStack gap={4}>
            <XDSText type="label" weight="bold">
              Fonts
            </XDSText>
            <XDSHStack gap={8}>
              <XDSVStack gap={2} style={{alignItems: 'center'}}>
                <div
                  style={{
                    fontFamily: 'var(--font-family-body, system-ui)',
                    fontSize: '4rem',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>
                  Aa
                </div>
                <XDSText type="supporting" color="secondary">
                  Body
                </XDSText>
              </XDSVStack>
              <XDSVStack gap={2} style={{alignItems: 'center'}}>
                <div
                  style={{
                    fontFamily: 'var(--font-family-code, monospace)',
                    fontSize: '4rem',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>
                  Aa
                </div>
                <XDSText type="supporting" color="secondary">
                  Code
                </XDSText>
              </XDSVStack>
            </XDSHStack>
          </XDSVStack>
        </XDSVStack>
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
