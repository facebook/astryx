// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {Text} from '@xds/core/Text';
import {Link} from '@xds/core/Link';
import {Button} from '@xds/core/Button';
import {HStack, VStack} from '@xds/core/Layout';
import {Grid, GridSpan} from '@xds/core/Grid';
import {Card} from '@xds/core/Card';
import {Section} from '@xds/core/Section';
import {useAppShellMobile} from '@xds/core/AppShell';
import {GITHUB_REPO, GITHUB_PAGES} from '../constants';
import {
  AstryxLogo,
  GitHubLogo,
  ThreadsLogo,
  XLogo,
  MetaOpenSourceLogo,
} from './logos';

const styles = stylex.create({
  footerLinks: {
    width: '100%',
    paddingInline: spacingVars['--spacing-2'],
  },
  logo: {
    height: 18,
    width: 'auto',
    display: 'block',
    color: 'var(--color-icon-secondary)',
  },
  socialIcon: {
    width: 16,
    height: 16,
    display: 'block',
  },
  metaOpenSourceLogo: {
    height: 14,
    width: 'auto',
    display: 'block',
    color: 'var(--color-icon-secondary)',
  },
});

const FOOTER_LINKS: ReadonlyArray<{
  label: string;
  href: string;
  isExternal?: boolean;
}> = [
  {label: 'Docs', href: '/docs'},
  {label: 'Changelog', href: '/changelog'},
  {label: 'Community', href: '/community'},
  {label: 'Blog', href: '/blog'},
  {label: 'Components', href: '/components'},
  {label: 'Templates', href: '/templates'},
  {label: 'Themes', href: '/themes'},
  {label: 'Playground', href: '/playground'},
  {label: 'GitHub Pages', href: GITHUB_PAGES, isExternal: true},
];

const SOCIAL_LINKS: ReadonlyArray<{
  label: string;
  href: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}> = [
  {label: 'GitHub', href: GITHUB_REPO, Icon: GitHubLogo},
  {label: 'Threads', href: 'https://www.threads.net', Icon: ThreadsLogo},
  {label: 'X', href: 'https://x.com', Icon: XLogo},
];

const LEGAL_LINKS: ReadonlyArray<{label: string; href: string}> = [
  {label: 'Terms of use', href: 'https://opensource.fb.com/legal/terms'},
  {label: 'Privacy policy', href: 'https://opensource.fb.com/legal/privacy'},
];

function NavLinks() {
  return (
    <>
      {FOOTER_LINKS.map(item => (
        <Link
          key={item.label}
          href={item.href}
          type="supporting"
          color="secondary"
          isStandalone
          target={item.isExternal ? '_blank' : undefined}>
          {item.label}
        </Link>
      ))}
    </>
  );
}

function SocialButtons() {
  return (
    <>
      {SOCIAL_LINKS.map(social => (
        <Button
          key={social.label}
          label={social.label}
          tooltip={social.label}
          variant="secondary"
          isIconOnly
          icon={
            <social.Icon
              aria-hidden="true"
              {...stylex.props(styles.socialIcon)}
            />
          }
          href={social.href}
        />
      ))}
    </>
  );
}

function LegalLinks() {
  return (
    <>
      {LEGAL_LINKS.map(link => (
        <Link
          key={link.label}
          href={link.href}
          type="supporting"
          color="secondary"
          isStandalone
          target="_blank">
          {link.label}
        </Link>
      ))}
    </>
  );
}

export function SiteFooter() {
  const {isMobile} = useAppShellMobile();
  const year = new Date().getFullYear();

  // The regex compliance check requires the year to immediately follow the
  // copyright mark — `©{year}`, no separating space. See PR description.
  const copyright = `\u00A9${year} Meta Platforms, Inc.`;

  const astryxLogo = (
    <AstryxLogo role="img" aria-label="Astryx" {...stylex.props(styles.logo)} />
  );

  const metaOpenSourceLink = (
    <Link
      href="https://opensource.fb.com"
      label="Meta Open Source"
      target="_blank">
      <MetaOpenSourceLogo
        aria-hidden="true"
        {...stylex.props(styles.metaOpenSourceLogo)}
      />
    </Link>
  );

  if (isMobile) {
    // On narrow viewports the horizontal rows can't fit side by side, so we
    // stack the three regions vertically and let the link lists wrap.
    return (
      <Section role="contentinfo" padding={4}>
        <VStack gap={4}>
          <VStack gap={3} hAlign="start" xstyle={styles.footerLinks}>
            {astryxLogo}
            <HStack gap={4} wrap="wrap" align="center">
              <NavLinks />
            </HStack>
            <HStack gap={2} wrap="wrap" align="center">
              <SocialButtons />
            </HStack>
          </VStack>

          <Card variant="muted">
            <VStack gap={3} hAlign="start">
              {metaOpenSourceLink}
              <VStack gap={2} hAlign="start">
                <LegalLinks />
              </VStack>
              <Text type="supporting" color="secondary">
                {copyright}
              </Text>
            </VStack>
          </Card>
        </VStack>
      </Section>
    );
  }

  return (
    <Section role="contentinfo" padding={4}>
      <VStack gap={4}>
        <Grid columns={5} xstyle={styles.footerLinks} align="center">
          {astryxLogo}
          <GridSpan columns={3}>
            <HStack gap={4} wrap="wrap" align="center" hAlign="center">
              <NavLinks />
            </HStack>
          </GridSpan>
          <HStack gap={2} align="center" justify="end">
            <SocialButtons />
          </HStack>
        </Grid>

        <Card variant="muted">
          <Grid columns={4} align="center">
            {metaOpenSourceLink}
            <GridSpan columns={2}>
              <HStack
                gap={4}
                wrap="wrap"
                align="center"
                hAlign="center"
                width="100%">
                <LegalLinks />
              </HStack>
            </GridSpan>
            <Text type="supporting" color="secondary" justify="end">
              {copyright}
            </Text>
          </Grid>
        </Card>
      </VStack>
    </Section>
  );
}
