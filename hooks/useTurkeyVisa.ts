import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { CheckStatusFormData } from '../lib/schemas';
import { apiService } from '../services/api';
import { useApplicationStore } from '../stores/applicationStore';

export function useStartApplication() {
  const router = useRouter();
  const { setApplicationId, setEmail, setCurrentStep, setStatus } =
    useApplicationStore();

  return useMutation({
    mutationFn: async () => {
      // This will be replaced with actual API call when backend is ready
      return new Promise(resolve => {
        setTimeout(() => {
          const mockApplicationId = `TUR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          resolve({
            success: true,
            data: {
              applicationId: mockApplicationId,
              email: '',
              currentStep: 1,
              status: 'draft',
            },
          });
        }, 500);
      });
    },
    onSuccess: (response: any) => {
      if (response.success) {
        const data = response.data;
        setApplicationId(data.applicationId);
        setEmail(data.email);
        setCurrentStep(data.currentStep);
        setStatus(data.status);

        // Navigate to the application start page
        router.push('/(country)/turkey/start');
      }
    },
  });
}

export function useCheckApplicationStatus() {
  const router = useRouter();
  const { setApplicationId, setEmail, setCurrentStep, setStatus } =
    useApplicationStore();

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
  });
}
