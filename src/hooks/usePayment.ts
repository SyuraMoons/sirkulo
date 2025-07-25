/**
 * Payment Hook
 * Provides payment functionality with Xendit integration
 */

import { useState, useCallback } from 'react';
import { apiService } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'ewallet' | 'retail_outlet' | 'credit_card';
  logo?: string;
  fees?: {
    percentage?: number;
    fixed?: number;
  };
  minAmount?: number;
  maxAmount?: number;
  isAvailable: boolean;
}

interface Payment {
  id: string;
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';
  paidAt?: string;
  expiresAt?: string;
  paymentUrl?: string;
  qrCode?: string;
  virtualAccountNumber?: string;
  bankCode?: string;
  ewalletType?: string;
  retailOutletName?: string;
  createdAt: string;
  customer: {
    givenNames: string;
    surname?: string;
    email: string;
    mobileNumber?: string;
  };
  order: {
    id: number;
    items: Array<{
      listingId: number;
      title: string;
      quantity: number;
      price: number;
    }>;
  };
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  averageAmount: number;
}

interface UsePaymentReturn {
  payments: Payment[];
  paymentMethods: PaymentMethod[];
  paymentStats: PaymentStats | null;
  currentPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createPayment: (orderData: {
    orderId: number;
    paymentMethod: string;
    bankCode?: string;
    ewalletType?: string;
    customer: {
      givenNames: string;
      surname?: string;
      email: string;
      mobileNumber?: string;
    };
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
  }) => Promise<Payment | null>;
  getPayments: () => Promise<void>;
  getPayment: (id: string) => Promise<void>;
  getPaymentMethods: () => Promise<void>;
  getPaymentStats: () => Promise<void>;
  clearError: () => void;
}

export const usePayment = (): UsePaymentReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { state: authState } = useAuth();

  const createPayment = useCallback(async (orderData: {
    orderId: number;
    paymentMethod: string;
    bankCode?: string;
    ewalletType?: string;
    customer: {
      givenNames: string;
      surname?: string;
      email: string;
      mobileNumber?: string;
    };
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
  }): Promise<Payment | null> => {
    if (!authState.isAuthenticated) {
      setError('Please log in to make payments');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.createPayment(orderData);
      
      if (response.success && response.data) {
        const payment = response.data;
        setCurrentPayment(payment);
        // Add to payments list
        setPayments(prev => [payment, ...prev]);
        return payment;
      } else {
        setError(response.error || 'Failed to create payment');
        return null;
      }
    } catch (error) {
      setError('Failed to create payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  const getPayments = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getPayments();
      
      if (response.success && response.data) {
        setPayments(response.data.payments || []);
      } else {
        setError(response.error || 'Failed to load payments');
        setPayments([]);
      }
    } catch (error) {
      setError('Failed to load payments');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  const getPayment = useCallback(async (id: string) => {
    if (!authState.isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getPayment(id);
      
      if (response.success && response.data) {
        setCurrentPayment(response.data);
      } else {
        setError(response.error || 'Failed to load payment');
        setCurrentPayment(null);
      }
    } catch (error) {
      setError('Failed to load payment');
      setCurrentPayment(null);
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  const getPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getPaymentMethods();
      
      if (response.success && response.data) {
        setPaymentMethods(response.data.methods || []);
      } else {
        setError(response.error || 'Failed to load payment methods');
        setPaymentMethods([]);
      }
    } catch (error) {
      setError('Failed to load payment methods');
      setPaymentMethods([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPaymentStats = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      const response = await apiService.getPaymentStats();
      
      if (response.success && response.data) {
        setPaymentStats(response.data);
      } else {
        setPaymentStats(null);
      }
    } catch (error) {
      console.error('Failed to load payment stats:', error);
      setPaymentStats(null);
    }
  }, [authState.isAuthenticated]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    payments,
    paymentMethods,
    paymentStats,
    currentPayment,
    isLoading,
    error,
    createPayment,
    getPayments,
    getPayment,
    getPaymentMethods,
    getPaymentStats,
    clearError,
  };
};