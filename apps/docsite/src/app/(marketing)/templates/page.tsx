/**
 * Templates gallery — extracted from craft.
 */

'use client';

import {useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSOverlay} from '@xds/core/Overlay';
import {XDSBadge} from '@xds/core/Badge';
import {templates} from '../../../generated/templateRegistry';
import {TemplateThumbnail} from '../../../components/TemplateThumbnail';

const styles = stylex.create({
  heroTitle: {
    textAlign: 'center' as const,
  },
  cardImage: {
    display: 'block',
    width: '100%',
    aspectRatio: '16/10',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
  },
  comingSoon: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayInner: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    height: '100%',
    width: '100%',
    padding: 8,
  },
});

export default function TemplatesPage() {
  const items = useMemo(
    () =>
      templates.map(t => ({
        name: t.name,
        description: t.description,
        slug: t.slug,
        href: `/templates/${t.slug}`,
        isReady: t.isReady,
      })),
    [],
  );

  return (
    <XDSSection maxWidth="xl" padding={6}>
      <XDSVStack gap={6}>
        <XDSVStack gap={2} style={{alignItems: 'center'}}>
          <XDSText type="display-2" xstyle={styles.heroTitle}>
            Templates
          </XDSText>
          <XDSText type="body" color="secondary" xstyle={styles.heroTitle}>
            Ready-to-use page templates to kickstart your project.
          </XDSText>
        </XDSVStack>

        <XDSGrid columns={{minWidth: 300, repeat: 'fill'}} gap={4} rowGap={6}>
          {items.map(item => (
            <XDSCard key={item.slug} padding={0}>
              <XDSOverlay
                showOn="hover"
                scrim="dark"
                content={
                  <div {...stylex.props(styles.overlayInner)}>
                    <XDSVStack gap={2}>
                      <XDSVStack gap={0.5}>
                        <XDSText
                          type="body"
                          weight="bold"
                          style={{color: '#fff'}}>
                          {item.name}
                        </XDSText>
                        <XDSText
                          type="supporting"
                          style={{color: 'rgba(255,255,255,0.7)'}}>
                          {item.description.slice(0, 80)}
                          {item.description.length > 80 ? '\u2026' : ''}
                        </XDSText>
                      </XDSVStack>
                      <XDSHStack gap={2}>
                        <XDSButton
                          label="Preview"
                          variant="secondary"
                          size="sm"
                          href={item.href}
                        />
                        <XDSButton
                          label="Use"
                          variant="secondary"
                          size="sm"
                          href={item.href}
                        />
                      </XDSHStack>
                    </XDSVStack>
                  </div>
                }>
                {item.isReady ? (
                  <TemplateThumbnail slug={item.slug} />
                ) : (
                  <div {...stylex.props(styles.cardImage)}>
                    <div {...stylex.props(styles.comingSoon)}>
                      <XDSBadge label="Coming Soon" variant="info" />
                    </div>
                  </div>
                )}
              </XDSOverlay>
            </XDSCard>
          ))}
        </XDSGrid>
      </XDSVStack>
    </XDSSection>
  );
}
