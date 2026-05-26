// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeAll} from 'vitest';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {useXDSServerDialog} from './useXDSServerDialog';
import {XDSDialogServer} from './XDSDialogServer';
import {XDSButtonServer} from './XDSButtonServer';
import type {ClientProp} from './ClientProp';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

type TestDialogProps = {
  title: string;
  onDone: ClientProp<() => void>;
  onOpenChange: ClientProp<(isOpen: boolean) => void>;
};

async function fakeServerDialog(props: TestDialogProps) {
  return (
    <XDSDialogServer isOpen onOpenChange={props.onOpenChange} width={400}>
      <div>
        <span>{props.title}</span>
        <XDSButtonServer label="Done" onClick={props.onDone} />
      </div>
    </XDSDialogServer>
  );
}

function TestHarness({onDone}: {onDone: () => void}) {
  const [showDialog, preloadDialog, dialogElement] =
    useXDSServerDialog(fakeServerDialog);

  return (
    <div>
      <button
        data-testid="open"
        onMouseEnter={() =>
          preloadDialog({title: 'Test Title'}, {onDone: () => {}})
        }
        onClick={() => showDialog({title: 'Test Title'}, {onDone})}>
        Open
      </button>
      {dialogElement}
    </div>
  );
}

describe('useXDSServerDialog', () => {
  it('renders nothing initially', () => {
    render(<TestHarness onDone={() => {}} />);
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('shows dialog content after showDialog is called', async () => {
    render(<TestHarness onDone={() => {}} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('open'));
    });
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('resolves ClientProp markers in wrapper components', async () => {
    const onDone = vi.fn();
    render(<TestHarness onDone={onDone} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('open'));
    });

    fireEvent.click(screen.getByText('Done'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('caches the server function result for identical props', async () => {
    const serverFn = vi.fn(fakeServerDialog);

    function CacheHarness() {
      const [showDialog, , dialogElement] = useXDSServerDialog(serverFn);
      return (
        <div>
          <button
            data-testid="open"
            onClick={() => showDialog({title: 'Same'}, {onDone: () => {}})}>
            Open
          </button>
          {dialogElement}
        </div>
      );
    }

    render(<CacheHarness />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('open'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('open'));
    });

    expect(serverFn).toHaveBeenCalledTimes(1);
  });

  it('preloadDialog fires the server function without rendering', async () => {
    const serverFn = vi.fn(fakeServerDialog);

    function PreloadHarness() {
      const [, preloadDialog, dialogElement] = useXDSServerDialog(serverFn);
      return (
        <div>
          <button
            data-testid="preload"
            onClick={() =>
              preloadDialog({title: 'Preloaded'}, {onDone: () => {}})
            }>
            Preload
          </button>
          {dialogElement}
        </div>
      );
    }

    render(<PreloadHarness />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('preload'));
    });

    expect(serverFn).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Preloaded')).not.toBeInTheDocument();
  });
});

describe('XDSDialogServer', () => {
  it('renders with a direct onOpenChange function', () => {
    const onOpenChange = vi.fn();
    render(
      <XDSDialogServer isOpen onOpenChange={onOpenChange} width={400}>
        <div>Content</div>
      </XDSDialogServer>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('XDSButtonServer', () => {
  it('renders with a direct onClick function', () => {
    const onClick = vi.fn();
    render(<XDSButtonServer label="Click me" onClick={onClick} />);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders without onClick', () => {
    render(<XDSButtonServer label="No handler" />);
    expect(screen.getByText('No handler')).toBeInTheDocument();
  });
});
