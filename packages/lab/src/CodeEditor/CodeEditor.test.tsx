// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CodeEditor} from './CodeEditor';

describe('CodeEditor', () => {
  it('uses the label prop as the accessible name', () => {
    render(
      <CodeEditor
        value=""
        onChange={() => {}}
        language="typescript"
        label="Edit snippet"
      />,
    );
    expect(
      screen.getByRole('textbox', {name: 'Edit snippet'}),
    ).toBeInTheDocument();
  });
});
