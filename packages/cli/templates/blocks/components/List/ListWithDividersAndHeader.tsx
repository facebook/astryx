'use client';

import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSIcon} from '@xds/core/Icon';

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function ListWithDividersAndHeader() {
  return (
    <XDSList hasDividers header={<strong>Team Members</strong>}>
      <XDSListItem
        label="Alice Johnson"
        description="Engineering"
        startContent={<XDSIcon icon={UserIcon} />}
      />
      <XDSListItem
        label="Bob Smith"
        description="Design"
        startContent={<XDSIcon icon={UserIcon} />}
      />
    </XDSList>
  );
}
