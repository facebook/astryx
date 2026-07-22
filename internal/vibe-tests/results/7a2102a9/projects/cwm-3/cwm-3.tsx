import {useState} from 'react';
const ICONS = ['📄', '🎯', '📊', '🚀', '💡', '🎨', '📝', '⚡'];

export default function NotionPageHeader() {
  const [icon, setIcon] = useState('📄');
  const [showPicker, setShowPicker] = useState(false);
  const [cover, setCover] = useState('');

  return (
    <div style={{fontFamily: 'system-ui'}}>
      {cover ? <div style={{height: 200, backgroundImage: `url(${cover})`, backgroundSize: 'cover', borderRadius: 8}} /> : <button onClick={() => setCover('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200')} style={{border: 'none', background: 'none', color: '#999', cursor: 'pointer'}}>+ Add Cover</button>}
      <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 16}}>
        <div style={{position: 'relative'}}>
          <button onClick={() => setShowPicker(!showPicker)} style={{fontSize: 48, background: 'none', border: 'none', cursor: 'pointer'}}>{icon}</button>
          {showPicker && <div style={{position: 'absolute', top: 60, left: 0, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, padding: 8, border: '1px solid #ddd', borderRadius: 8, background: 'white'}}>
            {ICONS.map(e => <button key={e} onClick={() => {setIcon(e); setShowPicker(false);}} style={{fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', padding: 4}}>{e}</button>)}
          </div>}
        </div>
        <h1 style={{fontSize: 36, fontWeight: 700, margin: 0}}>Untitled</h1>
      </div>
    </div>
  );
}
