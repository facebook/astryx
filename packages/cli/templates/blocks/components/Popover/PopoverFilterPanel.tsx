'use client';

import {useState} from 'react';
import {XDSPopover} from '@xds/core/Popover';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSHeading} from '@xds/core/Text';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSDivider} from '@xds/core/Divider';
export default function PopoverFilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    active: true,
    archived: false,
    drafts: true,
    shared: false,
  });

  const toggle = (key: keyof typeof filters) =>
    setFilters(prev => ({...prev, [key]: !prev[key]}));

  return (
    <XDSPopover
      placement="below"
      label="Filter"
      width={240}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      content={
        <XDSVStack gap={3}>
          <XDSHeading level={4}>Filter by status</XDSHeading>
          <XDSDivider />
          <XDSCheckboxInput
            label="Active"
            value={filters.active}
            onChange={() => toggle('active')}
          />
          <XDSCheckboxInput
            label="Archived"
            value={filters.archived}
            onChange={() => toggle('archived')}
          />
          <XDSCheckboxInput
            label="Drafts"
            value={filters.drafts}
            onChange={() => toggle('drafts')}
          />
          <XDSCheckboxInput
            label="Shared with me"
            value={filters.shared}
            onChange={() => toggle('shared')}
          />
          <XDSDivider />
          <XDSHStack gap={2} hAlign="end">
            <XDSButton
              label="Apply"
              variant="primary"
              onClick={() => setIsOpen(false)}>
              Apply
            </XDSButton>
            <XDSButton
              label="Reset"
              variant="ghost"
              onClick={() =>
                setFilters({
                  active: true,
                  archived: false,
                  drafts: true,
                  shared: false,
                })
              }>
              Reset
            </XDSButton>
          </XDSHStack>
        </XDSVStack>
      }>
      <XDSButton label="Filter">Filter</XDSButton>
    </XDSPopover>
  );
}
