'use client';

import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

export default function CheckboxListShowcase() {
  return (
    <XDSCheckboxList label="Notification preferences" value={[]} onChange={() => {}}>
      <XDSCheckboxListItem label="Email" value="email" />
      <XDSCheckboxListItem label="SMS" value="sms" />
      <XDSCheckboxListItem label="Push notification" value="push" />
    </XDSCheckboxList>
  );
}
