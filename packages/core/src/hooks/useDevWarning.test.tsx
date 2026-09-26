// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, describe, expect, it, vi} from 'vitest';
import {render} from '@testing-library/react';
import {useDevWarning} from './useDevWarning';

afterEach(() => {
  vi.restoreAllMocks();
});

function Probe({
  condition,
  message = 'boom',
}: {
  condition: boolean;
  message?: string;
}) {
  useDevWarning('TestComponent', message, condition);
  return null;
}

describe('useDevWarning', () => {
  it('warns once, in the standardized format, when the condition is true', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {rerender} = render(<Probe condition={true} />);
    rerender(<Probe condition={true} />);
    rerender(<Probe condition={true} />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('TestComponent: boom');
  });

  it('does not warn when the condition is false', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Probe condition={false} />);
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns after the condition flips from false to true', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {rerender} = render(<Probe condition={false} />);
    expect(warn).not.toHaveBeenCalled();
    rerender(<Probe condition={true} />);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
