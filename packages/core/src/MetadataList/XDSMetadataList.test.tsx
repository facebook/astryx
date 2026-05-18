// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSMetadataList} from './XDSMetadataList';
import {XDSMetadataListItem} from './XDSMetadataListItem';

describe('XDSMetadataList', () => {
  it('renders a description list with items', () => {
    render(
      <XDSMetadataList>
        <XDSMetadataListItem label="Name">Alice</XDSMetadataListItem>
        <XDSMetadataListItem label="Role">Engineer</XDSMetadataListItem>
      </XDSMetadataList>,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
  });

  it('renders a semantic dl element', () => {
    const {container} = render(
      <XDSMetadataList>
        <XDSMetadataListItem label="Key">Value</XDSMetadataListItem>
      </XDSMetadataList>,
    );

    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(container.querySelector('dt')).toBeInTheDocument();
    expect(container.querySelector('dd')).toBeInTheDocument();
  });

  it('renders a title when provided', () => {
    render(
      <XDSMetadataList title={<h3>Details</h3>}>
        <XDSMetadataListItem label="Key">Value</XDSMetadataListItem>
      </XDSMetadataList>,
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(
      <XDSMetadataList data-testid="my-list">
        <XDSMetadataListItem label="Key">Value</XDSMetadataListItem>
      </XDSMetadataList>,
    );

    expect(screen.getByTestId('my-list')).toBeInTheDocument();
  });

  it('shows "Show more" button when items exceed maxNumOfItems', () => {
    render(
      <XDSMetadataList maxNumOfItems={2}>
        <XDSMetadataListItem label="A">1</XDSMetadataListItem>
        <XDSMetadataListItem label="B">2</XDSMetadataListItem>
        <XDSMetadataListItem label="C">3</XDSMetadataListItem>
      </XDSMetadataList>,
    );

    expect(screen.getByText('Show more')).toBeInTheDocument();
    // Third item should be hidden
    expect(screen.queryByText('C')).not.toBeInTheDocument();
  });

  it('toggles show more / show less', async () => {
    const user = userEvent.setup();

    render(
      <XDSMetadataList maxNumOfItems={1}>
        <XDSMetadataListItem label="A">1</XDSMetadataListItem>
        <XDSMetadataListItem label="B">2</XDSMetadataListItem>
      </XDSMetadataList>,
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
      <XDSMetadataList orientation="horizontal" maxNumOfItems={1}>
        <XDSMetadataListItem label="A">1</XDSMetadataListItem>
        <XDSMetadataListItem label="B">2</XDSMetadataListItem>
      </XDSMetadataList>,
    );

    expect(screen.queryByText('Show more')).not.toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});

describe('XDSMetadataListItem', () => {
  it('renders label and children', () => {
    render(
      <XDSMetadataList>
        <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      </XDSMetadataList>,
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    render(
      <XDSMetadataList>
        <XDSMetadataListItem
          label="Info"
          icon={<span data-testid="test-icon">*</span>}>
          Details
        </XDSMetadataListItem>
      </XDSMetadataList>,
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders in stacked mode when label position is top', () => {
    const {container} = render(
      <XDSMetadataList label={{position: 'top'}}>
        <XDSMetadataListItem label="Key">Value</XDSMetadataListItem>
      </XDSMetadataList>,
    );

    // In stacked mode, dt and dd are inside a wrapper div
    const wrapper = container.querySelector('.xds-metadata-list-item');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.querySelector('dt')).toBeInTheDocument();
    expect(wrapper?.querySelector('dd')).toBeInTheDocument();
  });
});
