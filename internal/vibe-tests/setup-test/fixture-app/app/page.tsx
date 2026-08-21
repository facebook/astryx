'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {EnvPicker} from '@/components/env-picker';
import {RunTable} from '@/components/run-table';

export default function RunsPage() {
  const [env, setEnv] = useState('prod');

  return (
    <main className="space-y-3">
      <header className="flex items-center justify-between">
        <h1 className="text-sm font-semibold">Deploy runs</h1>
        <div className="flex items-center gap-2">
          <EnvPicker value={env} onChange={setEnv} />
          <Button size="sm" variant="outline" className="h-8 text-xs">
            Refresh
          </Button>
        </div>
      </header>

      <Card className="border-border bg-card p-0">
        <RunTable env={env} />
      </Card>
    </main>
  );
}
