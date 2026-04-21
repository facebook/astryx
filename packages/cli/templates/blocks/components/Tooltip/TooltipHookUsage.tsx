'use client';

import {useXDSTooltip} from '@xds/core/Tooltip';
import {XDSButton} from '@xds/core/Button';

export default function TooltipHookUsage() {
  const tooltip = useXDSTooltip({
    placement: 'above',
    delay: 100,
  });

  return (
    <>
      <XDSButton
        label="Using hook directly"
        ref={tooltip.ref}
        aria-describedby={tooltip.describedBy}
      />
      {tooltip.renderTooltip('Tooltip via hook')}
    </>
  );
}
