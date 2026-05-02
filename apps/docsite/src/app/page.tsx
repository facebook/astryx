import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSGrid} from '@xds/core/Grid';
import {XDSSection} from '@xds/core/Section';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {packages} from '../generated/packageRegistry';
import {components, componentCount} from '../generated/componentRegistry';
import {blockCount, showcaseCount} from '../generated/blockRegistry';
import {templateCount} from '../generated/templateRegistry';
import {docsCount} from '../generated/docsRegistry';

const themeCount = packages.filter(p => p.name.includes('theme-')).length;
const componentPackages = Object.keys(components);

export default function Home() {
  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={8}>
        {/* Hero */}
        <XDSVStack gap={3}>
          <XDSHeading level={1}>XDS</XDSHeading>
          <XDSText type="large" color="secondary">
            Open-source design system for building internal tools and products.
          </XDSText>
          <XDSHStack gap={3}>
            <XDSButton
              label="Getting Started"
              variant="primary"
              href="/getting-started"
            />
            <XDSButton
              label="Components"
              variant="secondary"
              href="/components/Button"
            />
            <XDSButton label="Templates" variant="ghost" href="/templates" />
          </XDSHStack>
        </XDSVStack>

        {/* Stats */}
        <XDSGrid columns={4} gap={4} minChildWidth={140}>
          <StatCard n={componentCount} label="Components" />
          <StatCard n={blockCount} label="Blocks" />
          <StatCard n={showcaseCount} label="Showcases" />
          <StatCard n={templateCount} label="Templates" />
          <StatCard n={themeCount} label="Themes" />
          <StatCard n={docsCount} label="Doc Topics" />
          <StatCard n={packages.length} label="Packages" />
          <StatCard n={componentPackages.length} label="Component Pkgs" />
        </XDSGrid>

        {/* Packages */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>Packages</XDSHeading>
          <XDSGrid columns={2} gap={4} minChildWidth={280}>
            {packages.map(p => (
              <XDSClickableCard
                key={p.name}
                label={p.name}
                href={`/packages/${encodeURIComponent(p.name)}`}
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

        {/* Components by package */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>Components by Package</XDSHeading>
          <XDSGrid columns={3} gap={4} minChildWidth={160}>
            {componentPackages.map(pkg => (
              <XDSCard key={pkg} padding={5}>
                <XDSVStack gap={1} hAlign="center">
                  <XDSText type="display-2">{components[pkg].length}</XDSText>
                  <XDSText type="supporting" color="secondary">
                    {pkg.replace('@xds/', '')}
                  </XDSText>
                </XDSVStack>
              </XDSCard>
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
