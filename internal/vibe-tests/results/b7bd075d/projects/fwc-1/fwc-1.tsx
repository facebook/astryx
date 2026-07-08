// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {AlertTriangle} from 'lucide-react';

export default function TrialExpirationBanner({daysLeft = 7}: {daysLeft?: number}) {
  return (
    <Alert variant="warning" className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5" />
        <div>
          <AlertTitle>Your trial expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</AlertTitle>
          <AlertDescription>Upgrade now to keep access to all features.</AlertDescription>
        </div>
      </div>
      <Button size="sm">Upgrade</Button>
    </Alert>
  );
}
