// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSInputGroup.test.tsx
 * @input Uses vitest, @testing-library/react, InputGroup and TextInput components
 * @output Unit tests for XDSInputGroup
 * @position Testing; validates InputGroup component implementation
 *
 * SYNC: When InputGroup component changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSInputGroup} from './XDSInputGroup';
import {XDSInputGroupText} from './XDSInputGroupText';
import {XDSTextInput} from '../TextInput';

describe('XDSInputGroup', () => {
  it('renders a group with aria-label', () => {
    render(
      <XDSInputGroup label="Price">
        <XDSInputGroupText>$</XDSInputGroupText>
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value=""
          onChange={() => {}}
        />
      </XDSInputGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-label', 'Price');
  });

  it('renders the visible label', () => {
    render(
      <XDSInputGroup label="Price">
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value=""
          onChange={() => {}}
        />
      </XDSInputGroup>,
    );

    expect(screen.getByText('Price')).toBeInTheDocument();
  });

  it('renders addon text', () => {
    render(
      <XDSInputGroup label="Price">
        <XDSInputGroupText>$</XDSInputGroupText>
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value=""
          onChange={() => {}}
        />
      </XDSInputGroup>,
    );

    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders the input', () => {
    render(
      <XDSInputGroup label="Price">
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value=""
          onChange={() => {}}
        />
      </XDSInputGroup>,
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders prefix and suffix addons', () => {
    render(
      <XDSInputGroup label="Website">
        <XDSInputGroupText>https://</XDSInputGroupText>
        <XDSTextInput label="URL" isLabelHidden value="" onChange={() => {}} />
        <XDSInputGroupText>.com</XDSInputGroupText>
      </XDSInputGroup>,
    );

    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getByText('.com')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies data-testid', () => {
    render(
      <XDSInputGroup label="Price" data-testid="price-group">
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value=""
          onChange={() => {}}
        />
      </XDSInputGroup>,
    );

    expect(screen.getByTestId('price-group')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(
      <XDSInputGroup label="Price" description="Enter the price in USD">
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value=""
          onChange={() => {}}
        />
      </XDSInputGroup>,
    );

    expect(screen.getByText('Enter the price in USD')).toBeInTheDocument();
  });

  it('renders status message', () => {
    render(
      <XDSInputGroup
        label="Price"
        status={{type: 'error', message: 'Price is required'}}>
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value=""
          onChange={() => {}}
        />
      </XDSInputGroup>,
    );

    expect(screen.getByText('Price is required')).toBeInTheDocument();
  });

  it('renders with hidden label', () => {
    render(
      <XDSInputGroup label="Price" isLabelHidden>
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value=""
          onChange={() => {}}
        />
      </XDSInputGroup>,
    );

    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const {rerender} = render(
      <XDSInputGroup label="Price" size="sm">
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value=""
          onChange={() => {}}
        />
      </XDSInputGroup>,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    rerender(
      <XDSInputGroup label="Price" size="lg">
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value=""
          onChange={() => {}}
        />
      </XDSInputGroup>,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
