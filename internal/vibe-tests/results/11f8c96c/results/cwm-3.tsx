import {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Stack';
import {Icon} from '@astryxdesign/core/Icon';

export default function PageHeader() {
  const [icon, setIcon] = useState('📄');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const icons = ['📄', '🎯', '🚀', '💡', '📊', '🎨', '⚡', '🔥'];

  return (
    <Stack gap={0}>
      {coverUrl && (
        <div style={{width: '100%', height: 200, overflow: 'hidden'}}>
          <img src={coverUrl} alt="Cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      )}
      <Stack gap={2} padding={4}>
        <Stack gap={1}>
          <div style={{position: 'relative'}}>
            <Button variant="ghost" clickAction={() => setShowIconPicker(!showIconPicker)}>
              <Text type="display-1">{icon}</Text>
            </Button>
            {showIconPicker && (
              <Card padding={2}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4}}>
                  {icons.map(i => (
                    <Button key={i} variant="ghost" clickAction={() => { setIcon(i); setShowIconPicker(false); }}>
                      {i}
                    </Button>
                  ))}
                </div>
              </Card>
            )}
          </div>
          <Text type="display-2" weight="bold">Untitled</Text>
        </Stack>
        {!coverUrl && (
          <Button variant="ghost" size="sm" clickAction={() => setCoverUrl('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200')}>
            Add cover
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
