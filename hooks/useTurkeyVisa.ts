import { useMutation, useQuery } from '@tanstack/react-query';
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

        // Navigate to the applicant details screen
        router.push(
          `/(country)/turkey/applicant-details?id=${data.applicationId}`
        );
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

export function useGetApplication(applicationId: string, email?: string) {
  return useQuery({
    queryKey: ['application', applicationId, email],
    queryFn: async () => {
      return apiService.getApplication(applicationId);
    },
    enabled: !!applicationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGetPaymentByApplicationId(applicationId: string) {
  return useMutation({
    mutationFn: async () => {
      return apiService.getPaymentByApplicationId(applicationId);
    },
  });
}

export function useSubmitApplicantDetails() {
  return useMutation({
    mutationFn: async (data: {
      applicationId: string;
      applicantDetails: any;
    }) => {
      return apiService.saveApplicantDetails(data);
    },
  });
}

export function useUpdateApplicantDetails() {
  return useMutation({
    mutationFn: async (data: {
      applicationId: string;
      applicantDetails: any;
    }) => {
      return apiService.updateApplicantDetails(data);
    },
  });
}

export function useUpdateApplication() {
  return useMutation({
    mutationFn: async ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: StartApplicationFormData;
    }) => {
      return apiService.updateApplication(applicationId, data);
    },
  });
}

export function useUploadDocuments() {
  const router = useRouter();
  const { setApplicationData } = useApplicationStore();

  return useMutation({
    mutationFn: async (data: { applicationId: string; documents: any }) => {
      return apiService.uploadDocuments(data);
    },
    onSuccess: (response: any) => {
      if (response.success) {
        const data = response.data;
        setApplicationData({
          documents: data.documents,
        });

        // Navigate to the status screen
        router.push(`/(country)/turkey/status?id=${data.applicationId}`);
      }
    },
  });
}

export function useUpdateDocuments() {
  return useMutation({
    mutationFn: async ({
      applicationId,
      documents,
    }: {
      applicationId: string;
      documents: any;
    }) => {
      return apiService.updateDocuments(applicationId, documents);
    },
  });
}
