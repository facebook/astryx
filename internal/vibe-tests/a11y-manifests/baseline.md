# Baseline (Radix/shadcn) Accessibility Manifest

**Source:** https://www.radix-ui.com/primitives/docs/overview/accessibility
**Generated:** 2026-02-05T18:03:04.623Z

## Button

**Built-in accessibility:**

- Native button element with proper role
- Keyboard activation (Enter/Space)
- Focus management

**Keyboard:**

- Enter/Space to activate

**Developer must provide:**

- Provide aria-label for icon-only buttons
- Use aria-pressed for toggle buttons
- Use aria-expanded for buttons that control expandable content

**Notes:**

- Based on native <button> element

## Dialog

**Built-in accessibility:**

- Focus trap - focus stays within dialog
- Escape key closes dialog
- aria-modal="true" on dialog
- aria-labelledby pointing to title
- aria-describedby pointing to description
- Returns focus to trigger on close
- Scrolling blocked on body when open

**Keyboard:**

- Escape to close
- Tab/Shift+Tab to navigate within

**Developer must provide:**

- Provide DialogTitle for aria-labelledby
- Provide DialogDescription for aria-describedby (or use aria-describedby={undefined})

**Notes:**

- WAI-ARIA Dialog pattern

## DropdownMenu

**Built-in accessibility:**

- role="menu" on content
- role="menuitem" on items
- Arrow key navigation
- Typeahead to jump to items
- Focus returns to trigger on close
- Escape closes menu
- Submenu support with proper aria-haspopup

**Keyboard:**

- Arrow Down/Up to navigate
- Enter/Space to select
- Escape to close
- Arrow Right/Left for submenus
- A-Z for typeahead

**Notes:**

- WAI-ARIA Menu pattern

## Select

**Built-in accessibility:**

- role="combobox" on trigger
- role="listbox" on content
- role="option" on items
- aria-expanded on trigger
- aria-activedescendant for focus
- Arrow key navigation
- Typeahead support

**Keyboard:**

- Arrow Down/Up to navigate
- Enter/Space to select
- Escape to close
- A-Z for typeahead
- Home/End to jump

**Developer must provide:**

- Provide accessible label (Label component or aria-label)

**Notes:**

- WAI-ARIA Combobox pattern (Select-Only)

## Checkbox

**Built-in accessibility:**

- role="checkbox"
- aria-checked state
- Keyboard activation (Space)
- Supports indeterminate state

**Keyboard:**

- Space to toggle

**Developer must provide:**

- Provide accessible label (Label component or aria-label)

**Notes:**

- WAI-ARIA Checkbox pattern

## Switch

**Built-in accessibility:**

- role="switch"
- aria-checked state
- Keyboard activation (Space)

**Keyboard:**

- Space to toggle

**Developer must provide:**

- Provide accessible label (Label component or aria-label)

**Notes:**

- WAI-ARIA Switch pattern

## Tabs

**Built-in accessibility:**

- role="tablist" on list
- role="tab" on triggers
- role="tabpanel" on content
- aria-selected on active tab
- Arrow key navigation between tabs
- Automatic activation on focus (or manual mode)

**Keyboard:**

- Arrow Left/Right to navigate tabs
- Home/End to jump to first/last tab
- Tab to move into panel

**Notes:**

- WAI-ARIA Tabs pattern

## Tooltip

**Built-in accessibility:**

- aria-describedby linking trigger to content
- Escape to dismiss
- Delay before showing (configurable)
- Touch-friendly behavior

**Keyboard:**

- Escape to dismiss

**Developer must provide:**

- Ensure trigger is focusable (use asChild with focusable element)

**Notes:**

- Content should be supplementary, not essential

## Popover

**Built-in accessibility:**

- Focus management
- Escape to close
- Click outside to close
- aria-haspopup on trigger

**Keyboard:**

- Escape to close
- Tab to navigate within

**Developer must provide:**

- Manage focus appropriately within popover content

**Notes:**

- Non-modal by default - focus is not trapped

## AlertDialog

**Built-in accessibility:**

- Focus trap
- aria-modal="true"
- role="alertdialog"
- aria-labelledby pointing to title
- aria-describedby pointing to description
- Escape is disabled by default (requires explicit action)

**Keyboard:**

- Tab/Shift+Tab to navigate within

**Developer must provide:**

- Provide AlertDialogTitle
- Provide AlertDialogDescription
- Include at least one focusable action button

**Notes:**

- WAI-ARIA AlertDialog pattern - for important interruptions

## Progress

**Built-in accessibility:**

- role="progressbar"
- aria-valuenow
- aria-valuemin
- aria-valuemax

**Developer must provide:**

- Provide aria-label or aria-labelledby for context

**Notes:**

- Use aria-valuetext for non-percentage values

## Slider

**Built-in accessibility:**

- role="slider"
- aria-valuenow, aria-valuemin, aria-valuemax
- Arrow key adjustment
- Home/End for min/max
- Page Up/Down for larger steps

**Keyboard:**

- Arrow Left/Down to decrease
- Arrow Right/Up to increase
- Home for minimum
- End for maximum
- Page Up/Down for larger steps

**Developer must provide:**

- Provide aria-label for context

**Notes:**

- WAI-ARIA Slider pattern

## Accordion

**Built-in accessibility:**

- role="region" on panels (when expanded)
- aria-expanded on triggers
- aria-controls linking trigger to panel
- Arrow key navigation between triggers

**Keyboard:**

- Enter/Space to toggle
- Arrow Down/Up to navigate
- Home/End to jump

**Notes:**

- WAI-ARIA Accordion pattern

## RadioGroup

**Built-in accessibility:**

- role="radiogroup"
- role="radio" on items
- aria-checked state
- Arrow key navigation
- Roving tabindex

**Keyboard:**

- Arrow keys to navigate and select
- Tab to enter/leave group

**Developer must provide:**

- Provide aria-label or aria-labelledby on group

**Notes:**

- WAI-ARIA Radio Group pattern

## Label

**Built-in accessibility:**

- Native label element
- Click on label focuses associated control
- Proper htmlFor association

**Notes:**

- Always use with form controls

## Input

**Built-in accessibility:**

- Native input element

**Developer must provide:**

- Provide accessible label (Label component, aria-label, or aria-labelledby)
- Use aria-describedby for error/help text
- Set aria-invalid for error states

**Notes:**

- shadcn Input is a styled native input

## Card

**Developer must provide:**

- If clickable, use button or link element, not onClick on div
- Provide appropriate role if interactive

**Notes:**

- Card is purely visual - has no semantic meaning

## Badge

**Developer must provide:**

- Provide context via aria-label or surrounding text
- For status badges, consider aria-live for dynamic updates

**Notes:**

- Badge is purely visual - has no semantic meaning

## Avatar

**Developer must provide:**

- Provide alt text on AvatarImage
- AvatarFallback provides fallback for screen readers

**Notes:**

- Decorative avatars should have empty alt=""

## Skeleton

**Developer must provide:**

- Provide aria-busy="true" on parent container
- Consider aria-live region for loading announcements

**Notes:**

- Skeleton is decorative - loading state should be announced separately

## Table

**Built-in accessibility:**

- Native table element with proper structure
- th elements for headers
- Proper table semantics

**Developer must provide:**

- Use TableCaption for table description
- Use scope="col" or scope="row" on headers

**Notes:**

- Use native table semantics, avoid role="presentation"
