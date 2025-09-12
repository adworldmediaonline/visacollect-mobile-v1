import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OnboardingState } from '../types/country';

interface OnboardingStore extends OnboardingState {
  setSelectedCountry: (country: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    set => ({
      selectedCountry: null,
      isOnboardingComplete: false,

      setSelectedCountry: (country: string) =>
        set({ selectedCountry: country }),

      completeOnboarding: () => set({ isOnboardingComplete: true }),

      resetOnboarding: () =>
        set({
          selectedCountry: null,
          isOnboardingComplete: false,
        }),
    }),
    {
      name: 'visa-onboarding-store',
    }
  )
);
