import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { cashbackService } from '../services/cashbackService';

interface CashbackRedeemModalProps {
  visible: boolean;
  onClose: () => void;
  availableBalance: number;
  onRedeemSuccess: () => void;
}

const CashbackRedeemModal: React.FC<CashbackRedeemModalProps> = ({
  visible,
  onClose,
  availableBalance,
  onRedeemSuccess
}) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRedeem = async () => {
    if (!amount.trim()) {
      Alert.alert('Invalid Amount', 'Please enter an amount to redeem.');
      return;
    }

    const redeemAmount = parseFloat(amount);
    
    if (isNaN(redeemAmount) || redeemAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    if (redeemAmount > availableBalance) {
      Alert.alert('Insufficient Balance', `You only have $${availableBalance.toFixed(2)} BONK available.`);
      return;
    }

    setIsLoading(true);
    
    try {
      const transaction = cashbackService.redeemCashback(redeemAmount, 'Manual Redemption');
      
      if (transaction) {
        Alert.alert(
          'Success!',
          `Successfully redeemed $${redeemAmount.toFixed(2)} BONK cashback!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setAmount('');
                onRedeemSuccess();
                onClose();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to redeem cashback. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Redeem BONK Cashback</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Balance Info */}
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(availableBalance)}</Text>
              <Text style={styles.balanceSubtext}>BONK Tokens</Text>
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Amount to Redeem</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#666666"
                  keyboardType="decimal-pad"
                  autoFocus={true}
                />
              </View>
              <Text style={styles.inputHint}>
                Enter amount up to {formatCurrency(availableBalance)}
              </Text>
            </View>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              <Text style={styles.quickAmountsLabel}>Quick Amounts:</Text>
              <View style={styles.quickAmountButtons}>
                {[5, 10, 25, 50].map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={[
                      styles.quickAmountButton,
                      quickAmount > availableBalance && styles.quickAmountButtonDisabled
                    ]}
                    onPress={() => setAmount(quickAmount.toString())}
                    disabled={quickAmount > availableBalance}
                  >
                    <Text style={[
                      styles.quickAmountText,
                      quickAmount > availableBalance && styles.quickAmountTextDisabled
                    ]}>
                      ${quickAmount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  (!amount.trim() || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance) &&
                  styles.redeemButtonDisabled
                ]}
                onPress={handleRedeem}
                disabled={isLoading || !amount.trim() || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
              >
                <Text style={styles.redeemButtonText}>
                  {isLoading ? 'Processing...' : 'Redeem'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  balanceInfo: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#f59e0b',
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  quickAmounts: {
    marginBottom: 24,
  },
  quickAmountsLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  quickAmountButtonDisabled: {
    backgroundColor: '#1a1a1a',
    borderColor: '#444444',
  },
  quickAmountText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  quickAmountTextDisabled: {
    color: '#666666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  redeemButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  redeemButtonDisabled: {
    backgroundColor: '#444444',
  },
  redeemButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default CashbackRedeemModal; 