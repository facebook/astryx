// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Text} from '@astryxdesign/core/Text';
import {Link} from '@astryxdesign/core/Link';
import {Button} from '@astryxdesign/core/Button';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Grid, GridSpan} from '@astryxdesign/core/Grid';
import {Divider} from '@astryxdesign/core/Divider';
import {Section} from '@astryxdesign/core/Section';
import {useAppShellMobile} from '@astryxdesign/core/AppShell';
import {
  GITHUB_REPO,
  DISCORD_URL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  THREADS_URL,
  X_URL,
} from '../constants';
import {
  AstryxLogo,
  GitHubLogo,
  ThreadsLogo,
  XLogo,
  InstagramLogo,
  FacebookLogo,
  MetaOpenSourceLogo,
  DiscordLogo,
} from './logos';

const styles = stylex.create({
  siteFooter: {
    // Match the section rhythm above (responsive); fall back off the home page.
    paddingTop:
      'var(--astryx-marketing-section-gap, calc(var(--spacing-12) * 2))',
  },
  astryxLogo: {
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
  mobileFooterLinks: {
    maxWidth: 320,
  },
});

const FOOTER_LINKS: ReadonlyArray<{
  label: string;
  href: string;
}> = [
  {label: 'Docs', href: '/docs/getting-started'},
  {label: 'Components', href: '/components'},
  {label: 'Templates', href: '/templates'},
  {label: 'Themes', href: '/themes'},
  {label: 'Playground', href: '/playground'},
  {label: 'Blog', href: '/blog'},
  {label: 'Community', href: '/community'},
  {label: 'Changelog', href: '/changelog'},
];

const SOCIAL_LINKS: ReadonlyArray<{
  label: string;
  href: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}> = [
  {label: 'GitHub', href: GITHUB_REPO, Icon: GitHubLogo},
  {label: 'Discord', href: DISCORD_URL, Icon: DiscordLogo},
  {label: 'Facebook', href: FACEBOOK_URL, Icon: FacebookLogo},
  {label: 'Instagram', href: INSTAGRAM_URL, Icon: InstagramLogo},
  {label: 'Threads', href: THREADS_URL, Icon: ThreadsLogo},
  {label: 'X', href: X_URL, Icon: XLogo},
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
          isStandalone>
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

export function SiteFooter({year}: {year: number}) {
  const {isMobile} = useAppShellMobile();

  // The regex compliance check requires the year to immediately follow the
  // copyright mark — `©{year}`, no separating space. See PR description.
  const copyright = `\u00A9${year} Meta Platforms, Inc.`;

  const astryxLogo = (
    <Link href="/" label="Astryx">
      <AstryxLogo aria-hidden="true" {...stylex.props(styles.astryxLogo)} />
    </Link>
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
      <Section role="contentinfo" padding={6} xstyle={styles.siteFooter}>
        <VStack gap={6}>
          <VStack gap={6} hAlign="center">
            {astryxLogo}
            <HStack
              gap={3}
              wrap="wrap"
              hAlign="center"
              align="center"
              xstyle={styles.mobileFooterLinks}>
              <NavLinks />
            </HStack>
            <HStack gap={2} wrap="wrap" align="center">
              <SocialButtons />
            </HStack>
          </VStack>

          <Divider />

          <VStack gap={2} hAlign="center">
            {metaOpenSourceLink}
            <HStack gap={4} hAlign="start" xstyle={styles.mobileFooterLinks}>
              <LegalLinks />
            </HStack>
            <Text type="supporting" color="secondary">
              {copyright}
            </Text>
          </VStack>
        </VStack>
      </Section>
    );
  }

  return (
    <Section role="contentinfo" padding={6} xstyle={styles.siteFooter}>
      <VStack gap={4}>
        <Grid columns={5} align="center">
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

        <Divider />

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
      </VStack>
    </Section>
  );
}
