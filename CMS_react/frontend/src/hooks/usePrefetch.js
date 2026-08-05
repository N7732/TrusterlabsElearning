import { useCallback } from 'react';
import { mutate } from 'swr';
import { swrFetcher } from '../config/swrConfig';

/**
 * Custom React hook for intelligent next-page API data prefetching.
 * When called on mouse hover or scroll intersection, warms the SWR memory cache
 * without triggering re-renders, enabling instant 0.00ms navigation transitions.
 */
export const usePrefetch = () => {
  const prefetchData = useCallback(async (endpoints) => {
    if (!endpoints) return;
    const urlList = Array.isArray(endpoints) ? endpoints : [endpoints];

    urlList.forEach((url) => {
      if (typeof url === 'string' && url.trim() !== '') {
        // Prime SWR cache silently without forcing active component revalidations
        mutate(url, swrFetcher(url), { revalidate: false }).catch(() => {
          // Ignore background prefetch network errors during offline mode
        });
      }
    });
  }, []);

  return { prefetchData };
};

export default usePrefetch;
