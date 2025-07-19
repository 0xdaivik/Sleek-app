import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CashbackRedeemModal from '../../src/components/CashbackRedeemModal';
import { cashbackService, CashbackTransaction } from '../../src/services/cashbackService';

const RewardsScreen = () => {
  const [balance, setBalance] = useState({ totalEarned: 0, totalRedeemed: 0, availableBalance: 0 });
  const [transactions, setTransactions] = useState<CashbackTransaction[]>([]);
  const [stats, setStats] = useState({ totalTransactions: 0, averageCashback: 0 });
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const loadCashbackData = () => {
    const cashbackBalance = cashbackService.getCashbackBalance();
    const cashbackTransactions = cashbackService.getTransactions();
    const cashbackStats = cashbackService.getCashbackStats();
    
    setBalance(cashbackBalance);
    setTransactions(cashbackTransactions);
    setStats(cashbackStats);
    
    console.log('Rewards: Loaded cashback data:', cashbackBalance);
  };

  // Refresh data when tab becomes focused
  useFocusEffect(
    React.useCallback(() => {
      loadCashbackData();
    }, [])
  );

  useEffect(() => {
    loadCashbackData();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getTransactionIcon = (type: 'earned' | 'redeemed') => {
    return type === 'earned' ? '💰' : '💸';
  };

  const getTransactionColor = (type: 'earned' | 'redeemed') => {
    return type === 'earned' ? '#38a169' : '#e53e3e';
  };

  const handleRedeemCashback = () => {
    if (balance.availableBalance <= 0) {
      Alert.alert('No Balance', 'You have no BONK cashback available for redemption.');
      return;
    }
    setShowRedeemModal(true);
  };

  const handleRedeemSuccess = () => {
    loadCashbackData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rewards</Text>
        <Text style={styles.headerSubtitle}>BONK Cashback</Text>
      </View>

      {/* Balance Cards */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceIcon}>💰</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance.availableBalance)}</Text>
          <Text style={styles.balanceLabel}>Available BONK</Text>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceIcon}>📊</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance.totalEarned)}</Text>
          <Text style={styles.balanceLabel}>Total Earned</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalTransactions}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatCurrency(stats.averageCashback)}</Text>
          <Text style={styles.statLabel}>Avg. Cashback</Text>
        </View>
      </View>

      {/* Redeem Button */}
      {balance.availableBalance > 0 && (
        <TouchableOpacity style={styles.redeemButton} onPress={handleRedeemCashback}>
          <Text style={styles.redeemButtonText}>Redeem BONK Cashback</Text>
        </TouchableOpacity>
      )}



      {/* Transactions List */}
      <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎁</Text>
            <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start purchasing subscriptions to earn BONK cashback!
            </Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionIcon}>
                    {getTransactionIcon(transaction.transactionType)}
                  </Text>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionName}>
                      {transaction.transactionType === 'earned' 
                        ? `Earned from ${transaction.subscriptionName}`
                        : `Redeemed for ${transaction.subscriptionName}`
                      }
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.timestamp)}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.amountText,
                    { color: getTransactionColor(transaction.transactionType) }
                  ]}>
                    {transaction.transactionType === 'earned' ? '+' : '-'}
                    {formatCurrency(transaction.cashbackAmount)}
                  </Text>
                  <Text style={styles.amountLabel}>BONK</Text>
                </View>
              </View>
              
              {transaction.transactionType === 'earned' && (
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionText}>
                    Subscription: {transaction.subscriptionName}
                  </Text>
                  <Text style={styles.subscriptionText}>
                    Price: {formatCurrency(transaction.subscriptionPrice)}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <CashbackRedeemModal
        visible={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        onRedeemSuccess={handleRedeemSuccess}
        availableBalance={balance.availableBalance}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#0a0a0a',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  balanceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  redeemButton: {
    backgroundColor: '#f59e0b',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  redeemButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 20,
  },
  transactionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountLabel: {
    fontSize: 10,
    color: '#a0a0a0',
  },
  subscriptionInfo: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  subscriptionText: {
    fontSize: 11,
    color: '#a0a0a0',
  },
});

export default RewardsScreen; 