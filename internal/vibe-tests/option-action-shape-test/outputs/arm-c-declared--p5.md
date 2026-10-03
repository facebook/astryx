### Code

```tsx
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
  const options = countries.map(country => ({
    value: country.code,
    label: country.name,
  }));

  return (
    <MultiSelector
      label="Ship to countries"
      options={options}
      value={selected}
      onChange={setSelected}
      placeholder="Select countries..."
      hasSearch
      isDisabled={isDisabled}
      emptyText="No matching countries"
    />
  );
}
```

### Notes

I reached first for the plain-picker example and mapped `countries` into `{value, label}` objects, since the reference says options can be strings or option objects and the field here needs a display name separate from the stored code. The task says nothing happens to a country besides checking it, so I deliberately left `action` off every option; per the reference that keeps the panel a plain listbox rather than switching to the grid mode, and I didn't use `renderOption` because the default row (checkbox plus label) already covers the need.

I hesitated over `hasSearch` and `hasSelectAll`. Country lists are long, so a search box seemed like a clear win and I turned it on; select-all felt wrong for a shipping form (shipping everywhere is rarely the intent), so I left it at its default of off. I also wasn't sure whether `emptyText` applies to "no search matches" or only to an empty `options` array — the reference doesn't say — so I wrote the text to read reasonably either way.

Things I wanted but couldn't find: a way to show a country flag or ISO code in the row without a custom `renderOption` beyond the `icon`/`description` option keys (which exist, but I had no flag asset, so I didn't use them); any sort order control, so I rely on the incoming `countries` order; and any mention of `id`/`name` for form submission or a required/error state, which a shipping form would normally want. I didn't work around those — I left the field purely controlled via `selected`/`setSelected` and kept the surface to documented props only.
