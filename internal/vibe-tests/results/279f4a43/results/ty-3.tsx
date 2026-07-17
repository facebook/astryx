// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent} from '../components/ui/card';

export default function MetricsCard() {
  return (
    <Card className="max-w-xs">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
        <p className="text-3xl font-bold mt-1">$12,340.56</p>
        <p className="text-sm text-green-600 mt-1">+12% from last month</p>
      </CardContent>
    </Card>
  );
}
