'use client';

import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSVStack} from '@xds/core/Layout';

export default function HoverCardInlineTextHoverCard() {
  return (
    <div style={{padding: 80}}>
      <p>
        The project is maintained by{' '}
        <XDSHoverCard
          content={
            <div style={{width: 200}}>
              <XDSVStack gap={2}>
                <div style={{fontWeight: 600}}>Jane Doe</div>
                <div style={{fontSize: 14, opacity: 0.7}}>
                  Software Engineer
                </div>
                <div style={{fontSize: 13}}>
                  Building great products with great people.
                </div>
              </XDSVStack>
            </div>
          }
          placement="above">
          Jane Doe
        </XDSHoverCard>
        ,{' '}
        <XDSHoverCard
          content={
            <div style={{width: 200}}>
              <XDSVStack gap={2}>
                <div style={{fontWeight: 600}}>John Smith</div>
                <div style={{fontSize: 14, opacity: 0.7}}>Product Manager</div>
              </XDSVStack>
            </div>
          }
          placement="above">
          John Smith
        </XDSHoverCard>
        , and others.
      </p>
    </div>
  );
}
