// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent} from '@/components/ui/card';

export default function CustomCard() {
  return (
    <div className="p-8">
      <Card className="border-2 rounded-2xl shadow-lg" style={{borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1', boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)'}}>
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-3">Custom Themed Card</h2>
          <p className="text-muted-foreground">This card uses a gradient border and increased shadow via custom styling.</p>
        </CardContent>
      </Card>
    </div>
  );
}
