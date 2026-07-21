import React, {useState} from 'react';

const EMOJIS = ['\U0001f4c4','\U0001f4dd','\U0001f3af','\U0001f680','\U0001f4a1','\U0001f525','\u2b50','\U0001f3a8','\U0001f4ca','\U0001f4c8','\U0001f5c2','\U0001f4c1','\U0001f4bc','\U0001f3e0','\U0001f30d','\U0001f3b5','\U0001f4f8','\U0001f3ac','\U0001f4da','\U0001f511','\U0001f48e','\U0001f3c6','\u26a1','\U0001f308'];

export default function NotionPageHeader() {
  const [icon, setIcon] = useState('\U0001f4c4');
  const [cover, setCover] = useState<string|null>(null);
  const [title, setTitle] = useState('Untitled');
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div style={{width:'100%'}}>
      {cover ? <div style={{position:'relative'}}><img src={cover} alt="Cover" style={{width:'100%',height:200,objectFit:'cover',borderRadius:8}} /><div style={{position:'absolute',top:8,right:8,display:'flex',gap:4}}><button onClick={()=>setCover('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&h=200&fit=crop')} style={{padding:'4px 8px',background:'rgba(255,255,255,0.9)',border:'none',borderRadius:4,cursor:'pointer'}}>Change</button><button onClick={()=>setCover(null)} style={{padding:'4px 8px',background:'rgba(255,255,255,0.9)',border:'none',borderRadius:4,cursor:'pointer'}}>Remove</button></div></div> : <div style={{width:'100%',height:200,backgroundColor:'#f5f5f5',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><button onClick={()=>setCover('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=200&fit=crop')} style={{padding:'8px 16px',background:'none',border:'1px solid #ccc',borderRadius:4,cursor:'pointer'}}>Add cover</button></div>}
      <div style={{display:'flex',alignItems:'flex-start',gap:12,padding:'16px 0'}}>
        <div style={{position:'relative'}}>
          <button onClick={()=>setPickerOpen(!pickerOpen)} style={{fontSize:48,border:'none',background:'none',cursor:'pointer'}} aria-label="Change icon">{icon}</button>
          {pickerOpen&&<div style={{position:'absolute',top:'100%',left:0,zIndex:10,background:'#fff',border:'1px solid #e0e0e0',borderRadius:8,padding:8,display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:4}}>{EMOJIS.map(e=><button key={e} onClick={()=>{setIcon(e);setPickerOpen(false);}} style={{fontSize:20,border:'none',background:'none',cursor:'pointer',padding:4,borderRadius:4}}>{e}</button>)}</div>}
        </div>
        <div style={{flex:1}}>
          <h1 style={{margin:0,fontSize:32}}>{title}</h1>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Untitled" style={{width:'100%',padding:8,border:'1px solid #e0e0e0',borderRadius:4,marginTop:8,fontSize:16}} />
        </div>
      </div>
    </div>
  );
}
