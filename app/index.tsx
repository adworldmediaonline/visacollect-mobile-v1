import { Redirect } from 'expo-router';
import React from 'react';

import { useOnboardingStore } from '../stores/onboardingStore';

export default function HomeScreen() {
  const { isOnboardingComplete, selectedCountry } = useOnboardingStore();

  // Check if onboarding is complete and redirect accordingly
  if (isOnboardingComplete && selectedCountry) {
    if (selectedCountry === 'TR') {
      return <Redirect href="/(country)/turkey/welcome" />;
    }
    // Add more countries here as needed
  }

  // Show onboarding screen if not completed or no country selected
  return <Redirect href="/(onboarding)" />;
}
