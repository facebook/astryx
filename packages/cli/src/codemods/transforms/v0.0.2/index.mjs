/**
 * @file v0.0.2 transform manifest
 *
 * Lists all codemods for the v0.0.2 release in the order they should run.
 */

import renameSelectorItemsToOptions, {
  meta as selectorMeta,
} from './rename-selector-items-to-options.mjs';
import unifyVisibilityToOnOpenChange, {
  meta as visibilityMeta,
} from './unify-visibility-to-onOpenChange.mjs';
import unifyUncontrolledToDefaultX, {
  meta as uncontrolledMeta,
} from './unify-uncontrolled-to-defaultX.mjs';
import renameBannerEndButtonToEndContent, {
  meta as bannerMeta,
} from './rename-banner-endButton-to-endContent.mjs';
import renameFormTooltipStartIcon, {
  meta as formMeta,
} from './rename-form-tooltip-startIcon.mjs';
import renameIsShownToIsOpen, {
  meta as isShownMeta,
} from './rename-isShown-to-isOpen.mjs';
import renameTopNavTitleToHeading, {
  meta as topNavTitleMeta,
} from './rename-topnav-title-to-heading.mjs';
import renameSideNavHeaderToHeading, {
  meta as sideNavHeaderMeta,
} from './rename-sidenav-header-to-heading.mjs';
export default [
  {
    name: 'rename-selector-items-to-options',
    transform: renameSelectorItemsToOptions,
    meta: selectorMeta,
  },
  {
    name: 'unify-visibility-to-onOpenChange',
    transform: unifyVisibilityToOnOpenChange,
    meta: visibilityMeta,
  },
  {
    name: 'unify-uncontrolled-to-defaultX',
    transform: unifyUncontrolledToDefaultX,
    meta: uncontrolledMeta,
  },
  {
    name: 'rename-banner-endButton-to-endContent',
    transform: renameBannerEndButtonToEndContent,
    meta: bannerMeta,
  },
  {
    name: 'rename-form-tooltip-startIcon',
    transform: renameFormTooltipStartIcon,
    meta: formMeta,
  },
  {
    name: 'rename-isShown-to-isOpen',
    transform: renameIsShownToIsOpen,
    meta: isShownMeta,
  },
  {
    name: 'rename-topnav-title-to-heading',
    transform: renameTopNavTitleToHeading,
    meta: topNavTitleMeta,
  },
  {
    name: 'rename-sidenav-header-to-heading',
    transform: renameSideNavHeaderToHeading,
    meta: sideNavHeaderMeta,
  },
];
