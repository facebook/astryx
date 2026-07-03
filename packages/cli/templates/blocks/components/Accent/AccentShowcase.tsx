// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Accent} from '@astryxdesign/core/theme';
import {Section} from '@astryxdesign/core/Section';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';

export default function AccentShowcase() {
  return (
    <Section
      variant="transparent"
      padding={4}
      style={{width: 360, maxWidth: '100%'}}>
      <Stack direction="vertical" gap={3}>
        <Stack direction="horizontal" gap={2}>
          <Accent color="#7C3AED">
            <Section variant="muted" padding={3} style={{flex: '1 1 0'}}>
              <Stack direction="vertical" gap={2} hAlign="start">
                <Text type="label" color="accent">
                  Violet
                </Text>
                <Button label="Action" variant="primary" size="sm" />
              </Stack>
            </Section>
          </Accent>
          <Accent color="#0E7490">
            <Section variant="muted" padding={3} style={{flex: '1 1 0'}}>
              <Stack direction="vertical" gap={2} hAlign="start">
                <Text type="label" color="accent">
                  Teal
                </Text>
                <Button label="Action" variant="primary" size="sm" />
              </Stack>
            </Section>
          </Accent>
          <Accent color="#B45309">
            <Section variant="muted" padding={3} style={{flex: '1 1 0'}}>
              <Stack direction="vertical" gap={2} hAlign="start">
                <Text type="label" color="accent">
                  Amber
                </Text>
                <Button label="Action" variant="primary" size="sm" />
              </Stack>
            </Section>
          </Accent>
        </Stack>
        <Text type="supporting" color="secondary">
          Each panel re-accents its subtree from a seed color — accent text and
          filled controls derive per-section accent families under one theme.
        </Text>
      </Stack>
    </Section>
  );
}
