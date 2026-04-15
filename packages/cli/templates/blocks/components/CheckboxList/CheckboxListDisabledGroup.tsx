'use client';

import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

export default function CheckboxListDisabledGroup() {
  return (
    <XDSCheckboxList
      label="Locked selections"
      value={['email']}
      onChange={() => {}}
      isDisabled>
      <XDSCheckboxListItem label="Email" value="email" />
      <XDSCheckboxListItem label="SMS" value="sms" />
    </XDSCheckboxList>
  );
}
