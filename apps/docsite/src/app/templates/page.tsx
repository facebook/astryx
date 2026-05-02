import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {templates, templateCount} from '../../generated/templateRegistry';

export default function TemplatesPage() {
  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={6}>
        <XDSVStack gap={2}>
          <XDSHeading level={1}>Templates</XDSHeading>
          <XDSText type="body" color="secondary">
            {templateCount} page templates ready to use.
          </XDSText>
        </XDSVStack>
        <XDSGrid columns={3} gap={4} minChildWidth={280}>
          {templates.map(t => (
            <XDSCard key={t.slug} padding={5}>
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
            </XDSCard>
          ))}
        </XDSGrid>
      </XDSVStack>
    </XDSSection>
  );
}
