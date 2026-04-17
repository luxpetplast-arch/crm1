import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiResponse, ApiError } from '../lib/professionalApi';
import { errorHandler } from '../lib/professionalErrorHandler';

// Hook Options
export interface UseApiOptions {
  immediate?: boolean;
  retry?: boolean;
  retryCount?: number;
  cache?: boolean;
  cacheTTL?: number;
  showProgress?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  onFinally?: () => void;
}

// Hook State
export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

// Professional API Hook
export function useProfessionalApi<T = any>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const {
    immediate = false,
    retry = true,
    retryCount = 3,
    cache = false,
    cacheTTL = 300000,
    showProgress = false,
    onSuccess,
    onError,
    onFinally,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  const execute = useCallback(async (): Promise<T | null> => {
    if (!mountedRef.current) return null;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      const response = await apiCall();
      
      if (!mountedRef.current) return null;

      setState({
        data: response.data,
        loading: false,
        error: null,
        success: true,
      });

      retryCountRef.current = 0;
      onSuccess?.(response.data);
      return response.data;

    } catch (error) {
      if (!mountedRef.current) return null;

      const apiError = errorHandler.handleError(error) as ApiError;
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
        success: false,
      }));

      onError?.(apiError);

      // Retry logic
      if (retry && apiError.retryable && retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => execute(), 1000 * retryCountRef.current);
      }

      return null;
    } finally {
      if (mountedRef.current) {
        onFinally?.();
      }
    }
  }, [apiCall, retry, retryCount, onSuccess, onError, onFinally]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
    retryCountRef.current = 0;
  }, []);

  const refetch = useCallback(() => {
    retryCountRef.current = 0;
    return execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    refetch,
  };
}

// Pagination Hook
export function usePagination<T = any>(
  fetchPage: (page: number, limit: number) => Promise<ApiResponse<T[]>>,
  initialLimit: number = 10
) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<T[]>([]);

  const {
    loading,
    error,
    success,
    execute: fetch,
  } = useProfessionalApi(
    () => fetchPage(page, limit),
    {
      immediate: true,
      onSuccess: (response) => {
        if (Array.isArray(response)) {
          setData(response);
        }
      },
    }
  );

  const nextPage = useCallback(() => {
    if (page * limit < total) {
      setPage(prev => prev + 1);
    }
  }, [page, limit, total]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((targetPage: number) => {
    setPage(targetPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page * limit < total;
  const hasPrevPage = page > 1;

  return {
    data,
    loading,
    error,
    success,
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    fetch,
  };
}

// Infinite Scroll Hook
export function useInfiniteScroll<T = any>(
  fetchMore: (page: number, limit: number) => Promise<ApiResponse<T[]>>,
  initialLimit: number = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetchMore(page, initialLimit);
      const newData = response.data;
      
      if (Array.isArray(newData)) {
        if (newData.length < initialLimit) {
          setHasMore(false);
        }
        
        setData(prev => [...prev, ...newData]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      errorHandler.handleError(error);
    } finally {
      setLoading(false);
    }
  }, [page, initialLimit, fetchMore, loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMore();
  }, []);

  return {
    data,
    loading,
    hasMore,
    loadMore,
    reset,
  };
}

// Search Hook
export function useSearch<T = any>(
  searchFunction: (query: string, filters?: any) => Promise<ApiResponse<T[]>>,
  debounceMs: number = 300
) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const {
    execute: search,
    error,
  } = useProfessionalApi(
    () => searchFunction(debouncedQuery, filters),
    {
      immediate: false,
      onSuccess: (response) => {
        if (Array.isArray(response)) {
          setResults(response);
        }
      },
    }
  );

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Trigger search when debounced query or filters change
  useEffect(() => {
    if (debouncedQuery.trim() || Object.keys(filters).length > 0) {
      search();
    } else {
      setResults([]);
    }
  }, [debouncedQuery, filters, search]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const updateFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setFilters({});
    setResults([]);
    setDebouncedQuery('');
  }, []);

  return {
    query,
    filters,
    results,
    loading,
    error,
    updateQuery,
    updateFilters,
    clear,
  };
}

// Cache Hook
export function useCache<T = any>(key: string, fetcher: () => Promise<T>, ttl: number = 300000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      
      // Cache in localStorage
      localStorage.setItem(key, JSON.stringify({
        data: result,
        timestamp: Date.now(),
        ttl,
      }));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  useEffect(() => {
    // Check cache first
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data: cachedData, timestamp, ttl: cachedTtl } = JSON.parse(cached);
        
        if (Date.now() - timestamp < cachedTtl) {
          setData(cachedData);
          return;
        }
      }
    } catch {}

    // Fetch fresh data
    fetchData();
  }, [key, fetchData]);

  const invalidate = useCallback(() => {
    localStorage.removeItem(key);
    fetchData();
  }, [key, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidate,
  };
}

// Real-time Hook
export function useRealtime<T = any>(
  subscribe: (callback: (data: T) => void) => () => void,
  initialData?: T
) {
  const [data, setData] = useState<T | null>(initialData || null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = subscribe((newData) => {
        setData(newData);
        setConnected(true);
        setError(null);
      });
    } catch (err) {
      setError(err as Error);
      setConnected(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [subscribe]);

  return {
    data,
    connected,
    error,
  };
}

// Form Hook
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: any,
  onSubmit?: (values: T) => Promise<void>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const setError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const clearError = useCallback((name: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const validate = useCallback(() => {
    if (!validationSchema) return true;

    const result = validationSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof T, string>> = {};
      result.error.issues.forEach((issue: any) => {
        fieldErrors[issue.path[0] as keyof T] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async () => {
    setSubmitted(true);
    
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit?.(values);
      setSubmitted(false);
    } catch (error) {
      errorHandler.handleError(error);
    } finally {
      setSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    submitting,
    submitted,
    isValid,
    isDirty,
    setValue,
    setError,
    clearError,
    validate,
    handleSubmit,
    reset,
  };
}

export default useProfessionalApi;
