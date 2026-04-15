'use client';

import {stack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

function Child() {
  return <div style={{padding: 8}}>Child</div>;
}

export default function StackStyleXUtilityAdvancedUse() {
  return (
    <div {...(stylex.props(...stack({direction: 'horizontal', gap: 2})) as React.HTMLAttributes<HTMLDivElement>)}>
      <Child />
      <Child />
    </div>
  );
}
