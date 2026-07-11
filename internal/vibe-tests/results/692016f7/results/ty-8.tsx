// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Card, CardContent } from './components/ui/card';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';

export default function ProfileCard() {
  return (
    <Card className="max-w-sm mx-auto text-center">
      <CardContent className="pt-6 space-y-4">
        <Avatar className="w-20 h-20 mx-auto">
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold">Sarah Chen</h2>
        <Badge variant="secondary">Senior Engineer</Badge>
        <p className="text-sm text-muted-foreground">
          Passionate about building accessible, performant UI systems.
          Working on design tools and component libraries for the past 5 years.
        </p>
        <Separator />
        <p className="text-xs text-muted-foreground">Joined March 2021</p>
      </CardContent>
    </Card>
  );
}
