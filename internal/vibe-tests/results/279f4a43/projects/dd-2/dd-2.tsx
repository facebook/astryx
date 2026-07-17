// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../components/ui/table';
import {Badge} from '../components/ui/badge';

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

const statusVariant = {completed: 'default', pending: 'secondary', failed: 'destructive'} as const;

export default function TransactionList() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Transactions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.description}</TableCell>
              <TableCell className={`text-right ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {t.amount >= 0 ? '+' : ''}{t.amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
              </TableCell>
              <TableCell className="text-muted-foreground">{new Date(t.date).toLocaleDateString()}</TableCell>
              <TableCell><Badge variant={statusVariant[t.status]}>{t.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
