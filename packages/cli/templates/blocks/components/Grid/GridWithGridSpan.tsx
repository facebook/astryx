// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Grid, GridSpan} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

export default function GridWithGridSpan() {
  return (
    <Grid columns={3} gap={4} width="100%" style={{maxWidth: 500}}>
      <GridSpan rows={2}>
        <Card variant="cyan">
          <VStack gap={1}>
            <Text type="label" display="block">
              Featured Release
            </Text>
            <Text type="supporting" display="block">
              XDS 4.0 is now available with new layout primitives, refreshed
              tokens, and improved theming support across the system.
            </Text>
          </VStack>
        </Card>
      </GridSpan>
      <Card>
        <Text type="label" display="block">
          Components
        </Text>
        <Text type="supporting" display="block">
          54 available
        </Text>
      </Card>
      <Card>
        <Text type="label" display="block">
          Templates
        </Text>
        <Text type="supporting" display="block">
          28 available
        </Text>
      </Card>
      <Card>
        <Text type="label" display="block">
          Tokens
        </Text>
        <Text type="supporting" display="block">
          120 defined
        </Text>
      </Card>
      <Card>
        <Text type="label" display="block">
          Themes
        </Text>
        <Text type="supporting" display="block">
          6 published
        </Text>
      </Card>
      <Card>
        <Text type="label" display="block">
          Icons
        </Text>
        <Text type="supporting" display="block">
          312 available
        </Text>
      </Card>
      <Card>
        <Text type="label" display="block">
          Patterns
        </Text>
        <Text type="supporting" display="block">
          18 documented
        </Text>
      </Card>
      <Card>
        <Text type="label" display="block">
          Contributors
        </Text>
        <Text type="supporting" display="block">
          42 active
        </Text>
      </Card>
      <GridSpan columns="full">
        <Card variant="cyan">
          <VStack gap={1}>
            <Text type="label" display="block">
              Community Showcase
            </Text>
            <Text type="supporting" display="block">
              See how teams are building with XDS across the organization
            </Text>
          </VStack>
        </Card>
      </GridSpan>
    </Grid>
  );
}
