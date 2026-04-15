'use client';

import {useXDSLinkComponent} from '@xds/core/Link';
import type {XDSLinkComponentType} from '@xds/core/Link';

function MyLink({as}: {as?: XDSLinkComponentType}) {
  const LinkComponent = useXDSLinkComponent(as);
  return <LinkComponent href="/foo">Click me</LinkComponent>;
}

export default function LinkUseHook() {
  return <MyLink />;
}
