/**
 * @file Codemod: Unify visibility callbacks to onOpenChange
 * @see https://github.com/facebookexperimental/xds/pull/473
 *
 * Renames various visibility-related callback props to the unified `onOpenChange`.
 * For components with both onShow and onHide (HoverCard, Tooltip), handles merging
 * when only one is present, or adds a TODO comment when both exist.
 */

export const meta = {
  title: 'Unify visibility callbacks → onOpenChange',
  description:
    'Renames onHide, onClose, onShow, onToggle, onMenuToggle to onOpenChange across dialog, menu, popover, and tooltip components.',
  pr: '#473',
};

/**
 * Simple renames: old prop → onOpenChange (one-to-one mapping)
 */
const SIMPLE_RENAMES = [
  {component: 'XDSDialog', oldProp: 'onHide'},
  {component: 'XDSDialogHeader', oldProp: 'onHide'},
  {component: 'XDSCommandPalette', oldProp: 'onHide'},
  {component: 'XDSMobileNav', oldProp: 'onClose'},
  {component: 'XDSDropdownMenu', oldProp: 'onMenuToggle'},
  {component: 'XDSPopover', oldProp: 'onToggle'},
  {component: 'XDSCollapsibleGroup', oldProp: 'onToggle'},
];

/**
 * Merge renames: components with onShow/onHide that merge into onOpenChange
 */
const MERGE_COMPONENTS = ['XDSHoverCard', 'XDSTooltip'];

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Handle simple renames
  for (const {component, oldProp} of SIMPLE_RENAMES) {
    root
      .find(j.JSXOpeningElement, {
        name: {name: component},
      })
      .forEach((path) => {
        path.node.attributes.forEach((attr) => {
          if (attr.type === 'JSXAttribute' && attr.name.name === oldProp) {
            attr.name.name = 'onOpenChange';
            hasChanges = true;
          }
        });
      });
  }

  // Handle merge components (onShow/onHide → onOpenChange)
  for (const component of MERGE_COMPONENTS) {
    root
      .find(j.JSXOpeningElement, {
        name: {name: component},
      })
      .forEach((path) => {
        const attrs = path.node.attributes;
        const onShowAttr = attrs.find(
          (a) => a.type === 'JSXAttribute' && a.name.name === 'onShow',
        );
        const onHideAttr = attrs.find(
          (a) => a.type === 'JSXAttribute' && a.name.name === 'onHide',
        );

        if (onShowAttr && onHideAttr) {
          // Both exist — add a TODO comment and leave them
          // We add the comment as a JSX expression before the element
          const comment = j.jsxExpressionContainer(
            j.jsxEmptyExpression(),
          );
          comment.expression = j.jsxEmptyExpression();
          // Add leading comment to the onShow attribute
          if (!onShowAttr.comments) {
            onShowAttr.comments = [];
          }
          onShowAttr.comments.push(
            j.commentBlock(
              ' TODO: Merge onShow and onHide into a single onOpenChange={(isOpen) => { ... }} prop ',
              false,
              true,
            ),
          );
          hasChanges = true;
        } else if (onShowAttr && !onHideAttr) {
          onShowAttr.name.name = 'onOpenChange';
          hasChanges = true;
        } else if (onHideAttr && !onShowAttr) {
          onHideAttr.name.name = 'onOpenChange';
          hasChanges = true;
        }
      });
  }

  return hasChanges ? root.toSource() : undefined;
}
