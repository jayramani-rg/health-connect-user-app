// Server-paginated list state for directory screens: first load, pull-to-refresh, infinite "load more",
// and protection against out-of-order responses (a slow page-1 for an old search must never overwrite the
// results of a newer one). The server owns ordering — including locality prioritization — so pages are
// appended as-is, never re-sorted on the device.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PaginatedResponse } from '../types/common.types';

export interface PaginatedListState<T> {
  items: T[];
  totalCount: number;
  /** First page (or a filter change) in flight with nothing to show yet — render skeletons. */
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
  retry: () => void;
}

export function usePaginatedList<T>(
  fetchPage: (page: number) => Promise<PaginatedResponse<T>>,
  /** Any change here restarts from page 1 (filters, search, locality). */
  resetKey: string,
): PaginatedListState<T> {
  const [items, setItems] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const run = useCallback(async (targetPage: number, mode: 'initial' | 'refresh' | 'more') => {
    const requestId = ++requestIdRef.current;
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    if (mode === 'more') setLoadingMore(true);
    if (mode !== 'more') setError(null);

    try {
      const result = await fetchRef.current(targetPage);
      if (requestId !== requestIdRef.current) return;
      setItems((prev) => (targetPage === 1 ? result.items : [...prev, ...result.items]));
      setTotalCount(result.totalCount);
      setPage(targetPage);
      setHasMore(result.hasNextPage);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      if (mode === 'more') {
        // Keep what's already on screen; stop auto-paging until the user retries.
        setHasMore(false);
        setError(message);
      } else {
        setError(message);
        if (mode === 'initial') setItems([]);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    run(1, 'initial');
  }, [resetKey, run]);

  const refresh = useCallback(() => run(1, 'refresh'), [run]);
  const retry = useCallback(() => run(items.length > 0 ? page + 1 : 1, items.length > 0 ? 'more' : 'initial'), [run, items.length, page]);
  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore || refreshing) return;
    run(page + 1, 'more');
  }, [hasMore, loading, loadingMore, refreshing, page, run]);

  return { items, totalCount, loading, refreshing, loadingMore, error, hasMore, refresh, loadMore, retry };
}
