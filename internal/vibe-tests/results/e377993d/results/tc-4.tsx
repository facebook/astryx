import {useState} from 'react';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

const themes = [
  {name: 'Default', accent: '#2563eb', description: 'Clean blue accent with neutral tones'},
  {name: 'Midnight', accent: '#7c3aed', description: 'Dark purple for a nighttime feel'},
  {name: 'Sunrise', accent: '#ea580c', description: 'Warm orange for an energetic look'},
];

export default function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState(themes[0]);

  return (
    <div className="p-6 space-y-4" style={{'--accent': activeTheme.accent} as React.CSSProperties}>
      <h2 className="text-2xl font-bold">Theme Switcher</h2>
      <p className="text-gray-600">Pick a theme to preview.</p>
      <div className="flex flex-wrap gap-3">
        {themes.map(t => (
          <Card key={t.name} className="p-4 space-y-2">
            <p className="font-medium">{t.name}</p>
            <p className="text-sm text-gray-500">{t.description}</p>
            <Button
              variant={activeTheme.name === t.name ? 'default' : 'outline'}
              onClick={() => setActiveTheme(t)}
              disabled={activeTheme.name === t.name}>
              {activeTheme.name === t.name ? 'Active' : 'Apply'}
            </Button>
          </Card>
        ))}
      </div>
      <Card className="p-4 space-y-3" style={{borderColor: activeTheme.accent}}>
        <h3 className="text-xl font-semibold">Preview</h3>
        <p>This card demonstrates the current theme.</p>
        <div className="flex gap-2">
          <Button style={{backgroundColor: activeTheme.accent, color: 'white'}}>Primary Action</Button>
          <Button variant="outline">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Card>
    </div>
  );
}
