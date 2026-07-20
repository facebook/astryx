// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file boolean-prop-naming.test.mjs
 * @description Tests for the Astryx boolean prop naming ESLint rule.
 */

import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import booleanPropNamingRule from './boolean-prop-naming.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {jsx: true},
    },
  },
});

// RuleTester registers its own describe/it blocks internally, so it
// must run at the top level. Vitest 4 forbids calling suite functions
// (describe/it) from inside another it() callback.
ruleTester.run('boolean-prop-naming', booleanPropNamingRule, {
  valid: [
    // ✅ Correct "is" prefix
    {
      code: `
            interface ButtonProps {
              isDisabled?: boolean;
            }
          `,
    },
    // ✅ Correct "has" prefix
    {
      code: `
            interface TextInputProps {
              hasAutoFocus?: boolean;
            }
          `,
    },
    // ✅ Correct "initialIs" prefix
    {
      code: `
            interface DialogProps {
              initialIsOpen?: boolean;
            }
          `,
    },
    // ✅ Correct "initialHas" prefix
    {
      code: `
            interface SelectorProps {
              initialHasSelection?: boolean;
            }
          `,
    },
    // ✅ Correct "defaultIs" prefix
    {
      code: `
            interface CollapsibleProps {
              defaultIsOpen?: boolean;
            }
          `,
    },
    // ✅ Correct "defaultHas" prefix
    {
      code: `
            interface SelectorProps {
              defaultHasSelection?: boolean;
            }
          `,
    },
    // ✅ Correct "defaultIs" prefix — expanded
    {
      code: `
            interface BannerProps {
              defaultIsExpanded?: boolean;
            }
          `,
    },
    // ✅ Non-boolean prop — should be ignored
    {
      code: `
            interface ButtonProps {
              label: string;
              size?: 'sm' | 'md' | 'lg';
            }
          `,
    },
    // ✅ Boolean in non-Props interface — should be ignored
    {
      code: `
            interface TableContextValue {
              striped: boolean;
              hover: boolean;
            }
          `,
    },
    // ✅ Boolean in non-Props type alias — should be ignored
    {
      code: `
            type ItemData = {
              disabled?: boolean;
            };
          `,
    },
    // ✅ Union type with boolean — should be ignored (not purely boolean)
    {
      code: `
            interface HeadingProps {
              truncateTooltip?: boolean | string;
            }
          `,
    },
    // ✅ aria-* props — excluded
    {
      code: `
            interface ButtonProps {
              'aria-pressed'?: boolean;
            }
          `,
    },
    // ✅ data-* props — excluded
    {
      code: `
            interface ButtonProps {
              'data-active'?: boolean;
            }
          `,
    },
    // ✅ value prop — excluded (controlled component pattern)
    {
      code: `
            interface SwitchProps {
              value: boolean;
            }
          `,
    },
    // ✅ defaultValue prop — excluded
    {
      code: `
            interface ToggleProps {
              defaultValue?: boolean;
            }
          `,
    },
    // ✅ Type alias with Props suffix — correct naming
    {
      code: `
            type CardProps = {
              isFullBleed?: boolean;
            };
          `,
    },
    // ✅ Multiple valid props
    {
      code: `
            interface FieldProps {
              isLabelHidden?: boolean;
              isOptional?: boolean;
              isRequired?: boolean;
              isDisabled?: boolean;
              hasAutoFocus?: boolean;
            }
          `,
    },
  ],

  invalid: [
    {
      code: `
            interface ButtonProps {
              disabled?: boolean;
            }
          `,
      errors: [
        {
          messageId: 'invalidBooleanPropName',
          data: {
            name: 'disabled',
            interfaceName: 'ButtonProps',
            suggestion: 'isDisabled',
          },
          suggestions: [
            {
              desc: 'Rename to "isDisabled"',
              output: `
            interface ButtonProps {
              isDisabled?: boolean;
            }
          `,
            },
          ],
        },
      ],
    },
    {
      code: `
            interface ButtonProps {
              loading?: boolean;
            }
          `,
      errors: [
        {
          messageId: 'invalidBooleanPropName',
          data: {
            name: 'loading',
            interfaceName: 'ButtonProps',
            suggestion: 'isLoading',
          },
          suggestions: [
            {
              desc: 'Rename to "isLoading"',
              output: `
            interface ButtonProps {
              isLoading?: boolean;
            }
          `,
            },
          ],
        },
      ],
    },
    {
      code: `
            interface CenterProps {
              inline?: boolean;
            }
          `,
      errors: [
        {
          messageId: 'invalidBooleanPropName',
          data: {
            name: 'inline',
            interfaceName: 'CenterProps',
            suggestion: 'isInline',
          },
          suggestions: [
            {
              desc: 'Rename to "isInline"',
              output: `
            interface CenterProps {
              isInline?: boolean;
            }
          `,
            },
          ],
        },
      ],
    },
    {
      code: `
            interface LinkProps {
              standalone?: boolean;
            }
          `,
      errors: [
        {
          messageId: 'invalidBooleanPropName',
          data: {
            name: 'standalone',
            interfaceName: 'LinkProps',
            suggestion: 'isStandalone',
          },
          suggestions: [
            {
              desc: 'Rename to "isStandalone"',
              output: `
            interface LinkProps {
              isStandalone?: boolean;
            }
          `,
            },
          ],
        },
      ],
    },
    {
      code: `
            type TableProps = {
              striped?: boolean;
            };
          `,
      errors: [
        {
          messageId: 'invalidBooleanPropName',
          data: {
            name: 'striped',
            interfaceName: 'TableProps',
            suggestion: 'isStriped',
          },
          suggestions: [
            {
              desc: 'Rename to "isStriped"',
              output: `
            type TableProps = {
              isStriped?: boolean;
            };
          `,
            },
          ],
        },
      ],
    },
    {
      code: `
            interface FieldProps {
              required?: boolean;
            }
          `,
      errors: [
        {
          messageId: 'invalidBooleanPropName',
          data: {
            name: 'required',
            interfaceName: 'FieldProps',
            suggestion: 'isRequired',
          },
          suggestions: [
            {
              desc: 'Rename to "isRequired"',
              output: `
            interface FieldProps {
              isRequired?: boolean;
            }
          `,
            },
          ],
        },
      ],
    },
    {
      code: `
            interface CheckboxProps {
              checked?: boolean;
            }
          `,
      errors: [
        {
          messageId: 'invalidBooleanPropName',
          data: {
            name: 'checked',
            interfaceName: 'CheckboxProps',
            suggestion: 'isChecked',
          },
          suggestions: [
            {
              desc: 'Rename to "isChecked"',
              output: `
            interface CheckboxProps {
              isChecked?: boolean;
            }
          `,
            },
          ],
        },
      ],
    },
    {
      code: `
            interface TableProps {
              striped?: boolean;
              hover?: boolean;
            }
          `,
      errors: [
        {
          messageId: 'invalidBooleanPropName',
          data: {
            name: 'striped',
            interfaceName: 'TableProps',
            suggestion: 'isStriped',
          },
          suggestions: [
            {
              desc: 'Rename to "isStriped"',
              output: `
            interface TableProps {
              isStriped?: boolean;
              hover?: boolean;
            }
          `,
            },
          ],
        },
        {
          messageId: 'invalidBooleanPropName',
          data: {
            name: 'hover',
            interfaceName: 'TableProps',
            suggestion: 'hasHover',
          },
          suggestions: [
            {
              desc: 'Rename to "hasHover"',
              output: `
            interface TableProps {
              striped?: boolean;
              hasHover?: boolean;
            }
          `,
            },
          ],
        },
      ],
    },
    {
      code: `
            interface WidgetProps {
              active?: boolean;
            }
          `,
      errors: [
        {
          messageId: 'invalidBooleanPropName',
          data: {
            name: 'active',
            interfaceName: 'WidgetProps',
            suggestion: 'isActive',
          },
          suggestions: [
            {
              desc: 'Rename to "isActive"',
              output: `
            interface WidgetProps {
              isActive?: boolean;
            }
          `,
            },
          ],
        },
      ],
    },
  ],
});
