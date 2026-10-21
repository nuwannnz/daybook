import { useState } from 'react';

export function SampleCounter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setCount(count + 1);
        }}
      >
        Add one
      </button>
      <p role="status">Count: {count}</p>
    </div>
  );
}
