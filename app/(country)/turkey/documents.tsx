import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeft, FileText, Save, Upload } from 'lucide-react-native';

import { Controller } from 'react-hook-form';
import {
  AlertDescription,
  AlertError,
  AlertSuccess,
} from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { DatePicker } from '../../../components/ui/DatePicker';
import { FileUpload } from '../../../components/ui/FileUpload';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/Form';
import { Input } from '../../../components/ui/Input';
import { PickerSelect } from '../../../components/ui/Picker';
import { ProgressIndicator } from '../../../components/ui/ProgressIndicator';
import {
  useGetApplication,
  useUpdateDocuments,
  useUploadDocuments,
} from '../../../hooks/useTurkeyVisa';
import {
  DocumentUploadFormData,
  documentUploadSchema,
} from '../../../lib/schemas/documents';
import { useApplicationStore } from '../../../stores/applicationStore';

// Document types for Turkey visa (matches backend validation)
const DOCUMENT_TYPES = [
  { label: 'Visa', value: 'Visa' },
  { label: 'Residence Permit', value: 'Residence Permit' },
  { label: 'visa', value: 'visa' },
  { label: 'residence-permit', value: 'residence-permit' },
];

// Countries list (matches web version)
const COUNTRIES = [
  { label: 'Ireland', value: 'Ireland' },
  { label: 'Schengen', value: 'Schengen' },
  { label: 'USA / U.S.A', value: 'USA / U.S.A' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Austria', value: 'Austria' },
  { label: 'Belgium', value: 'Belgium' },
  { label: 'Bulgaria', value: 'Bulgaria' },
  { label: 'Czech Republic', value: 'Czech Republic' },
  { label: 'Denmark', value: 'Denmark' },
  { label: 'Estonia', value: 'Estonia' },
  { label: 'Finland', value: 'Finland' },
  { label: 'France', value: 'France' },
  { label: 'Germany', value: 'Germany' },
  { label: 'Greece', value: 'Greece' },
  { label: 'Hungary', value: 'Hungary' },
  { label: 'Iceland', value: 'Iceland' },
  { label: 'Italy', value: 'Italy' },
  { label: 'Latvia', value: 'Latvia' },
  { label: 'Liechtenstein', value: 'Liechtenstein' },
  { label: 'Lithuania', value: 'Lithuania' },
  { label: 'Luxembourg', value: 'Luxembourg' },
  { label: 'Malta', value: 'Malta' },
  { label: 'Netherlands', value: 'Netherlands' },
  { label: 'Norway', value: 'Norway' },
  { label: 'Poland', value: 'Poland' },
  { label: 'Portugal', value: 'Portugal' },
  { label: 'Slovakia', value: 'Slovakia' },
  { label: 'Slovenia', value: 'Slovenia' },
  { label: 'Spain', value: 'Spain' },
  { label: 'Sweden', value: 'Sweden' },
  { label: 'Switzerland', value: 'Switzerland' },
  { label: 'U.S.A', value: 'U.S.A' },
];

export default function DocumentsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const applicationId = id;

  // Zustand store
  const { setApplicationData } = useApplicationStore();

  // Error state management
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Mutations and Queries
  const uploadDocumentsMutation = useUploadDocuments();
  const updateDocumentsMutation = useUpdateDocuments();
  const { data: existingApplication, isLoading: isLoadingApplication } =
    useGetApplication(applicationId || '', undefined);

  const form = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema) as any,
    defaultValues: {
      supportingDocuments: [],
      additionalDocuments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'supportingDocuments',
  });

  // Load existing data when component mounts or when data changes
  useEffect(() => {
    // Clear any existing errors and success messages
    setErrorMessage('');
    setSuccessMessage('');

    // If we have an existing application, populate the form with its data
    if (existingApplication?.success && existingApplication.data) {
      const appData = existingApplication.data;

      // Check if documents exist
      if (appData.documents) {
        form.reset({
          supportingDocuments: appData.documents.supportingDocuments || [],
          additionalDocuments: appData.documents.additionalDocuments || [],
        });

        // Update store with existing application data
        setApplicationData({
          documents: appData.documents,
        });
      } else {
        // Reset form to default values for new documents
        form.reset({
          supportingDocuments: [],
          additionalDocuments: [],
        });

        // Additional cleanup: clear any stored document data that might interfere
        setApplicationData({});
      }
    } else {
      // Reset form to default values for new application
      form.reset({
        supportingDocuments: [],
        additionalDocuments: [],
      });

      // Additional cleanup: clear any stored application data that might interfere
      setApplicationData({});
    }
  }, [form, existingApplication, applicationId, setApplicationData]);

  const onSubmit = async (data: DocumentUploadFormData) => {
    // Clear any previous errors
    setErrorMessage('');

    // Validate required fields
    if (!data.supportingDocuments || data.supportingDocuments.length === 0) {
      setErrorMessage('Please add at least one supporting document.');
      return;
    }

    // Transform the data to match backend expectations
    const transformedData = {
      ...data,
      supportingDocuments: data.supportingDocuments.map(doc => {
        // If isUnlimited is true, remove expiryDate completely
        if (doc.isUnlimited) {
          const { expiryDate, ...rest } = doc;
          return rest;
        }
        return doc;
      }),
    };

    try {
      // If we already have documents, update them on the backend
      if (existingApplication?.data?.documents) {
        // Clear any previous messages
        setErrorMessage('');
        setSuccessMessage('');

        try {
          // Update documents on backend
          const updateResponse = await updateDocumentsMutation.mutateAsync({
            applicationId: applicationId!,
            documents: transformedData,
          });

          if (updateResponse.success) {
            // Update store with the response data
            setApplicationData({
              documents: updateResponse.data.documents,
            });

            // Show success message briefly
            setSuccessMessage('Documents updated successfully!');

            // Navigate to next step after a brief delay
            setTimeout(() => {
              router.push(`/(country)/turkey/status?id=${applicationId}`);
            }, 1000);
          }
        } catch (error: any) {
          console.error('Error updating documents:', error);
          setErrorMessage(
            error.message || 'Failed to update documents. Please try again.'
          );
        }
        return;
      }

      // Create new documents
      await uploadDocumentsMutation.mutateAsync({
        applicationId: applicationId!,
        documents: transformedData,
      });
    } catch (error: any) {
      console.error('Error uploading documents:', error);
      setErrorMessage(
        error.message || 'Failed to upload documents. Please try again.'
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleFormChange = () => {
    if (errorMessage) {
      setErrorMessage('');
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const addSupportingDocument = () => {
    append({
      documentType: 'Visa' as const,
      issuingCountry: '',
      documentNumber: '',
      isUnlimited: false,
    });
  };

  const handleAdditionalFilesSelected = (files: any[]) => {
    form.setValue('additionalDocuments', files);
    handleFormChange();
  };

  if (isLoadingApplication) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <StatusBar style="dark" backgroundColor="#f8fafc" />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-lg text-gray-600 text-center">
            Loading application data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <StatusBar style="dark" backgroundColor="#f8fafc" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center"
        >
          <ArrowLeft size={20} color="#1e8ec2" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold text-gray-900">
            Step 3:{' '}
            {existingApplication?.data?.documents
              ? 'Update Documents'
              : 'Upload Documents'}
          </Text>
          <Text className="text-sm text-gray-600">
            {existingApplication?.data?.documents
              ? 'Update your supporting documents'
              : 'Upload your supporting documents'}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 120, // Add bottom padding to prevent content from being hidden behind sticky button
        }}
      >
        {/* Progress Indicator */}
        <ProgressIndicator
          steps={[
            { id: 'start', label: 'Start', labelShort: 'Start' },
            { id: 'applicant', label: 'Applicant', labelShort: 'Applicant' },
            { id: 'documents', label: 'Documents', labelShort: 'Documents' },
            { id: 'payment', label: 'Payment', labelShort: 'Payment' },
            { id: 'review', label: 'Review', labelShort: 'Review' },
          ]}
          currentStep="documents"
          completedSteps={['start', 'applicant']}
          className="mb-6"
        />

        {/* Error/Success Messages */}
        {errorMessage && (
          <AlertError className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </AlertError>
        )}
        {successMessage && (
          <AlertSuccess className="mb-4">
            <AlertDescription>{successMessage}</AlertDescription>
          </AlertSuccess>
        )}

        {/* Supporting Documents Section */}
        <Card className="w-full shadow-lg border-0 mb-6">
          <CardHeader>
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-primary-100 rounded-full items-center justify-center">
                <FileText size={16} color="#1e8ec2" />
              </View>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Supporting Documents
              </CardTitle>
            </View>
            <CardDescription className="text-gray-600 mt-2">
              Upload required supporting documents for your visa application
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            {/* Supporting Documents List */}
            {fields.map((field, index) => (
              <Card key={field.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-medium text-gray-900">
                      Document {index + 1}
                    </Text>
                    <TouchableOpacity
                      onPress={() => remove(index)}
                      className="w-8 h-8 bg-red-100 rounded-full items-center justify-center"
                    >
                      <Text className="text-red-600 font-bold">×</Text>
                    </TouchableOpacity>
                  </View>
                </CardHeader>
                <CardContent className="gap-4">
                  {/* Document Type */}
                  <Controller
                    control={form.control}
                    name={`supportingDocuments.${index}.documentType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type *</FormLabel>
                        <FormControl>
                          <PickerSelect
                            options={DOCUMENT_TYPES}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select document type"
                            searchable={true}
                          />
                        </FormControl>
                        <FormMessage>
                          {
                            form.formState.errors.supportingDocuments?.[index]
                              ?.documentType?.message
                          }
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  {/* Issuing Country */}
                  <Controller
                    control={form.control}
                    name={`supportingDocuments.${index}.issuingCountry`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issuing Country *</FormLabel>
                        <FormControl>
                          <PickerSelect
                            options={COUNTRIES}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select issuing country"
                            searchable={true}
                          />
                        </FormControl>
                        <FormMessage>
                          {
                            form.formState.errors.supportingDocuments?.[index]
                              ?.issuingCountry?.message
                          }
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  {/* Document Number */}
                  <Controller
                    control={form.control}
                    name={`supportingDocuments.${index}.documentNumber`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Number *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter document number"
                            value={field.value}
                            onChangeText={field.onChange}
                            autoCapitalize="characters"
                          />
                        </FormControl>
                        <FormMessage>
                          {
                            form.formState.errors.supportingDocuments?.[index]
                              ?.documentNumber?.message
                          }
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  {/* Expiry Date */}
                  <Controller
                    control={form.control}
                    name={`supportingDocuments.${index}.isUnlimited`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                              onPress={() => field.onChange(!field.value)}
                              className={`w-6 h-6 rounded border-2 items-center justify-center ${
                                field.value
                                  ? 'bg-primary-500 border-primary-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {field.value && (
                                <Text className="text-white text-xs font-bold">
                                  ✓
                                </Text>
                              )}
                            </TouchableOpacity>
                            <FormLabel>Unlimited validity</FormLabel>
                          </View>
                        </FormControl>
                        <FormMessage>
                          {
                            form.formState.errors.supportingDocuments?.[index]
                              ?.isUnlimited?.message
                          }
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  {/* Expiry Date - Only show if not unlimited */}
                  {!form.watch(`supportingDocuments.${index}.isUnlimited`) && (
                    <Controller
                      control={form.control}
                      name={`supportingDocuments.${index}.expiryDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date *</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select expiry date"
                              minimumDate={new Date()}
                              maximumDate={
                                new Date(
                                  new Date().getFullYear() + 20,
                                  new Date().getMonth(),
                                  new Date().getDate()
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage>
                            {
                              form.formState.errors.supportingDocuments?.[index]
                                ?.expiryDate?.message
                            }
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Add Document Button */}
            <Button
              onPress={addSupportingDocument}
              variant="outline"
              className="w-full"
            >
              <View className="flex-row items-center justify-center gap-2">
                <FileText size={20} color="#1e8ec2" />
                <Text className="text-primary-600 font-semibold">
                  Add Supporting Document
                </Text>
              </View>
            </Button>
          </CardContent>
        </Card>

        {/* Additional Documents Section */}
        <Card className="w-full shadow-lg border-0 mb-6">
          <CardHeader>
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-accent-100 rounded-full items-center justify-center">
                <Upload size={16} color="#f97316" />
              </View>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Additional Documents
              </CardTitle>
            </View>
            <CardDescription className="text-gray-600 mt-2">
              Upload any additional supporting documents (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFilesSelected={handleAdditionalFilesSelected}
              maxFiles={5}
              acceptedTypes={['image/*', 'application/pdf']}
              applicationId={applicationId}
            />
          </CardContent>
        </Card>
      </ScrollView>

      {/* Sticky Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <View className="gap-3">
          <Button
            onPress={form.handleSubmit(onSubmit as any)}
            loading={
              uploadDocumentsMutation.isPending ||
              updateDocumentsMutation.isPending
            }
            className="w-full"
            size="lg"
          >
            <View className="flex-row items-center justify-center gap-2">
              <Save size={20} color="#ffffff" />
              <Text className="text-white font-semibold">
                {uploadDocumentsMutation.isPending ||
                updateDocumentsMutation.isPending
                  ? existingApplication?.data?.documents
                    ? 'Updating...'
                    : 'Uploading...'
                  : existingApplication?.data?.documents
                    ? 'Update Documents'
                    : 'Upload Documents'}
              </Text>
            </View>
          </Button>

          <Button onPress={handleBack} variant="outline" className="w-full">
            <View className="flex-row items-center justify-center gap-2">
              <ArrowLeft size={20} color="#6b7280" />
              <Text className="text-gray-600 font-semibold">Back</Text>
            </View>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
