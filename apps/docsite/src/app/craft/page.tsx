/**
 * Page type: craft landing
 * Template gallery with tabs: All, Templates, Components.
 * All data from pipeline registries.
 */

import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSBadge} from '@xds/core/Badge';
import {templates} from '../../generated/templateRegistry';
import {blocks, showcaseCount} from '../../generated/blockRegistry';

const showcases = blocks.filter(b => b.isShowcase);

export default function CraftPage() {
  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={8}>
        <XDSVStack gap={2}>
          <XDSHeading level={1}>Craft</XDSHeading>
          <XDSText type="large" color="secondary">
            Browse templates, component showcases, and examples. Copy the source
            code to get started.
          </XDSText>
        </XDSVStack>

        {/* Templates */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>Page Templates ({templates.length})</XDSHeading>
          <XDSGrid columns={{minWidth: 280, repeat: 'fit'}} gap={4} rowGap={6}>
            {templates.map(t => (
              <XDSClickableCard
                key={t.slug}
                label={t.name}
                href={`/craft/templates/${t.slug}`}
                padding={5}>
                <XDSVStack gap={2}>
                  <XDSText type="body" weight="bold">
                    {t.name}
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    {t.description}
                  </XDSText>
                  {!t.isReady && (
                    <XDSBadge label="Coming Soon" variant="warning" />
                  )}
                </XDSVStack>
              </XDSClickableCard>
            ))}
          </XDSGrid>
        </XDSVStack>

        {/* Showcases */}
        <XDSVStack gap={4}>
          <XDSHeading level={2}>
            Component Showcases ({showcaseCount})
          </XDSHeading>
          <XDSGrid columns={{minWidth: 280, repeat: 'fit'}} gap={4} rowGap={6}>
            {showcases.map(b => (
              <XDSClickableCard
                key={b.dirName}
                label={b.name}
                href={`/components/${b.componentsUsed[0] || b.category.split('/').pop()}`}
                padding={5}>
                <XDSVStack gap={2}>
                  <XDSText type="body" weight="bold">
                    {b.name}
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    {b.description}
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
