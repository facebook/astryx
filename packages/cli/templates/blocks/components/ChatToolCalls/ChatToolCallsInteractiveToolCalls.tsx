'use client';

import {XDSChatToolCalls} from '@xds/core/Chat';
import {XDSCodeBlock} from '@xds/core/CodeBlock';

const editDiff = `--- a/packages/core/src/Button/XDSButton.tsx
+++ b/packages/core/src/Button/XDSButton.tsx
@@ -55,7 +55,7 @@
-    borderRadius: 'var(--button-radius)',
+    borderRadius: 'var(--button-radius, var(--radius-element))',
@@ -93,6 +93,10 @@
+  focusVisible: {
+    outline: '2px solid var(--color-ring-focus)',
+    outlineOffset: '2px',
+  },`;

const testOutput = `$ yarn test
 PASS  packages/core/src/Button/XDSButton.test.tsx
 PASS  packages/core/src/Chat/XDSChatToolCalls.test.tsx

Test Suites: 7 passed, 7 total
Tests:       67 passed, 67 total
Time:        6.1s`;

export default function ChatToolCallsInteractiveToolCalls() {
  return (
    <XDSChatToolCalls
      calls={[
        {
          name: 'edit',
          target: 'XDSButton.tsx',
          status: 'complete',
          duration: '85ms',
          node: 'cli:devvm',
          additions: 12,
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
          duration: '6.1s',
          node: 'cli:devvm',
          resultDetail: (
            <XDSCodeBlock
              code={testOutput}
              language="bash"
              maxHeight="50vh"
            />
          ),
        },
        {
          name: 'web_search',
          target: 'CSS anchor positioning',
          status: 'complete',
          duration: '1.8s',
        },
      ]}
    />
  );
}
