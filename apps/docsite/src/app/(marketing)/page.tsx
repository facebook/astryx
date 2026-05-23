import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSSection} from '@xds/core/Section';
import {XDSMediaTheme} from '@xds/core/theme';

const styles = stylex.create({
  hero: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: 48,
  },
  subtitle: {
    maxWidth: 560,
    marginTop: 8,
  },
  buttons: {
    marginTop: 32,
    display: 'flex',
    gap: 12,
  },
});

export default function HomePage() {
  return (
    <div {...stylex.props(styles.hero)}>
      <XDSMediaTheme mode="light">
        <XDSVStack gap={2} style={{alignItems: 'center'}}>
          <XDSText type="display-1">XDS Open Source</XDSText>
          <XDSText type="large" color="secondary" xstyle={styles.subtitle}>
            An open design system for building internal tools with AI-powered
            development.
          </XDSText>
          <div {...stylex.props(styles.buttons)}>
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
          </div>
        </XDSVStack>
      </XDSMediaTheme>
    </div>
  );
}
