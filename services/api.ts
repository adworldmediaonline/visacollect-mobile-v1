import { ApiResponse } from '../types/country';

// Backend API base URL - update this to your actual backend URL
const API_BASE_URL = 'http://localhost:3000/api/v1/turkey';

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.error?.message || 'An error occurred',
            code: data.error?.code,
          },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Network error occurred',
        },
      };
    }
  }

  async getApplication(applicationId: string): Promise<ApiResponse<any>> {
    // For development, you can use mock data by uncommenting the mock section below
    // and commenting out the real API call

    // Mock implementation for development (comment out when using real API)
    if (
      process.env.NODE_ENV === 'development' &&
      applicationId === 'TUR-VSG9ZZ4Z'
    ) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              _id: '68bbc1c2de84e629f70c203e',
              applicationId,
              passportCountry: 'Vietnam',
              travelDocument: 'Ordinary Passport',
              visaType: 'Electronic Visa',
              destination: 'Turkey',
              email: 'sunil141292@gmail.com',
              status: 'started',
              currentStep: 1,
              visaFee: 51,
              serviceFee: 35,
              additionalApplicants: [],
              lastUpdated: '2025-09-06T05:08:40.065Z',
              createdAt: '2025-09-06T05:08:18.431Z',
              updatedAt: '2025-09-06T05:08:40.065Z',
              __v: 0,
            },
          });
        }, 800);
      });
    }

    // For development testing - simulate "not found" for invalid IDs
    if (
      process.env.NODE_ENV === 'development' &&
      applicationId !== 'TUR-VSG9ZZ4Z'
    ) {
      return new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error('Application not found');
          (error as any).code = 'NOT_FOUND';
          reject(error);
        }, 500);
      });
    }

    // Real API call to backend
    const response = await this.request<any>(`/application/${applicationId}`);

    // If the API returns success: false, throw an error so TanStack Query can handle it properly
    if (!response.success) {
      const error = new Error(
        response.error?.message || 'Application not found'
      );
      (error as any).code = response.error?.code;
      throw error;
    }

    return response;
  }
}

export const apiService = new ApiService();
