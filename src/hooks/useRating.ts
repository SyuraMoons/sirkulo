/**
 * Rating Hook
 * Provides rating functionality for listings and users
 */

import { useState, useCallback } from 'react';
import { apiService } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';

interface Rating {
  id: number;
  listingId: number;
  userId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    fullName: string;
    avatar?: string;
  };
  listing?: {
    id: number;
    title: string;
  };
}

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface UseRatingReturn {
  ratings: Rating[];
  userRatings: Rating[];
  ratingStats: RatingStats | null;
  isLoading: boolean;
  error: string | null;
  canRate: boolean;
  
  // Actions
  createRating: (listingId: number, rating: number, comment?: string) => Promise<boolean>;
  getListingRatings: (listingId: number, params?: {
    minRating?: number;
    maxRating?: number;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  getListingRatingStats: (listingId: number) => Promise<void>;
  getUserRatings: () => Promise<void>;
  checkCanRate: (listingId: number) => Promise<void>;
  clearError: () => void;
}

export const useRating = (): UseRatingReturn => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRatings, setUserRatings] = useState<Rating[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canRate, setCanRate] = useState(false);
  
  const { state: authState } = useAuth();

  const createRating = useCallback(async (
    listingId: number, 
    rating: number, 
    comment?: string
  ): Promise<boolean> => {
    if (!authState.isAuthenticated) {
      setError('Please log in to rate listings');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.createRating(listingId, rating, comment);
      
      if (response.success) {
        // Refresh ratings after creating a new one
        await getListingRatings(listingId);
        await getListingRatingStats(listingId);
        return true;
      } else {
        setError(response.error || 'Failed to create rating');
        return false;
      }
    } catch (error) {
      setError('Failed to create rating');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  const getListingRatings = useCallback(async (
    listingId: number, 
    params?: {
      minRating?: number;
      maxRating?: number;
      page?: number;
      limit?: number;
    }
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getListingRatings(listingId, params);
      
      if (response.success && response.data) {
        setRatings(response.data.ratings || []);
      } else {
        setError(response.error || 'Failed to load ratings');
        setRatings([]);
      }
    } catch (error) {
      setError('Failed to load ratings');
      setRatings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getListingRatingStats = useCallback(async (listingId: number) => {
    try {
      const response = await apiService.getListingRatingStats(listingId);
      
      if (response.success && response.data) {
        setRatingStats(response.data);
      } else {
        setRatingStats(null);
      }
    } catch (error) {
      console.error('Failed to load rating stats:', error);
      setRatingStats(null);
    }
  }, []);

  const getUserRatings = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getUserRatings();
      
      if (response.success && response.data) {
        setUserRatings(response.data.ratings || []);
      } else {
        setError(response.error || 'Failed to load your ratings');
        setUserRatings([]);
      }
    } catch (error) {
      setError('Failed to load your ratings');
      setUserRatings([]);
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  const checkCanRate = useCallback(async (listingId: number) => {
    if (!authState.isAuthenticated) {
      setCanRate(false);
      return;
    }

    try {
      const response = await apiService.canUserRateListing(listingId);
      
      if (response.success && response.data) {
        setCanRate(response.data.canRate || false);
      } else {
        setCanRate(false);
      }
    } catch (error) {
      console.error('Failed to check rating eligibility:', error);
      setCanRate(false);
    }
  }, [authState.isAuthenticated]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ratings,
    userRatings,
    ratingStats,
    isLoading,
    error,
    canRate,
    createRating,
    getListingRatings,
    getListingRatingStats,
    getUserRatings,
    checkCanRate,
    clearError,
  };
};