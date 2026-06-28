// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useEffect} from 'react';

type Status = 'loading' | 'error' | 'success';

export default function DashboardWidget() {
  const [status, setStatus] = useState<Status>('loading');
  const [data, setData] = useState<{revenue: number; users: number; growth: number} | null>(null);

  function fetchData() {
    setStatus('loading');
    setData(null);
    setTimeout(() => {
      if (Math.random() > 0.3) {
        setData({revenue: 48250, users: 1240, growth: 12.5});
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 1500);
  }

  useEffect(() => { fetchData(); }, []);

  const cardStyle: React.CSSProperties = {border: '1px solid #ddd', borderRadius: 8, padding: 24, maxWidth: 400};

  if (status === 'loading') {
    return (
      <div style={{...cardStyle, textAlign: 'center'}}>
        <div style={{fontSize: 24, marginBottom: 8}}>Loading...</div>
        <p style={{color: '#666', fontSize: 14}}>Loading dashboard data...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={cardStyle}>
        <div style={{backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: 4, padding: 12, marginBottom: 12}}>
          <strong style={{color: '#c00'}}>Error:</strong> Something went wrong while fetching dashboard data.
        </div>
        <button onClick={fetchData} style={{padding: '8px 16px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>Retry</button>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <h3 style={{fontSize: 18, fontWeight: 'bold', marginBottom: 16}}>Dashboard Overview</h3>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16}}>
        <div><p style={{fontSize: 12, color: '#666'}}>Revenue</p><p style={{fontSize: 20, fontWeight: 'bold'}}>${data!.revenue.toLocaleString()}</p></div>
        <div><p style={{fontSize: 12, color: '#666'}}>Active Users</p><p style={{fontSize: 20, fontWeight: 'bold'}}>{data!.users.toLocaleString()}</p></div>
        <div><p style={{fontSize: 12, color: '#666'}}>Growth</p><p style={{fontSize: 20, fontWeight: 'bold'}}>+{data!.growth}%</p></div>
      </div>
    </div>
  );
}
