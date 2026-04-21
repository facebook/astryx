'use client';

import {XDSCodeBlock} from '@xds/core/CodeBlock';

const code = `#!/usr/bin/env python3
"""Data processing pipeline."""

from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Config:
    input_path: str
    output_path: str
    batch_size: int = 100

def process(config: Config) -> None:
    """Process data according to config."""
    print(f"Processing {config.input_path}")
    # TODO: implement pipeline
    pass

if __name__ == "__main__":
    cfg = Config("input.csv", "output.csv")
    process(cfg)`;

export default function CodeBlockPythonScript() {
  return (
    <XDSCodeBlock
      code={code}
      language="python"
      title="pipeline.py"
      hasLineNumbers
      highlightLines={[7, 8, 9, 10, 11]}
    />
  );
}
