'use client';

import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';

export default function RadioListDisabledGroup() {
  return (
    <XDSRadioList
      label="Locked selection"
      value="locked"
      onChange={() => {}}
      isDisabled>
      <XDSRadioListItem label="Locked" value="locked" />
      <XDSRadioListItem label="Unavailable" value="unavailable" />
    </XDSRadioList>
  );
}
