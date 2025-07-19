import { router } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivatedSubscription } from '../services/subscriptionService';

interface PaymentSuccessModalProps {
  visible: boolean;
  subscription: ActivatedSubscription | null;
  onClose: () => void;
}

export const PaymentSuccessModal = ({ visible, subscription, onClose }: PaymentSuccessModalProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleContinue = () => {
    onClose();
    // Navigate to the Sleek tab
    router.push('/tabs/sleek');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Success Icon */}
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>

          {/* Success Title */}
          <Text style={styles.successTitle}>Payment Successful!</Text>
          
          {/* Subscription Details */}
          <View style={styles.subscriptionDetails}>
            <Text style={styles.subscriptionName}>{subscription?.name}</Text>
            <Text style={styles.subscriptionPrice}>
              ${subscription?.price.toFixed(2)} / {subscription?.period}
            </Text>
            <Text style={styles.subscriptionSol}>
              ~{subscription?.solPrice} SOL
            </Text>
            {subscription?.cashbackEarned && (
              <Text style={styles.cashbackEarned}>
                🎁 Earned ${subscription.cashbackEarned.toFixed(2)} BONK Cashback!
              </Text>
            )}
          </View>

          {/* Activation Details */}
          <View style={styles.activationDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Activated:</Text>
              <Text style={styles.detailValue}>{subscription ? formatDate(subscription.activatedAt) : ''}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expires:</Text>
              <Text style={styles.detailValue}>{subscription ? formatDate(subscription.expiresAt) : ''}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, styles.activeStatus]}>Active</Text>
            </View>
          </View>

          {/* Success Message */}
          <Text style={styles.successMessage}>
            Your subscription has been activated successfully! You can now access all premium features.
          </Text>

          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    maxWidth: 400,
    width: '90%',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#38a169',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  subscriptionDetails: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subscriptionPrice: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  subscriptionSol: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  cashbackEarned: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: 'bold',
    marginTop: 10,
  },
  activationDetails: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  activeStatus: {
    color: '#38a169',
    fontWeight: 'bold',
  },
  successMessage: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
}); 