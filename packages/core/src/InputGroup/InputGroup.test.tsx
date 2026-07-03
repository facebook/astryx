// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file InputGroup.test.tsx
 * @input Uses vitest, @testing-library/react, InputGroup and TextInput components
 * @output Unit tests for InputGroup
 * @position Testing; validates InputGroup component implementation
 *
 * SYNC: When InputGroup component changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {InputGroup} from './InputGroup';
import {InputGroupText} from './InputGroupText';
import {TextInput} from '../TextInput';

describe('InputGroup', () => {
  it('names the group via the label element (forms-14)', () => {
    render(
      <InputGroup label="Price">
        <InputGroupText>$</InputGroupText>
        <TextInput label="Amount" isLabelHidden value="" onChange={() => {}} />
      </InputGroup>,
    );

    // The group is named by the field label via aria-labelledby (not a
    // duplicated aria-label). The label is rendered as a <span> (not a literal
    // <label>, which can't name a group) and carries no orphaned htmlFor.
    const group = screen.getByRole('group', {name: 'Price'});
    expect(group).toBeInTheDocument();
    expect(group).not.toHaveAttribute('aria-label');
    const label = screen.getByText('Price');
    expect(label.tagName).toBe('SPAN');
    expect(label.closest('label')).toBeNull();
    expect(label).not.toHaveAttribute('for');
    expect(group.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('renders the visible label', () => {
    render(
      <InputGroup label="Price">
        <TextInput label="Amount" isLabelHidden value="" onChange={() => {}} />
      </InputGroup>,
    );

    expect(screen.getByText('Price')).toBeInTheDocument();
  });

  it('renders addon text', () => {
    render(
      <InputGroup label="Price">
        <InputGroupText>$</InputGroupText>
        <TextInput label="Amount" isLabelHidden value="" onChange={() => {}} />
      </InputGroup>,
    );

    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders the input', () => {
    render(
      <InputGroup label="Price">
        <TextInput label="Amount" isLabelHidden value="" onChange={() => {}} />
      </InputGroup>,
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders prefix and suffix addons', () => {
    render(
      <InputGroup label="Website">
        <InputGroupText>https://</InputGroupText>
        <TextInput label="URL" isLabelHidden value="" onChange={() => {}} />
        <InputGroupText>.com</InputGroupText>
      </InputGroup>,
    );

    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getByText('.com')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies data-testid', () => {
    render(
      <InputGroup label="Price" data-testid="price-group">
        <TextInput label="Amount" isLabelHidden value="" onChange={() => {}} />
      </InputGroup>,
    );

    expect(screen.getByTestId('price-group')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(
      <InputGroup label="Price" description="Enter the price in USD">
        <TextInput label="Amount" isLabelHidden value="" onChange={() => {}} />
      </InputGroup>,
    );

    expect(screen.getByText('Enter the price in USD')).toBeInTheDocument();
  });

  it('renders status message', () => {
    render(
      <InputGroup
        label="Price"
        status={{type: 'error', message: 'Price is required'}}>
        <TextInput label="Amount" isLabelHidden value="" onChange={() => {}} />
      </InputGroup>,
    );

    expect(screen.getByText('Price is required')).toBeInTheDocument();
  });

  it('renders with hidden label', () => {
    render(
      <InputGroup label="Price" isLabelHidden>
        <TextInput label="Amount" isLabelHidden value="" onChange={() => {}} />
      </InputGroup>,
    );

    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const {rerender} = render(
      <InputGroup label="Price" size="sm">
        <TextInput label="Amount" isLabelHidden value="" onChange={() => {}} />
      </InputGroup>,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    rerender(
      <InputGroup label="Price" size="lg">
        <TextInput label="Amount" isLabelHidden value="" onChange={() => {}} />
      </InputGroup>,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
