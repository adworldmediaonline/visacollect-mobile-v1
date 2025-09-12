import { ApiResponse } from '../types/country';

// Backend API base URL - update this to your actual backend URL
const API_BASE_URL = 'http://localhost:8090/api/v1/turkey';

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
            message: data.error?.message || data.message || 'An error occurred',
            code: data.error?.code || 'API_ERROR',
          },
        };
      }

      // Backend returns { success: true, data: applicationData }
      return {
        success: data.success || true,
        data: data.data || data,
      };
    } catch (error: any) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Network error occurred',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  async getApplication(applicationId: string): Promise<ApiResponse<any>> {
    console.log(`🔍 Fetching application: ${applicationId}`);
    console.log(`🌐 API URL: ${API_BASE_URL}/application/${applicationId}`);

    // Make real API call to backend
    const response = await this.request<any>(`/application/${applicationId}`);

    console.log(`📡 API Response:`, response);

    // If the API returns success: false, throw an error so TanStack Query can handle it properly
    if (!response.success) {
      console.log(`❌ API Error:`, response.error);
      const error = new Error(
        response.error?.message || 'Application not found'
      );
      (error as any).code = response.error?.code;
      throw error;
    }

    console.log(`✅ Application found:`, response.data);
    return response;
  }

  async getPaymentByApplicationId(
    applicationId: string
  ): Promise<ApiResponse<any>> {
    console.log(`🔍 Fetching payment for application: ${applicationId}`);

    // Payment endpoints are at /api/v1/payment, not /api/v1/turkey/payment
    const paymentBaseUrl = API_BASE_URL.replace('/api/v1/turkey', '/api/v1');
    console.log(
      `🌐 API URL: ${paymentBaseUrl}/payment/application/${applicationId}`
    );

    try {
      const response = await fetch(
        `${paymentBaseUrl}/payment/application/${applicationId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log(`📡 Payment API Response:`, data);

      if (!response.ok) {
        const error = new Error(
          data.error?.message || data.message || 'Payment not found'
        );
        (error as any).code = data.error?.code || 'API_ERROR';
        throw error;
      }

      return {
        success: data.success || true,
        data: data.data || data,
      };
    } catch (error: any) {
      console.error('Payment API Request Error:', error);
      const apiError = new Error(error.message || 'Network error occurred');
      (apiError as any).code = 'NETWORK_ERROR';
      throw apiError;
    }
  }

  async startApplication(data: any): Promise<ApiResponse<any>> {
    console.log('🚀 Starting application:', data);

    try {
      const response = await fetch(`${API_BASE_URL}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('📡 Start Application API Response:', responseData);

      if (!response.ok) {
        const error = new Error(
          responseData.error?.message ||
            responseData.message ||
            'Failed to start application'
        );
        (error as any).code = responseData.error?.code || 'API_ERROR';
        throw error;
      }

      return {
        success: responseData.success || true,
        data: responseData.data || responseData,
      };
    } catch (error: any) {
      console.error('Start Application API Request Error:', error);
      const apiError = new Error(error.message || 'Network error occurred');
      (apiError as any).code = 'NETWORK_ERROR';
      throw apiError;
    }
  }
}

export const apiService = new ApiService();
