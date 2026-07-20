import {useState} from 'react';

export default function PageHeader() {
  const [icon, setIcon] = useState('\u{1F4C4}');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const icons = ['\u{1F4C4}', '\u{1F3AF}', '\u{1F680}', '\u{1F4A1}', '\u{1F4CA}', '\u{1F3A8}', '\u{26A1}', '\u{1F525}'];

  return (
    <div style={{width: '100%'}}>
      {coverUrl && <div style={{width: '100%', height: 200, overflow: 'hidden'}}><img src={coverUrl} alt="Cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>}
      <div style={{padding: '16px 48px'}}>
        <div style={{position: 'relative'}}>
          <button onClick={() => setShowPicker(!showPicker)} style={{fontSize: 48, background: 'none', border: 'none', cursor: 'pointer'}}>{icon}</button>
          {showPicker && (
            <div style={{position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid #e0e0e0', borderRadius: 8, padding: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, zIndex: 10}}>
              {icons.map(i => <button key={i} onClick={() => { setIcon(i); setShowPicker(false); }} style={{fontSize: 24, background: 'none', border: 'none', cursor: 'pointer'}}>{i}</button>)}
            </div>
          )}
        </div>
        <h1 style={{fontSize: 36, fontWeight: 700, margin: '8px 0'}}>Untitled</h1>
        {!coverUrl && <button onClick={() => setCoverUrl('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200')} style={{padding: '4px 8px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 14}}>Add cover</button>}
      </div>
    </div>
  );
}
