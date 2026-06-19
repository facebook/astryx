// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MetadataList} from './MetadataList';
import {MetadataListItem} from './MetadataListItem';

describe('MetadataList', () => {
  it('renders a description list with items', () => {
    render(
      <MetadataList>
        <MetadataListItem label="Name">Alice</MetadataListItem>
        <MetadataListItem label="Role">Engineer</MetadataListItem>
      </MetadataList>,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
  });

  it('renders a semantic dl element', () => {
    const {container} = render(
      <MetadataList>
        <MetadataListItem label="Key">Value</MetadataListItem>
      </MetadataList>,
    );

    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(container.querySelector('dt')).toBeInTheDocument();
    expect(container.querySelector('dd')).toBeInTheDocument();
  });

  it('renders a title when provided', () => {
    render(
      <MetadataList title={<h3>Details</h3>}>
        <MetadataListItem label="Key">Value</MetadataListItem>
      </MetadataList>,
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(
      <MetadataList data-testid="my-list">
        <MetadataListItem label="Key">Value</MetadataListItem>
      </MetadataList>,
    );

    expect(screen.getByTestId('my-list')).toBeInTheDocument();
  });

  it('shows "Show more" button when items exceed maxNumOfItems', () => {
    render(
      <MetadataList maxNumOfItems={2}>
        <MetadataListItem label="A">1</MetadataListItem>
        <MetadataListItem label="B">2</MetadataListItem>
        <MetadataListItem label="C">3</MetadataListItem>
      </MetadataList>,
    );

    expect(screen.getByText('Show more')).toBeInTheDocument();
    // Third item should be hidden
    expect(screen.queryByText('C')).not.toBeInTheDocument();
  });

  it('toggles show more / show less', async () => {
    const user = userEvent.setup();

    render(
      <MetadataList maxNumOfItems={1}>
        <MetadataListItem label="A">1</MetadataListItem>
        <MetadataListItem label="B">2</MetadataListItem>
      </MetadataList>,
    );

    expect(screen.queryByText('B')).not.toBeInTheDocument();

    await user.click(screen.getByText('Show more'));
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('Show less')).toBeInTheDocument();

    await user.click(screen.getByText('Show less'));
    expect(screen.queryByText('B')).not.toBeInTheDocument();
  });

  it('does not show toggle in horizontal mode even with maxNumOfItems', () => {
    render(
      <MetadataList orientation="horizontal" maxNumOfItems={1}>
        <MetadataListItem label="A">1</MetadataListItem>
        <MetadataListItem label="B">2</MetadataListItem>
      </MetadataList>,
    );

    expect(screen.queryByText('Show more')).not.toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});

describe('MetadataListItem', () => {
  it('renders label and children', () => {
    render(
      <MetadataList>
        <MetadataListItem label="Status">Active</MetadataListItem>
      </MetadataList>,
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    render(
      <MetadataList>
        <MetadataListItem
          label="Info"
          icon={<span data-testid="test-icon">*</span>}>
          Details
        </MetadataListItem>
      </MetadataList>,
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders in stacked mode when label position is top', () => {
    const {container} = render(
      <MetadataList label={{position: 'top'}}>
        <MetadataListItem label="Key">Value</MetadataListItem>
      </MetadataList>,
    );

    // In stacked mode, dt and dd are inside a wrapper div
    const wrapper = container.querySelector('.xds-metadata-list-item');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.querySelector('dt')).toBeInTheDocument();
    expect(wrapper?.querySelector('dd')).toBeInTheDocument();
  });
});
