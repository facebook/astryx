import {XDSMultiSelector} from '@xds/core/MultiSelector';

export default function MultiSelectorShowcase() {
  return (
    <div style={{width: 300}}>
      <XDSMultiSelector
        label="Columns"
        options={['Name', 'Email', 'Role', 'Status', 'Created']}
        value={[]}
        onChange={() => {}}
        placeholder="Select columns..."
      />
    </div>
  );
}
