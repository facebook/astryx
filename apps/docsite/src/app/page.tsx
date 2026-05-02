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
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {packages} from '../generated/packageRegistry';
import {componentCount} from '../generated/componentRegistry';
import {docTopics} from '../generated/docsRegistry';

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
    borderRadius: 12,
    position: 'relative' as const,
    marginBottom: 12,
    backgroundColor: 'var(--color-background-card)',
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

const isThemePkg = (name: string) => name.includes('theme-');

const foundationTopics = docTopics
  .filter(d => d.category === 'foundations')
  .sort((a, b) => {
    if (a.topic === 'tokens') return -1;
    if (b.topic === 'tokens') return 1;
    return a.title.localeCompare(b.title);
  });

export default function HomePage() {
  const coreCount = componentCount;
  const libraryPackages = packages.filter(p => !isThemePkg(p.name));
  const themePackages = packages.filter(p => isThemePkg(p.name));
  const allPackages = [...libraryPackages, ...themePackages];

  return (
    <div {...stylex.props(styles.pageContainer)}>
      <XDSSection padding={0}>
        <XDSVStack gap={10} style={{rowGap: 60}}>
          {/* Hero */}
          <div {...stylex.props(styles.heroContainer)}>
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
              An open design system for building internal tools with AI-powered
              development. Ship faster with {coreCount} accessible, themeable
              components.
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
              {allPackages.map(pkg => (
                <Link
                  key={pkg.name}
                  href={`/packages/${pkg.name.replace('@xds/', '')}`}
                  {...stylex.props(styles.linkReset)}>
                  <div {...stylex.props(styles.packageImageWrapper)} />
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
              ))}
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
                  <div {...stylex.props(styles.foundationImage)} />
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
