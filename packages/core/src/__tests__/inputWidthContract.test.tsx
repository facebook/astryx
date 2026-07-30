// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

import {docs as CheckboxInputDocs} from '../CheckboxInput/CheckboxInput.doc.mjs';
import {docs as CheckboxListDocs} from '../CheckboxList/CheckboxList.doc.mjs';
import {docs as DateInputDocs} from '../DateInput/DateInput.doc.mjs';
import {docs as DateRangeInputDocs} from '../DateRangeInput/DateRangeInput.doc.mjs';
import {docs as DateTimeInputDocs} from '../DateTimeInput/DateTimeInput.doc.mjs';
import {docs as FileInputDocs} from '../FileInput/FileInput.doc.mjs';
import {docs as MultiSelectorDocs} from '../MultiSelector/MultiSelector.doc.mjs';
import {docs as NumberInputDocs} from '../NumberInput/NumberInput.doc.mjs';
import {docs as RadioListDocs} from '../RadioList/RadioList.doc.mjs';
import {docs as SelectorDocs} from '../Selector/Selector.doc.mjs';
import {docs as SliderDocs} from '../Slider/Slider.doc.mjs';
import {docs as SwitchDocs} from '../Switch/Switch.doc.mjs';
import {docs as TextAreaDocs} from '../TextArea/TextArea.doc.mjs';
import {docs as TextInputDocs} from '../TextInput/TextInput.doc.mjs';
import {docs as TimeInputDocs} from '../TimeInput/TimeInput.doc.mjs';
import {docs as TokenizerDocs} from '../Tokenizer/Tokenizer.doc.mjs';
import {docs as TypeaheadDocs} from '../Typeahead/Typeahead.doc.mjs';

const inputDocsSuite = [
  {name: 'CheckboxInput', docs: CheckboxInputDocs},
  {name: 'CheckboxList', docs: CheckboxListDocs},
  {name: 'DateInput', docs: DateInputDocs},
  {name: 'DateRangeInput', docs: DateRangeInputDocs},
  {name: 'DateTimeInput', docs: DateTimeInputDocs},
  {name: 'FileInput', docs: FileInputDocs},
  {name: 'MultiSelector', docs: MultiSelectorDocs},
  {name: 'NumberInput', docs: NumberInputDocs},
  {name: 'RadioList', docs: RadioListDocs},
  {name: 'Selector', docs: SelectorDocs},
  {name: 'Slider', docs: SliderDocs},
  {name: 'Switch', docs: SwitchDocs},
  {name: 'TextArea', docs: TextAreaDocs},
  {name: 'TextInput', docs: TextInputDocs},
  {name: 'TimeInput', docs: TimeInputDocs},
  {name: 'Tokenizer', docs: TokenizerDocs},
  {name: 'Typeahead', docs: TypeaheadDocs},
];

describe('Input Family width Prop Contract (#4163)', () => {
  inputDocsSuite.forEach(({name, docs}) => {
    it(`documents the width prop for ${name}`, () => {
      const propsList = (docs.props || docs.components?.[0]?.props) as {
        name: string;
        type: string;
      }[];
      expect(
        propsList,
        `${name}.doc.mjs must expose a props array`,
      ).toBeDefined();
      const widthProp = propsList.find(p => p.name === 'width');
      expect(
        widthProp,
        `${name}.doc.mjs must document the width prop`,
      ).toBeDefined();
      expect(widthProp?.type).toBe('SizeValue');
    });
  });
});
