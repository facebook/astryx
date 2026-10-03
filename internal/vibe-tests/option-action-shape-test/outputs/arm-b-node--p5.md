### Code

```tsx
import {MultiSelector} from '@astryxdesign/core';

type Country = {
  code: string;
  name: string;
};

type CountryPickerProps = {
  countries: Country[];
  selected: string[];
  setSelected: (value: string[]) => void;
};

export function CountryPicker({
  countries,
  selected,
  setSelected,
}: CountryPickerProps) {
  const options = countries.map(country => ({
    value: country.code,
    label: country.name,
  }));

  return (
    <MultiSelector
      label="Ships to"
      options={options}
      value={selected}
      onChange={setSelected}
      placeholder="Select countries..."
      hasSearch
      hasSelectAll
      emptyText="No matching countries"
    />
  );
}
```

### Notes

I reached for the plain-picker example first and mapped `countries` onto `{value, label}` objects, because the stored value (ISO code) and the displayed text (name) differ, so bare strings would not work. I turned on `hasSearch` because a country list is long, and `hasSelectAll` because a shipping form plausibly wants "everywhere". I deliberately left `action` off every option: the task says nothing happens to a country except checking it, and the reference is clear that `action` is only for secondary actions and that adding one flips the panel from a listbox to a grid, which I did not want for a plain picker.

I hesitated over `emptyText`. The reference says it defaults to `'No options'` but does not say whether it also shows when a search matches nothing, so I set it to wording that reads fine in either case.

Things I wanted but could not find: anything about form integration for a shipping form — a `name` for submission, a required flag, or an error/validation message prop. The reference also does not say what `hasSearch` matches against (label only, or value too) or how `hasSelectAll` treats `disabled` options; neither mattered here since no option is disabled. I used no workarounds — if validation is needed, it would have to be plain React around the component.
