'use client';

import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';

function HomeIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93s.844.141 1.2-.058l.758-.454a1.125 1.125 0 0 1 1.37.17l.773.773c.4.4.48 1.01.17 1.37l-.454.758c-.2.356-.223.808-.058 1.2s.506.71.93.78l.894.149c.542.09.94.56.94 1.11v1.093c0 .55-.398 1.02-.94 1.11l-.894.149c-.424.07-.764.384-.93.78s-.141.844.058 1.2l.454.758a1.125 1.125 0 0 1-.17 1.37l-.773.773a1.125 1.125 0 0 1-1.37.17l-.758-.454c-.356-.2-.808-.223-1.2-.058s-.71.506-.78.93l-.149.894c-.09.542-.56.94-1.11.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.894a1.62 1.62 0 0 0-.78-.93 1.62 1.62 0 0 0-1.2.058l-.758.454a1.125 1.125 0 0 1-1.37-.17l-.773-.773a1.125 1.125 0 0 1-.17-1.37l.454-.758c.2-.356.223-.808.058-1.2a1.62 1.62 0 0 0-.93-.78l-.894-.149c-.542-.09-.94-.56-.94-1.11v-1.093c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.384.93-.78s.141-.844-.058-1.2l-.454-.758a1.125 1.125 0 0 1 .17-1.37l.773-.773a1.125 1.125 0 0 1 1.37-.17l.758.454c.356.2.808.223 1.2.058s.71-.506.78-.93l.149-.894ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

export default function BreadcrumbsWithIcons() {
  return (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem href="/" startIcon={<HomeIcon />}>
        Home
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/settings" startIcon={<SettingsIcon />}>
        Settings
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>Profile</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  );
}
