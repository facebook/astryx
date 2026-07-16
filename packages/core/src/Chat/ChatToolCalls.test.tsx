// Copyright (c) Meta Platforms, Inc. and affiliates.

import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {ChatToolCalls} from './ChatToolCalls';

describe('ChatToolCalls', () => {
  it('renders nothing for empty calls', () => {
    const {container} = render(<ChatToolCalls calls={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders single call inline without group chrome', () => {
    render(
      <ChatToolCalls
        calls={[{name: 'bash', status: 'complete', duration: '1.2s'}]}
      />,
    );
    expect(screen.getByText('bash')).toBeInTheDocument();
    expect(screen.getByText('1.2s')).toBeInTheDocument();
    // No group header / expand button for single call
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders latest call as surface for multiple calls', () => {
    render(
      <ChatToolCalls
        calls={[
          {name: 'searchCode', status: 'complete'},
          {name: 'readFile', status: 'complete'},
          {name: 'editFile', status: 'running'},
        ]}
      />,
    );
    // Latest call (editFile) shown at surface + in expanded list
    expect(screen.getAllByText('editFile').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('hides duration when not complete', () => {
    render(
      <ChatToolCalls
        calls={[{name: 'bash', status: 'running', duration: '1.2s'}]}
      />,
    );
    expect(screen.queryByText('1.2s')).not.toBeInTheDocument();
  });

  it('defaults to collapsed', () => {
    render(
      <ChatToolCalls
        calls={[
          {name: 'a', status: 'complete'},
          {name: 'b', status: 'complete'},
        ]}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('auto-collapses groups of more than 3', () => {
    render(
      <ChatToolCalls
        calls={[{name: 'a'}, {name: 'b'}, {name: 'c'}, {name: 'd'}]}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('toggles on click', () => {
    render(
      <ChatToolCalls
        defaultIsExpanded={false}
        calls={[
          {name: 'a', status: 'complete'},
          {name: 'b', status: 'complete'},
        ]}
      />,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows target when provided', () => {
    render(
      <ChatToolCalls
        calls={[{name: 'bash', target: 'git status', status: 'complete'}]}
      />,
    );
    expect(screen.getByText('git status')).toBeInTheDocument();
  });

  it('exposes no aria-expanded on a call row without resultDetail', () => {
    const {container} = render(
      <ChatToolCalls calls={[{name: 'bash', status: 'complete'}]} />,
    );
    expect(container.querySelector('[aria-expanded]')).toBeNull();
  });

  it('wires disclosure semantics on an expandable call row', () => {
    render(
      <ChatToolCalls
        calls={[
          {
            name: 'readFile',
            status: 'complete',
            resultDetail: <div>file contents here</div>,
          },
        ]}
      />,
    );
    const row = screen.getByRole('button');
    expect(row).toHaveAttribute('aria-expanded', 'false');
    // Detail panel is conditionally mounted, so no aria-controls while closed.
    expect(row).not.toHaveAttribute('aria-controls');
    expect(screen.queryByText('file contents here')).not.toBeInTheDocument();

    fireEvent.click(row);

    expect(row).toHaveAttribute('aria-expanded', 'true');
    const detailId = row.getAttribute('aria-controls');
    expect(detailId).toBeTruthy();
    const panel = document.getElementById(detailId as string);
    expect(panel).not.toBeNull();
    expect(panel).toHaveTextContent('file contents here');
  });

  it('points the group header aria-controls at the content region', () => {
    render(
      <ChatToolCalls
        defaultIsExpanded={true}
        calls={[
          {name: 'searchCode', status: 'complete'},
          {name: 'readFile', status: 'complete'},
        ]}
      />,
    );
    const header = screen.getByRole('button');
    expect(header).toHaveAttribute('aria-expanded', 'true');
    const regionId = header.getAttribute('aria-controls');
    expect(regionId).toBeTruthy();
    const region = document.getElementById(regionId as string);
    expect(region).not.toBeNull();
    expect(region).toHaveTextContent('searchCode');
    expect(region).toHaveTextContent('readFile');
  });
});
