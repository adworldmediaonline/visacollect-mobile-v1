import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { CheckStatusFormData } from '../lib/schemas';
import { StartApplicationFormData } from '../lib/schemas/startApplication';
import { apiService } from '../services/api';
import { useApplicationStore } from '../stores/applicationStore';

export function useStartApplication() {
  const router = useRouter();
  const { setApplicationId, setEmail, setCurrentStep, setStatus } =
    useApplicationStore();

  return useMutation({
    mutationFn: async (data: StartApplicationFormData) => {
      return apiService.startApplication(data);
    },
    onSuccess: (response: any) => {
      if (response.success) {
        const data = response.data;
        setApplicationId(data.applicationId);
        setEmail(data.email);
        setCurrentStep(data.currentStep);
        setStatus(data.status);

        // Navigate to the status screen to show application details
        router.push(`/(country)/turkey/status?id=${data.applicationId}`);
      }
    },
  });
}

export function useCheckApplicationStatus() {
  const router = useRouter();
  const {
    setApplicationId,
    setEmail,
    setCurrentStep,
    setStatus,
    resetApplication,
  } = useApplicationStore();

  return useMutation({
    mutationFn: async (data: CheckStatusFormData) => {
      return apiService.getApplication(data.applicationId);
    },
    onSuccess: response => {
      if (response.success && response.data) {
        const data = response.data;
        setApplicationId(data.applicationId);
        setEmail(data.email);
        setCurrentStep(data.currentStep);
        setStatus(data.status);

        // Navigate to application status page
        router.push({
          pathname: '/(country)/turkey/status',
          params: { id: data.applicationId },
        });
      }
    },
    onError: () => {
      // Clear any previous application data when check fails
      resetApplication();
      // Error navigation is handled in the component that uses this hook
    },
  });
}

export function useGetApplication(applicationId: string) {
  return useMutation({
    mutationFn: async () => {
      return apiService.getApplication(applicationId);
    },
  });
}

export function useGetPaymentByApplicationId(applicationId: string) {
  return useMutation({
    mutationFn: async () => {
      return apiService.getPaymentByApplicationId(applicationId);
    },
  });
}
