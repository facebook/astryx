import React, {useState} from 'react';

const SECTIONS = ['Profile','Notifications','Security','Appearance'];

export default function SettingsDashboard() {
  const [selected, setSelected] = useState('Profile');
  const [name, setName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex@example.com');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <header style={{position:'fixed',top:0,left:0,right:0,padding:'12px 24px',borderBottom:'1px solid #e0e0e0',background:'#fff',zIndex:10}}><h1 style={{margin:0,fontSize:18}}>Settings App</h1></header>
      <aside style={{width:220,borderRight:'1px solid #e0e0e0',paddingTop:60,padding:'60px 12px 12px'}}><nav style={{display:'flex',flexDirection:'column',gap:2}}>{SECTIONS.map(s=><button key={s} onClick={()=>setSelected(s)} style={{textAlign:'left',padding:'8px 12px',border:'none',borderRadius:6,cursor:'pointer',background:selected===s?'#e3f2fd':'transparent',fontWeight:selected===s?500:'normal'}}>{s}</button>)}</nav></aside>
      <main style={{flex:1,padding:'80px 24px 24px',maxWidth:500}}>
        {selected==='Profile'&&<div style={{border:'1px solid #e0e0e0',borderRadius:8,padding:24}}><h2 style={{marginTop:0}}>Profile</h2><div style={{marginBottom:12}}><label style={{display:'block',fontSize:14,marginBottom:4}}>Full Name</label><input value={name} onChange={e=>setName(e.target.value)} style={{width:'100%',padding:8,border:'1px solid #ccc',borderRadius:4}} /></div><div style={{marginBottom:12}}><label style={{display:'block',fontSize:14,marginBottom:4}}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:8,border:'1px solid #ccc',borderRadius:4}} /></div><button style={{padding:'8px 16px',backgroundColor:'#0066cc',color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>Save changes</button></div>}
        {selected==='Notifications'&&<div style={{border:'1px solid #e0e0e0',borderRadius:8,padding:24}}><h2 style={{marginTop:0}}>Notifications</h2><label style={{display:'flex',justifyContent:'space-between',marginBottom:12}}><span>Email notifications</span><input type="checkbox" checked={emailNotifs} onChange={e=>setEmailNotifs(e.target.checked)} /></label><label style={{display:'flex',justifyContent:'space-between'}}><span>Push notifications</span><input type="checkbox" checked={pushNotifs} onChange={e=>setPushNotifs(e.target.checked)} /></label></div>}
        {selected==='Security'&&<div style={{border:'1px solid #e0e0e0',borderRadius:8,padding:24}}><h2 style={{marginTop:0}}>Security</h2><button style={{display:'block',marginBottom:8,padding:'8px 16px',border:'1px solid #ccc',borderRadius:4,cursor:'pointer'}}>Change password</button><button style={{display:'block',padding:'8px 16px',border:'1px solid #ccc',borderRadius:4,cursor:'pointer'}}>Enable 2FA</button></div>}
        {selected==='Appearance'&&<div style={{border:'1px solid #e0e0e0',borderRadius:8,padding:24}}><h2 style={{marginTop:0}}>Appearance</h2><p style={{color:'#666'}}>Theme settings here.</p></div>}
      </main>
    </div>
  );
}
