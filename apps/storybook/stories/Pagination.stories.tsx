import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSPagination} from '@xds/core/Pagination';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  pageWrapper: {
    backgroundColor: colorVars['--color-wash'],
    padding: spacingVars['--spacing-6'],
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-6'],
  },
  label: {
    fontFamily: 'inherit',
    fontSize: 14,
    color: colorVars['--color-text-secondary'],
    margin: 0,
  },
});

const meta: Meta<typeof XDSPagination> = {
  title: 'Navigation/XDSPagination',
  component: XDSPagination,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div {...stylex.props(styles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of pagination controls',
    },
    currentPage: {
      control: {type: 'number', min: 1},
      description: 'Current active page (1-indexed)',
    },
    totalPages: {
      control: {type: 'number', min: 1},
      description: 'Total number of pages',
    },
    maxVisiblePages: {
      control: {type: 'number', min: 3},
      description: 'Max page buttons before ellipsis',
    },
    hasArrows: {
      control: 'boolean',
      description: 'Show previous/next arrow buttons',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disable all controls',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSPagination>;

export const Default: Story = {
  render: function Default() {
    const [page, setPage] = useState(1);
    return (
      <XDSPagination
        currentPage={page}
        totalPages={10}
        onPageChange={setPage}
      />
    );
  },
};

export const FewPages: Story = {
  render: function FewPages() {
    const [page, setPage] = useState(1);
    return (
      <XDSPagination currentPage={page} totalPages={3} onPageChange={setPage} />
    );
  },
};

export const ManyPages: Story = {
  render: function ManyPages() {
    const [page, setPage] = useState(1);
    return (
      <XDSPagination
        currentPage={page}
        totalPages={100}
        onPageChange={setPage}
      />
    );
  },
};

export const MiddlePage: Story = {
  render: function MiddlePage() {
    const [page, setPage] = useState(50);
    return (
      <XDSPagination
        currentPage={page}
        totalPages={100}
        onPageChange={setPage}
      />
    );
  },
};

export const SmallSize: Story = {
  render: function SmallSize() {
    const [page, setPage] = useState(1);
    return (
      <XDSPagination
        currentPage={page}
        totalPages={10}
        onPageChange={setPage}
        size="sm"
      />
    );
  },
};

export const WithoutArrows: Story = {
  render: function WithoutArrows() {
    const [page, setPage] = useState(3);
    return (
      <XDSPagination
        currentPage={page}
        totalPages={5}
        onPageChange={setPage}
        hasArrows={false}
      />
    );
  },
};

export const Disabled: Story = {
  render: function Disabled() {
    return (
      <XDSPagination
        currentPage={3}
        totalPages={10}
        onPageChange={() => {}}
        isDisabled
      />
    );
  },
};

export const Sizes: Story = {
  render: function Sizes() {
    const [pageMd, setPageMd] = useState(5);
    const [pageSm, setPageSm] = useState(5);
    return (
      <div {...stylex.props(styles.stack)}>
        <div>
          <p {...stylex.props(styles.label)}>md (default)</p>
          <XDSPagination
            currentPage={pageMd}
            totalPages={20}
            onPageChange={setPageMd}
          />
        </div>
        <div>
          <p {...stylex.props(styles.label)}>sm (compact)</p>
          <XDSPagination
            currentPage={pageSm}
            totalPages={20}
            onPageChange={setPageSm}
            size="sm"
          />
        </div>
      </div>
    );
  },
};

export const CustomMaxVisible: Story = {
  render: function CustomMaxVisible() {
    const [page, setPage] = useState(25);
    return (
      <XDSPagination
        currentPage={page}
        totalPages={50}
        onPageChange={setPage}
        maxVisiblePages={5}
      />
    );
  },
};
