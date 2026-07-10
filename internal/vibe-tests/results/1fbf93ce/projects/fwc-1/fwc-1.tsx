// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {AlertTriangle} from 'lucide-react';

export default function TrialExpirationBanner({daysLeft}: {daysLeft: number}) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Trial Expiring</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>Your trial expires in {daysLeft} day{daysLeft === 1 ? '' : 's'}. Upgrade to keep access.</span>
        <Button size="sm">Upgrade</Button>
      </AlertDescription>
    </Alert>
  );
}
