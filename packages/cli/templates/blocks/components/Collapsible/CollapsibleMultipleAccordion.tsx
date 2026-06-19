// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Collapsible, CollapsibleGroup} from '@xds/core/Collapsible';
import {Card} from '@xds/core/Card';
import {Text} from '@xds/core/Text';
import {VStack} from '@xds/core/Layout';

export default function CollapsibleMultipleAccordion() {
  return (
    <CollapsibleGroup type="multiple" defaultValue={['features', 'pricing']}>
      <VStack gap={2} style={{width: '100%', maxWidth: 400}}>
        <Card>
          <Collapsible trigger="Features" value="features">
            <Text type="body">
              Includes real-time collaboration, version history, and granular
              permissions for teams of any size.
            </Text>
          </Collapsible>
        </Card>
        <Card>
          <Collapsible trigger="Pricing" value="pricing">
            <Text type="body">
              Free for up to 5 users. Pro plans start at $12/user/month with
              annual billing.
            </Text>
          </Collapsible>
        </Card>
        <Card>
          <Collapsible trigger="Integrations" value="integrations">
            <Text type="body">
              Connect with Slack, GitHub, Jira, and 40+ other tools through our
              REST API and pre-built connectors.
            </Text>
          </Collapsible>
        </Card>
      </VStack>
    </CollapsibleGroup>
  );
}
