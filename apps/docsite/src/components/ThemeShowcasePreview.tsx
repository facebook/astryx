'use client';

import {useState, useEffect, useRef} from 'react';
import stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSCenter} from '@xds/core/Center';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTable} from '@xds/core/Table';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSIcon} from '@xds/core/Icon';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSBanner} from '@xds/core/Banner';

const styles = stylex.create({
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  cardBody: {
    padding: 'var(--spacing-4)',
  },
  heroText: {
    textAlign: 'center' as const,
    maxWidth: 560,
  },
  content: {
    maxWidth: 960,
    marginInline: 'auto',
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-element)',
    flexShrink: 0,
  },
  fontCard: {
    borderColor: 'transparent',
  },
  fontSample: {
    height: '100%',
  },
  fontSampleInner: {
    flex: 1,
  },
  componentCard: {
    borderColor: 'transparent',
  },
});

const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
];

const PRODUCTS = [
  {
    name: 'Minimalist Watch',
    description: 'Clean design meets everyday durability.',
    badge: 'New',
    badgeVariant: 'info' as const,
  },
  {
    name: 'Wireless Headphones',
    description: 'Immersive sound, all-day comfort.',
    badge: 'Popular',
    badgeVariant: 'success' as const,
  },
  {
    name: 'Leather Wallet',
    description: 'Handcrafted from full-grain leather.',
    badge: 'Limited',
    badgeVariant: 'warning' as const,
  },
];

const TABLE_DATA = [
  {
    name: 'Minimalist Watch',
    description: 'Stainless steel, sapphire crystal',
    price: '$189',
    stock: '42',
  },
  {
    name: 'Wireless Headphones',
    description: 'ANC, 30hr battery',
    price: '$249',
    stock: '128',
  },
  {
    name: 'Leather Wallet',
    description: 'Full-grain, RFID blocking',
    price: '$79',
    stock: '15',
  },
  {
    name: 'Canvas Backpack',
    description: 'Water-resistant, 25L',
    price: '$119',
    stock: '63',
  },
] as Record<string, unknown>[];

const COLOR_ROWS = [
  [
    'var(--color-accent)',
    'var(--color-accent-muted)',
    'var(--color-neutral)',
    'var(--color-background-surface)',
    'var(--color-background-body)',
  ],
  [
    'var(--color-success)',
    'var(--color-error)',
    'var(--color-warning)',
    'var(--color-text-primary)',
    'var(--color-text-secondary)',
  ],
];

function ColorSwatches({swatches}: {swatches: string[]}) {
  return (
    <XDSHStack gap={1}>
      {swatches.map(color => (
        <div
          key={color}
          {...stylex.props(styles.swatch)}
          style={{backgroundColor: color}}
        />
      ))}
    </XDSHStack>
  );
}

function FontLabel({cssVar, fallback}: {cssVar: string; fallback: string}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [label, setLabel] = useState(fallback);

  useEffect(() => {
    if (!ref.current) return;
    const computed = getComputedStyle(ref.current)
      .getPropertyValue(cssVar)
      .trim();
    if (computed) {
      setLabel(computed.split(',')[0].replace(/['"]/g, '').trim());
    }
  }, [cssVar]);

  return (
    <span ref={ref}>
      <XDSText type="supporting" color="secondary">
        {label}
      </XDSText>
    </span>
  );
}

interface ThemeShowcasePreviewProps {
  mode: 'light' | 'dark';
  onModeChange: (mode: 'light' | 'dark') => void;
}

export function ThemeShowcasePreview({
  mode,
  onModeChange,
}: ThemeShowcasePreviewProps) {
  return (
    <XDSVStack gap={0}>
      <XDSTopNav
        label="Theme Preview"
        heading={<XDSTopNavHeading heading="Theme Preview" />}
        endContent={
          <XDSSwitch
            label={mode === 'dark' ? 'Dark' : 'Light'}
            value={mode === 'dark'}
            onChange={v => onModeChange(v ? 'dark' : 'light')}
          />
        }
      />

      <XDSSection padding={8}>
        <XDSVStack gap={10} xstyle={styles.content}>
          <XDSCenter>
            <XDSVStack gap={4} hAlign="center" xstyle={styles.heroText}>
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
                <XDSButton label="Get started" variant="primary" href="#" />
                <XDSButton label="Learn more" variant="secondary" href="#" />
              </XDSHStack>
            </XDSVStack>
          </XDSCenter>

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
                  <div {...stylex.props(styles.cardBody)}>
                    <XDSVStack gap={2}>
                      <XDSHStack>
                        <XDSBadge label={p.badge} variant={p.badgeVariant} />
                      </XDSHStack>
                      <XDSHeading level={4}>{p.name}</XDSHeading>
                      <XDSText type="supporting" color="secondary">
                        {p.description}
                      </XDSText>
                      <XDSButton
                        label="Learn more"
                        variant="secondary"
                        href="#"
                      />
                    </XDSVStack>
                  </div>
                </XDSVStack>
              </XDSCard>
            ))}
          </XDSGrid>

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

          <ThemeShowcaseDetails />
        </XDSVStack>
      </XDSSection>
    </XDSVStack>
  );
}

function ThemeShowcaseDetails() {
  const [radioValue, setRadioValue] = useState('a');

  return (
    <XDSVStack gap={4}>
      <XDSGrid columns={2} gap={4}>
        <XDSCard padding={6} xstyle={styles.fontCard}>
          <XDSVStack gap={4}>
            <XDSText type="label" weight="bold">
              Colors
            </XDSText>
            {COLOR_ROWS.map((row, i) => (
              <ColorSwatches key={i} swatches={row} />
            ))}
          </XDSVStack>
        </XDSCard>

        <XDSCard padding={6} xstyle={styles.fontCard}>
          <XDSVStack gap={0} xstyle={styles.fontSample}>
            <XDSText type="label" weight="bold">
              Fonts
            </XDSText>
            <XDSHStack
              gap={8}
              hAlign="center"
              vAlign="center"
              xstyle={styles.fontSampleInner}>
              <XDSVStack gap={2} hAlign="center">
                <XDSText
                  type="display-1"
                  style={{fontFamily: 'var(--font-family-body, system-ui)'}}>
                  Aa
                </XDSText>
                <FontLabel cssVar="--font-family-body" fallback="Body" />
              </XDSVStack>
              <XDSVStack gap={2} hAlign="center">
                <XDSText
                  type="display-1"
                  style={{fontFamily: 'var(--font-family-code, monospace)'}}>
                  Aa
                </XDSText>
                <FontLabel cssVar="--font-family-code" fallback="Code" />
              </XDSVStack>
            </XDSHStack>
          </XDSVStack>
        </XDSCard>
      </XDSGrid>

      <XDSCard padding={6} xstyle={styles.componentCard}>
        <XDSGrid columns={2} gap={8}>
          <XDSVStack gap={4}>
            <XDSText type="label" weight="bold">
              Components
            </XDSText>
            <XDSHStack gap={2}>
              <XDSButton label="Primary" variant="primary" size="sm" href="#" />
              <XDSButton
                label="Secondary"
                variant="secondary"
                size="sm"
                href="#"
              />
              <XDSButton label="Ghost" variant="ghost" size="sm" href="#" />
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
                  <XDSListItem
                    label="Notifications"
                    startContent={<XDSIcon icon="info" size="sm" />}
                  />
                  <XDSListItem
                    label="Privacy"
                    startContent={<XDSIcon icon="warning" size="sm" />}
                  />
                  <XDSListItem
                    label="Security"
                    startContent={<XDSIcon icon="check" size="sm" />}
                  />
                </XDSList>
              </XDSVStack>
            </XDSGrid>
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
                  href="#"
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
