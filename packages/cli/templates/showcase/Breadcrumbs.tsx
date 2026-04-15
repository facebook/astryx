'use client';

import {XDSBreadcrumbs} from '@xds/core/Breadcrumbs';

export default function BreadcrumbsShowcase() {
  return <XDSBreadcrumbs items={[{label: 'Home'}, {label: 'Settings'}]} />;
}
