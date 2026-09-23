// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {
  colorVars,
  radiusVars,
  borderVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  logFrame: {
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-muted'],
  },
});

const LOG_LINES = [
  '09:41:02  resolving 214 workspace packages from pnpm-lock.yaml (frozen)',
  '09:41:08  restored build cache from ci/web-checkout/node-24 (86% hit, 1.2 GB)',
  '09:41:31  typecheck packages/web-checkout ......................... 0 errors',
  '09:41:52  typecheck services/pricing ................................ 0 errors',
  '09:42:14  bundle web/checkout → dist/assets/checkout.9f3c17ab.js  1.84 MB (gzip 412 kB)',
  '09:42:15  warning: "@internal/legacy-address" is deprecated, use "@internal/address" instead',
  '09:42:40  unit tests 1,284 passed, 3 skipped, 0 failed in 1m 30s',
  '09:43:06  visual tests 96 passed, 2 snapshots updated (checkout-summary, tax-row)',
  '09:43:44  uploading 18 artifacts to releases/web-checkout/2026.3.18-rc4',
  '09:44:01  promoting 2026.3.18-rc4 to the staging fleet (12 instances, rolling)',
  '09:44:58  health checks green on 12/12 instances, p95 latency 142 ms',
  '09:45:14  done in 4m 12s',
];

const STEPS = [
  {name: 'Install', detail: '38s', state: 'Complete', variant: 'success'},
  {name: 'Typecheck', detail: '44s', state: 'Complete', variant: 'success'},
  {name: 'Bundle', detail: '1m 02s', state: 'Complete', variant: 'success'},
  {name: 'Tests', detail: '1m 30s', state: 'Complete', variant: 'success'},
  {
    name: 'Promote to staging',
    detail: '18s',
    state: 'Complete',
    variant: 'success',
  },
  {
    name: 'Promote to production',
    detail: 'Waiting for approval',
    state: 'Blocked',
    variant: 'warning',
  },
] as const;

export default function ScrollableAreaNestedLog() {
  return (
    <Card width={440} padding={0}>
      <VStack>
        <VStack gap={0.5} padding={4} paddingBlockEnd={3}>
          <Heading level={3}>Deploy 2026.3.18-rc4</Heading>
          <Text type="supporting">web/checkout · staging · 4m 12s</Text>
        </VStack>
        <ScrollableArea
          axis="block"
          role="region"
          label="Deploy details"
          height={320}
          paddingInline={4}
          paddingBlockEnd={4}>
          <VStack gap={4}>
            <MetadataList orientation="horizontal">
              <MetadataListItem label="Triggered by">
                Ines Okafor
              </MetadataListItem>
              <MetadataListItem label="Commit">a71f3c9</MetadataListItem>
              <MetadataListItem label="Started">9:41 AM</MetadataListItem>
            </MetadataList>

            <VStack gap={2}>
              <Text type="label">Build log</Text>
              <ScrollableArea
                axis="both"
                label="Build log"
                overscroll="contain"
                height={150}
                padding={3}
                xstyle={styles.logFrame}>
                <VStack gap={0.5}>
                  {LOG_LINES.map(line => (
                    <Text key={line} type="code" size="2xs" textWrap="nowrap">
                      {line}
                    </Text>
                  ))}
                </VStack>
              </ScrollableArea>
              <Text type="supporting">
                The log keeps its own scroll: reaching either end stops there
                instead of carrying on down the panel.
              </Text>
            </VStack>

            <VStack gap={2}>
              <Text type="label">Steps</Text>
              <VStack gap={1.5}>
                {STEPS.map(step => (
                  <HStack key={step.name} gap={2} vAlign="center">
                    <StatusDot
                      variant={step.variant}
                      label={`${step.name}: ${step.state}`}
                    />
                    <Text>{step.name}</Text>
                    <Text type="supporting">{step.detail}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </VStack>
        </ScrollableArea>
      </VStack>
    </Card>
  );
}
