/**
 * Type augmentation for StyleX `sx` prop on native HTML elements.
 *
 * The StyleX babel plugin (>=0.18) transforms `sx={styles}` into
 * `{...stylex.props(styles)}` at compile time. This declaration
 * teaches TypeScript about the prop so it doesn't report errors.
 */
import type {StyleXArray, StyleXClassName} from '@stylexjs/stylex';

type SXProp = StyleXArray<
  | StyleXClassName
  | false
  | null
  | undefined
  | Readonly<Record<string, StyleXClassName>>
>;

declare module 'react' {
  interface HTMLAttributes<T> {
    sx?: SXProp;
  }
  // SVG elements extend SVGAttributes, not HTMLAttributes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface SVGAttributes<T> {
    sx?: SXProp;
  }
}
