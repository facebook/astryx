import type {ComponentDoc} from '../docs-types';

export const docs: ComponentDoc = {
  name: 'NavIcon',
  description:
    'Circular icon container with accent background for navigation headers.',
  features: [
    'Shared — used in both XDSTopNavTitle and XDSPageNavHeader',
    'Accent background — uses --color-accent with --color-icon-on-media contrast',
    'Fixed size — renders at the medium (--size-md) design token size',
  ],
  props: [
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'The icon element to render inside the circular background. Should be an XDSIcon or similar icon component.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'In top navigation',
      code: `import {CubeIcon} from '@heroicons/react/24/solid';

<XDSTopNavTitle
  title="My App"
  logo={<XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />}
/>`,
    },
    {
      label: 'In side navigation',
      code: `import {CubeIcon} from '@heroicons/react/24/solid';

<XDSPageNavHeader
  icon={<XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />}
  title="My App"
/>`,
    },
    {
      label: 'With HomeIcon',
      code: `import {HomeIcon} from '@heroicons/react/24/solid';

<XDSTopNavTitle
  title="Dashboard"
  logo={<XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
/>`,
    },
  ],
};
