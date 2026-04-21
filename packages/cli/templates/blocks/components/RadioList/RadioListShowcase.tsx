import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';

export default function RadioListShowcase() {
  return (
    <XDSRadioList label="Notification preference" value="" onChange={() => {}}>
      <XDSRadioListItem label="Email" value="email" />
      <XDSRadioListItem label="SMS" value="sms" />
      <XDSRadioListItem label="Push notification" value="push" />
    </XDSRadioList>
  );
}
