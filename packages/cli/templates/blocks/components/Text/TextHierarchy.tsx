'use client';

import {XDSText} from '@xds/core/Text';

export default function TextHierarchy() {
  return (
    <div
      style={{
        maxWidth: 300,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
      <div>
        <XDSText type="label" display="block">
          Section title as label
        </XDSText>
        <XDSText type="body" display="block">
          Body text provides the main content or instructions for this section.
        </XDSText>
        <XDSText type="supporting" display="block">
          Supporting text adds extra context or constraints.
        </XDSText>
      </div>
      <div>
        <XDSText type="label" display="block">
          Another section
        </XDSText>
        <XDSText type="body" display="block">
          These text types create a natural visual hierarchy without any
          additional styling.
        </XDSText>
        <XDSText type="supporting" color="active" display="block">
          Active supporting text draws attention to important details.
        </XDSText>
      </div>
    </div>
  );
}
