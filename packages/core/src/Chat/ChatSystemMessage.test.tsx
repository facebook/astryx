// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRef, Fragment} from 'react';
import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {ChatSystemMessage} from './ChatSystemMessage';

const xstyleProbe = stylex.create({
  root: {marginBlockStart: '13px'},
});

function expectProbeClasses(element: HTMLElement): void {
  const classes = (stylex.props(xstyleProbe.root).className ?? '')
    .split(' ')
    .filter(className => className !== '' && !className.includes('__'));
  expect(classes.length).toBeGreaterThan(0);
  for (const className of classes) {
    expect(element).toHaveClass(className);
  }
}

describe('ChatSystemMessage', () => {
  it('renders children', () => {
    render(<ChatSystemMessage>Conversation started</ChatSystemMessage>);
    expect(screen.getByText('Conversation started')).toBeTruthy();
  });

  it('renders default variant without divider lines', () => {
    const {container} = render(<ChatSystemMessage>Hello</ChatSystemMessage>);
    const hiddenElements = container.querySelectorAll('[aria-hidden]');
    expect(hiddenElements.length).toBe(0);
  });

  it('renders divider variant with Divider', () => {
    render(<ChatSystemMessage variant="divider">Today</ChatSystemMessage>);
    expect(screen.getByText('Today')).toBeTruthy();
  });

  it('exposes the divider variant label as the separator accessible name', () => {
    render(<ChatSystemMessage variant="divider">Today</ChatSystemMessage>);
    expect(screen.getByRole('separator')).toHaveAccessibleName('Today');
  });

  it('renders icon in the default variant', () => {
    render(
      <ChatSystemMessage icon={<span data-testid="icon">*</span>}>
        Notice
      </ChatSystemMessage>,
    );
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('records the current divider and icon behavior without settling it', () => {
    render(
      <ChatSystemMessage
        icon={<span data-testid="divider-icon">*</span>}
        variant="divider">
        Today
      </ChatSystemMessage>,
    );
    expect(screen.queryByTestId('divider-icon')).not.toBeInTheDocument();
  });

  it('applies variant class', () => {
    render(
      <ChatSystemMessage variant="divider" data-testid="sys">
        Today
      </ChatSystemMessage>,
    );
    expect(screen.getByTestId('sys')).toHaveAttribute(
      'data-variant',
      'divider',
    );
  });

  it.each(['default', 'divider'] as const)(
    'preserves the complete root passthrough seam for %s',
    variant => {
      const ref = createRef<HTMLDivElement>();
      render(
        <ChatSystemMessage
          ref={ref}
          variant={variant}
          data-testid={`sys-${variant}`}
          aria-label={`${variant} system message`}
          role="note"
          className="consumer-system-message"
          style={{outlineOffset: '3px'}}
          xstyle={xstyleProbe.root}>
          {variant === 'divider' ? 'Today' : 'Conversation started'}
        </ChatSystemMessage>,
      );

      const root = screen.getByTestId(`sys-${variant}`);
      expect(ref.current).toBe(root);
      expect(root).toHaveClass('consumer-system-message');
      expect(root).toHaveStyle({outlineOffset: '3px'});
      expectProbeClasses(root);
      expect(root).toHaveAttribute('aria-label', `${variant} system message`);
      expect(root).toHaveAttribute('role', 'status');
      expect(root).toHaveAttribute('data-variant', variant);
    },
  );

  it.each([
    {name: 'empty string', value: '', text: ''},
    {name: 'numeric zero', value: 0, text: '0'},
    {
      name: 'empty fragment',
      value: (
        <Fragment>
          {null}
          {null}
        </Fragment>
      ),
      text: '',
    },
  ])('keeps the default root for $name children', ({value, text}) => {
    render(
      <ChatSystemMessage data-testid="empty-partition">
        {value}
      </ChatSystemMessage>,
    );
    const root = screen.getByTestId('empty-partition');
    expect(root).toHaveAttribute('role', 'status');
    expect(root).toHaveTextContent(text);
  });

  it.each([
    {name: 'empty string', value: ''},
    {name: 'numeric zero', value: 0},
    {
      name: 'empty fragment',
      value: (
        <Fragment>
          {null}
          {null}
        </Fragment>
      ),
    },
  ])('keeps the divider root for $name children', ({value}) => {
    render(
      <ChatSystemMessage variant="divider" data-testid="empty-partition">
        {value}
      </ChatSystemMessage>,
    );
    const root = screen.getByTestId('empty-partition');
    expect(root).toHaveAttribute('role', 'status');
    expect(root).toContainElement(screen.getByRole('separator'));
  });
});
