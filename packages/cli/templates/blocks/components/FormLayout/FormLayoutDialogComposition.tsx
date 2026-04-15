'use client';

import {useState} from 'react';
// @ts-expect-error migrated example
import {XDSDialog, XDSDialogFooter} from '@xds/core/Dialog';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';

export default function FormLayoutDialogComposition() {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    // @ts-expect-error migrated example
    <XDSDialog>
      <form id="edit-form" onSubmit={handleSubmit}>
        <XDSFormLayout>
          <XDSTextInput label="Name" value={name} onChange={setName} />
        </XDSFormLayout>
      </form>
      <XDSDialogFooter>
        <XDSButton label="Save" type="submit" form="edit-form" />
      </XDSDialogFooter>
    </XDSDialog>
  );
}
