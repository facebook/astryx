import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Input} from '@/components/ui/input';

const EMOJIS = ['\U0001f4c4','\U0001f4dd','\U0001f3af','\U0001f680','\U0001f4a1','\U0001f525','\u2b50','\U0001f3a8','\U0001f4ca','\U0001f4c8','\U0001f5c2','\U0001f4c1','\U0001f4bc','\U0001f3e0','\U0001f30d','\U0001f3b5','\U0001f4f8','\U0001f3ac','\U0001f4da','\U0001f511','\U0001f48e','\U0001f3c6','\u26a1','\U0001f308'];
const COVERS = ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=200&fit=crop', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&h=200&fit=crop'];

export default function NotionPageHeader() {
  const [icon, setIcon] = useState('\U0001f4c4');
  const [cover, setCover] = useState<string | null>(null);
  const [title, setTitle] = useState('Untitled');

  return (
    <div className="relative w-full">
      {cover ? (
        <div className="relative">
          <img src={cover} alt="Cover" className="w-full h-[200px] object-cover rounded-lg" />
          <div className="absolute top-2 right-2 flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setCover(COVERS[Math.floor(Math.random() * COVERS.length)])}>Change</Button>
            <Button variant="ghost" size="sm" onClick={() => setCover(null)}>Remove</Button>
          </div>
        </div>
      ) : (
        <div className="w-full h-[200px] bg-muted rounded-lg flex items-center justify-center">
          <Button variant="ghost" onClick={() => setCover(COVERS[0])}>Add cover</Button>
        </div>
      )}
      <div className="flex items-start gap-3 py-4">
        <Popover>
          <PopoverTrigger asChild><button className="text-5xl border-none bg-transparent cursor-pointer" aria-label="Change icon">{icon}</button></PopoverTrigger>
          <PopoverContent className="w-auto"><div className="grid grid-cols-8 gap-1 p-2">{EMOJIS.map(e => <button key={e} className="text-xl p-1 cursor-pointer border-none bg-transparent rounded hover:bg-muted" onClick={() => setIcon(e)}>{e}</button>)}</div></PopoverContent>
        </Popover>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Untitled" />
        </div>
      </div>
    </div>
  );
}
