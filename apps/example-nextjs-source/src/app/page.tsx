'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core';
import {XDSCard} from '@xds/core/Card';
import {XDSSwitch} from '@xds/core/Switch';

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
  layerDemo: {
    padding: '1.5rem',
    borderRadius: 12,
    backgroundColor: 'var(--color-background-secondary)',
  },
  customButton: {
    borderRadius: 999,
  },
  wideButton: {
    width: '100%',
  },
  brandSecondary: {
    backgroundColor: 'mediumseagreen',
    color: 'white',
  },
  card: {
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    padding: '1rem',
    backgroundColor: 'var(--color-background-body)',
  },
  prefixDemo: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    padding: '0.5rem',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 6,
    overflowX: 'auto',
  },
});

export default function Home() {
  const [email, setEmail] = useState('');
  const [toggle, setToggle] = useState(false);

  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.container)}>
        <XDSVStack gap={6}>
          <XDSVStack gap={2}>
            <XDSHeading level={1}>XDS + Next.js (Source Build)</XDSHeading>
            <XDSText type="body" color="secondary">
              This example compiles{' '}
              <XDSText type="body" weight="bold">
                @xds/core
              </XDSText>{' '}
              from raw TypeScript + StyleX source. The{' '}
              <XDSText type="body" weight="bold">
                @xds/build
              </XDSText>{' '}
              package provides a babel plugin and PostCSS plugin that compile
              library and product code with separate class name prefixes,
              enabling independent CSS layers.
            </XDSText>
          </XDSVStack>

          <XDSDivider />

          {/* Layer Demo */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Layer Demo</XDSHeading>
            <XDSText type="body" color="secondary">
              Four CSS layers in strict order. Product styles override theme,
              theme overrides base, all without <code>!important</code>.
            </XDSText>

            <div {...stylex.props(styles.layerDemo)}>
              <XDSVStack gap={4}>
                {/* Base layer */}
                <XDSVStack gap={1}>
                  <XDSText type="supporting" weight="bold">
                    1. xds-base — default component styles
                  </XDSText>
                  <XDSHStack gap={3} vAlign="center">
                    <XDSButton label="Primary" variant="primary" />
                    <XDSButton label="Secondary" variant="secondary" />
                    <XDSButton label="Ghost" variant="ghost" />
                  </XDSHStack>
                </XDSVStack>

                {/* Theme layer */}
                <XDSVStack gap={1}>
                  <XDSText type="supporting" weight="bold">
                    2. xds-theme — theme overrides base
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    The secondary button background comes from the theme layer,
                    overriding the base default.
                  </XDSText>
                  <XDSHStack gap={3} vAlign="center">
                    <XDSButton label="Theme color" variant="secondary" />
                    <XDSBadge variant="info" label="Themed" />
                    <XDSBadge variant="success" label="Themed" />
                  </XDSHStack>
                </XDSVStack>

                {/* Product layer overrides */}
                <XDSVStack gap={1}>
                  <XDSText type="supporting" weight="bold">
                    3. product — product overrides theme
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    Product styles use a different class prefix (x vs xds) so
                    they don't collide with library classes in the base layer.
                  </XDSText>
                  <XDSHStack gap={3} vAlign="center">
                    <XDSButton
                      label="Pill shape"
                      variant="primary"
                      xstyle={styles.customButton}
                    />
                    <XDSButton
                      label="Green override"
                      variant="secondary"
                      xstyle={styles.brandSecondary}
                    />
                  </XDSHStack>
                </XDSVStack>

                {/* Full width */}
                <XDSButton
                  label="Full width product override"
                  variant="primary"
                  xstyle={styles.wideButton}
                />
              </XDSVStack>
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* Class prefix verification */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Class Prefix Verification</XDSHeading>
            <XDSText type="body" color="secondary">
              Inspect these elements in devtools. XDS library classes start with{' '}
              <code>xds</code>, product classes start with <code>x</code>.
            </XDSText>
            <XDSCard padding={4}>
              <XDSVStack gap={2}>
                <XDSText type="supporting" weight="bold">
                  This card is an XDS component → xds-prefixed classes
                </XDSText>
                <div {...stylex.props(styles.prefixDemo)}>
                  This div uses product StyleX → x-prefixed classes
                </div>
              </XDSVStack>
            </XDSCard>
          </XDSVStack>

          <XDSDivider />

          {/* Form components */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Form Components</XDSHeading>
            <XDSTextInput
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
            />
            <XDSSwitch
              label="Enable notifications"
              value={toggle}
              onChange={(checked) => setToggle(checked)}
            />
          </XDSVStack>

          <XDSDivider />

          {/* Typography */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Typography</XDSHeading>
            <XDSText type="large" weight="bold">
              Large bold text
            </XDSText>
            <XDSText type="body">Default body text</XDSText>
            <XDSText type="supporting" color="secondary">
              Supporting text in secondary color
            </XDSText>
          </XDSVStack>

          <XDSDivider />

          {/* How it works */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>How It Works</XDSHeading>
            <div {...stylex.props(styles.card)}>
              <XDSVStack gap={2}>
                <XDSText type="body">
                  <code>@xds/build/babel</code> wraps the StyleX babel plugin
                  and routes files to two internal instances with different{' '}
                  <code>classNamePrefix</code> values based on file path.
                </XDSText>
                <XDSText type="body">
                  <code>@xds/build/postcss</code> does the same for CSS
                  extraction, placing each group in its own <code>@layer</code>{' '}
                  block.
                </XDSText>
                <XDSText type="body">
                  Open devtools → CSS layers panel to see:{' '}
                  <code>reset &lt; xds-base &lt; xds-theme &lt; product</code>
                </XDSText>
              </XDSVStack>
            </div>
          </XDSVStack>
        </XDSVStack>
      </div>
    </main>
  );
}
