import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSTheme} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme/default';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core';

const styles = stylex.create({
  main: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
  },
  container: {
    maxWidth: 640,
    width: '100%',
  },
});

export default function App() {
  const [email, setEmail] = useState('');

  return (
    <XDSTheme theme={defaultTheme}>
      <main {...stylex.props(styles.main)}>
        <div {...stylex.props(styles.container)}>
          <XDSVStack gap="space6">
            <XDSVStack gap="space2">
              <XDSHeading level={1}>XDS Example — Vite</XDSHeading>
              <XDSText type="body" color="secondary">
                This is a reference example for consuming{' '}
                <XDSText type="body" weight="bold">
                  @xds/core
                </XDSText>{' '}
                as a source distribution in a Vite + React application. StyleX
                compilation and CSS extraction are handled by{' '}
                <XDSText type="body" weight="bold">
                  @stylexjs/unplugin
                </XDSText>{' '}
                — no PostCSS or Babel config needed.
              </XDSText>
            </XDSVStack>

            <XDSDivider />

            {/* Buttons */}
            <XDSVStack gap="space3">
              <XDSHeading level={2}>Buttons</XDSHeading>
              <XDSHStack gap="space3" vAlign="center">
                <XDSButton label="Primary" variant="primary" />
                <XDSButton label="Secondary" variant="secondary" />
                <XDSButton label="Ghost" variant="ghost" />
              </XDSHStack>
            </XDSVStack>

            <XDSDivider />

            {/* Badges */}
            <XDSVStack gap="space3">
              <XDSHeading level={2}>Badges</XDSHeading>
              <XDSHStack gap="space3" vAlign="center">
                <XDSBadge variant="info">Info</XDSBadge>
                <XDSBadge variant="success">Success</XDSBadge>
                <XDSBadge variant="warning">Warning</XDSBadge>
                <XDSBadge variant="error">Error</XDSBadge>
              </XDSHStack>
            </XDSVStack>

            <XDSDivider />

            {/* Text Input */}
            <XDSVStack gap="space3">
              <XDSHeading level={2}>Text Input</XDSHeading>
              <XDSTextInput
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
              />
            </XDSVStack>

            <XDSDivider />

            {/* Typography */}
            <XDSVStack gap="space3">
              <XDSHeading level={2}>Typography</XDSHeading>
              <XDSText type="large" weight="bold">
                Large bold text
              </XDSText>
              <XDSText type="body">Default body text</XDSText>
              <XDSText type="supporting" color="secondary">
                Supporting text in secondary color
              </XDSText>
            </XDSVStack>
          </XDSVStack>
        </div>
      </main>
    </XDSTheme>
  );
}
