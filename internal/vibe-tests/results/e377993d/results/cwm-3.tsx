import {useState} from 'react';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

const icons = ['📄', '🎯', '📊', '🚀', '💡', '📝', '🎨', '🔧', '📦', '🌟', '🏠', '📋'];
const covers = ['https://picsum.photos/1200/400?random=1', 'https://picsum.photos/1200/400?random=2', 'https://picsum.photos/1200/400?random=3'];

export default function NotionPageHeader() {
  const [selectedIcon, setSelectedIcon] = useState('📄');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [title, setTitle] = useState('Untitled');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-3">
      {coverImage ? (
        <img className="w-full h-72 object-cover rounded-lg cursor-pointer" src={coverImage} alt="Cover" onClick={() => setCoverImage(covers[Math.floor(Math.random() * covers.length)])} />
      ) : (
        <div className="w-full h-72 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer" onClick={() => setCoverImage(covers[0])}>
          <span className="text-gray-500">Click to add cover</span>
        </div>
      )}
      <div className="px-6 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-5xl cursor-pointer" onClick={() => setShowIconPicker(!showIconPicker)} role="button" tabIndex={0}>{selectedIcon}</span>
          {isEditing ? (
            <input value={title} onChange={e => setTitle(e.target.value)} onBlur={() => setIsEditing(false)} autoFocus className="text-3xl font-bold border-none outline-none w-full" />
          ) : (
            <h1 className="text-3xl font-bold cursor-text" onClick={() => setIsEditing(true)}>{title}</h1>
          )}
        </div>
        {showIconPicker && (
          <Card className="p-3">
            <div className="grid grid-cols-6 gap-2">
              {icons.map(icon => (
                <button key={icon} className="text-2xl p-2 rounded hover:bg-gray-100 border-0 bg-transparent cursor-pointer" onClick={() => { setSelectedIcon(icon); setShowIconPicker(false); }}>{icon}</button>
              ))}
            </div>
          </Card>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCoverImage(covers[0])}>Add cover</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowIconPicker(true)}>Change icon</Button>
        </div>
      </div>
    </div>
  );
}
