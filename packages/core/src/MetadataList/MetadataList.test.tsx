// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MetadataList} from './MetadataList';
import {MetadataListItem} from './MetadataListItem';
import {InternationalizationProvider} from '../i18n';

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

  it('localizes the show more / show less labels through the i18n catalog', async () => {
    const user = userEvent.setup();

    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{
          fr: {
            '@astryx.metadataList.showMore': 'Afficher plus',
            '@astryx.metadataList.showLess': 'Afficher moins',
          },
        }}>
        <MetadataList maxNumOfItems={1}>
          <MetadataListItem label="A">1</MetadataListItem>
          <MetadataListItem label="B">2</MetadataListItem>
        </MetadataList>
      </InternationalizationProvider>,
    );

    await user.click(screen.getByText('Afficher plus'));
    expect(screen.getByText('Afficher moins')).toBeInTheDocument();
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

  describe('numeric columns', () => {
    // A fixed column count is a runtime value, so it arrives as a StyleX
    // dynamic style: the template lands in the element's inline style (as the
    // generated custom property) rather than in a static class rule.
    const gridTemplateOf = (container: HTMLElement) =>
      container.querySelector('dl')?.getAttribute('style') ?? '';

    it('renders the requested number of columns with stacked labels', () => {
      const {container} = render(
        <MetadataList columns={3}>
          <MetadataListItem label="A">1</MetadataListItem>
        </MetadataList>,
      );

      expect(gridTemplateOf(container)).toContain('repeat(3, 1fr)');
    });

    it('renders label and value tracks per column with side labels', () => {
      const {container} = render(
        <MetadataList columns={3} label={{position: 'start'}}>
          <MetadataListItem label="A">1</MetadataListItem>
        </MetadataList>,
      );

      expect(gridTemplateOf(container)).toContain('repeat(3, auto 1fr)');
    });

    it('leaves the grid to the static rule for columns="multi"', () => {
      const {container} = render(
        <MetadataList columns="multi">
          <MetadataListItem label="A">1</MetadataListItem>
        </MetadataList>,
      );

      expect(gridTemplateOf(container)).not.toContain('repeat(');
    });

    it('ignores numeric columns in horizontal orientation', () => {
      const {container} = render(
        <MetadataList columns={3} orientation="horizontal">
          <MetadataListItem label="A">1</MetadataListItem>
        </MetadataList>,
      );

      expect(gridTemplateOf(container)).not.toContain('repeat(');
    });

    it('still applies a custom label width with side labels', () => {
      const {container} = render(
        <MetadataList label={{position: 'start', width: 120}}>
          <MetadataListItem label="A">1</MetadataListItem>
        </MetadataList>,
      );

      expect(gridTemplateOf(container)).toContain('120px 1fr');
    });
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
    const wrapper = container.querySelector('.astryx-metadata-list-item');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.querySelector('dt')).toBeInTheDocument();
    expect(wrapper?.querySelector('dd')).toBeInTheDocument();
  });
});

describe('MetadataListItem pass-through props', () => {
  it('forwards pass-through props to the item element', () => {
    render(
      <MetadataList>
        <MetadataListItem
          label="Owner"
          aria-label="Owner field"
          id="owner"
          data-source="crm"
          data-testid="item">
          Alice
        </MetadataListItem>
      </MetadataList>,
    );
    const item = screen.getByTestId('item-label');
    expect(item).toHaveAttribute('aria-label', 'Owner field');
    expect(item).toHaveAttribute('id', 'owner');
    expect(item).toHaveAttribute('data-source', 'crm');
  });

  it('forwards pass-through props in the stacked layout', () => {
    render(
      <MetadataList orientation="horizontal">
        <MetadataListItem label="Owner" id="owner-stacked" data-testid="item">
          Alice
        </MetadataListItem>
      </MetadataList>,
    );
    expect(screen.getByTestId('item')).toHaveAttribute('id', 'owner-stacked');
  });
});

describe('MetadataListItem pass-through target', () => {
  it('lands pass-through props on the <dt> in the inline layout, where the ref also goes', () => {
    const handleClick = vi.fn();
    render(
      <MetadataList>
        <MetadataListItem
          label="Owner"
          onClick={handleClick}
          data-testid="item">
          Alice
        </MetadataListItem>
      </MetadataList>,
    );

    const label = screen.getByTestId('item-label');
    expect(label.tagName).toBe('DT');
    fireEvent.click(label);
    expect(handleClick).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByTestId('item-value'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('lands them on the wrapper in the stacked layout, so both halves are covered', () => {
    const handleClick = vi.fn();
    render(
      <MetadataList orientation="horizontal">
        <MetadataListItem
          label="Owner"
          onClick={handleClick}
          data-testid="item">
          Alice
        </MetadataListItem>
      </MetadataList>,
    );

    fireEvent.click(screen.getByText('Alice'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
