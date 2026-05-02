/**
 * Page type: overview
 * The home page — stats, package cards, quick links.
 */

import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSGrid} from '@xds/core/Grid';
import {XDSSection} from '@xds/core/Section';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {packages} from '../generated/packageRegistry';
import {componentCount} from '../generated/componentRegistry';
import {blockCount, showcaseCount} from '../generated/blockRegistry';
import {templateCount} from '../generated/templateRegistry';

export default function HomePage() {
  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={8}>
        <XDSVStack gap={3}>
          <XDSHeading level={1}>XDS</XDSHeading>
          <XDSText type="large" color="secondary">
            Open-source design system for building internal tools and products.
          </XDSText>
          <XDSHStack gap={3}>
            <XDSButton
              label="Getting Started"
              variant="primary"
              href="/docs/getting-started"
            />
            <XDSButton
              label="Components"
              variant="secondary"
              href="/packages/core"
            />
            <XDSButton label="Changelog" variant="ghost" href="/changelog" />
          </XDSHStack>
        </XDSVStack>

        <XDSGrid columns={4} gap={4} minChildWidth={140}>
          <StatCard n={componentCount} label="Components" />
          <StatCard n={blockCount} label="Blocks" />
          <StatCard n={showcaseCount} label="Showcases" />
          <StatCard n={templateCount} label="Templates" />
        </XDSGrid>

        <XDSVStack gap={4}>
          <XDSHeading level={2}>Packages</XDSHeading>
          <XDSGrid columns={2} gap={4} minChildWidth={280}>
            {packages.map(p => (
              <XDSClickableCard
                key={p.name}
                label={p.name}
                href={`/packages/${p.name.replace('@xds/', '')}`}
                padding={5}>
                <XDSVStack gap={2}>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSText type="body" weight="bold">
                      {p.name}
                    </XDSText>
                    <XDSBadge label={`v${p.version}`} variant="info" />
                  </XDSHStack>
                  <XDSText type="supporting" color="secondary">
                    {p.description}
                  </XDSText>
                </XDSVStack>
              </XDSClickableCard>
            ))}
          </XDSGrid>
        </XDSVStack>
      </XDSVStack>
    </XDSSection>
  );
}

function StatCard({n, label}: {n: number; label: string}) {
  return (
    <XDSCard padding={4}>
      <XDSVStack gap={1} hAlign="center">
        <XDSText type="display-2">{n}</XDSText>
        <XDSText type="supporting" color="secondary">
          {label}
        </XDSText>
      </XDSVStack>
    </XDSCard>
  );
}
