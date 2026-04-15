'use client';

import {useState} from 'react';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSLayoutFooter} from '@xds/core/Layout';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';

export default function FormLayoutDialogComposition() {
  const [isOpen, setIsOpen] = useState(true);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <XDSDialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <form id="edit-form" onSubmit={handleSubmit}>
        <XDSFormLayout>
          <XDSTextInput
            label="Name"
            value={name}
            onChange={(v) => setName(v)}
          />
        </XDSFormLayout>
      </form>
      <XDSLayoutFooter>
        <XDSButton label="Save" type="submit" form="edit-form" />
      </XDSLayoutFooter>
    </XDSDialog>
  );
}
