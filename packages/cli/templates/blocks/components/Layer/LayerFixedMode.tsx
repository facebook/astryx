'use client';

import {useState} from 'react';
import {useXDSLayer} from '@xds/core/Layer';

function Content() {
  return (
    <div style={{padding: 12, background: 'var(--color-background-secondary)', borderRadius: 8}}>
      Layer content
    </div>
  );
}

export default function LayerFixedMode() {
  const layer = useXDSLayer({mode: 'fixed'});
  const [coords, setCoords] = useState({x: 100, y: 100});

  const handleClick = (e: React.MouseEvent) => {
    setCoords({x: e.clientX, y: e.clientY});
    layer.show();
  };

  return (
    <>
      <button onClick={handleClick}>Click to show layer</button>
      {layer.render(<Content />, {x: coords.x, y: coords.y})}
    </>
  );
}
