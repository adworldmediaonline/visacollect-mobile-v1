import { ApiResponse } from '../types/country';

// This will be replaced with actual API calls when backend integration is ready
const API_BASE_URL = 'https://your-backend-url.com/api';

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
    // Mock implementation using the real data structure from MongoDB
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate API response with real data structure
        if (applicationId.startsWith('TUR-')) {
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
              ipAddress: '::1',
              userAgent:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
              additionalApplicants: [],
              lastUpdated: '2025-09-06T05:08:40.065Z',
              createdAt: '2025-09-06T05:08:18.431Z',
              updatedAt: '2025-09-06T05:08:40.065Z',
              __v: 0,
            },
          });
        } else {
          resolve({
            success: false,
            error: {
              message: 'Application not found',
            },
          });
        }
      }, 800);
    });

    // Uncomment when backend is ready:
    // return this.request<ApplicationData>(`/applications/${applicationId}`);
  }
}

export const apiService = new ApiService();
