'use client';

import {XDSCodeBlock} from '@xds/core/CodeBlock';

const code = `import {useState, useEffect} from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}\`);
  }
  return response.json();
}

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(id).then(setUser);
  }, [id]);

  return user;
}`;

export default function CodeBlockHighlightedLines() {
  return (
    <XDSCodeBlock
      code={code}
      language="typescript"
      title="useUser.ts"
      hasLineNumbers
      highlightLines={[9, 10, 11, 12, 13]}
    />
  );
}
