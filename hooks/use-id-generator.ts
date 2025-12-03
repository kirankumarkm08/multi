import { useState, useCallback } from "react";

/**
 * Hook to generate unique IDs with a given prefix
 */
export function useIdGenerator(initialValue: number = 1000) {
  const [counter, setCounter] = useState(initialValue);

  const generateId = useCallback(
    (prefix: string): string => {
      setCounter((prev) => prev + 1);
      return `${prefix}-${counter}`;
    },
    [counter]
  );

  return generateId;
}
