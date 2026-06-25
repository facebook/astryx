// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file boolean-prop-naming.test.mjs
 * @description Tests for the Astryx boolean prop naming ESLint rule.
 */

import {describe, it} from 'vitest';
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

describe('boolean-prop-naming', () => {
  it('passes RuleTester valid/invalid cases', () => {
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
        // ❌ Missing prefix — should suggest "isDisabled"
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
            },
          ],
        },
        // ❌ Missing prefix — should suggest "isLoading"
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
            },
          ],
        },
        // ❌ Missing prefix — should suggest "isInline"
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
            },
          ],
        },
        // ❌ Missing prefix — should suggest "isStandalone"
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
            },
          ],
        },
        // ❌ Missing prefix in type alias
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
            },
          ],
        },
        // ❌ "required" should suggest "isRequired"
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
            },
          ],
        },
        // ❌ "checked" should suggest "isChecked"
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
            },
          ],
        },
        // ❌ Multiple violations in one interface
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
            },
            {
              messageId: 'invalidBooleanPropName',
              data: {
                name: 'hover',
                interfaceName: 'TableProps',
                suggestion: 'hasHover',
              },
            },
          ],
        },
        // ❌ Unknown prop gets generic "is" prefix suggestion
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
            },
          ],
        },
      ],
    });
  });
});
