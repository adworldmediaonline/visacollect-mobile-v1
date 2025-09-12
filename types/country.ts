export interface Country {
  code: string;
  name: string;
  flag: string;
  enabled: boolean;
}

export interface CountryOption {
  label: string;
  value: string;
}

export interface OnboardingState {
  selectedCountry: string | null;
  isOnboardingComplete: boolean;
}

export interface CheckStatusFormData {
  applicationId: string;
}

export interface ApplicationData {
  applicationId: string;
  email: string;
  currentStep: number;
  status: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
