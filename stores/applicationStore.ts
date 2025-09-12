import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApplicationData } from '../types/country';

interface ApplicationStore extends Partial<ApplicationData> {
  setApplicationId: (id: string) => void;
  setEmail: (email: string) => void;
  setCurrentStep: (step: number) => void;
  setStatus: (status: string) => void;
  resetApplication: () => void;
}

export const useApplicationStore = create<ApplicationStore>()(
  persist(
    set => ({
      applicationId: undefined,
      email: undefined,
      currentStep: undefined,
      status: undefined,

      setApplicationId: (id: string) => set({ applicationId: id }),

      setEmail: (email: string) => set({ email }),

      setCurrentStep: (step: number) => set({ currentStep: step }),

      setStatus: (status: string) => set({ status }),

      resetApplication: () =>
        set({
          applicationId: undefined,
          email: undefined,
          currentStep: undefined,
          status: undefined,
        }),
    }),
    {
      name: 'turkey-visa-application-store',
    }
  )
);
