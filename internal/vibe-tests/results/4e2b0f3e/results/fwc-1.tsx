// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';

export default function TrialExpirationBanner({daysLeft}: {daysLeft: number}) {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <Banner
        status="warning"
        title={`Your trial expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
        description="Upgrade now to keep access to all features."
        endContent={<Button label="Upgrade" variant="primary" />}
        isDismissable
      />
    </div>
  );
}
