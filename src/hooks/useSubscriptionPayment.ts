import { useState } from 'react';
import { Subscription, subscriptionService } from '../services/subscriptionService';

export const useSubscriptionPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    subscription?: any;
    error?: string;
  } | null>(null);

  /**
   * Process subscription payment (dummy success)
   */
  const processPayment = async (subscription: Subscription) => {
    setIsProcessing(true);
    setPaymentResult(null);

    try {
      console.log('Processing payment for:', subscription.name);
      
      // Add category to subscription if not present
      const subscriptionWithCategory = {
        ...subscription,
        category: subscription.category || 'Unknown'
      };

      const result = await subscriptionService.activateSubscription(subscriptionWithCategory);
      
      setPaymentResult(result);
      
      if (result.success) {
        console.log('Payment successful:', result.subscription?.name);
      } else {
        console.error('Payment failed:', result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      const result = { success: false, error: errorMessage };
      setPaymentResult(result);
      console.error('Payment error:', error);
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Get activated subscriptions
   */
  const getActivatedSubscriptions = () => {
    return subscriptionService.getActivatedSubscriptions();
  };

  /**
   * Check if subscription is activated
   */
  const isSubscriptionActivated = (subscriptionName: string) => {
    return subscriptionService.isSubscriptionActivated(subscriptionName);
  };

  /**
   * Get subscription statistics
   */
  const getSubscriptionStats = () => {
    return subscriptionService.getSubscriptionStats();
  };

  /**
   * Cancel subscription
   */
  const cancelSubscription = (subscriptionId: string) => {
    return subscriptionService.cancelSubscription(subscriptionId);
  };

  return {
    isProcessing,
    paymentResult,
    processPayment,
    getActivatedSubscriptions,
    isSubscriptionActivated,
    getSubscriptionStats,
    cancelSubscription
  };
}; 