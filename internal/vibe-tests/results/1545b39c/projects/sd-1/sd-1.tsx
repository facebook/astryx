import React, {useState, useEffect} from 'react';

type State = 'loading' | 'error' | 'success';

export default function DashboardWidget() {
  const [state, setState] = useState<State>('loading');
  const [data, setData] = useState<{revenue: string; users: number; growth: string}|null>(null);
  const fetchData = () => { setState('loading'); setData(null); setTimeout(() => { if(Math.random()>0.6) setState('error'); else { setData({revenue:'$12,450',users:1284,growth:'+12.5%'}); setState('success'); } }, 2000); };
  useEffect(() => { fetchData(); }, []);

  return (
    <div style={{maxWidth:360,padding:24,border:'1px solid #e0e0e0',borderRadius:8}}>
      <h3 style={{margin:'0 0 16px'}}>Dashboard</h3>
      {state==='loading'&&<div><div style={{height:16,background:'#f0f0f0',borderRadius:4,marginBottom:8,animation:'pulse 1.5s infinite'}} /><div style={{height:16,background:'#f0f0f0',borderRadius:4,width:'80%',marginBottom:8}} /><div style={{height:16,background:'#f0f0f0',borderRadius:4,width:'60%',marginBottom:12}} /><p style={{fontSize:14,color:'#666'}}>Loading...</p></div>}
      {state==='error'&&<div style={{padding:12,background:'#fdecea',borderRadius:6}}><p style={{color:'#d32f2f',fontWeight:500,margin:'0 0 8px'}}>Failed to load data</p><button onClick={fetchData} style={{padding:'4px 12px',border:'1px solid #ccc',borderRadius:4,cursor:'pointer'}}>Retry</button></div>}
      {state==='success'&&data&&<div>{[['Revenue',data.revenue],['Active Users',data.users.toLocaleString()],['Growth',data.growth]].map(([l,v])=><div key={l as string} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f5f5f5'}}><span style={{color:'#666',fontSize:14}}>{l}</span><span style={{fontWeight:600}}>{v}</span></div>)}</div>}
    </div>
  );
}
