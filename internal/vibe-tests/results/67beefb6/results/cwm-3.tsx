import {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

const icons = ['📄', '🎯', '📊', '🚀', '💡', '📝', '🎨', '🔧', '📦', '🌟', '🏠', '📋'];
const covers = [
  'https://picsum.photos/1200/400?random=1',
  'https://picsum.photos/1200/400?random=2',
  'https://picsum.photos/1200/400?random=3',
];

export default function NotionPageHeader() {
  const [selectedIcon, setSelectedIcon] = useState('📄');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [title, setTitle] = useState('Untitled');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-3">
      {coverImage ? (
        <img
          className="w-full h-72 object-cover rounded-lg cursor-pointer"
          src={coverImage}
          alt="Page cover"
          onClick={() => setCoverImage(covers[Math.floor(Math.random() * covers.length)])}
        />
      ) : (
        <div
          className="w-full h-72 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer"
          onClick={() => setCoverImage(covers[0])}>
          <Text color="secondary">Click to add cover</Text>
        </div>
      )}
      <div className="px-6 space-y-3">
        <div className="flex items-center gap-3">
          <span
            className="text-5xl cursor-pointer"
            onClick={() => setShowIconPicker(!showIconPicker)}
            role="button"
            tabIndex={0}
            aria-label="Change page icon">
            {selectedIcon}
          </span>
          {isEditing ? (
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setIsEditing(false)}
              autoFocus
              className="text-3xl font-bold border-none outline-none w-full"
            />
          ) : (
            <Heading level={1}>
              <span onClick={() => setIsEditing(true)} role="button" tabIndex={0}>{title}</span>
            </Heading>
          )}
        </div>
        {showIconPicker && (
          <Card padding={2}>
            <div className="grid grid-cols-6 gap-2 p-2">
              {icons.map(icon => (
                <button
                  key={icon}
                  className="text-2xl p-2 rounded-lg border-0 bg-transparent cursor-pointer hover:bg-gray-100"
                  onClick={() => { setSelectedIcon(icon); setShowIconPicker(false); }}
                  aria-label={`Select ${icon} icon`}>
                  {icon}
                </button>
              ))}
            </div>
          </Card>
        )}
        <div className="flex gap-2">
          <Button label="Add cover" variant="ghost" size="sm" onClick={() => setCoverImage(covers[0])} />
          <Button label="Change icon" variant="ghost" size="sm" onClick={() => setShowIconPicker(true)} />
        </div>
      </div>
    </div>
  );
}
