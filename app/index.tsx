import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Removed NavigationContainer and createStackNavigator as Expo Router provides its own
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';

import { useRouter } from 'expo-router'; // Import useRouter hook from expo-router

// Import your onboarding screen (no change needed here, it's a standalone screen)
// import OnboardingScreen from './onboarding-screen'; // Not directly imported here, but used by router

/**
 * IMAGE PATH:
 * This path assumes your 'assets' folder is in the root of your project,
 * and 'index.tsx' is inside the 'app' folder.
 * Path: Root -> assets -> images -> logoint.png
 */
const logoImage = require('../assets/images/logoint.png');

// In Expo Router, you don't define RootStackParamList or StackScreenProps here directly
// as the router handles the navigation types implicitly based on file names.

// This is now the main component for the '/' route (index.tsx)
const App = () => { // Renamed from InitialWelcomeScreen to App as it's the default export for index.tsx
  const router = useRouter(); // Initialize the router hook

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <View style={styles.graphicContainer}>
          <Image
            source={logoImage}
            style={styles.graphicImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to Sleek</Text>
          <Text style={styles.subtitle}>
            All your subscriptions under one{'\n'}roof with GREAT discounts!
          </Text>
        </View>

        <TouchableOpacity
          style={styles.buttonContainer}
          activeOpacity={0.8}
          // Use router.push to navigate to the onboarding-screen.tsx file
          onPress={() => router.push('/onboarding-screen')}
        >
          <LinearGradient
            // Gradient colors
            colors={['#b9ff47', '#91d82c']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Removed Stack definition as it's not needed here with Expo Router

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  graphicContainer: {
    // This container can be adjusted if needed
  },
  graphicImage: {
    width: 320,
    height: 320,
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#A9A9A9',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 25,
  },
  buttonContainer: {
    width: '100%',
    shadowColor: '#a3e635',
    shadowOffset: {
      width: 0,
      height: 5,
    },
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
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;
