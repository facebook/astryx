// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSButton} from '@xds/core/Button';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {GITHUB_REPO} from '../constants';
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

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <XDSSection role="contentinfo" padding={4}>
      <XDSVStack gap={4}>
        <XDSGrid columns={5} xstyle={styles.footerLinks} align="center">
          <AstryxLogo
            role="img"
            aria-label="Astryx"
            {...stylex.props(styles.logo)}
          />
          <XDSGridSpan columns={3}>
            <XDSHStack gap={4} align="center" hAlign="center">
              {FOOTER_LINKS.map(item => (
                <XDSLink
                  key={item.label}
                  href={item.href}
                  type="supporting"
                  color="secondary"
                  isStandalone
                  target={item.isExternal ? '_blank' : undefined}>
                  {item.label}
                </XDSLink>
              ))}
            </XDSHStack>
          </XDSGridSpan>
          <XDSHStack gap={2} align="center" justify="end">
            {SOCIAL_LINKS.map(social => (
              <XDSButton
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
          </XDSHStack>
        </XDSGrid>

        <XDSCard variant="muted">
          <XDSGrid columns={4} align="center">
            <XDSLink
              href="https://opensource.fb.com"
              label="Meta Open Source"
              target="_blank">
              <MetaOpenSourceLogo
                aria-hidden="true"
                {...stylex.props(styles.metaOpenSourceLogo)}
              />
            </XDSLink>
            <XDSGridSpan columns={2}>
              <XDSHStack gap={4} align="center" hAlign="center" width="100%">
                {LEGAL_LINKS.map(link => (
                  <XDSLink
                    key={link.label}
                    href={link.href}
                    type="supporting"
                    color="secondary"
                    isStandalone
                    target="_blank">
                    {link.label}
                  </XDSLink>
                ))}
              </XDSHStack>
            </XDSGridSpan>
            <XDSText type="supporting" color="secondary" justify="end">
              &copy; {year} Meta Platforms, Inc.
            </XDSText>
          </XDSGrid>
        </XDSCard>
      </XDSVStack>
    </XDSSection>
  );
}
