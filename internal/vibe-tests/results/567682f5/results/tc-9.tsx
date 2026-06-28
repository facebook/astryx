// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';

function ThemeDemo({themeName, colors}: {themeName: string; colors: Record<string, string>}) {
  return (
    <div style={{'--theme-primary': colors.primary, '--theme-bg': colors.surface} as React.CSSProperties}>
      <Card className="border-2" style={{borderColor: colors.border, backgroundColor: colors.surface}}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle style={{color: colors.text}}>{themeName} Theme</CardTitle>
            <Badge style={{backgroundColor: colors.primary, color: '#fff'}}>Preview</Badge>
          </div>
          <p className="text-sm" style={{color: colors.textSecondary}}>
            This card demonstrates the {themeName.toLowerCase()} color palette with shared spacing and typography.
          </p>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button style={{backgroundColor: colors.primary, color: '#fff'}}>Primary Action</Button>
          <Button variant="outline" style={{borderColor: colors.border, color: colors.text}}>Secondary</Button>
          <Button variant="ghost" style={{color: colors.text}}>Ghost</Button>
        </CardContent>
      </Card>
    </div>
  );
}

const oceanColors = {primary: '#0077B6', surface: '#F0F8FF', text: '#1B3A4B', textSecondary: '#4A7C8E', border: '#B8D4E3'};
const sunsetColors = {primary: '#E85D04', surface: '#FFF8F0', text: '#3D1F00', textSecondary: '#8B5E3C', border: '#F0C8A0'};

export default function CustomThemesDemo() {
  return (
    <div className="space-y-8 p-8 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Custom Themes</h1>
        <p className="text-muted-foreground">Two themes sharing spacing and typography but with distinct color palettes.</p>
      </div>
      <ThemeDemo themeName="Ocean" colors={oceanColors} />
      <ThemeDemo themeName="Sunset" colors={sunsetColors} />
    </div>
  );
}
