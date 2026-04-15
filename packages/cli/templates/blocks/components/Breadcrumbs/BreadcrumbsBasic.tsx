'use client';

import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';

export default function BreadcrumbsBasic() {
  return (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  );
}
