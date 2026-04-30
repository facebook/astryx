'use client';

import {XDSChatToolCalls} from '@xds/core/Chat';
import {XDSCodeBlock} from '@xds/core/CodeBlock';

const errorOutput = `$ yarn test
 PASS  src/utils/formatDate.test.ts (3 tests)
 FAIL  src/components/DataGrid.test.tsx

  ● DataGrid > sorts columns on header click

    TypeError: Cannot read properties of undefined (reading 'sort')

Test Suites: 1 failed, 4 passed, 5 total
Tests:       2 failed, 18 passed, 20 total
Time:        3.41s`;

export default function ChatToolCallsToolCallsWithErrors() {
  return (
    <XDSChatToolCalls
      defaultIsExpanded
      calls={[
        {
          name: 'bash',
          target: 'yarn build',
          status: 'complete',
          duration: '8s',
          node: 'cli:devvm',
        },
        {
          name: 'read',
          target: 'src/components/DataGrid.tsx',
          status: 'complete',
          duration: '15ms',
          node: 'cli:devvm',
        },
        {
          name: 'bash',
          target: 'yarn test',
          status: 'error',
          duration: '3.4s',
          node: 'cli:devvm',
          errorMessage: '2 tests failed',
          resultDetail: (
            <XDSCodeBlock
              code={errorOutput}
              language="bash"
              maxHeight="50vh"
            />
          ),
        },
      ]}
    />
  );
}
