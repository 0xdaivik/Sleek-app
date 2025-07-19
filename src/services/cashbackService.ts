export interface CashbackTransaction {
  id: string;
  subscriptionName: string;
  subscriptionPrice: number;
  cashbackAmount: number;
  transactionType: 'earned' | 'redeemed';
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface CashbackBalance {
  totalEarned: number;
  totalRedeemed: number;
  availableBalance: number;
  pendingBalance: number;
}

class CashbackService {
  private transactions: CashbackTransaction[] = [];
  private readonly CASHBACK_PERCENTAGE = 0.10; // 10%

  /**
   * Calculate cashback amount for a subscription purchase
   */
  calculateCashback(subscriptionPrice: number): number {
    return subscriptionPrice * this.CASHBACK_PERCENTAGE;
  }

  /**
   * Earn cashback from subscription purchase
   */
  earnCashback(subscriptionName: string, subscriptionPrice: number): CashbackTransaction {
    const cashbackAmount = this.calculateCashback(subscriptionPrice);
    
    const transaction: CashbackTransaction = {
      id: `cashback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subscriptionName,
      subscriptionPrice,
      cashbackAmount,
      transactionType: 'earned',
      timestamp: new Date(),
      status: 'completed'
    };

    this.transactions.push(transaction);
    console.log(`Earned ${cashbackAmount.toFixed(2)} BONK cashback for ${subscriptionName}`);
    
    return transaction;
  }

  /**
   * Redeem cashback for a purchase
   */
  redeemCashback(amount: number, subscriptionName: string): CashbackTransaction | null {
    const availableBalance = this.getAvailableBalance();
    
    console.log(`CashbackService: Attempting to redeem $${amount} BONK`);
    console.log(`CashbackService: Available balance: $${availableBalance} BONK`);
    
    if (availableBalance < amount) {
      console.log(`CashbackService: Insufficient balance. Available: ${availableBalance}, Requested: ${amount}`);
      return null;
    }

    const transaction: CashbackTransaction = {
      id: `redemption-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subscriptionName,
      subscriptionPrice: 0,
      cashbackAmount: amount,
      transactionType: 'redeemed',
      timestamp: new Date(),
      status: 'completed'
    };

    this.transactions.push(transaction);
    console.log(`CashbackService: Successfully redeemed ${amount.toFixed(2)} BONK cashback for ${subscriptionName}`);
    console.log(`CashbackService: New available balance: ${this.getAvailableBalance().toFixed(2)} BONK`);
    
    return transaction;
  }

  /**
   * Get all cashback transactions
   */
  getTransactions(): CashbackTransaction[] {
    return [...this.transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get transactions by type
   */
  getTransactionsByType(type: 'earned' | 'redeemed'): CashbackTransaction[] {
    return this.transactions.filter(t => t.transactionType === type);
  }

  /**
   * Get current cashback balance
   */
  getCashbackBalance(): CashbackBalance {
    const earnedTransactions = this.getTransactionsByType('earned');
    const redeemedTransactions = this.getTransactionsByType('redeemed');
    
    const totalEarned = earnedTransactions.reduce((sum, t) => sum + t.cashbackAmount, 0);
    const totalRedeemed = redeemedTransactions.reduce((sum, t) => sum + t.cashbackAmount, 0);
    const availableBalance = totalEarned - totalRedeemed;
    
    return {
      totalEarned,
      totalRedeemed,
      availableBalance: Math.max(0, availableBalance),
      pendingBalance: 0 // Could be used for pending transactions
    };
  }

  /**
   * Get available balance for redemption
   */
  getAvailableBalance(): number {
    return this.getCashbackBalance().availableBalance;
  }

  /**
   * Check if user can redeem cashback
   */
  canRedeemCashback(amount: number): boolean {
    return this.getAvailableBalance() >= amount;
  }

  /**
   * Get cashback statistics
   */
  getCashbackStats() {
    const balance = this.getCashbackBalance();
    const transactions = this.getTransactions();
    
    return {
      totalTransactions: transactions.length,
      totalEarned: balance.totalEarned,
      totalRedeemed: balance.totalRedeemed,
      availableBalance: balance.availableBalance,
      averageCashback: transactions.length > 0 ? balance.totalEarned / transactions.filter(t => t.transactionType === 'earned').length : 0
    };
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData(): void {
    this.transactions = [];
  }

  /**
   * Add test cashback data (for debugging)
   */
  addTestCashback(): void {
    // Add some test earned cashback
    this.earnCashback('Netflix Premium', 599.40);
    this.earnCashback('Spotify Family', 299.40);
    this.earnCashback('YouTube Premium', 399.40);
    
    console.log('CashbackService: Added test cashback data');
    console.log('CashbackService: Current balance:', this.getCashbackBalance());
  }
}

export const cashbackService = new CashbackService(); 