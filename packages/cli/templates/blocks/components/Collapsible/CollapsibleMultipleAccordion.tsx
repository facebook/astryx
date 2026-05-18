// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

export default function CollapsibleMultipleAccordion() {
  return (
    <XDSCollapsibleGroup type="multiple" defaultValue={['features', 'pricing']}>
      <XDSVStack gap={2} style={{width: '100%', maxWidth: 400}}>
        <XDSCard>
          <XDSCollapsible trigger="Features" value="features">
            <XDSText type="body">
              Includes real-time collaboration, version history, and granular
              permissions for teams of any size.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Pricing" value="pricing">
            <XDSText type="body">
              Free for up to 5 users. Pro plans start at $12/user/month with
              annual billing.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Integrations" value="integrations">
            <XDSText type="body">
              Connect with Slack, GitHub, Jira, and 40+ other tools through our
              REST API and pre-built connectors.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  );
}
