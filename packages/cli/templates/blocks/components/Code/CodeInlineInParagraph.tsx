'use client';

import {XDSCode} from '@xds/core/CodeBlock';
import {XDSText} from '@xds/core/Text';

export default function CodeInlineInParagraph() {
  return (
    <XDSText type="body">
      Use <XDSCode>useState</XDSCode> for local state and{' '}
      <XDSCode>useEffect</XDSCode> for side effects. If you need shared state
      across components, consider <XDSCode>useContext</XDSCode> or a state
      management library.
    </XDSText>
  );
}
