import React, {useState} from 'react';

const NAV = ['Home','Documents','Analytics','Settings'];

export default function ResponsiveSidebar() {
  const [selected, setSelected] = useState('Home');
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div style={{display:'flex',height:'100vh'}}>
      <aside style={{width:240,borderRight:'1px solid #e0e0e0',padding:16,display:'flex',flexDirection:'column',gap:4}}>
        {NAV.map(n=><button key={n} onClick={()=>setSelected(n)} style={{textAlign:'left',padding:'8px 12px',border:'none',borderRadius:6,cursor:'pointer',background:selected===n?'#e3f2fd':'transparent',fontWeight:selected===n?500:'normal'}}>{n}</button>)}
      </aside>
      <div style={{flex:1,display:'flex',flexDirection:'column'}}>
        <header style={{padding:16,borderBottom:'1px solid #e0e0e0',display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Toggle menu" style={{border:'none',background:'none',cursor:'pointer',fontSize:18}}>☰</button>
          <span style={{fontWeight:600}}>My App</span>
        </header>
        <main style={{padding:24}}>
          <h1 style={{fontSize:24,marginBottom:8}}>{selected}</h1>
          <p style={{color:'#666'}}>The sidebar becomes a bottom sheet on mobile.</p>
        </main>
      </div>
      {mobileOpen&&<div style={{position:'fixed',bottom:0,left:0,right:0,background:'#fff',borderTop:'1px solid #e0e0e0',padding:16,display:'flex',flexDirection:'column',gap:4,boxShadow:'0 -2px 10px rgba(0,0,0,0.1)'}}>
        {NAV.map(n=><button key={n} onClick={()=>{setSelected(n);setMobileOpen(false);}} style={{textAlign:'left',padding:'10px 12px',border:'none',borderRadius:6,cursor:'pointer',background:selected===n?'#e3f2fd':'transparent'}}>{n}</button>)}
      </div>}
    </div>
  );
}
