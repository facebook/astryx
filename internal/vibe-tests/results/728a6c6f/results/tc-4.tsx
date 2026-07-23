// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

const themes = [
  {name: 'Default', bg: '#ffffff', surface: '#f9fafb', fg: '#111827', accent: '#0066cc'},
  {name: 'Midnight', bg: '#1e1b2e', surface: '#2d2844', fg: '#f0eaff', accent: '#8b5cf6'},
  {name: 'Forest', bg: '#0f1f13', surface: '#1a3320', fg: '#e8f5e9', accent: '#22c55e'},
];

export default function ThemeSwitcher() {
  const [active, setActive] = useState(themes[0]);

  return (
    <div style={{backgroundColor: active.bg, color: active.fg, padding: 24, borderRadius: 12, minHeight: 300}} className="transition-colors duration-300">
      <Card className="w-96" style={{backgroundColor: active.surface, borderColor: active.fg + '20'}}>
        <CardHeader><CardTitle style={{color: active.fg}}>Theme Switcher</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm" style={{color: active.fg + 'cc'}}>Select a theme to preview.</p>
          <div className="flex gap-2">
            {themes.map(t => (
              <Button key={t.name} variant={active.name === t.name ? 'default' : 'outline'} onClick={() => setActive(t)} style={active.name === t.name ? {backgroundColor: t.accent, color: '#fff'} : {}}>
                {t.name}
              </Button>
            ))}
          </div>
          <Card style={{backgroundColor: active.bg, borderColor: active.fg + '20'}}>
            <CardContent className="pt-4 space-y-2">
              <p className="font-medium" style={{color: active.fg}}>Preview</p>
              <p className="text-sm" style={{color: active.fg + 'cc'}}>Content rendered in the selected theme.</p>
              <Button style={{backgroundColor: active.accent, color: '#fff'}}>Sample Action</Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
