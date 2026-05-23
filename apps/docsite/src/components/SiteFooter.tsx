// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {spacingVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  divider: {
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

export function SiteFooter() {
  return (
    <>
      <XDSDivider xstyle={styles.divider} />
      <footer {...stylex.props(styles.footer)}>
        <XDSText type="supporting" color="secondary">
          <XDSLink
            color="secondary"
            label="GitHub Pages"
            href="https://studious-broccoli-o7e61n3.pages.github.io/"
            isExternalLink>
            GitHub Pages
          </XDSLink>
          {' | '}
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
    </>
  );
}
