import React, {useState} from 'react';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

export default function AppearanceSettings() {
  const [radius, setRadius] = useState([8]);
  const [fontSize, setFontSize] = useState([16]);
  const [darkMode, setDarkMode] = useState(false);
  const [accent, setAccent] = useState('blue');

  return (
    <div className="max-w-lg p-6 space-y-6">
      <h1 className="text-2xl font-bold">Appearance</h1>
      <p className="text-muted-foreground">Customize the look and feel.</p>
      <Card><CardHeader><CardTitle>Accent Color</CardTitle></CardHeader><CardContent><div className="flex gap-2">{['blue','purple','green','red'].map(c => <button key={c} onClick={() => setAccent(c)} className={`w-8 h-8 rounded-full border-2 ${accent === c ? 'border-foreground' : 'border-transparent'}`} style={{backgroundColor: c}} aria-label={c} />)}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>Layout</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Border Radius: {radius[0]}px</Label><Slider value={radius} onValueChange={setRadius} min={0} max={24} step={1} /></div><div><Label>Font Size: {fontSize[0]}px</Label><Slider value={fontSize} onValueChange={setFontSize} min={12} max={24} step={1} /></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><Label>Dark mode</Label><Switch checked={darkMode} onCheckedChange={setDarkMode} /></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Preview</CardTitle></CardHeader><CardContent><div style={{padding: 24, borderRadius: radius[0], fontSize: fontSize[0], background: darkMode ? '#1a1a1a' : '#fff', color: darkMode ? '#fff' : '#000', border: '1px solid #e0e0e0'}}><p style={{marginBottom: 8}}>Preview of settings.</p><Button>Sample Button</Button></div></CardContent></Card>
    </div>
  );
}
