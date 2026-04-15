'use client';

import {useXDSLayer} from '@xds/core/Layer';

function Content() {
  return (
    <div style={{padding: 12, background: 'var(--color-background-secondary)', borderRadius: 8}}>
      Layer content
    </div>
  );
}

export default function LayerContextMode() {
  const layer = useXDSLayer({mode: 'context'});

  return (
    <>
      <button ref={layer.ref}>Trigger</button>
      {layer.render(<Content />, {placement: 'above', alignment: 'center'})}
    </>
  );
}
