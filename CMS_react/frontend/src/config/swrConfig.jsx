import React from 'react';
import { SWRConfig, mutate } from 'swr';
import { apiClient } from '../api/apiClient';

/**
 * Default SWR fetcher utilizing apiClient for automatic token management and error handling.
 */
export const swrFetcher = async (url) => {
  if (!url) return null;
  return await apiClient.get(url);
};

/**
 * Persistent LocalStorage Cache Provider for instant 0.00ms initial renders across browser reloads.
 * Implements Stale-While-Revalidate pattern with offline/reconnect support.
 */
export const localStorageProvider = () => {
  // Restore cache entries from localStorage on application initialize
  const map = new Map();
  try {
    const cached = localStorage.getItem('truster_swr_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        parsed.forEach(([key, value]) => map.set(key, value));
      }
    }
  } catch (e) {
    console.warn('Failed to parse SWR local storage cache:', e);
  }

  // Persist memory cache back to localStorage on window close/reload or background sync
  const saveCache = () => {
    try {
      // Keep only successful data entries to optimize quota
      const entries = Array.from(map.entries()).filter(([k, v]) => {
        return v && v.data !== undefined && !v.error;
      });
      // Limit cache size to the most recent 100 entries to prevent QuotaExceededError
      const sliced = entries.slice(-100);
      localStorage.setItem('truster_swr_cache', JSON.stringify(sliced));
    } catch (err) {
      console.warn('LocalStorage quota exceeded for SWR cache, trimming cache.');
    }
  };

  window.addEventListener('beforeunload', saveCache);
  // Periodically snapshot cache every 30 seconds
  setInterval(saveCache, 30000);

  return map;
};

/**
 * Helper to perform instant Optimistic UI updates on any SWR cache key.
 * 
 * @param {string|Array} key - The SWR cache key (endpoint URL)
 * @param {Function|any} optimisticData - The optimistic value or an updater function (current => next)
 * @param {Function} asyncMutationFn - The server mutation API call (Promise)
 * @param {boolean} [revalidate=true] - Whether to trigger background revalidation after server success
 */
export const mutateOptimistic = async (key, optimisticData, asyncMutationFn, revalidate = true) => {
  return await mutate(
    key,
    async () => {
      const result = await asyncMutationFn();
      return result !== undefined ? result : undefined;
    },
    {
      optimisticData,
      rollbackOnError: true,
      populateCache: false,
      revalidate
    }
  );
};

/**
 * Global SWR Configuration Provider Component
 */
export const SWRProvider = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        provider: localStorageProvider,
        dedupingInterval: 3000, // Prevent duplicate requests within 3 seconds
        focusThrottleInterval: 5000,
        revalidateOnFocus: true, // Automatic revalidation on window focus
        revalidateOnReconnect: true, // Revalidate when network recovers
        revalidateIfStale: true,
        keepPreviousData: true, // Keep stale data displayed during key changes or background revalidation
        errorRetryCount: 3
      }}
    >
      {children}
    </SWRConfig>
  );
};
