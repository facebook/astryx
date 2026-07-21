import React, {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Popover} from '@astryxdesign/core/Popover';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Heading} from '@astryxdesign/core/Heading';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  wrapper: { position: 'relative', width: '100%' },
  cover: { width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 },
  coverPlaceholder: { width: '100%', height: 200, backgroundColor: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  header: { padding: '16px 0', display: 'flex', alignItems: 'flex-start', gap: 12 },
  iconDisplay: { fontSize: 48, lineHeight: 1, cursor: 'pointer', border: 'none', background: 'none' },
  emojiGrid: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, padding: 8 },
  emojiBtn: { fontSize: 20, padding: 4, cursor: 'pointer', border: 'none', background: 'none', borderRadius: 4 },
  coverActions: { position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 },
});

const EMOJIS = ['\U0001f4c4','\U0001f4dd','\U0001f4cb','\U0001f4cc','\U0001f3af','\U0001f680','\U0001f4a1','\U0001f525','\u2b50','\U0001f3a8','\U0001f4ca','\U0001f4c8','\U0001f5c2','\U0001f4c1','\U0001f4bc','\U0001f3e0','\U0001f30d','\U0001f3b5','\U0001f4f8','\U0001f3ac','\U0001f4da','\U0001f511','\U0001f48e','\U0001f3c6'];
COVERS = ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=200&fit=crop', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&h=200&fit=crop', 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=900&h=200&fit=crop']

export default function NotionPageHeader() {
  const [icon, setIcon] = useState('\U0001f4c4');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('Untitled');

  return (
    <div {...stylex.props(styles.wrapper)}>
      {coverUrl ? (
        <div style={{position: 'relative'}}>
          <img src={coverUrl} alt="Page cover" {...stylex.props(styles.cover)} />
          <div {...stylex.props(styles.coverActions)}>
            <Button label="Change cover" size="sm" variant="ghost" onClick={() => setCoverUrl(COVERS[Math.floor(Math.random() * COVERS.length)])} />
            <Button label="Remove" size="sm" variant="ghost" onClick={() => setCoverUrl(null)} />
          </div>
        </div>
      ) : (
        <div {...stylex.props(styles.coverPlaceholder)}>
          <Button label="Add cover" variant="ghost" onClick={() => setCoverUrl(COVERS[0])} />
        </div>
      )}
      <div {...stylex.props(styles.header)}>
        <Popover content={<div {...stylex.props(styles.emojiGrid)}>{EMOJIS.map(e => <button key={e} {...stylex.props(styles.emojiBtn)} onClick={() => setIcon(e)}>{e}</button>)}</div>} placement="below" label="Pick an icon">
          <button {...stylex.props(styles.iconDisplay)} aria-label="Change page icon">{icon}</button>
        </Popover>
        <div style={{flex: 1}}>
          <Heading level={1}>{title}</Heading>
          <TextInput label="Page title" isLabelHidden value={title} onChange={setTitle} placeholder="Untitled" />
        </div>
      </div>
    </div>
  );
}
