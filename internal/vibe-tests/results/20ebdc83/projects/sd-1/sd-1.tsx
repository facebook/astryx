// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState, useEffect} from 'react';

type State = 'loading' | 'error' | 'data';

export default function DashboardWidget() {
  const [state, setState] = useState<State>('loading');
  const [metrics, setMetrics] = useState<Array<{label: string; value: string; change: string}>>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Math.random() > 0.3) {
        setMetrics([
          {label: 'Revenue', value: '$12,450', change: '+12%'},
          {label: 'Users', value: '1,234', change: '+5%'},
          {label: 'Orders', value: '89', change: '-2%'},
        ]);
        setState('data');
      } else {
        setState('error');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const retry = () => {
    setState('loading');
    setTimeout(() => {
      setMetrics([{label: 'Revenue', value: '$12,450', change: '+12%'}, {label: 'Users', value: '1,234', change: '+5%'}, {label: 'Orders', value: '89', change: '-2%'}]);
      setState('data');
    }, 1500);
  };

  const shimmer = {background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 6, height: 56, marginBottom: 8};

  return (
    <div style={{width: 400, border: '1px solid #e5e5e5', borderRadius: 8, padding: 20, fontFamily: 'system-ui'}}>
      <h3 style={{margin: '0 0 16px'}}>Weekly Metrics</h3>
      {state === 'loading' && (
        <div>
          <div style={shimmer} />
          <div style={shimmer} />
          <div style={shimmer} />
          <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
        </div>
      )}
      {state === 'error' && (
        <div>
          <div style={{padding: 12, backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, marginBottom: 12, color: '#b91c1c', fontSize: 14}}>
            Failed to load metrics. The server returned an error.
          </div>
          <button onClick={retry} style={{padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', background: '#fff'}}>
            Retry
          </button>
        </div>
      )}
      {state === 'data' && (
        <div>
          {metrics.map(m => (
            <div key={m.label} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#f9f9f9', borderRadius: 6, marginBottom: 8}}>
              <div><div style={{fontSize: 12, color: '#666'}}>{m.label}</div><div style={{fontSize: 18, fontWeight: 600}}>{m.value}</div></div>
              <span style={{fontSize: 14, color: '#666'}}>{m.change}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
