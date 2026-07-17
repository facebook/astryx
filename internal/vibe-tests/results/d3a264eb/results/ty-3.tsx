// Copyright (c) Meta Platforms, Inc. and affiliates.

export default function MetricsCard() {
  return (
    <div style={{maxWidth: 300, border: '1px solid #e2e8f0', borderRadius: 12, padding: 20}}>
      <p style={{fontSize: 14, fontWeight: 500, color: '#64748b', margin: '0 0 4px 0'}}>Total Revenue</p>
      <p style={{fontSize: 32, fontWeight: 700, margin: '0 0 4px 0'}}>$12,340.56</p>
      <p style={{fontSize: 14, color: '#16a34a', margin: 0}}>+12% from last month</p>
    </div>
  );
}
