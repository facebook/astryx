// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {CodeBlock} from '@astryxdesign/core/CodeBlock';

const code = `interface User {
  id: string;
  name: string;
}

export function useUser(id: string) {
  const [user, setUser] = useState<User>();
  useEffect(() => {
    fetchUser(id).then(setUser);
  }, [id]);
  return user;
}`;

export default function CodeBlockHighlightedLines() {
  return (
    <CodeBlock
      code={code}
      language="typescript"
      title="useUser.ts"
      hasLineNumbers
      highlightLines={[8, 9, 10]}
    />
  );
}
