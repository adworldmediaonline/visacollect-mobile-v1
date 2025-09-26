import { ApiResponse } from '../types/country';

// Backend API base URL - update this to your actual backend URL
const API_BASE_URL = 'http://localhost:8090/api/v1/turkey';

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      console.log(
        `🌐 API Request: ${options?.method || 'GET'} ${API_BASE_URL}${endpoint}`
      );

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      console.log(
        `📡 API Response Status: ${response.status} ${response.statusText}`
      );

      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const htmlText = await response.text();
        console.error(
          '❌ Server returned HTML instead of JSON:',
          htmlText.substring(0, 200)
        );
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

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
      console.error('❌ API Request Error:', error);
      if (error.message.includes('JSON Parse error')) {
        throw new Error(
          'Server returned invalid response. Please check if the backend is running.'
        );
      }
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

  async saveApplicantDetails(data: {
    applicationId: string;
    applicantDetails: any;
  }): Promise<ApiResponse<any>> {
    console.log('💾 Saving applicant details:', data);

    try {
      const response = await fetch(`${API_BASE_URL}/applicant-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('📡 Save Applicant Details API Response:', responseData);

      if (!response.ok) {
        const error = new Error(
          responseData.error?.message ||
            responseData.message ||
            'Failed to save applicant details'
        );
        (error as any).code = responseData.error?.code || 'API_ERROR';
        throw error;
      }

      return {
        success: responseData.success || true,
        data: responseData.data || responseData,
      };
    } catch (error: any) {
      console.error('Save Applicant Details API Request Error:', error);
      const apiError = new Error(error.message || 'Network error occurred');
      (apiError as any).code = 'NETWORK_ERROR';
      throw apiError;
    }
  }

  async updateApplicantDetails(data: {
    applicationId: string;
    applicantDetails: any;
  }): Promise<ApiResponse<any>> {
    console.log('📝 Updating applicant details:', data);

    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-details/${data.applicationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data.applicantDetails),
        }
      );

      const responseData = await response.json();
      console.log('📡 Update Applicant Details API Response:', responseData);

      if (!response.ok) {
        const error = new Error(
          responseData.error?.message ||
            responseData.message ||
            'Failed to update applicant details'
        );
        (error as any).code = responseData.error?.code || 'API_ERROR';
        throw error;
      }

      return {
        success: responseData.success || true,
        data: responseData.data || responseData,
      };
    } catch (error: any) {
      console.error('Update Applicant Details API Request Error:', error);
      const apiError = new Error(error.message || 'Network error occurred');
      (apiError as any).code = 'NETWORK_ERROR';
      throw apiError;
    }
  }

  async updateApplication(
    applicationId: string,
    data: any
  ): Promise<ApiResponse<any>> {
    console.log('📝 Updating application:', { applicationId, data });

    try {
      const response = await fetch(
        `${API_BASE_URL}/application/${applicationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();
      console.log('📡 Update Application API Response:', responseData);

      if (!response.ok) {
        const error = new Error(
          responseData.error?.message ||
            responseData.message ||
            'Failed to update application'
        );
        (error as any).code = responseData.error?.code || 'API_ERROR';
        throw error;
      }

      return {
        success: responseData.success || true,
        data: responseData.data || responseData,
      };
    } catch (error: any) {
      console.error('Update Application API Request Error:', error);
      const apiError = new Error(error.message || 'Network error occurred');
      (apiError as any).code = 'NETWORK_ERROR';
      throw apiError;
    }
  }

  async uploadFilesToCloudinary(
    files: any[],
    folder: string
  ): Promise<ApiResponse<any>> {
    console.log('📤 Uploading files to Cloudinary:', {
      files: files.length,
      folder,
    });

    try {
      const formData = new FormData();

      // Add files to FormData
      files.forEach((file, index) => {
        formData.append('documents', {
          uri: file.uri,
          type: file.type,
          name: file.name,
        } as any);
      });

      // Add folder information
      formData.append('folder', folder);

      const response = await fetch(
        `${API_BASE_URL.replace('/turkey', '')}/multiple/document`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const responseData = await response.json();
      console.log('📡 Cloudinary Upload Response:', responseData);

      if (!response.ok) {
        const error = new Error(
          responseData.error?.message ||
            responseData.message ||
            'Failed to upload files to Cloudinary'
        );
        (error as any).code = responseData.error?.code || 'API_ERROR';
        throw error;
      }

      return {
        success: responseData.success || true,
        data: responseData.data || responseData,
      };
    } catch (error: any) {
      console.error('Cloudinary Upload Error:', error);
      const apiError = new Error(error.message || 'Network error occurred');
      (apiError as any).code = 'NETWORK_ERROR';
      throw apiError;
    }
  }

  async uploadDocuments(data: {
    applicationId: string;
    documents: any;
  }): Promise<ApiResponse<any>> {
    console.log('📤 Registering documents with application:', data);

    try {
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('📡 Register Documents API Response:', responseData);

      if (!response.ok) {
        const error = new Error(
          responseData.error?.message ||
            responseData.message ||
            'Failed to register documents'
        );
        (error as any).code = responseData.error?.code || 'API_ERROR';
        throw error;
      }

      return {
        success: responseData.success || true,
        data: responseData.data || responseData,
      };
    } catch (error: any) {
      console.error('Register Documents API Request Error:', error);
      const apiError = new Error(error.message || 'Network error occurred');
      (apiError as any).code = 'NETWORK_ERROR';
      throw apiError;
    }
  }

  async updateDocuments(
    applicationId: string,
    documents: any
  ): Promise<ApiResponse<any>> {
    console.log('📝 Updating documents:', { applicationId, documents });

    try {
      const response = await fetch(
        `${API_BASE_URL}/documents/${applicationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documents }),
        }
      );

      const responseData = await response.json();
      console.log('📡 Update Documents API Response:', responseData);

      if (!response.ok) {
        const error = new Error(
          responseData.error?.message ||
            responseData.message ||
            'Failed to update documents'
        );
        (error as any).code = responseData.error?.code || 'API_ERROR';
        throw error;
      }

      return {
        success: responseData.success || true,
        data: responseData.data || responseData,
      };
    } catch (error: any) {
      console.error('Update Documents API Request Error:', error);
      const apiError = new Error(error.message || 'Network error occurred');
      (apiError as any).code = 'NETWORK_ERROR';
      throw apiError;
    }
  }

  // Add Applicant Methods
  async addApplicant(data: { applicationId: string; applicant: any }) {
    try {
      console.log('🚀 Add Applicant API Request:', {
        applicationId: data.applicationId,
        applicant: data.applicant,
      });

      const response = await this.request('/add-applicant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: data.applicationId,
          applicant: data.applicant,
        }),
      });

      console.log('📡 Add Applicant API Response:', response);
      return response;
    } catch (error: any) {
      console.error('Add Applicant API Request Error:', error);
      const apiError = new Error(error.message || 'Network error occurred');
      (apiError as any).code = 'NETWORK_ERROR';
      throw apiError;
    }
  }

  async updateApplicant(applicationId: string, index: number, applicant: any) {
    try {
      const response = await this.request(
        `/add-applicant/${applicationId}/${index}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ applicant }),
        }
      );

      return response;
    } catch (error: any) {
      console.error('Update Applicant API Request Error:', error);
      const apiError = new Error(error.message || 'Network error occurred');
      (apiError as any).code = 'NETWORK_ERROR';
      throw apiError;
    }
  }

  async deleteApplicant(applicationId: string, index: number) {
    try {
      const response = await this.request(
        `/add-applicant/${applicationId}/${index}`,
        {
          method: 'DELETE',
        }
      );

      return response;
    } catch (error: any) {
      console.error('Delete Applicant API Request Error:', error);
      const apiError = new Error(error.message || 'Network error occurred');
      (apiError as any).code = 'NETWORK_ERROR';
      throw apiError;
    }
  }
}

export const apiService = new ApiService();
