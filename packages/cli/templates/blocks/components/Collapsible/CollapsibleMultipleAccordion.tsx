'use client';

import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';

export default function CollapsibleMultipleAccordion() {
  return (
    <XDSCollapsibleGroup type="multiple" defaultValue={['faq1', 'faq3']}>
      <XDSVStack gap={2}>
        <XDSCard>
          <XDSCollapsible trigger="What is XDS?" value="faq1">
            <p style={{margin: 0}}>
              XDS is a design system for building internal tools and products.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="How do I install it?" value="faq2">
            <p style={{margin: 0}}>
              Run <code>npm install @xds/core</code> to get started.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Is it open source?" value="faq3">
            <p style={{margin: 0}}>
              Yes! XDS is open source and available on GitHub.
            </p>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  );
}
