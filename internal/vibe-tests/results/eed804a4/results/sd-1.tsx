import {useState, useEffect} from 'react';

type State = 'loading' | 'error' | 'success';

export default function DashboardWidget() {
  const [state, setState] = useState<State>('loading');
  const [data, setData] = useState<{revenue: string; users: number; orders: number} | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (Math.random() > 0.7) setState('error');
      else { setData({revenue: '$12,450', users: 1234, orders: 89}); setState('success'); }
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, width: 380}}>
      <h3 style={{margin: '0 0 12px', fontSize: 16, fontWeight: 600}}>Dashboard Overview</h3>
      {state === 'loading' && <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>{[100, 80, 60].map((w, i) => <div key={i} style={{width: `${w}%`, height: 16, background: '#f0f0f0', borderRadius: 4, animation: 'pulse 1.5s infinite'}} />)}</div>}
      {state === 'error' && <div><p style={{color: '#d32f2f', fontSize: 14}}>Failed to load.</p><button onClick={() => setState('loading')} style={{marginTop: 8, padding: '4px 12px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>Retry</button></div>}
      {state === 'success' && data && <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><p>Revenue: {data.revenue}</p><p>Users: {data.users}</p><p>Orders: {data.orders}</p></div>}
    </div>
  );
}
