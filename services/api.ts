import { ApiResponse, ApplicationData } from '../types/country';

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

  async getApplication(
    applicationId: string
  ): Promise<ApiResponse<ApplicationData>> {
    // Mock implementation for now
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate API response
        if (applicationId.startsWith('TUR-')) {
          resolve({
            success: true,
            data: {
              applicationId,
              email: 'user@example.com',
              currentStep: 1,
              status: 'in_progress',
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
      }, 1000);
    });

    // Uncomment when backend is ready:
    // return this.request<ApplicationData>(`/applications/${applicationId}`);
  }
}

export const apiService = new ApiService();
