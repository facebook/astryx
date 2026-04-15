'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSTooltip, useXDSTooltip} from '@xds/core/Tooltip';

export default function TooltipUseXDSTooltipHook() {
  const tooltip = useXDSTooltip({ placement: 'above' });
  

  return (
    <>
      <XDSButton label="Hover me" ref={tooltip.ref} aria-describedby={tooltip.describedBy} />
      {tooltip.renderTooltip('Helpful tooltip text')}
    </>
  );
}
