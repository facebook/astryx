// Copyright (c) Meta Platforms, Inc. and affiliates.

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const transactions: Transaction[] = [
  {id: '1', description: 'Payment from Acme Corp', amount: 2500.00, date: '2024-03-15', status: 'completed'},
  {id: '2', description: 'Subscription renewal', amount: -49.99, date: '2024-03-14', status: 'completed'},
  {id: '3', description: 'Refund - Order #1234', amount: 150.00, date: '2024-03-13', status: 'pending'},
  {id: '4', description: 'Transfer to savings', amount: -500.00, date: '2024-03-12', status: 'completed'},
  {id: '5', description: 'Invoice payment', amount: 1200.00, date: '2024-03-11', status: 'failed'},
];

const statusColors = {completed: '#16a34a', pending: '#ca8a04', failed: '#dc2626'};

export default function TransactionList() {
  return (
    <div style={{maxWidth: 800, margin: '0 auto', padding: 24}}>
      <h2 style={{fontSize: 24, fontWeight: 700, marginBottom: 16}}>Transactions</h2>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{borderBottom: '2px solid #e2e8f0'}}>
            <th style={{textAlign: 'left', padding: '12px 8px', fontSize: 14, fontWeight: 600}}>Description</th>
            <th style={{textAlign: 'right', padding: '12px 8px', fontSize: 14, fontWeight: 600}}>Amount</th>
            <th style={{textAlign: 'left', padding: '12px 8px', fontSize: 14, fontWeight: 600}}>Date</th>
            <th style={{textAlign: 'left', padding: '12px 8px', fontSize: 14, fontWeight: 600}}>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} style={{borderBottom: '1px solid #f1f5f9'}}>
              <td style={{padding: '12px 8px'}}>{t.description}</td>
              <td style={{padding: '12px 8px', textAlign: 'right', color: t.amount >= 0 ? '#16a34a' : '#dc2626'}}>
                {t.amount >= 0 ? '+' : ''}{t.amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
              </td>
              <td style={{padding: '12px 8px', color: '#64748b'}}>{new Date(t.date).toLocaleDateString()}</td>
              <td style={{padding: '12px 8px'}}>
                <span style={{padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500, background: `${statusColors[t.status]}20`, color: statusColors[t.status]}}>
                  {t.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
