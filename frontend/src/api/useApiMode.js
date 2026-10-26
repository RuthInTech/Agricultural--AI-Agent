import { useEffect, useState } from 'react';
import { getApiMode, subscribeApiMode } from './apiMode.js';

// Subscribes a component to the live/demo API mode so the UI can show an
// honest indicator of whether data comes from the backend or demo fallback.
export default function useApiMode() {
  const [mode, setMode] = useState(getApiMode);

  useEffect(() => {
    const unsubscribe = subscribeApiMode(setMode);
    return () => {
      unsubscribe();
    };
  }, []);

  return mode;
}
