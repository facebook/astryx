'use client';

import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSVStack,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSDivider} from '@xds/core/Divider';
import {XDSBadge} from '@xds/core/Badge';

// ─── Icons ──────────────────────────────────────────────────────────────────
const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

// ─── Product Data ───────────────────────────────────────────────────────────
const PRODUCT = {
  name: 'Meridian Desk Lamp',
  category: 'Lighting',
  subcategory: 'Desk Lamps',
  price: 189.0,
  sku: 'MDL-2024-BRS',
  description:
    'A refined desk lamp with an adjustable brass arm and a linen shade. The weighted walnut base keeps it stable on any surface. Perfect for focused task lighting or a warm ambient glow in your workspace.',
  features: [
    'Adjustable brass arm with 180° rotation',
    'Natural walnut base with anti-scratch felt pad',
    'Linen drum shade with white interior lining',
    'Built-in touch dimmer (3 brightness levels)',
    'Compatible with E26 LED bulbs up to 60W equivalent',
  ],
  dimensions: 'Height: 48 cm | Base: 15 cm diameter | Shade: 20 cm diameter',
  availability: 'In Stock',
};

const fmt = (n: number) => `$${n.toFixed(2)}`;

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  return (
    <XDSLayout
      header={
        <XDSLayoutHeader hasDivider>
          <XDSHStack gap={2} vAlign="center">
            <XDSButton
              label="Back"
              variant="ghost"
              icon={<ArrowLeftIcon style={{width: 16, height: 16}} />}
              onClick={() => window.history.back()}>
              Back
            </XDSButton>
            <XDSText type="label" color="secondary">
              Product Detail
            </XDSText>
          </XDSHStack>
        </XDSLayoutHeader>
      }
      content={
        <XDSLayoutContent>
          <XDSVStack gap={6}>
            {/* Breadcrumb Navigation */}
            <XDSBreadcrumbs>
              <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
              <XDSBreadcrumbItem href="/category">
                {PRODUCT.category}
              </XDSBreadcrumbItem>
              <XDSBreadcrumbItem href="/category/subcategory">
                {PRODUCT.subcategory}
              </XDSBreadcrumbItem>
              <XDSBreadcrumbItem isCurrent>
                {PRODUCT.name}
              </XDSBreadcrumbItem>
            </XDSBreadcrumbs>

            {/* Product Info Section */}
            <XDSCard>
              <XDSVStack gap={4}>
                <XDSHStack gap={2} vAlign="center">
                  <XDSHeading level={1}>{PRODUCT.name}</XDSHeading>
                  <XDSBadge variant="success" label={PRODUCT.availability} />
                </XDSHStack>

                <XDSText type="large" weight="bold">
                  {fmt(PRODUCT.price)}
                </XDSText>

                <XDSText type="supporting" color="secondary">
                  SKU: {PRODUCT.sku}
                </XDSText>

                <XDSDivider />

                <XDSVStack gap={2}>
                  <XDSHeading level={3}>Description</XDSHeading>
                  <XDSText type="body">{PRODUCT.description}</XDSText>
                </XDSVStack>

                <XDSDivider />

                <XDSVStack gap={2}>
                  <XDSHeading level={3}>Features</XDSHeading>
                  <XDSVStack gap={1}>
                    {PRODUCT.features.map((feature, i) => (
                      <XDSText key={i} type="body">
                        • {feature}
                      </XDSText>
                    ))}
                  </XDSVStack>
                </XDSVStack>

                <XDSDivider />

                <XDSVStack gap={2}>
                  <XDSHeading level={3}>Dimensions</XDSHeading>
                  <XDSText type="body">{PRODUCT.dimensions}</XDSText>
                </XDSVStack>

                <XDSDivider />

                <XDSHStack gap={2}>
                  <XDSButton label="Add to Cart" variant="primary" size="lg">
                    Add to Cart
                  </XDSButton>
                  <XDSButton
                    label="Back to browsing"
                    variant="secondary"
                    size="lg"
                    onClick={() => window.history.back()}>
                    Back
                  </XDSButton>
                </XDSHStack>
              </XDSVStack>
            </XDSCard>
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
