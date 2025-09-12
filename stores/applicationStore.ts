import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApplicationData } from '../types/country';

interface ApplicationStore extends Partial<ApplicationData> {
  applicationData: any;
  setApplicationId: (id: string | null) => void;
  setEmail: (email: string) => void;
  setCurrentStep: (step: number) => void;
  setStatus: (status: string) => void;
  setApplicationData: (data: any) => void;
  resetApplication: () => void;
}

export const useApplicationStore = create<ApplicationStore>()(
  persist(
    set => ({
      applicationId: undefined,
      email: undefined,
      currentStep: undefined,
      status: undefined,
      applicationData: {},

      setApplicationId: (id: string | null) => set({ applicationId: id }),

      setEmail: (email: string) => set({ email }),

      setCurrentStep: (step: number) => set({ currentStep: step }),

      setStatus: (status: string) => set({ status }),

      setApplicationData: (data: any) => set({ applicationData: data }),

      resetApplication: () =>
        set({
          applicationId: undefined,
          email: undefined,
          currentStep: undefined,
          status: undefined,
          applicationData: {},
        }),
    }),
    {
      name: 'turkey-visa-application-store',
    }
  )
);
