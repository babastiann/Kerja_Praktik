import { useState, useEffect, useCallback } from "react";

/**
 * Hook sederhana untuk fetch data dari API.
 * @param {Function} apiFn  - fungsi dari utils/api.js
 * @param {any[]}    deps   - dependensi untuk re-fetch (mirip useEffect)
 */
export function useApi(apiFn, deps = []) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFn()
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}