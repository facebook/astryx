import {useState} from 'react';

const icons = ['📄', '🎯', '📊', '🚀', '💡', '📝', '🎨', '🔧', '📦', '🌟', '🏠', '📋'];
const covers = ['https://picsum.photos/1200/400?random=1', 'https://picsum.photos/1200/400?random=2'];

export default function NotionPageHeader() {
  const [icon, setIcon] = useState('📄');
  const [showPicker, setShowPicker] = useState(false);
  const [cover, setCover] = useState<string | null>(null);
  const [title, setTitle] = useState('Untitled');
  const [editing, setEditing] = useState(false);

  return (
    <div>
      {cover ? <img src={cover} alt="Cover" onClick={() => setCover(covers[Math.floor(Math.random() * covers.length)])} style={{width: '100%', height: 280, objectFit: 'cover', cursor: 'pointer'}} /> : <div onClick={() => setCover(covers[0])} style={{width: '100%', height: 280, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>Click to add cover</div>}
      <div style={{padding: 24}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span onClick={() => setShowPicker(!showPicker)} style={{fontSize: 48, cursor: 'pointer'}} role="button">{icon}</span>
          {editing ? <input value={title} onChange={e => setTitle(e.target.value)} onBlur={() => setEditing(false)} autoFocus style={{fontSize: 32, fontWeight: 700, border: 'none', outline: 'none', width: '100%'}} /> : <h1 onClick={() => setEditing(true)} style={{fontSize: 32, fontWeight: 700, cursor: 'text'}}>{title}</h1>}
        </div>
        {showPicker && (
          <div style={{marginTop: 8, padding: 12, border: '1px solid #e0e0e0', borderRadius: 8, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8}}>
            {icons.map(i => <button key={i} onClick={() => { setIcon(i); setShowPicker(false); }} style={{fontSize: 24, padding: 8, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 4}}>{i}</button>)}
          </div>
        )}
        <div style={{display: 'flex', gap: 8, marginTop: 12}}>
          <button onClick={() => setCover(covers[0])} style={{padding: '6px 12px', background: 'none', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>Add cover</button>
          <button onClick={() => setShowPicker(true)} style={{padding: '6px 12px', background: 'none', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>Change icon</button>
        </div>
      </div>
    </div>
  );
}
