### Code

```tsx
import {useMemo} from 'react';
import {MultiSelector} from '@astryxdesign/core';

type Country = {code: string; name: string};

type CountryPickerProps = {
  countries: Country[];
  selected: string[];
  setSelected: (value: string[]) => void;
  isDisabled?: boolean;
};

export function CountryPicker({
  countries,
  selected,
  setSelected,
  isDisabled = false,
}: CountryPickerProps) {
  const options = useMemo(
    () =>
      countries.map(country => ({
        value: country.code,
        label: country.name,
      })),
    [countries],
  );

  return (
    <MultiSelector
      label="Ships to"
      options={options}
      value={selected}
      onChange={setSelected}
      placeholder="Select countries..."
      hasSearch
      hasSelectAll
      isDisabled={isDisabled}
      emptyText="No countries match"
    />
  );
}
```

### Notes

I reached first for the plain-picker example and mapped `countries` into `{value, label}` objects, since the reference says options can be either strings or `MultiSelectorOptionData` and the country code is the natural stored value while the name is what people read. I turned on `hasSearch` because a country list is long enough that scrolling alone is painful, and `hasSelectAll` because a shipping form plausibly wants "everywhere" as a one-click choice.

I deliberately did not pass `renderOptionAction`. The task says nothing happens to a country beyond checking it, and the reference is explicit that passing the function at all turns the panel into a grid, so passing it with a `null` return would change keyboard behavior for no reason.

Where I hesitated: the reference does not say whether `value` entries must match option `value`s exactly or whether unknown codes are tolerated, so I assumed `selected` already holds country codes. I also wasn't sure whether `useMemo` is necessary — the reference doesn't say whether `MultiSelector` is sensitive to a new `options` array identity each render — so I memoized defensively. Things I wanted but couldn't find: a way to show a flag or region grouping without reaching for `icon` on every option (I left it out rather than invent it), a documented `required` or error-state prop for form validation, and a `name` prop for native form submission. No workarounds were needed beyond the option mapping.
