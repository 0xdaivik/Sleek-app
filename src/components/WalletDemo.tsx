import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useWallet } from '../hooks/useWallet';

export const WalletDemo = () => {
  const { wallet, isConnecting, isConnected, connect, disconnect, getBalance } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const handleConnectWallet = async () => {
    try {
      if (isConnected) {
        await disconnect();
        setBalance(null);
        Alert.alert('Success', 'Wallet disconnected successfully!');
      } else {
        await connect();
        Alert.alert('Success', 'Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      Alert.alert(
        'Connection Error', 
        'Failed to connect wallet. Please make sure you have a Solana wallet app installed (like Phantom, Solflare, etc.) and try again.'
      );
    }
  };

  const handleCheckBalance = async () => {
    if (!wallet) {
      Alert.alert('Error', 'Please connect a wallet first');
      return;
    }

    try {
      setIsLoadingBalance(true);
      const walletBalance = await getBalance(wallet.publicKey);
      setBalance(walletBalance);
      Alert.alert('Balance', `Your wallet balance: ${walletBalance.toFixed(4)} SOL`);
    } catch (error) {
      console.error('Balance check error:', error);
      Alert.alert('Error', 'Failed to get wallet balance');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet Demo</Text>
      
      {/* Connection Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        {wallet && (
          <Text style={styles.addressText}>
            Address: {wallet.publicKey.toString().slice(0, 8)}...
          </Text>
        )}
      </View>

      {/* Connect/Disconnect Button */}
      <TouchableOpacity
        style={[styles.button, isConnected && styles.disconnectButton]}
        onPress={handleConnectWallet}
        disabled={isConnecting}
      >
        <Text style={styles.buttonText}>
          {isConnecting 
            ? 'Connecting...' 
            : isConnected 
              ? 'Disconnect Wallet' 
              : 'Connect Wallet'
          }
        </Text>
      </TouchableOpacity>

      {/* Check Balance Button */}
      {isConnected && (
        <TouchableOpacity
          style={[styles.button, styles.balanceButton]}
          onPress={handleCheckBalance}
          disabled={isLoadingBalance}
        >
          <Text style={styles.buttonText}>
            {isLoadingBalance ? 'Loading...' : 'Check Balance'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Balance Display */}
      {balance !== null && (
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>
            Balance: {balance.toFixed(4)} SOL
          </Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to test:</Text>
                 <Text style={styles.instructionsText}>
           1. Install a Solana wallet (Phantom, Solflare, etc.)
         </Text>
         <Text style={styles.instructionsText}>
           2. Tap &quot;Connect Wallet&quot;
         </Text>
         <Text style={styles.instructionsText}>
           3. Follow the wallet&apos;s authorization flow
         </Text>
        <Text style={styles.instructionsText}>
          4. Check your balance (uses Solana Devnet)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  addressText: {
    color: '#b9ff47',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#b9ff47',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#ff6b6b',
  },
  balanceButton: {
    backgroundColor: '#4ecdc4',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  balanceContainer: {
    backgroundColor: 'rgba(185, 255, 71, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#b9ff47',
  },
  balanceText: {
    color: '#b9ff47',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructionsContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionsText: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 5,
  },
}); 