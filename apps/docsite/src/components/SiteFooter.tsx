// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Fragment} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSHStack} from '@xds/core/Stack';
import {XDSDivider} from '@xds/core/Divider';
import {spacingVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  footer: {
    paddingBlock: spacingVars['--spacing-6'],
    paddingInline: spacingVars['--spacing-4'],
  },
});

const links = [
  {
    label: 'Terms of use',
    href: 'https://opensource.fb.com/legal/terms',
  },
  {
    label: 'Privacy policy',
    href: 'https://opensource.fb.com/legal/privacy',
  },
  {
    label: 'GitHub pages',
    href: 'https://studious-broccoli-o7e61n3.pages.github.io/',
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer {...stylex.props(styles.footer)}>
      <XDSHStack gap={3} wrap="wrap" justify="center" align="center">
        <XDSText type="supporting" color="primary">
          Copyright © {year} Meta Platforms Inc.
        </XDSText>
        {links.map(link => (
          <Fragment key={link.href}>
            <XDSDivider
              orientation="vertical"
              variant="strong"
              style={{height: '0.75em'}}
            />
            <XDSLink
              type="supporting"
              color="primary"
              label={link.label}
              href={link.href}>
              {link.label}
            </XDSLink>
          </Fragment>
        ))}
      </XDSHStack>
    </footer>
  );
}
