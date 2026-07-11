// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';

export default function BrandThemeDemo() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Custom Brand Theme</h2>
        <p className="text-muted-foreground">Primary accent: #7B61FF (purple), dark surface background</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button>Primary Action</Button>
            <Button variant="outline">Secondary Action</Button>
            <Button variant="ghost">Ghost Action</Button>
          </div>
          <div className="flex gap-2">
            <Badge>Accent Badge</Badge>
            <Badge variant="secondary">Neutral Badge</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            The accent color flows through all interactive elements via CSS custom properties.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
