### Code

```tsx
import {MultiSelector} from '@astryxdesign/core';

type Country = {code: string; name: string};

type ShippingCountryPickerProps = {
  countries: Country[];
  selected: string[];
  setSelected: (value: string[]) => void;
  isDisabled?: boolean;
};

export function ShippingCountryPicker({
  countries,
  selected,
  setSelected,
  isDisabled = false,
}: ShippingCountryPickerProps) {
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
      hasSelectAll
      isDisabled={isDisabled}
      emptyText="No matching countries"
    />
  );
}
```

### Notes

I reached first for the plain-picker example: map `countries` to `{value, label}` objects (code as the value, name as the label) and pass `value`/`onChange` straight through to `selected`/`setSelected`. Since the task says nothing happens to a country other than checking it, I deliberately did not pass `actions`, `renderOption`, `icon`, or `description` — the reference says omitting `actions` keeps the panel a plain listbox, which is the right shape here.

I turned on `hasSearch` because country lists are long, and `hasSelectAll` because a shipping form plausibly wants "ship everywhere". I hesitated briefly on `hasSelectAll`: the reference doesn't say whether it respects a search filter (select all visible vs. select all options), so I can't promise which behavior a user gets. I also hesitated on `emptyText`: the reference doesn't say whether it shows only when `options` is empty or also when a search yields no matches, so my "No matching countries" wording is a guess at the second case.

Things I wanted but couldn't find: a way to pass a flag or emoji icon per country without reaching for `icon` (which I could have used, but had no icon source documented beyond the seven named `Icon` glyphs); any error/validation state (`isInvalid`, `errorText`, required marker) for a form field; a `name` or `id` prop for form submission and label association; and a documented `onChange` ordering guarantee (whether `value` comes back in option order or click order), which matters if the form serializes the selection. I didn't work around any of these — I left them out rather than invent props — but a real shipping form would need the validation and `name` story answered.
