// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: overview
 * Home page — hero, libraries, foundations.
 * All data from pipeline registries.
 */

import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSSection} from '@xds/core/Section';
import {XDSButton} from '@xds/core/Button';
import {XDSMediaTheme} from '@xds/core/theme';
import {XDSLink} from '@xds/core/Link';
import {ThemedPreview} from '../../../components/ThemedPreview';
import {packages} from '../../../generated/packageRegistry';
import {componentCount} from '../../../generated/componentRegistry';
import {docTopics} from '../../../generated/docsRegistry';
import {ThemeShowcaseTile} from '../../../components/ThemeShowcaseTile';
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

const PACKAGE_IMAGES: Record<string, string> = {
  '@xds/cli': '/LibrariesCli.png',
  '@xds/core': '/LibrariesCore.png',
};

const foundationImages: Record<string, string> = {
  color: '/FoundationsColors.png',
  icons: '/FoundationsIcons.png',
  shape: '/FoundationsShape.png',
  spacing: '/FoundationsSpacing.png',
  typography: '/FoundationsTypogrpahy.png',
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
  foundationImage: {
    display: 'block',
    width: '100%',
    aspectRatio: '2/1',
    objectFit: 'cover' as const,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'var(--color-background-card)',
  },
  packageImageWrapper: {
    aspectRatio: '2/1',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: 12,
    position: 'relative' as const,
    marginBottom: 12,
    backgroundColor: 'var(--color-background-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageIconOverlay: {
    color: '#484233',
    opacity: 0.8,
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
});

const foundationTopics = docTopics
  .filter(d => d.category === 'foundations')
  .sort((a, b) => {
    if (a.topic === 'tokens') {
      return -1;
    }
    if (b.topic === 'tokens') {
      return 1;
    }
    return a.title.localeCompare(b.title);
  });

export default function HomePage() {
  const coreCount = componentCount;

  return (
    <div {...stylex.props(styles.pageContainer)}>
      <XDSSection padding={0}>
        <XDSVStack gap={10} style={{rowGap: 60}}>
          {/* Hero */}
          <div {...stylex.props(styles.heroContainer)}>
            <XDSMediaTheme mode="light">
              <XDSText type="large" weight="semibold" xstyle={styles.heroTitle}>
                Astryx
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
                  href="/packages/core"
                />
              </XDSHStack>
            </XDSMediaTheme>
          </div>

          {/* Libraries & Packages */}
          <XDSVStack gap={5}>
            <XDSVStack gap={1}>
              <XDSHeading level={2}>Libraries &amp; packages</XDSHeading>
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
                const image = PACKAGE_IMAGES[pkg.name] ?? '/LibrariesCore.png';
                const icon = PACKAGE_ICONS[pkg.name] ?? null;

                return (
                  <Link
                    key={pkg.name}
                    href={`/packages/${pkg.name.replace('@xds/', '')}`}
                    {...stylex.props(styles.linkReset)}>
                    {theme ? (
                      <ThemedPreview theme={theme}>
                        <div {...stylex.props(styles.packageImageWrapper)}>
                          <ThemeShowcaseTile label={pkg.displayName} />
                        </div>
                      </ThemedPreview>
                    ) : (
                      <div
                        {...stylex.props(styles.packageImageWrapper)}
                        style={{backgroundImage: `url(${image})`}}>
                        {icon && (
                          <div {...stylex.props(styles.packageIconOverlay)}>
                            {icon}
                          </div>
                        )}
                      </div>
                    )}
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
              {foundationTopics.map(topic => (
                <Link
                  key={topic.topic}
                  href={`/docs/${topic.topic}`}
                  {...stylex.props(styles.linkReset)}>
                  {foundationImages[topic.topic] ? (
                    <img
                      src={foundationImages[topic.topic]}
                      alt={topic.title}
                      {...stylex.props(styles.foundationImage)}
                    />
                  ) : (
                    <div {...stylex.props(styles.foundationImage)} />
                  )}
                  <XDSVStack gap={1}>
                    <XDSText type="body" weight="bold">
                      {topic.title}
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      {topic.description}
                    </XDSText>
                  </XDSVStack>
                </Link>
              ))}
            </XDSGrid>
          </XDSVStack>
        </XDSVStack>
      </XDSSection>
    </div>
  );
}
