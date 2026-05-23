/**
 * Page type: overview
 * Documentation home — hero, libraries, foundations.
 * Uses AssetCard for consistent visual treatment instead of individual images.
 */

import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSSection} from '@xds/core/Section';
import {XDSButton} from '@xds/core/Button';
import {XDSTheme, XDSMediaTheme} from '@xds/core/theme';
import {XDSDivider} from '@xds/core/Divider';
import {XDSLink} from '@xds/core/Link';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {packages} from '../../../generated/packageRegistry';
import {componentCount} from '../../../generated/componentRegistry';
import {docTopics} from '../../../generated/docsRegistry';
import {ThemeShowcaseTile} from '../../../components/ThemeShowcaseTile';
import {AssetCard} from '../../../components/AssetCard';
import {themeObjects} from '../../../generated/themeRegistry';

const TerminalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="m7 11 2-2-2-2" />
    <path d="M11 13h4" />
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
  </svg>
);

const CodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="m18 16 4-4-4-4" />
    <path d="m6 8-4 4 4 4" />
    <path d="m14.5 4-5 16" />
  </svg>
);

const PACKAGE_ICONS: Record<string, React.ReactNode> = {
  '@xds/cli': <TerminalIcon />,
  '@xds/core': <CodeIcon />,
};

const PACKAGE_GRADIENTS: Record<string, 'primary' | 'secondary' | 'tertiary' | 'warm' | 'cool' | 'neutral'> = {
  '@xds/cli': 'warm',
  '@xds/core': 'primary',
};

const FOUNDATION_GRADIENTS: Record<string, 'primary' | 'secondary' | 'tertiary' | 'warm' | 'cool' | 'neutral'> = {
  color: 'primary',
  icons: 'cool',
  shape: 'tertiary',
  spacing: 'secondary',
  typography: 'warm',
  tokens: 'neutral',
};

const styles = stylex.create({
  pageContainer: {
    maxWidth: 1200,
    marginInline: 'auto',
    paddingInline: {
      default: 16,
      '@media (min-width: 768px)': 40,
    },
    paddingBlockStart: 0,
    paddingBlockEnd: 32,
  },
  heroContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-card)',
    backgroundImage: 'url(/hero-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: {
      default: '48px 24px',
      '@media (min-width: 768px)': 48,
    },
  },
  heroTitle: {
    textAlign: 'center' as const,
  },
  heroSubtitle: {
    textAlign: 'center' as const,
    marginTop: 8,
  },
  heroDescription: {
    maxWidth: 480,
    marginTop: 4,
    fontSize: 16,
    lineHeight: 1.5,
    textAlign: 'center' as const,
  },
  heroButtons: {
    marginTop: 24,
  },
  packageImageWrapper: {
    marginBottom: 12,
  },
  packageIconOverlay: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  monoText: {
    fontFamily: 'monospace',
  },
  versionText: {
    marginLeft: 8,
  },
  linkReset: {
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
  },
  footerDivider: {
    paddingBlockStart: spacingVars['--spacing-12'],
  },
  footer: {
    paddingBlockStart: spacingVars['--spacing-12'],
    paddingBlockEnd: spacingVars['--spacing-12'],
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
});

const foundationTopics = docTopics
  .filter(d => d.category === 'foundations')
  .sort((a, b) => {
    if (a.topic === 'tokens') return -1;
    if (b.topic === 'tokens') return 1;
    return a.title.localeCompare(b.title);
  });

export default function DocsHomePage() {
  const coreCount = componentCount;

  return (
    <div {...stylex.props(styles.pageContainer)}>
      <XDSSection padding={0}>
        <XDSVStack gap={10} style={{rowGap: 60}}>
          {/* Hero */}
          <div {...stylex.props(styles.heroContainer)}>
            <XDSMediaTheme mode="light">
              <XDSText type="large" weight="semibold" xstyle={styles.heroTitle}>
                XDS Open Source
              </XDSText>
              <XDSText type="display-1" xstyle={styles.heroSubtitle}>
                Build with AI
              </XDSText>
              <XDSText
                type="body"
                color="secondary"
                xstyle={styles.heroDescription}>
                An open design system for building internal tools with
                AI-powered development. Ship faster with {coreCount} accessible,
                themeable components. Made with{' '}
                <XDSLink
                  type="inherit"
                  color="secondary"
                  href="https://react.dev">
                  React
                </XDSLink>
                {' and '}
                <XDSLink
                  type="inherit"
                  color="secondary"
                  href="https://stylexjs.com">
                  StyleX
                </XDSLink>
                .
              </XDSText>
              <XDSHStack gap={3} xstyle={styles.heroButtons}>
                <XDSButton
                  variant="primary"
                  label="Get started"
                  href="/docs/getting-started"
                />
                <XDSButton
                  variant="secondary"
                  label="Browse components"
                  href="/components"
                />
              </XDSHStack>
            </XDSMediaTheme>
          </div>

          {/* Libraries & Packages */}
          <XDSVStack gap={5}>
            <XDSVStack gap={1}>
              <XDSHeading level={2}>Libraries &amp; Packages</XDSHeading>
              <XDSText type="body" color="secondary">
                Install what you need. All packages are published under the @xds
                scope.
              </XDSText>
            </XDSVStack>
            <XDSGrid
              columns={{minWidth: 260, repeat: 'fit'}}
              gap={4}
              rowGap={8}>
              {packages.map(pkg => {
                const theme = themeObjects[pkg.name];
                const icon = PACKAGE_ICONS[pkg.name] ?? null;
                const gradient = PACKAGE_GRADIENTS[pkg.name] ?? 'neutral';

                return (
                  <Link
                    key={pkg.name}
                    href={`/packages/${pkg.name.replace('@xds/', '')}`}
                    {...stylex.props(styles.linkReset)}>
                    <div {...stylex.props(styles.packageImageWrapper)}>
                      {theme ? (
                        <XDSTheme theme={theme}>
                          <AssetCard gradient={gradient} shape="rounded-lg">
                            <ThemeShowcaseTile label={pkg.displayName} />
                          </AssetCard>
                        </XDSTheme>
                      ) : (
                        <AssetCard gradient={gradient} shape="rounded-lg">
                          {icon && (
                            <div {...stylex.props(styles.packageIconOverlay)}>
                              {icon}
                            </div>
                          )}
                        </AssetCard>
                      )}
                    </div>
                    <XDSVStack gap={0.5}>
                      <span {...stylex.props(styles.monoText)}>
                        <XDSText type="body" weight="bold">
                          {pkg.name}
                        </XDSText>
                        <span {...stylex.props(styles.versionText)}>
                          <XDSText type="supporting" color="secondary">
                            v{pkg.version}
                          </XDSText>
                        </span>
                      </span>
                      <XDSText type="supporting" color="secondary">
                        {pkg.description}
                      </XDSText>
                    </XDSVStack>
                  </Link>
                );
              })}
            </XDSGrid>
          </XDSVStack>

          {/* Foundations */}
          <XDSVStack gap={5}>
            <XDSVStack gap={1}>
              <XDSHeading level={2}>Foundations</XDSHeading>
              <XDSText type="body" color="secondary">
                The design tokens and primitives that every component is built
                on.
              </XDSText>
            </XDSVStack>
            <XDSGrid
              columns={{minWidth: 300, repeat: 'fit'}}
              gap={4}
              rowGap={8}>
              {foundationTopics.map(topic => {
                const gradient = FOUNDATION_GRADIENTS[topic.topic] ?? 'neutral';
                return (
                  <Link
                    key={topic.topic}
                    href={`/docs/${topic.topic}`}
                    {...stylex.props(styles.linkReset)}>
                    <AssetCard
                      gradient={gradient}
                      shape="rounded-lg"
                      aspectRatio="2/1"
                    />
                    <XDSVStack gap={1} style={{marginTop: 12}}>
                      <XDSText type="body" weight="bold">
                        {topic.title}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        {topic.description}
                      </XDSText>
                    </XDSVStack>
                  </Link>
                );
              })}
            </XDSGrid>
          </XDSVStack>
        </XDSVStack>
      </XDSSection>

      <XDSDivider xstyle={styles.footerDivider} />
      <footer {...stylex.props(styles.footer)}>
        <XDSText type="supporting" color="secondary">
          <XDSLink
            color="secondary"
            label="Terms of Use"
            href="https://opensource.fb.com/legal/terms"
            isExternalLink>
            Terms of Use
          </XDSLink>
          {' | '}
          <XDSLink
            color="secondary"
            label="Privacy Policy"
            href="https://opensource.fb.com/legal/privacy"
            isExternalLink>
            Privacy Policy
          </XDSLink>
        </XDSText>
      </footer>
    </div>
  );
}
