// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChatActivityGroup.test.tsx
 * @input vitest, @testing-library/react, ChatActivityGroup
 * @output Unit tests for mixed reasoning + tool-call folding
 * @position Testing; validates ChatActivityGroup.tsx
 *
 * SYNC: When ChatActivityGroup.tsx changes, update tests to match new behavior
 */

import {render, screen, fireEvent, within} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {ChatActivityGroup} from './ChatActivityGroup';

const mixedItems = [
  {
    kind: 'reasoning' as const,
    content: 'Planning the change',
    label: 'Thinking',
  },
  {
    kind: 'tool' as const,
    name: 'readFile',
    status: 'complete' as const,
    target: 'Button.tsx',
  },
  {
    kind: 'tool' as const,
    name: 'editFile',
    status: 'running' as const,
    target: 'Button.tsx',
  },
];

describe('ChatActivityGroup', () => {
  it('renders nothing for empty items', () => {
    const {container} = render(<ChatActivityGroup items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a single tool inline without group chrome', () => {
    render(
      <ChatActivityGroup
        items={[
          {kind: 'tool', name: 'bash', status: 'complete', duration: '1.2s'},
        ]}
      />,
    );
    expect(screen.getByText('bash')).toBeInTheDocument();
    expect(screen.getByText('1.2s')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a single reasoning block without group chrome', () => {
    render(
      <ChatActivityGroup
        items={[
          {kind: 'reasoning', content: 'Let me think', label: 'Thinking'},
        ]}
      />,
    );
    expect(screen.getByText('Thinking')).toBeInTheDocument();
    expect(screen.getAllByText('Let me think').length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('shows the latest activity as the collapsed surface for mixed items', () => {
    render(<ChatActivityGroup items={mixedItems} />);
    const header = screen.getByRole('button');
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(within(header).getByText('editFile')).toBeInTheDocument();
    expect(within(header).queryByText('Planning the change')).toBeNull();
    expect(within(header).queryByText('readFile')).toBeNull();
  });

  it('expands to reveal every mixed item in order', () => {
    render(<ChatActivityGroup items={mixedItems} />);
    const header = screen.getByRole('button');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getAllByText('Planning the change').length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('readFile')).toBeInTheDocument();
    expect(screen.getAllByText('editFile').length).toBeGreaterThanOrEqual(1);
  });

  it('shows the item count on the collapsed surface', () => {
    render(<ChatActivityGroup items={mixedItems} />);
    expect(
      within(screen.getByRole('button')).getByText('3'),
    ).toBeInTheDocument();
  });

  it('keeps a running tool perceivable on the folded surface', () => {
    render(<ChatActivityGroup items={mixedItems} />);
    expect(
      within(screen.getByRole('button')).getByText('Running'),
    ).toBeInTheDocument();
  });

  it('shows a reasoning label when the latest item is reasoning', () => {
    render(
      <ChatActivityGroup
        items={[
          {kind: 'tool', name: 'bash', status: 'complete'},
          {
            kind: 'reasoning',
            content: 'Checking the tests',
            label: 'Thinking',
            isStreaming: true,
          },
        ]}
      />,
    );
    const header = screen.getByRole('button');
    expect(within(header).getByText('Thinking')).toBeInTheDocument();
    expect(within(header).queryByText('bash')).toBeNull();
    expect(within(header).getByText('Running')).toBeInTheDocument();
  });

  it('wires the group header to the item region and inerts it while collapsed', () => {
    render(<ChatActivityGroup items={mixedItems} />);
    const header = screen.getByRole('button');
    const regionId = header.getAttribute('aria-controls');
    expect(regionId).toBeTruthy();
    const region = document.getElementById(regionId as string) as HTMLElement;
    expect(region).not.toBeNull();
    expect(region).toHaveAttribute('inert');
    fireEvent.click(header);
    expect(region).not.toHaveAttribute('inert');
  });

  it('toggles on Enter and Space', () => {
    render(<ChatActivityGroup items={mixedItems} />);
    const header = screen.getByRole('button');
    fireEvent.keyDown(header, {key: 'Enter'});
    expect(header).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(header, {key: ' '});
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('honors controlled isExpanded', () => {
    const {rerender} = render(
      <ChatActivityGroup items={mixedItems} isExpanded={false} />,
    );
    const header = screen.getByRole('button');
    expect(header).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    rerender(<ChatActivityGroup items={mixedItems} isExpanded={true} />);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('readFile')).toBeInTheDocument();
  });

  it('calls onExpandedChange with the next state', () => {
    const onExpandedChange = vi.fn();
    render(
      <ChatActivityGroup
        items={mixedItems}
        onExpandedChange={onExpandedChange}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
  });

  it('uses a custom expanded label', () => {
    render(
      <ChatActivityGroup
        items={mixedItems}
        label="Agent steps"
        defaultIsExpanded
      />,
    );
    expect(screen.getByText('Agent steps')).toBeInTheDocument();
  });

  it('exposes an error on the folded surface when the latest tool failed', () => {
    render(
      <ChatActivityGroup
        items={[
          {kind: 'reasoning', content: 'Trying bash'},
          {
            kind: 'tool',
            name: 'bash',
            status: 'error',
            errorMessage: 'Command exited with code 1',
          },
        ]}
      />,
    );
    expect(
      within(screen.getByRole('button')).getByText(
        /Command exited with code 1/,
      ),
    ).toBeInTheDocument();
  });

  it('keeps rows mounted after collapse so a later expand does not remount', () => {
    render(<ChatActivityGroup items={mixedItems} />);
    const header = screen.getByRole('button');
    fireEvent.click(header);
    const region = document.getElementById(
      header.getAttribute('aria-controls') as string,
    ) as HTMLElement;
    const firstChild = region.querySelector('[class*="astryx-chat"]');
    fireEvent.click(header);
    expect(region).toHaveAttribute('inert');
    expect(region.querySelector('[class*="astryx-chat"]')).toBe(firstChild);
  });

  it('lets expanded reasoning rows keep their own disclosure', () => {
    render(<ChatActivityGroup items={mixedItems} defaultIsExpanded />);
    const reasoningTrigger = screen.getByRole('button', {name: /Thinking/});
    expect(reasoningTrigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(reasoningTrigger);
    expect(reasoningTrigger).toHaveAttribute('aria-expanded', 'true');
  });
});
