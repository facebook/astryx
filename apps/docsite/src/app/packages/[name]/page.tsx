/**
 * Page type: component-pkg OR theme-pkg
 * Renders a package detail page. Adapts based on whether the package
 * is a theme (theme-pkg) or a component library (component-pkg).
 *
 * component-pkg: grid of components in the package
 * theme-pkg: theme preview, token info, setup instructions
 */

import {notFound} from 'next/navigation';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSBadge} from '@xds/core/Badge';
import {XDSGrid} from '@xds/core/Grid';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {packages} from '../../../generated/packageRegistry';
import {
  components,
  type ComponentEntry,
} from '../../../generated/componentRegistry';

function slugToPackageName(slug: string): string {
  return `@xds/${slug}`;
}

export function generateStaticParams() {
  return packages.map(p => ({name: p.name.replace('@xds/', '')}));
}

export default async function PackagePage({
  params,
}: {
  params: Promise<{name: string}>;
}) {
  const {name: slug} = await params;
  const pkgName = slugToPackageName(slug);
  const pkg = packages.find(p => p.name === pkgName);
  if (!pkg) notFound();

  const isTheme = pkg.name.includes('theme-');
  const pkgComponents = components[pkg.name] || [];

  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={6}>
        <XDSVStack gap={2}>
          <XDSHeading level={1}>{pkg.displayName}</XDSHeading>
          <XDSHStack gap={2} vAlign="center">
            <XDSText type="supporting" color="secondary">
              {pkg.name}
            </XDSText>
            <XDSBadge label={`v${pkg.version}`} variant="info" />
          </XDSHStack>
          <XDSText type="body" color="secondary">
            {pkg.description}
          </XDSText>
        </XDSVStack>

        {isTheme ? (
          <ThemePackageContent />
        ) : (
          <ComponentPackageContent components={pkgComponents} />
        )}
      </XDSVStack>
    </XDSSection>
  );
}

function ThemePackageContent() {
  return (
    <XDSVStack gap={4}>
      {/* TODO: theme preview, token values, setup code from pipeline */}
      <XDSText type="body" color="secondary">
        Theme details coming soon.
      </XDSText>
    </XDSVStack>
  );
}

function ComponentPackageContent({
  components: pkgComponents,
}: {
  components: ComponentEntry[];
}) {
  // Only show top-level entries (not sub-components) in the grid
  const topLevel = pkgComponents.filter(c => !c.parentDoc);

  if (topLevel.length === 0) {
    return (
      <XDSText type="body" color="secondary">
        No components documented yet.
      </XDSText>
    );
  }

  return (
    <XDSVStack gap={4}>
      <XDSHeading level={2}>Components ({topLevel.length})</XDSHeading>
      <XDSGrid columns={3} gap={4} minChildWidth={200}>
        {topLevel.map(c => (
          <XDSClickableCard
            key={c.name}
            label={c.name}
            href={`/components/${c.name}`}
            padding={4}>
            <XDSVStack gap={1}>
              <XDSText type="body" weight="bold">
                {c.name}
              </XDSText>
              {c.group && <XDSBadge label={c.group} />}
              <XDSText type="supporting" color="secondary">
                {c.description.slice(0, 100)}
                {c.description.length > 100 ? '…' : ''}
              </XDSText>
            </XDSVStack>
          </XDSClickableCard>
        ))}
      </XDSGrid>
    </XDSVStack>
  );
}
