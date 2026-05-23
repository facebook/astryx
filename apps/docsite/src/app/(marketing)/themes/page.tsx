/**
 * Themes gallery — extracted from craft.
 */

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSOverlay} from '@xds/core/Overlay';
import {XDSTheme} from '@xds/core/theme';
import {packages} from '../../../generated/packageRegistry';
import {themeObjects} from '../../../generated/themeRegistry';
import {ThemeShowcaseTile} from '../../../components/ThemeShowcaseTile';

const themePackages = packages.filter(p => p.name.includes('theme-'));

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

export default function ThemesPage() {
  return (
    <XDSSection maxWidth="xl" padding={6}>
      <XDSVStack gap={6}>
        <XDSVStack gap={2} style={{alignItems: 'center'}}>
          <XDSText type="display-2" xstyle={styles.heroTitle}>
            Themes
          </XDSText>
          <XDSText type="body" color="secondary" xstyle={styles.heroTitle}>
            Swap the visual identity of your app with a single theme package.
          </XDSText>
        </XDSVStack>

        <XDSGrid columns={{minWidth: 300, repeat: 'fill'}} gap={4} rowGap={6}>
          {themePackages.map(pkg => {
            const theme = themeObjects[pkg.name];
            const label = pkg.displayName.replace('Theme: ', '');
            return (
              <XDSCard key={pkg.name} padding={0}>
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
                            {pkg.displayName}
                          </XDSText>
                          <XDSText
                            type="supporting"
                            style={{color: 'rgba(255,255,255,0.7)'}}>
                            {pkg.description.slice(0, 80)}
                            {pkg.description.length > 80 ? '\u2026' : ''}
                          </XDSText>
                        </XDSVStack>
                        <XDSHStack gap={2}>
                          <XDSButton
                            label="View theme"
                            variant="secondary"
                            size="sm"
                            href={`/packages/${pkg.name.replace('@xds/', '')}`}
                          />
                          <XDSButton
                            label="Customize"
                            variant="secondary"
                            size="sm"
                            href="/craft/theme"
                          />
                        </XDSHStack>
                      </XDSVStack>
                    </div>
                  }>
                  <div style={{aspectRatio: '16/10'}} inert>
                    {theme ? (
                      <XDSTheme theme={theme}>
                        <ThemeShowcaseTile label={label} />
                      </XDSTheme>
                    ) : (
                      <div {...stylex.props(styles.cardImage)} />
                    )}
                  </div>
                </XDSOverlay>
              </XDSCard>
            );
          })}
        </XDSGrid>
      </XDSVStack>
    </XDSSection>
  );
}
