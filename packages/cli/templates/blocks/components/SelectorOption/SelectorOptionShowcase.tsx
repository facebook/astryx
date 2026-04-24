'use client';

import {useState} from 'react';
import {XDSSelector, XDSSelectorOption} from '@xds/core/Selector';
import {XDSCenter} from '@xds/core/Center';

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const descriptions: Record<string, string> = {
  admin: 'Full access to all resources',
  editor: 'Can edit and publish content',
  viewer: 'Read-only access',
  billing: 'Manage plans and payments',
};

const roles = [
  {value: 'admin', label: 'Admin'},
  {value: 'editor', label: 'Editor'},
  {value: 'viewer', label: 'Viewer'},
  {value: 'billing', label: 'Billing'},
];

export default function SelectorOptionShowcase() {
  const [value, setValue] = useState<string | undefined>('editor');

  return (
    <XDSCenter width={280}>
      <XDSSelector
        label="Role"
        options={roles}
        value={value}
        onChange={setValue}
        placeholder="Assign a role...">
        {option => (
          <XDSSelectorOption
            icon={UserIcon}
            label={option.label}
            description={descriptions[option.value]}
          />
        )}
      </XDSSelector>
    </XDSCenter>
  );
}
