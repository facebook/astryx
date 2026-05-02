/**
 * Page type: component
 * Component or hook/utility detail page. Adapts based on content:
 * - Visual components: showcase + props + anatomy + examples
 * - Hooks/utilities: params + usage (no showcase if none exists)
 * - Compound components: also lists sub-components
 *
 * All data comes from componentRegistry. Sub-components (parentDoc != null)
 * are shown on their parent's page, not as standalone routes.
 */

import {notFound} from 'next/navigation';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core';
import {components} from '../../../generated/componentRegistry';

const allComponents = Object.values(components).flat();

export function generateStaticParams() {
  // Generate routes for top-level components only.
  // Sub-components are rendered on their parent's page.
  return allComponents.filter(c => !c.parentDoc).map(c => ({name: c.name}));
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{name: string}>;
}) {
  const {name} = await params;
  const comp = allComponents.find(c => c.name === name);
  if (!comp) notFound();

  const subComponents = allComponents.filter(c => c.parentDoc === name);
  const pkg = Object.entries(components).find(([, comps]) =>
    comps.includes(comp),
  )?.[0];

  return (
    <XDSSection maxWidth="md" padding={6}>
      <XDSVStack gap={6}>
        {/* Header */}
        <XDSVStack gap={2}>
          <XDSText type="supporting" color="secondary" weight="bold">
            {comp.displayName}
          </XDSText>
          <XDSHeading level={1}>{comp.name}</XDSHeading>
          <XDSText type="body" color="secondary">
            {comp.description}
          </XDSText>
          <XDSHStack gap={2}>
            {comp.group && <XDSBadge label={comp.group} />}
            {pkg && <XDSBadge label={pkg} variant="info" />}
          </XDSHStack>
        </XDSVStack>

        {/* TODO: showcase section — render if blockRegistry has a showcase for this component */}

        {/* TODO: props table — render from pipeline data */}

        {/* TODO: anatomy — render if doc has anatomy data */}

        {/* TODO: examples — render from blockRegistry matches */}

        {/* Sub-components */}
        {subComponents.length > 0 && (
          <>
            <XDSDivider />
            <XDSVStack gap={4}>
              <XDSHeading level={2}>
                Sub-components ({subComponents.length})
              </XDSHeading>
              <XDSVStack gap={3}>
                {subComponents.map(sub => (
                  <XDSCard key={sub.name} padding={4}>
                    <XDSVStack gap={1}>
                      <XDSText type="body" weight="bold">
                        {sub.displayName}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        {sub.description}
                      </XDSText>
                    </XDSVStack>
                  </XDSCard>
                ))}
              </XDSVStack>
            </XDSVStack>
          </>
        )}
      </XDSVStack>
    </XDSSection>
  );
}
