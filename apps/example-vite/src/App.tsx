// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Text, Heading} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';

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
});

export default function App() {
  const [email, setEmail] = useState('');

  return (
    <Theme theme={neutralTheme}>
      <main {...stylex.props(styles.main)}>
        <div {...stylex.props(styles.container)}>
          <VStack gap={6}>
            <VStack gap={2}>
              <Heading level={1}>XDS Example — Vite (Source)</Heading>
              <Text type="body" color="secondary">
                This example compiles{' '}
                <Text type="body" weight="bold">
                  @astryxdesign/core
                </Text>{' '}
                from source with split CSS layers via a Vite middleware that
                intercepts StyleX output.
              </Text>
            </VStack>

            <Divider />

            {/* Layer Demo */}
            <VStack gap={3}>
              <Heading level={2}>Layer Demo</Heading>
              <Text type="body" color="secondary">
                Product StyleX styles override XDS component defaults via CSS
                layer ordering. No <code>!important</code> needed.
              </Text>

              <div {...stylex.props(styles.layerDemo)}>
                <VStack gap={3}>
                  <VStack gap={1}>
                    <Text type="supporting" weight="bold">
                      Default XDS buttons (astryx-base layer)
                    </Text>
                    <HStack gap={3} vAlign="center">
                      <Button label="Default" variant="primary" />
                      <Button label="Default" variant="secondary" />
                    </HStack>
                  </VStack>

                  <VStack gap={1}>
                    <Text type="supporting" weight="bold">
                      Product-styled buttons (product layer overrides)
                    </Text>
                    <HStack gap={3} vAlign="center">
                      <Button
                        label="Pill shape"
                        variant="primary"
                        xstyle={styles.customButton}
                      />
                      <Button
                        label="Pill shape"
                        variant="secondary"
                        xstyle={styles.customButton}
                      />
                    </HStack>
                  </VStack>

                  <VStack gap={1}>
                    <Text type="supporting" weight="bold">
                      Three-layer cascade: base → theme → product
                    </Text>
                    <Text type="supporting" color="secondary">
                      Secondary button background: XDS base → theme override →
                      green product override.
                    </Text>
                    <HStack gap={3} vAlign="center">
                      <Button label="Theme color" variant="secondary" />
                      <Button
                        label="Product override"
                        variant="secondary"
                        xstyle={styles.brandSecondary}
                      />
                    </HStack>
                  </VStack>

                  <VStack gap={1}>
                    <Text type="supporting" weight="bold">
                      Full-width product override
                    </Text>
                    <Button
                      label="Full width button"
                      variant="primary"
                      xstyle={styles.wideButton}
                    />
                  </VStack>
                </VStack>
              </div>
            </VStack>

            <Divider />

            <VStack gap={3}>
              <Heading level={2}>Components</Heading>
              <HStack gap={3} vAlign="center">
                <Button label="Primary" variant="primary" />
                <Button label="Secondary" variant="secondary" />
                <Button label="Ghost" variant="ghost" />
              </HStack>
            </VStack>

            <Divider />

            <VStack gap={3}>
              <Heading level={2}>Badges</Heading>
              <HStack gap={3} vAlign="center">
                <Badge variant="info" label="Info" />
                <Badge variant="success" label="Success" />
                <Badge variant="warning" label="Warning" />
                <Badge variant="error" label="Error" />
              </HStack>
            </VStack>

            <Divider />

            <VStack gap={3}>
              <Heading level={2}>Text Input</Heading>
              <TextInput
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
              />
            </VStack>

            <Divider />

            <VStack gap={3}>
              <Heading level={2}>Source Build</Heading>
              <div {...stylex.props(styles.card)}>
                <Text type="body">
                  Open devtools → inspect the CSS layers panel. You'll see{' '}
                  <code>@layer astryx-base</code> and <code>@layer product</code>.
                  The layer order{' '}
                  <code>reset &lt; astryx-base &lt; astryx-theme &lt; product</code>{' '}
                  ensures product styles always win.
                </Text>
              </div>
            </VStack>

            <Divider />

            <VStack gap={3}>
              <Heading level={2}>Typography</Heading>
              <Text type="large" weight="bold">
                Large bold text
              </Text>
              <Text type="body">Default body text</Text>
              <Text type="supporting" color="secondary">
                Supporting text in secondary color
              </Text>
            </VStack>
          </VStack>
        </div>
      </main>
    </Theme>
  );
}
