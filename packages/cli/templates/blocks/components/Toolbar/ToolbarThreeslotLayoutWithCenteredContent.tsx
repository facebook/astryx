'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSToolbar} from '@xds/core/Toolbar';

export default function ToolbarThreeslotLayoutWithCenteredContent() {
  return (
    <XDSToolbar
      label="Document actions"
      startContent={<XDSButton label="Back" variant="ghost" />}
      centerContent={<XDSText type="body">Document Title</XDSText>}
      endContent={<XDSButton label="Save" variant="primary" />}
    />
  );
}
