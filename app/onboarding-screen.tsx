import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useWallet } from '../src/hooks/useWallet';

const { height } = Dimensions.get('window');

const App = () => {
  const { wallet, isConnecting, isConnected, connect, disconnect } = useWallet();
  const [isEmailConnecting, setIsEmailConnecting] = useState(false);
  const router = useRouter();

  /*
   * IMAGE PATH:
   * This path assumes your 'assets' folder is in the root of your project,
   * and your component file is in a subfolder (e.g., 'app/screens/OnboardingScreen.tsx').
   * Path: Root -> assets -> images -> appicon.jpeg
   */
  const logoImage = require('../assets/images/appicon.jpeg');

  const handleConnectWallet = async () => {
    try {
      if (isConnected) {
        await disconnect();
        Alert.alert('Success', 'Wallet disconnected successfully!');
      } else {
        await connect();
        // Automatically redirect to home screen after successful wallet connection
        router.push('/tabs/home');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      Alert.alert(
        'Connection Error', 
        'Failed to connect wallet. Please make sure you have a Solana wallet app installed (like Phantom, Solflare, etc.) and try again.'
      );
    }
  };

  const handleContinueWithEmail = async () => {
    try {
      setIsEmailConnecting(true);
      // Simulate email connection process
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Email connection initiated!');
    } catch {
      Alert.alert('Error', 'Failed to connect with email.');
    } finally {
      setIsEmailConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Image container occupying the top half of the screen */}
      <View style={styles.imageContainer}>
        <Image
          source={logoImage}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Content for the bottom half */}
      <View style={[styles.contentContainer, { marginTop: 45 }]}>
        {/* Main title */}
        <Text style={styles.title}>
          Sleek is changing the game — join us!
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Discover | Track | Manage
        </Text>

        {/* Continue with Email Button */}
        <TouchableOpacity
          style={[styles.buttonContainer, { marginTop: 16 }]}
          onPress={handleContinueWithEmail}
          disabled={isEmailConnecting}
        >
          <LinearGradient
            colors={['#b9ff47', '#91d82c']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>
              {isEmailConnecting ? 'Connecting...' : 'Continue with Email'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Connect Wallet Button */}
        <TouchableOpacity
          style={[styles.buttonContainer, { marginTop: 16 }]}
          onPress={handleConnectWallet}
          disabled={isConnecting}
        >
          <LinearGradient
            colors={['#b9ff47', '#91d82c']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>
              {isConnecting 
                ? 'Connecting...' 
                : isConnected 
                  ? 'Disconnect Wallet' 
                  : 'Connect Wallet'
              }
            </Text>
          </LinearGradient>
        </TouchableOpacity>



        {/* Wallet Status */}
        {wallet && (
          <View style={styles.walletStatus}>
            <Text style={styles.walletStatusText}>
              Connected: {wallet.publicKey.toString().slice(0, 8)}...
            </Text>
          </View>
        )}


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '100%',
    height: height / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    shadowColor: '#a3e635',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  gradient: {
    paddingVertical: 18,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  walletStatus: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(185, 255, 71, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b9ff47',
  },
  walletStatusText: {
    color: '#b9ff47',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default App;
