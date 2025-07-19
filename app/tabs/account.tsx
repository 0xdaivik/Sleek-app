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
import { useWallet } from '../../src/hooks/useWallet';
import { cashbackService } from '../../src/services/cashbackService';
import { ActivatedSubscription, subscriptionService } from '../../src/services/subscriptionService';

interface OrderHistoryItem {
  id: string;
  subscriptionName: string;
  price: number;
  solPrice: number;
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  cashbackEarned: number;
}

const AccountScreen = () => {
  const { wallet, isConnecting, isConnected, connect, disconnect, getBalance } = useWallet();
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [cashbackBalance, setCashbackBalance] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState<ActivatedSubscription[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const loadAccountData = () => {
    // Load activated subscriptions
    const subscriptions = subscriptionService.getActivatedSubscriptions();
    setActiveSubscriptions(subscriptions);

    // Load cashback balance
    const balance = cashbackService.getCashbackBalance();
    setCashbackBalance(balance.availableBalance);

    // Generate order history from subscriptions
    const history: OrderHistoryItem[] = subscriptions.map(sub => ({
      id: sub.id,
      subscriptionName: sub.name,
      price: sub.price,
      solPrice: sub.solPrice,
      status: 'completed' as const,
      date: sub.activatedAt,
      cashbackEarned: sub.cashbackEarned || 0
    }));

    setOrderHistory(history.sort((a, b) => b.date.getTime() - a.date.getTime()));
  };

  // Load wallet balance when wallet is connected
  useEffect(() => {
    const loadWalletBalance = async () => {
      if (wallet && isConnected) {
        try {
          const balance = await getBalance(wallet.publicKey);
          setWalletBalance(balance);
        } catch (error) {
          console.error('Failed to load wallet balance:', error);
          setWalletBalance(null);
        }
      } else {
        setWalletBalance(null);
      }
    };

    loadWalletBalance();
  }, [wallet, isConnected, getBalance]);

  // Refresh data when tab becomes focused
  useFocusEffect(
    React.useCallback(() => {
      loadAccountData();
    }, [])
  );

  useEffect(() => {
    loadAccountData();
  }, []);

  const handleConnectWallet = async () => {
    try {
      if (isConnected) {
        await disconnect();
        Alert.alert('Wallet Disconnected', 'Wallet has been disconnected successfully.');
      } else {
        await connect();
        Alert.alert('Wallet Connected', 'Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      Alert.alert(
        'Connection Error', 
        'Failed to connect wallet. Please make sure you have a Solana wallet app installed (like Phantom, Solflare, etc.) and try again.'
      );
    }
  };

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

  const formatSol = (amount: number) => {
    return `${amount.toFixed(4)} SOL`;
  };

  const getStatusColor = (status: 'completed' | 'pending' | 'failed') => {
    switch (status) {
      case 'completed': return '#38a169';
      case 'pending': return '#f59e0b';
      case 'failed': return '#e53e3e';
      default: return '#a0a0a0';
    }
  };

  const getStatusIcon = (status: 'completed' | 'pending' | 'failed') => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getShortAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
        <Text style={styles.headerSubtitle}>Manage your wallet & orders</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet</Text>
          
          {!isConnected ? (
            <TouchableOpacity 
              style={[styles.connectWalletButton, isConnecting && styles.connectWalletButtonDisabled]} 
              onPress={handleConnectWallet}
              disabled={isConnecting}
            >
              <Text style={styles.connectWalletIcon}>🔗</Text>
              <Text style={styles.connectWalletText}>
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.walletInfo}>
              <View style={styles.walletHeader}>
                <Text style={styles.walletIcon}>💼</Text>
                <Text style={styles.walletLabel}>Connected Wallet</Text>
              </View>
              <Text style={styles.walletAddress}>{getShortAddress(wallet?.publicKey?.toString() || '')}</Text>
              {walletBalance !== null && (
                <Text style={styles.walletBalance}>
                  Balance: {formatSol(walletBalance)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📋</Text>
              <Text style={styles.statNumber}>{activeSubscriptions.length}</Text>
              <Text style={styles.statLabel}>Active Subscriptions</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statNumber}>{formatCurrency(cashbackBalance)}</Text>
              <Text style={styles.statLabel}>BONK Balance</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statNumber}>{orderHistory.length}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
          </View>
        </View>

        {/* Order History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order History</Text>
          
          {orderHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📦</Text>
              <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Start purchasing subscriptions to see your order history!
              </Text>
            </View>
          ) : (
            orderHistory.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderName}>{order.subscriptionName}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
                  </View>
                  <View style={styles.orderStatus}>
                    <Text style={styles.statusIcon}>{getStatusIcon(order.status)}</Text>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.orderDetails}>
                  <View style={styles.orderDetail}>
                    <Text style={styles.detailLabel}>Price:</Text>
                    <Text style={styles.detailValue}>{formatCurrency(order.price)}</Text>
                  </View>
                  
                  <View style={styles.orderDetail}>
                    <Text style={styles.detailLabel}>SOL:</Text>
                    <Text style={styles.detailValue}>{formatSol(order.solPrice)}</Text>
                  </View>
                  
                  <View style={styles.orderDetail}>
                    <Text style={styles.detailLabel}>Cashback:</Text>
                    <Text style={[styles.detailValue, { color: '#f59e0b' }]}>
                      +{formatCurrency(order.cashbackEarned)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🔧</Text>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>❓</Text>
            <Text style={styles.actionText}>Help & Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📧</Text>
            <Text style={styles.actionText}>Contact Us</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={styles.actionText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  connectWalletButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectWalletButtonDisabled: {
    opacity: 0.7,
  },
  connectWalletIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  connectWalletText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  walletInfo: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  walletLabel: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  walletAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  walletBalance: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
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
  orderCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  orderStatus: {
    alignItems: 'flex-end',
  },
  statusIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  orderDetails: {
    gap: 8,
  },
  orderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default AccountScreen; 