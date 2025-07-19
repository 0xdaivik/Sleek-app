import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useWallet } from '../hooks/useWallet';

export const WalletTest = () => {
  const { 
    wallet, 
    isConnecting, 
    isConnected, 
    connect, 
    disconnect,
    testWalletAvailability,
    getAvailableWallets
  } = useWallet();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isTestingAvailability, setIsTestingAvailability] = useState(false);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const handleConnectWallet = async () => {
    try {
      addDebugInfo('Starting wallet connection...');
      
      if (isConnected) {
        addDebugInfo('Disconnecting wallet...');
        await disconnect();
        addDebugInfo('Wallet disconnected successfully');
        Alert.alert('Success', 'Wallet disconnected successfully!');
      } else {
        addDebugInfo('Attempting to connect wallet...');
        await connect();
        addDebugInfo('Wallet connected successfully');
        Alert.alert('Success', 'Wallet connected successfully!');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addDebugInfo(`Error: ${errorMessage}`);
      console.error('Wallet connection error:', error);
      Alert.alert(
        'Connection Error', 
        `Failed to connect wallet: ${errorMessage}`
      );
    }
  };

  const handleTestAvailability = async () => {
    try {
      setIsTestingAvailability(true);
      addDebugInfo('Testing mobile wallet adapter availability...');
      
      const isAvailable = await testWalletAvailability();
      addDebugInfo(`Mobile wallet adapter available: ${isAvailable}`);
      
      if (isAvailable) {
        addDebugInfo('Mobile wallet adapter is working correctly');
        Alert.alert('Success', 'Mobile wallet adapter is available and working!');
      } else {
        addDebugInfo('Mobile wallet adapter is not available');
        Alert.alert('Warning', 'Mobile wallet adapter is not available. Please check your device configuration.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addDebugInfo(`Availability test error: ${errorMessage}`);
      Alert.alert('Error', `Failed to test availability: ${errorMessage}`);
    } finally {
      setIsTestingAvailability(false);
    }
  };

  const handleGetAvailableWallets = async () => {
    try {
      addDebugInfo('Getting available wallet apps...');
      const wallets = await getAvailableWallets();
      addDebugInfo(`Available wallets: ${wallets.join(', ')}`);
      Alert.alert('Available Wallets', `Recommended wallets: ${wallets.join(', ')}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addDebugInfo(`Error getting wallets: ${errorMessage}`);
      Alert.alert('Error', `Failed to get available wallets: ${errorMessage}`);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Wallet Connection Test</Text>
      
      {/* Status Display */}
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

      {/* Test Buttons */}
      <TouchableOpacity
        style={[styles.button, styles.testButton]}
        onPress={handleTestAvailability}
        disabled={isTestingAvailability}
      >
        <Text style={styles.buttonText}>
          {isTestingAvailability ? 'Testing...' : 'Test Wallet Availability'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.infoButton]}
        onPress={handleGetAvailableWallets}
      >
        <Text style={styles.buttonText}>Get Available Wallets</Text>
      </TouchableOpacity>

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

      {/* Debug Info */}
      <View style={styles.debugContainer}>
        <View style={styles.debugHeader}>
          <Text style={styles.debugTitle}>Debug Information</Text>
          <TouchableOpacity onPress={clearDebugInfo} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.debugScroll}>
          {debugInfo.map((info, index) => (
            <Text key={index} style={styles.debugText}>
              {info}
            </Text>
          ))}
          {debugInfo.length === 0 && (
            <Text style={styles.debugText}>No debug information yet...</Text>
          )}
        </ScrollView>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Testing Instructions:</Text>
        <Text style={styles.instructionsText}>
          1. First, tap &quot;Test Wallet Availability&quot; to check if the mobile wallet adapter is working
        </Text>
        <Text style={styles.instructionsText}>
          2. Tap &quot;Get Available Wallets&quot; to see recommended wallet apps
        </Text>
        <Text style={styles.instructionsText}>
          3. Install a Solana wallet (Phantom, Solflare, etc.) from the app store
        </Text>
        <Text style={styles.instructionsText}>
          4. Tap &quot;Connect Wallet&quot; to attempt connection
        </Text>
        <Text style={styles.instructionsText}>
          5. Check the debug information below for details
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
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
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#47b9ff',
  },
  infoButton: {
    backgroundColor: '#ff47b9',
  },
  disconnectButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  debugContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 15,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  debugTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#666',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
  },
  debugScroll: {
    maxHeight: 200,
  },
  debugText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  instructionsContainer: {
    marginTop: 20,
    padding: 15,
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