'use client';

import {useState} from 'react';
import {XDSChatPastedTextToken} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const CONFIG_TEXT = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}`;

const SQL_QUERY = `SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2025-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC
LIMIT 50;`;

export default function ChatPastedTextTokenExpandable() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          With Expand button (hover to see)
        </XDSText>
        <XDSStack direction="horizontal" gap={2} vAlign="center">
          {expanded === 'config' ? (
            <XDSText type="body">Token expanded</XDSText>
          ) : (
            <XDSChatPastedTextToken
              text={CONFIG_TEXT}
              onExpand={() => setExpanded('config')}
            />
          )}
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Another expandable token
        </XDSText>
        <XDSStack direction="horizontal" gap={2} vAlign="center">
          {expanded === 'sql' ? (
            <XDSText type="body">Token expanded</XDSText>
          ) : (
            <XDSChatPastedTextToken
              text={SQL_QUERY}
              onExpand={() => setExpanded('sql')}
            />
          )}
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Without Expand (read-only preview)
        </XDSText>
        <XDSStack direction="horizontal" gap={2} vAlign="center">
          <XDSChatPastedTextToken text={CONFIG_TEXT} />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
