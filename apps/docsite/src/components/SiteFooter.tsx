// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Fragment} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {spacingVars} from '@xds/core/theme/tokens.stylex';

// Cream background to match the brand footer treatment in the design.
// Not a token yet — kept inline here until a brand surface token lands.
const CREAM_BACKGROUND = '#F7F2EA';

const styles = stylex.create({
  footer: {
    backgroundColor: CREAM_BACKGROUND,
    paddingBlockStart: spacingVars['--spacing-6'],
    paddingBlockEnd: spacingVars['--spacing-6'],
    paddingInlineStart: spacingVars['--spacing-4'],
    paddingInlineEnd: spacingVars['--spacing-4'],
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: spacingVars['--spacing-3'],
    rowGap: spacingVars['--spacing-2'],
  },
  separator: {
    userSelect: 'none',
  },
});

const links = [
  {
    label: 'GitHub Pages',
    href: 'https://studious-broccoli-o7e61n3.pages.github.io/',
  },
  {
    label: 'Terms of Use',
    href: 'https://opensource.fb.com/legal/terms',
  },
  {
    label: 'Privacy Policy',
    href: 'https://opensource.fb.com/legal/privacy',
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer {...stylex.props(styles.footer)}>
      <XDSText type="supporting" color="primary">
        Copyright © {year} Meta Platforms Inc.
      </XDSText>
      {links.map(link => (
        <Fragment key={link.href}>
          <XDSText
            type="supporting"
            color="disabled"
            xstyle={styles.separator}
            aria-hidden="true">
            |
          </XDSText>
          <XDSText type="supporting" color="primary">
            <XDSLink color="primary" label={link.label} href={link.href}>
              {link.label}
            </XDSLink>
          </XDSText>
        </Fragment>
      ))}
    </footer>
  );
}
