import { cashbackService } from './cashbackService';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  solPrice: number;
  period: string;
  estimated?: boolean;
  region?: string;
  category: string;
}

export interface ActivatedSubscription extends Subscription {
  activatedAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'cancelled';
  cashbackEarned?: number;
}

class SubscriptionService {
  private activatedSubscriptions: ActivatedSubscription[] = [];

  /**
   * Activate a subscription (dummy success)
   */
  async activateSubscription(subscription: Subscription): Promise<{ success: boolean; subscription?: ActivatedSubscription; error?: string }> {
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate cashback
      const cashbackAmount = cashbackService.calculateCashback(subscription.price);
      
      // Earn cashback
      const cashbackTransaction = cashbackService.earnCashback(subscription.name, subscription.price);

      // Create activated subscription
      const activatedSubscription: ActivatedSubscription = {
        ...subscription,
        id: `${subscription.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + this.getPeriodInMs(subscription.period)),
        status: 'active',
        cashbackEarned: cashbackAmount
      };

      // Add to activated subscriptions
      this.activatedSubscriptions.push(activatedSubscription);

      console.log('Subscription activated:', activatedSubscription.name);
      console.log('Cashback earned:', cashbackAmount.toFixed(2), 'BONK');
      
      return {
        success: true,
        subscription: activatedSubscription
      };
    } catch (error) {
      console.error('Error activating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to activate subscription'
      };
    }
  }

  /**
   * Get all activated subscriptions
   */
  getActivatedSubscriptions(): ActivatedSubscription[] {
    return this.activatedSubscriptions.filter(sub => sub.status === 'active');
  }

  /**
   * Get activated subscriptions by category
   */
  getActivatedSubscriptionsByCategory(category: string): ActivatedSubscription[] {
    return this.activatedSubscriptions.filter(sub => 
      sub.category === category && sub.status === 'active'
    );
  }

  /**
   * Check if a subscription is activated
   */
  isSubscriptionActivated(subscriptionName: string): boolean {
    return this.activatedSubscriptions.some(sub => 
      sub.name === subscriptionName && sub.status === 'active'
    );
  }

  /**
   * Cancel a subscription
   */
  cancelSubscription(subscriptionId: string): boolean {
    const subscription = this.activatedSubscriptions.find(sub => sub.id === subscriptionId);
    if (subscription) {
      subscription.status = 'cancelled';
      return true;
    }
    return false;
  }

  /**
   * Get subscription statistics
   */
  getSubscriptionStats() {
    const active = this.activatedSubscriptions.filter(sub => sub.status === 'active').length;
    const total = this.activatedSubscriptions.length;
    const totalValue = this.activatedSubscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + sub.price, 0);

    return {
      activeSubscriptions: active,
      totalSubscriptions: total,
      totalValue: totalValue
    };
  }

  /**
   * Convert period string to milliseconds
   */
  private getPeriodInMs(period: string): number {
    switch (period.toLowerCase()) {
      case 'year':
        return 365 * 24 * 60 * 60 * 1000;
      case 'month':
        return 30 * 24 * 60 * 60 * 1000;
      case 'week':
        return 7 * 24 * 60 * 60 * 1000;
      case 'day':
        return 24 * 60 * 60 * 1000;
      default:
        return 365 * 24 * 60 * 60 * 1000; // Default to 1 year
    }
  }
}

export const subscriptionService = new SubscriptionService(); 