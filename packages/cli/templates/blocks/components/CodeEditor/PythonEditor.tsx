'use client';

import {useState} from 'react';
import {XDSCodeEditor} from '@xds/lab';

const defaultPython = `def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence."""
    if n <= 0:
        return []
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib[:n]

result = fibonacci(10)
print(result)`;

export default function PythonEditor() {
  const [value, setValue] = useState(defaultPython);
  return (
    <XDSCodeEditor
      language="python"
      hasLineNumbers
      value={value}
      onChange={setValue}
    />
  );
}
