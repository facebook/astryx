import {Card, Heading, Text, VStack, HStack, Button, Icon, Popover} from '@astryxdesign/core';
import {useState} from 'react';

const ICONS = ['📄', '🎯', '📊', '🚀', '💡', '🎨', '📝', '⚡'];

export default function NotionPageHeader() {
  const [icon, setIcon] = useState('📄');
  const [coverUrl, setCoverUrl] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  return (
    <VStack gap={0}>
      {coverUrl ? (
        <div style={{height: 200, backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 8}} />
      ) : (
        <Button label="Add Cover" variant="ghost" size="sm" onPress={() => setCoverUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200')} />
      )}
      <HStack gap={2}>
        <Popover isOpen={showPicker} onClose={() => setShowPicker(false)} trigger={
          <button onClick={() => setShowPicker(!showPicker)} style={{fontSize: 48, background: 'none', border: 'none', cursor: 'pointer'}}>{icon}</button>
        }>
          <Card padding={2}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4}}>
              {ICONS.map(e => (
                <button key={e} onClick={() => { setIcon(e); setShowPicker(false); }} style={{fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', padding: 8}}>{e}</button>
              ))}
            </div>
          </Card>
        </Popover>
        <Heading level={1}>Untitled</Heading>
      </HStack>
    </VStack>
  );
}
