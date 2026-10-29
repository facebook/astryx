// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {MobileNav} from '@astryxdesign/core/MobileNav';
import {SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {TextInput} from '@astryxdesign/core/TextInput';
import {HomeIcon} from '@heroicons/react/24/outline';

// Fixture for the MobileNav header-row browser spec: a header taller than one
// bar (a title over a search field) must stay inside its row.
const meta: Meta<typeof MobileNav> = {
  title: 'Core/MobileNav Tall Header',
  component: MobileNav,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof MobileNav>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    return (
      <>
        <Button
          label="Open Navigation"
          icon={<Icon icon="menu" color="inherit" />}
          variant="ghost"
          onClick={() => setIsOpen(true)}
          isIconOnly
        />
        <MobileNav
          isOpen={isOpen}
          onOpenChange={open => setIsOpen(open)}
          header={
            <div data-testid="tall-header">
              <strong>Workspace</strong>
              <TextInput
                label="Search"
                isLabelHidden
                value={query}
                onChange={setQuery}
              />
            </div>
          }>
          <SideNavSection title="Main">
            <SideNavItem
              label="Dashboard"
              icon={HomeIcon}
              isSelected
              href="/dashboard"
            />
          </SideNavSection>
        </MobileNav>
      </>
    );
  },
};
