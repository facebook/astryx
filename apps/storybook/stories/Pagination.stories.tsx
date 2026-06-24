// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {Pagination} from '@astryxdesign/core/Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Core/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    page: {
      control: 'number',
      description: 'Current page (1-based)',
    },
    variant: {
      control: 'select',
      options: ['pages', 'count', 'compact', 'dots', 'none'],
      description: 'Visual variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size variant',
    },
    siblingCount: {
      control: 'number',
      description: 'Pages shown around current page',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

// Interactive wrapper for controlled state
function PaginationDemo(
  props: Omit<React.ComponentProps<typeof Pagination>, 'onChange'>,
) {
  const [page, setPage] = useState(props.page ?? 1);
  const [pageSize, setPageSize] = useState(props.pageSize ?? 10);
  return (
    <Pagination
      {...props}
      page={page}
      onChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={props.pageSizeOptions ? setPageSize : undefined}
    />
  );
}

export const Default: Story = {
  render: () => <PaginationDemo page={1} totalItems={100} pageSize={10} />,
};

export const PagesVariant: Story = {
  name: 'Variant: Pages',
  render: () => (
    <PaginationDemo page={1} totalItems={200} pageSize={10} variant="pages" />
  ),
};

export const CountVariant: Story = {
  name: 'Variant: Count',
  render: () => (
    <PaginationDemo page={1} totalItems={200} pageSize={20} variant="count" />
  ),
};

export const CompactVariant: Story = {
  name: 'Variant: Compact',
  render: () => <PaginationDemo page={1} totalPages={10} variant="compact" />,
};

export const DotsVariant: Story = {
  name: 'Variant: Dots',
  render: () => <PaginationDemo page={1} totalPages={8} variant="dots" />,
};

export const NoneVariant: Story = {
  name: 'Variant: None',
  render: () => <PaginationDemo page={1} totalPages={5} variant="none" />,
};

export const WithPageSizeSelector: Story = {
  name: 'With Page Size Selector',
  render: () => (
    <PaginationDemo
      page={1}
      totalItems={200}
      pageSize={10}
      pageSizeOptions={[10, 20, 50]}
      variant="count"
    />
  ),
};

export const CursorBased: Story = {
  name: 'Cursor-Based (hasMore)',
  render: () => <PaginationDemo page={1} hasMore={true} />,
};

export const SmallSize: Story = {
  name: 'Small Size',
  render: () => (
    <PaginationDemo page={1} totalItems={100} pageSize={10} size="sm" />
  ),
};

export const ManyPages: Story = {
  name: 'Many Pages (Ellipsis)',
  render: () => <PaginationDemo page={5} totalItems={500} pageSize={10} />,
};

export const ManyPagesLargeSiblings: Story = {
  name: 'Many Pages (siblingCount=2)',
  render: () => (
    <PaginationDemo page={10} totalItems={500} pageSize={10} siblingCount={2} />
  ),
};

export const SinglePage: Story = {
  name: 'Single Page',
  render: () => <PaginationDemo page={1} totalPages={1} />,
};

export const Disabled: Story = {
  render: () => <PaginationDemo page={3} totalPages={10} isDisabled />,
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <div>
        <p style={{marginBottom: 8, fontWeight: 500}}>pages (default)</p>
        <PaginationDemo
          page={3}
          totalItems={100}
          pageSize={10}
          variant="pages"
        />
      </div>
      <div>
        <p style={{marginBottom: 8, fontWeight: 500}}>count</p>
        <PaginationDemo
          page={3}
          totalItems={100}
          pageSize={10}
          variant="count"
        />
      </div>
      <div>
        <p style={{marginBottom: 8, fontWeight: 500}}>compact</p>
        <PaginationDemo page={3} totalPages={10} variant="compact" />
      </div>
      <div>
        <p style={{marginBottom: 8, fontWeight: 500}}>dots</p>
        <PaginationDemo page={3} totalPages={8} variant="dots" />
      </div>
      <div>
        <p style={{marginBottom: 8, fontWeight: 500}}>none</p>
        <PaginationDemo page={3} totalPages={10} variant="none" />
      </div>
    </div>
  ),
};
