import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputShowcase() {
  return (
    <div style={{maxWidth: 300}}>
      <XDSNumberInput
        label="Quantity"
        placeholder="Enter quantity"
        value={0}
        onChange={() => {}}
      />
    </div>
  );
}
