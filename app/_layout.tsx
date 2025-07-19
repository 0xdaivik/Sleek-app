import { Stack } from 'expo-router';
import React from 'react';

const RootLayout = () => {
  return (
    <Stack>
      {/* This line configures the screen for the 'index' route */}
      <Stack.Screen
        name="index"
        options={{
          // This option hides the header bar for the index screen
          headerShown: false,
        }}
      />
      {/* This line configures the screen for the 'onboarding-screen' route */}
      <Stack.Screen
        name="onboarding-screen" // Match the file name (without .tsx)
        options={{
          // This option hides the header bar for the onboarding screen
          headerShown: false,
        }}
      />
      {/* This line configures the screen for the 'tabs' route */}
      <Stack.Screen
        name="tabs"
        options={{
          // This option hides the header bar for the tabs screen
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default RootLayout;
