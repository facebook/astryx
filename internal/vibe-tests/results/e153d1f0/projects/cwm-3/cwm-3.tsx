import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {useState} from 'react';

const ICONS = ['📄', '🎯', '📊', '🚀', '💡', '🎨', '📝', '⚡'];

export default function NotionPageHeader() {
  const [icon, setIcon] = useState('📄');
  const [cover, setCover] = useState('');

  return (
    <div className="space-y-4">
      {cover ? (
        <div className="h-48 bg-cover bg-center rounded-lg" style={{backgroundImage: `url(${cover})`}} />
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setCover('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200')}>Add Cover</Button>
      )}
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild><button className="text-5xl bg-transparent border-none cursor-pointer">{icon}</button></PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-4 gap-1">
              {ICONS.map(e => <button key={e} className="text-2xl p-2 hover:bg-accent rounded" onClick={() => setIcon(e)}>{e}</button>)}
            </div>
          </PopoverContent>
        </Popover>
        <h1 className="text-4xl font-bold">Untitled</h1>
      </div>
    </div>
  );
}
