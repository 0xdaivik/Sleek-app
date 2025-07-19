import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSubscriptionPayment } from '../../src/hooks/useSubscriptionPayment';
import { ActivatedSubscription } from '../../src/services/subscriptionService';

const SleekScreen = () => {
  const { getActivatedSubscriptions, getSubscriptionStats } = useSubscriptionPayment();
  const [activatedSubscriptions, setActivatedSubscriptions] = useState<ActivatedSubscription[]>([]);
  const [stats, setStats] = useState({ activeSubscriptions: 0, totalValue: 0 });

  const loadSubscriptions = () => {
    const subscriptions = getActivatedSubscriptions();
    const subscriptionStats = getSubscriptionStats();
    setActivatedSubscriptions(subscriptions);
    setStats(subscriptionStats);
    console.log('Sleek: Loaded subscriptions:', subscriptions.length);
  };

  // Refresh data when tab becomes focused
  useFocusEffect(
    React.useCallback(() => {
      loadSubscriptions();
    }, [])
  );

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getDaysRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (daysRemaining: number) => {
    if (daysRemaining <= 7) return '#e53e3e'; // Red for expiring soon
    if (daysRemaining <= 30) return '#f59e0b'; // Orange for warning
    return '#38a169'; // Green for good
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sleek</Text>
        <Text style={styles.headerSubtitle}>Your Active Subscriptions</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeSubscriptions}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatCurrency(stats.totalValue)}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      {/* Subscriptions List */}
      <ScrollView style={styles.subscriptionsList} showsVerticalScrollIndicator={false}>
        {activatedSubscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📱</Text>
            <Text style={styles.emptyStateTitle}>No Active Subscriptions</Text>
            <Text style={styles.emptyStateSubtitle}>
              You haven't activated any subscriptions yet. Browse categories to get started!
            </Text>
          </View>
        ) : (
          activatedSubscriptions.map((subscription) => {
            const daysRemaining = getDaysRemaining(subscription.expiresAt);
            const statusColor = getStatusColor(daysRemaining);

            return (
              <View key={subscription.id} style={styles.subscriptionCard}>
                <View style={styles.subscriptionHeader}>
                  <View style={styles.subscriptionInfo}>
                    <Text style={styles.subscriptionName}>{subscription.name}</Text>
                    <Text style={styles.subscriptionCategory}>{subscription.category}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>${subscription.price.toFixed(2)}</Text>
                    <Text style={styles.period}>/{subscription.period}</Text>
                  </View>
                </View>

                <View style={styles.subscriptionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Activated:</Text>
                    <Text style={styles.detailValue}>{formatDate(subscription.activatedAt)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expires:</Text>
                    <Text style={styles.detailValue}>{formatDate(subscription.expiresAt)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={[styles.detailValue, { color: statusColor }]}>
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  subscriptionsList: {
    flex: 1,
    paddingHorizontal: 20,
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
  subscriptionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subscriptionCategory: {
    fontSize: 12,
    color: '#6366f1',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  period: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  subscriptionDetails: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  detailValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default SleekScreen; 