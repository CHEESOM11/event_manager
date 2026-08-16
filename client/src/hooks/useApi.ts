import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../utils/errors";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  request: () => Promise<T>,
  deps: unknown[] = [],
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const requestRef = useRef(request);
  requestRef.current = request;

  const execute = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    return requestRef
      .current()
      .then((data) => {
        setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: getErrorMessage(error),
        }));
      });
  }, []);

  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    execute();
    // Run when the serialized dependency values change.
  }, [execute, depsKey]);

  const refetch = useCallback(async () => {
    await execute();
  }, [execute]);

  return { ...state, refetch };
}
