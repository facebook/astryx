// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatToolCalls} from '@xds/core/Chat';
import {XDSCodeBlock} from '@xds/core/CodeBlock';

const editDiff = `--- a/src/utils/formatDate.ts
+++ b/src/utils/formatDate.ts
@@ -8,7 +8,11 @@
-export function formatDate(date: Date): string {
-  return date.toLocaleDateString();
-}
+export function formatDate(
+  date: Date,
+  locale = 'en-US',
+  options?: Intl.DateTimeFormatOptions,
+): string {
+  return new Intl.DateTimeFormat(locale, options).format(date);
+}`;

const testOutput = `$ yarn test
 PASS  src/utils/formatDate.test.ts
 PASS  src/components/DatePicker.test.tsx

Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total
Time:        1.8s`;

export default function ChatToolCallsInteractiveToolCalls() {
  return (
    <XDSChatToolCalls
      defaultIsExpanded
      calls={[
        {
          name: 'edit',
          target: 'src/utils/formatDate.ts',
          status: 'complete',
          duration: '85ms',
          node: 'cli:remote-server',
          additions: 6,
          deletions: 3,
          resultDetail: (
            <XDSCodeBlock
              code={editDiff}
              language="typescript"
              maxHeight="50vh"
            />
          ),
        },
        {
          name: 'bash',
          target: 'yarn test',
          status: 'complete',
          duration: '1.8s',
          node: 'cli:remote-server',
          resultDetail: (
            <XDSCodeBlock code={testOutput} language="bash" maxHeight="50vh" />
          ),
        },
        {
          name: 'web_search',
          target: 'Intl.DateTimeFormat locale options',
          status: 'complete',
          duration: '1.2s',
        },
      ]}
    />
  );
}
