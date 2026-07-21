import React, {useState} from 'react';

export default function AppearanceSettings() {
  const [radius, setRadius] = useState(8);
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);
  const [accent, setAccent] = useState('blue');

  return (
    <div style={{maxWidth:500,padding:24}}>
      <h1 style={{marginBottom:8}}>Appearance</h1>
      <p style={{color:'#666',marginBottom:24}}>Customize the look and feel.</p>
      <div style={{border:'1px solid #e0e0e0',borderRadius:8,padding:16,marginBottom:16}}>
        <h3 style={{marginTop:0}}>Accent Color</h3>
        <div style={{display:'flex',gap:8}}>{['blue','purple','green','red'].map(c=><button key={c} onClick={()=>setAccent(c)} style={{width:32,height:32,borderRadius:'50%',backgroundColor:c,border:accent===c?'3px solid #333':'2px solid transparent',cursor:'pointer'}} aria-label={c} />)}</div>
      </div>
      <div style={{border:'1px solid #e0e0e0',borderRadius:8,padding:16,marginBottom:16}}>
        <h3 style={{marginTop:0}}>Layout</h3>
        <label style={{display:'block',marginBottom:12}}>Border Radius: {radius}px<br/><input type="range" min={0} max={24} value={radius} onChange={e=>setRadius(Number(e.target.value))} style={{width:'100%'}} /></label>
        <label style={{display:'block'}}>Font Size: {fontSize}px<br/><input type="range" min={12} max={24} value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} style={{width:'100%'}} /></label>
      </div>
      <div style={{border:'1px solid #e0e0e0',borderRadius:8,padding:16,marginBottom:16}}>
        <label style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span>Dark mode</span><input type="checkbox" checked={darkMode} onChange={e=>setDarkMode(e.target.checked)} /></label>
      </div>
      <div style={{border:'1px solid #e0e0e0',borderRadius:8,padding:16}}>
        <h3 style={{marginTop:0}}>Preview</h3>
        <div style={{padding:24,borderRadius:radius,fontSize,background:darkMode?'#1a1a1a':'#fff',color:darkMode?'#fff':'#000',border:'1px solid #e0e0e0'}}><p style={{marginBottom:8}}>Preview of settings.</p><button style={{padding:'8px 16px',backgroundColor:accent,color:'#fff',border:'none',borderRadius:radius/2,cursor:'pointer'}}>Sample Button</button></div>
      </div>
    </div>
  );
}
