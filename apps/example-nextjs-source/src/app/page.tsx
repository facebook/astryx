'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
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
  card: {
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    padding: '1rem',
    backgroundColor: 'var(--color-background-body)',
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
});

export default function Home() {
  const [email, setEmail] = useState('');

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
              from raw TypeScript + StyleX source. Both XDS component styles and
              product styles are compiled together at build time — fully
              tree-shaken, zero unused CSS.
            </XDSText>
          </XDSVStack>

          <XDSDivider />

          {/* Layer Demo */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Layer Demo</XDSHeading>
            <XDSText type="body" color="secondary">
              Product StyleX styles override XDS component defaults via CSS
              layer ordering. No <code>!important</code> needed — the{' '}
              <code>product</code> layer sits above <code>xds-base</code> in the
              cascade.
            </XDSText>

            <div {...stylex.props(styles.layerDemo)}>
              <XDSVStack gap={3}>
                <XDSVStack gap={1}>
                  <XDSText type="supporting" weight="bold">
                    Default XDS buttons (xds-base layer)
                  </XDSText>
                  <XDSHStack gap={3} vAlign="center">
                    <XDSButton label="Default" variant="primary" />
                    <XDSButton label="Default" variant="secondary" />
                  </XDSHStack>
                </XDSVStack>

                <XDSVStack gap={1}>
                  <XDSText type="supporting" weight="bold">
                    Product-styled buttons (product layer overrides)
                  </XDSText>
                  <XDSHStack gap={3} vAlign="center">
                    <XDSButton
                      label="Pill shape"
                      variant="primary"
                      xstyle={styles.customButton}
                    />
                    <XDSButton
                      label="Pill shape"
                      variant="secondary"
                      xstyle={styles.customButton}
                    />
                  </XDSHStack>
                </XDSVStack>

                <XDSVStack gap={1}>
                  <XDSText type="supporting" weight="bold">
                    Three-layer cascade: base → theme → product
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    The secondary button's background goes through three layers:
                    XDS base sets the default, the theme overrides it with a
                    brand tint, and product code overrides again with green.
                  </XDSText>
                  <XDSHStack gap={3} vAlign="center">
                    <XDSButton label="Theme color" variant="secondary" />
                    <XDSButton
                      label="Product override"
                      variant="secondary"
                      xstyle={styles.brandSecondary}
                    />
                  </XDSHStack>
                </XDSVStack>

                <XDSVStack gap={1}>
                  <XDSText type="supporting" weight="bold">
                    Full-width product override
                  </XDSText>
                  <XDSButton
                    label="Full width button"
                    variant="primary"
                    xstyle={styles.wideButton}
                  />
                </XDSVStack>
              </XDSVStack>
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* Standard components */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Components</XDSHeading>
            <XDSHStack gap={3} vAlign="center">
              <XDSButton label="Primary" variant="primary" />
              <XDSButton label="Secondary" variant="secondary" />
              <XDSButton label="Ghost" variant="ghost" />
            </XDSHStack>
          </XDSVStack>

          <XDSDivider />

          <XDSVStack gap={3}>
            <XDSHeading level={2}>Badges</XDSHeading>
            <XDSHStack gap={3} vAlign="center">
              <XDSBadge variant="info" label="Info" />
              <XDSBadge variant="success" label="Success" />
              <XDSBadge variant="warning" label="Warning" />
              <XDSBadge variant="error" label="Error" />
            </XDSHStack>
          </XDSVStack>

          <XDSDivider />

          <XDSVStack gap={3}>
            <XDSHeading level={2}>Text Input</XDSHeading>
            <XDSTextInput
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
            />
          </XDSVStack>

          <XDSDivider />

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

          <XDSVStack gap={3}>
            <XDSHeading level={2}>Source Build</XDSHeading>
            <div {...stylex.props(styles.card)}>
              <XDSText type="body">
                Open devtools → inspect the CSS. You'll see separate{' '}
                <code>@layer xds-base</code> and <code>@layer product</code>{' '}
                blocks. The layer order{' '}
                <code>reset &lt; xds-base &lt; xds-theme &lt; product</code>{' '}
                ensures product styles always win without specificity hacks.
              </XDSText>
            </div>
          </XDSVStack>
        </XDSVStack>
      </div>
    </main>
  );
}
