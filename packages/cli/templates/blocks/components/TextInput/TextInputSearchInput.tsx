'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

export default function TextInputSearchInput() {
  const [value, setValue] = useState('');
  return (
    <XDSTextInput
      label="Search"
      isLabelHidden
      value={value}
      onChange={setValue}
      placeholder="Search..."
      startIcon={SearchIcon}
      hasClear
    />
  );
}
