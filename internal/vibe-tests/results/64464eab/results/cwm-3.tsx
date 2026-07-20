import {useState} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

export default function PageHeader() {
  const [icon, setIcon] = useState('\u{1F4C4}');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const icons = ['\u{1F4C4}', '\u{1F3AF}', '\u{1F680}', '\u{1F4A1}', '\u{1F4CA}', '\u{1F3A8}', '\u{26A1}', '\u{1F525}'];

  return (
    <div className="w-full">
      {coverUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="px-12 py-4 space-y-2">
        <div className="relative">
          <Button variant="ghost" onClick={() => setShowIconPicker(!showIconPicker)}>
            <span className="text-5xl">{icon}</span>
          </Button>
          {showIconPicker && (
            <Card className="absolute z-10 p-2">
              <CardContent className="grid grid-cols-4 gap-1 p-0">
                {icons.map(i => (
                  <Button key={i} variant="ghost" size="sm" onClick={() => { setIcon(i); setShowIconPicker(false); }}>
                    {i}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        <h1 className="text-4xl font-bold">Untitled</h1>
        {!coverUrl && (
          <Button variant="ghost" size="sm" onClick={() => setCoverUrl('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200')}>
            Add cover
          </Button>
        )}
      </div>
    </div>
  );
}
