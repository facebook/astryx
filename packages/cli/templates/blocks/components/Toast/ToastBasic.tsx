'use client';

import {XDSButton} from '@xds/core/Button';
import {useXDSToast} from '@xds/core/Toast';

export default function ToastBasic() {
  const toast = useXDSToast();

  return (
    <XDSButton
      label="Show toast"
      variant="primary"
      onClick={() => toast({body: 'Changes saved'})}
    />
  );
}

export const showcase = {
  aspectRatio: 1,
  render: ToastBasic,
};
