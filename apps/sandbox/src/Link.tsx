import {forwardRef} from 'react';
import {Link as RRLink} from 'react-router';

/**
 * Adapter so XDS components can use `as={Link}` with `href` prop.
 * React Router's Link uses `to` instead of `href`.
 */
export const Link = forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithRef<typeof RRLink> & {href?: string}
>(({href, to, ...props}, ref) => (
  <RRLink to={to ?? href ?? '#'} ref={ref} {...props} />
));
Link.displayName = 'Link';
