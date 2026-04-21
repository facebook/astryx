'use client';

import {XDSDropdownMenu, XDSDropdownMenuItem} from '@xds/core/DropdownMenu';
import {XDSDivider} from '@xds/core/Divider';

export default function DropdownMenuCompoundMode() {
  return (
    <XDSDropdownMenu button={{label: 'Actions'}}>
      <XDSDropdownMenuItem label="Edit" onClick={() => {}} />
      <XDSDropdownMenuItem label="Duplicate" onClick={() => {}} />
      <XDSDivider />
      <XDSDropdownMenuItem label="Delete" onClick={() => {}} />
    </XDSDropdownMenu>
  );
}
