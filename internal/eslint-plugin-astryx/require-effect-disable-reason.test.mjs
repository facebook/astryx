// Copyright (c) Meta Platforms, Inc. and affiliates.

import {RuleTester} from 'eslint';
import rule from './require-effect-disable-reason.js';

const noopRule = {
  meta: {schema: []},
  create() {
    return {};
  },
};

const ruleTester = new RuleTester({
  linterOptions: {reportUnusedDisableDirectives: false},
  plugins: {
    '@eslint-react': {
      rules: {'set-state-in-effect': noopRule},
    },
  },
});

ruleTester.run('require-effect-disable-reason', rule, {
  valid: [
    {
      code: `
        // eslint-disable-next-line @eslint-react/set-state-in-effect -- state comes from ResizeObserver measurements
        setSize(measuredSize);
      `,
    },
    {
      code: `
        setSize(measuredSize); // eslint-disable-line @eslint-react/set-state-in-effect -- records post-layout geometry
      `,
    },
    {
      code: `
        /* eslint-disable @eslint-react/set-state-in-effect -- bridges an external subscription */
        setValue(store.getSnapshot());
        /* eslint-enable @eslint-react/set-state-in-effect */
      `,
    },
    {
      code: `
        // eslint-disable-next-line no-console
        console.log('debug');
      `,
    },
    {
      code: `
        // eslint-disable-next-line @eslint-react/set-state-in-effect, no-console -- synchronizes measured browser state
        setValue(readLayout());
      `,
    },
  ],
  invalid: [
    {
      code: `
        // eslint-disable-next-line @eslint-react/set-state-in-effect
        setValue(value);
      `,
      errors: [{messageId: 'missingReason'}],
    },
    {
      code: `
        setValue(value); // eslint-disable-line @eslint-react/set-state-in-effect
      `,
      errors: [{messageId: 'missingReason'}],
    },
    {
      code: `
        /* eslint-disable @eslint-react/set-state-in-effect */
        setValue(value);
        /* eslint-enable @eslint-react/set-state-in-effect */
      `,
      errors: [{messageId: 'missingReason'}],
    },
    {
      code: `
        // eslint-disable-next-line no-console, @eslint-react/set-state-in-effect
        setValue(value);
      `,
      errors: [{messageId: 'missingReason'}],
    },
  ],
});
