/**
 * @file boolean-prop-naming.test.mjs
 * @description Tests for the XDS boolean prop naming ESLint rule.
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
            interface XDSButtonProps {
              isDisabled?: boolean;
            }
          `,
        },
        // ✅ Correct "has" prefix
        {
          code: `
            interface XDSTextInputProps {
              hasAutoFocus?: boolean;
            }
          `,
        },
        // ✅ Correct "initialIs" prefix
        {
          code: `
            interface XDSDialogProps {
              initialIsOpen?: boolean;
            }
          `,
        },
        // ✅ Correct "initialHas" prefix
        {
          code: `
            interface XDSSelectorProps {
              initialHasSelection?: boolean;
            }
          `,
        },
        // ✅ Correct "defaultIs" prefix
        {
          code: `
            interface XDSCollapsibleProps {
              defaultIsOpen?: boolean;
            }
          `,
        },
        // ✅ Correct "defaultHas" prefix
        {
          code: `
            interface XDSSelectorProps {
              defaultHasSelection?: boolean;
            }
          `,
        },
        // ✅ Correct "defaultIs" prefix — expanded
        {
          code: `
            interface XDSBannerProps {
              defaultIsExpanded?: boolean;
            }
          `,
        },
        // ✅ Non-boolean prop — should be ignored
        {
          code: `
            interface XDSButtonProps {
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
            interface XDSHeadingProps {
              truncateTooltip?: boolean | string;
            }
          `,
        },
        // ✅ aria-* props — excluded
        {
          code: `
            interface XDSButtonProps {
              'aria-pressed'?: boolean;
            }
          `,
        },
        // ✅ data-* props — excluded
        {
          code: `
            interface XDSButtonProps {
              'data-active'?: boolean;
            }
          `,
        },
        // ✅ value prop — excluded (controlled component pattern)
        {
          code: `
            interface XDSSwitchProps {
              value: boolean;
            }
          `,
        },
        // ✅ defaultValue prop — excluded
        {
          code: `
            interface XDSToggleProps {
              defaultValue?: boolean;
            }
          `,
        },
        // ✅ Type alias with Props suffix — correct naming
        {
          code: `
            type XDSCardProps = {
              isFullBleed?: boolean;
            };
          `,
        },
        // ✅ Multiple valid props
        {
          code: `
            interface XDSFieldProps {
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
            interface XDSButtonProps {
              disabled?: boolean;
            }
          `,
          errors: [
            {
              messageId: 'invalidBooleanPropName',
              data: {
                name: 'disabled',
                interfaceName: 'XDSButtonProps',
                suggestion: 'isDisabled',
              },
            },
          ],
        },
        // ❌ Missing prefix — should suggest "isLoading"
        {
          code: `
            interface XDSButtonProps {
              loading?: boolean;
            }
          `,
          errors: [
            {
              messageId: 'invalidBooleanPropName',
              data: {
                name: 'loading',
                interfaceName: 'XDSButtonProps',
                suggestion: 'isLoading',
              },
            },
          ],
        },
        // ❌ Missing prefix — should suggest "isInline"
        {
          code: `
            interface XDSCenterProps {
              inline?: boolean;
            }
          `,
          errors: [
            {
              messageId: 'invalidBooleanPropName',
              data: {
                name: 'inline',
                interfaceName: 'XDSCenterProps',
                suggestion: 'isInline',
              },
            },
          ],
        },
        // ❌ Missing prefix — should suggest "isStandalone"
        {
          code: `
            interface XDSLinkProps {
              standalone?: boolean;
            }
          `,
          errors: [
            {
              messageId: 'invalidBooleanPropName',
              data: {
                name: 'standalone',
                interfaceName: 'XDSLinkProps',
                suggestion: 'isStandalone',
              },
            },
          ],
        },
        // ❌ Missing prefix in type alias
        {
          code: `
            type XDSTableProps = {
              striped?: boolean;
            };
          `,
          errors: [
            {
              messageId: 'invalidBooleanPropName',
              data: {
                name: 'striped',
                interfaceName: 'XDSTableProps',
                suggestion: 'isStriped',
              },
            },
          ],
        },
        // ❌ "required" should suggest "isRequired"
        {
          code: `
            interface XDSFieldProps {
              required?: boolean;
            }
          `,
          errors: [
            {
              messageId: 'invalidBooleanPropName',
              data: {
                name: 'required',
                interfaceName: 'XDSFieldProps',
                suggestion: 'isRequired',
              },
            },
          ],
        },
        // ❌ "checked" should suggest "isChecked"
        {
          code: `
            interface XDSCheckboxProps {
              checked?: boolean;
            }
          `,
          errors: [
            {
              messageId: 'invalidBooleanPropName',
              data: {
                name: 'checked',
                interfaceName: 'XDSCheckboxProps',
                suggestion: 'isChecked',
              },
            },
          ],
        },
        // ❌ Multiple violations in one interface
        {
          code: `
            interface XDSTableProps {
              striped?: boolean;
              hover?: boolean;
            }
          `,
          errors: [
            {
              messageId: 'invalidBooleanPropName',
              data: {
                name: 'striped',
                interfaceName: 'XDSTableProps',
                suggestion: 'isStriped',
              },
            },
            {
              messageId: 'invalidBooleanPropName',
              data: {
                name: 'hover',
                interfaceName: 'XDSTableProps',
                suggestion: 'hasHover',
              },
            },
          ],
        },
        // ❌ Unknown prop gets generic "is" prefix suggestion
        {
          code: `
            interface XDSWidgetProps {
              active?: boolean;
            }
          `,
          errors: [
            {
              messageId: 'invalidBooleanPropName',
              data: {
                name: 'active',
                interfaceName: 'XDSWidgetProps',
                suggestion: 'isActive',
              },
            },
          ],
        },
      ],
    });
  });
});
