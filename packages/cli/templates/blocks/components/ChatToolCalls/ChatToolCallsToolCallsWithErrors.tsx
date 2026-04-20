'use client';

import {XDSChatToolCalls} from '@xds/core/Chat';
import {XDSCodeBlock} from '@xds/core/CodeBlock';

const errorOutput = `$ yarn test
 PASS  packages/core/src/Chat/XDSChatReasoning.test.tsx (7 tests)
 FAIL  packages/core/src/Chat/XDSChatToolCalls.test.tsx

  ● XDSChatToolCalls > renders group header for multiple calls

    ReferenceError: hasError is not defined

Test Suites: 1 failed, 6 passed, 7 total
Tests:       4 failed, 63 passed, 67 total
Time:        6.84s`;

export default function ChatToolCallsToolCallsWithErrors() {
  return (
    <XDSChatToolCalls
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
          target: 'XDSChatToolCalls.tsx',
          status: 'complete',
          duration: '15ms',
          node: 'cli:devvm',
        },
        {
          name: 'bash',
          target: 'yarn test',
          status: 'error',
          duration: '6.8s',
          node: 'cli:devvm',
          errorMessage: '4 tests failed',
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
