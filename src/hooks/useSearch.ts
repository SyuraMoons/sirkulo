/**
 * Advanced Search Hook
 * Provides comprehensive search functionality with filters and suggestions
 */

import { useState, useCallback, useEffect } from 'react';
import { apiService } from '@/src/services/api';

interface SearchFilters {
  query?: string;
  wasteTypes?: string[];
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  unit?: string;
  isNegotiable?: boolean;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  sortBy?: string;
  limit?: number;
  page?: number;
}

interface SearchResult {
  id: number;
  title: string;
  description: string;
  wasteType: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  isNegotiable: boolean;
  location: string;
  images: string[];
  user: {
    id: number;
    fullName: string;
    company?: string;
  };
  createdAt: string;
  rating?: number;
  distance?: number;
}

interface SearchSuggestion {
  text: string;
  type: 'query' | 'location' | 'material' | 'supplier';
  count?: number;
}

interface FilterOptions {
  wasteTypes: Array<{ value: string; label: string }>;
  statuses: Array<{ value: string; label: string }>;
  sortOptions: Array<{ value: string; label: string }>;
  units: Array<{ value: string; label: string }>;
  priceRanges: Array<{ min: number; max: number | null; label: string }>;
  radiusOptions: Array<{ value: number; label: string }>;
}

interface UseSearchReturn {
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  filterOptions: FilterOptions | null;
  popularSearches: string[];
  isLoading: boolean;
  isLoadingSuggestions: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalResults: number;
  
  // Actions
  search: (filters: SearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  getSuggestions: (query: string, type?: string) => Promise<void>;
  loadFilterOptions: () => Promise<void>;
  loadPopularSearches: () => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

export const useSearch = (): UseSearchReturn => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
    loadPopularSearches();
  }, []);

  const search = useCallback(async (filters: SearchFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentFilters(filters);
      setCurrentPage(1);

      const searchParams = {
        ...filters,
        page: 1,
        limit: filters.limit || 20,
      };

      const response = await apiService.searchListings(searchParams);
      
      if (response.success && response.data) {
        const { listings, pagination } = response.data;
        setResults(listings || []);
        setTotalResults(pagination?.total || 0);
        setHasMore(pagination?.hasMore || false);
      } else {
        setError(response.error || 'Search failed');
        setResults([]);
      }
    } catch (error) {
      setError('Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      setIsLoading(true);
      const nextPage = currentPage + 1;

      const searchParams = {
        ...currentFilters,
        page: nextPage,
        limit: currentFilters.limit || 20,
      };

      const response = await apiService.searchListings(searchParams);
      
      if (response.success && response.data) {
        const { listings, pagination } = response.data;
        setResults(prev => [...prev, ...(listings || [])]);
        setCurrentPage(nextPage);
        setHasMore(pagination?.hasMore || false);
      } else {
        setError(response.error || 'Failed to load more results');
      }
    } catch (error) {
      setError('Failed to load more results');
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, currentPage, currentFilters]);

  const getSuggestions = useCallback(async (query: string, type?: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoadingSuggestions(true);
      const response = await apiService.getSearchSuggestions(query, 5, type);
      
      if (response.success && response.data) {
        setSuggestions(response.data.suggestions || []);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const loadFilterOptions = useCallback(async () => {
    try {
      const response = await apiService.getFilterOptions();
      
      if (response.success && response.data) {
        setFilterOptions(response.data);
      }
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  }, []);

  const loadPopularSearches = useCallback(async () => {
    try {
      const response = await apiService.getPopularSearches(10);
      
      if (response.success && response.data) {
        setPopularSearches(response.data.searches || []);
      }
    } catch (error) {
      console.error('Failed to load popular searches:', error);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setSuggestions([]);
    setCurrentPage(1);
    setTotalResults(0);
    setHasMore(false);
    setCurrentFilters({});
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    results,
    suggestions,
    filterOptions,
    popularSearches,
    isLoading,
    isLoadingSuggestions,
    error,
    hasMore,
    currentPage,
    totalResults,
    search,
    loadMore,
    getSuggestions,
    loadFilterOptions,
    loadPopularSearches,
    clearResults,
    clearError,
  };
};