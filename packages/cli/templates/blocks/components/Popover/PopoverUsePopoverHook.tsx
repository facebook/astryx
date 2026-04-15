'use client';

import {useXDSPopover} from '@xds/core/Popover';

function CalendarContent() {
  return (
    <div style={{padding: 16}}>
      <p>Calendar picker content</p>
    </div>
  );
}

export default function PopoverUsePopoverHook() {
  const popover = useXDSPopover({
    closeButtonLabel: 'Close calendar',
  });

  return (
    <>
      <button
        ref={popover.triggerRef}
        onClick={popover.toggle}
        {...popover.triggerProps}>
        Open Calendar
      </button>
      {popover.render(<CalendarContent />, {
        placement: 'below',
        alignment: 'start',
      })}
    </>
  );
}
