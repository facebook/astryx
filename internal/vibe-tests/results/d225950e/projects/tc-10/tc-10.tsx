// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Card} from '@astryxdesign/core/Card';

export default function InstallSnippet() {
  return (
    <div className="flex flex-col gap-4 p-6 max-w-xl mx-auto">
      <Card>
        <div className="flex flex-col gap-3 p-4">
          <Heading level={2}>Getting Started</Heading>
          <Text>Install the package using your preferred package manager:</Text>
          <CodeBlock
            code="npm install @astryxdesign/core @astryxdesign/theme-neutral"
            language="bash"
            title="Terminal"
          />
          <Text color="secondary" type="supporting">
            Then import and use any component in your React project.
          </Text>
        </div>
      </Card>
    </div>
  );
}
