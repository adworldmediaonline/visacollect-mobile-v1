import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeft, Save } from 'lucide-react-native';

import { AlertError, AlertSuccess } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { FeeDisplay } from '../../../components/ui/FeeDisplay';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/Form';
import { Input } from '../../../components/ui/Input';
import { PickerSelect } from '../../../components/ui/Picker';
import { ProgressIndicator } from '../../../components/ui/ProgressIndicator';
import {
  useGetApplication,
  useStartApplication,
  useUpdateApplication,
} from '../../../hooks/useTurkeyVisa';
import {
  StartApplicationFormData,
  startApplicationSchema,
} from '../../../lib/schemas/startApplication';
import { useApplicationStore } from '../../../stores/applicationStore';

const PASSPORT_COUNTRIES = [
  { label: 'India', value: 'India' },
  { label: 'Pakistan', value: 'Pakistan' },
  { label: 'China', value: 'China' },
  { label: 'Australia', value: 'Australia' },
  { label: 'Iraq', value: 'Iraq' },
  { label: 'Mexico', value: 'Mexico' },
  { label: 'South Africa', value: 'South Africa' },
  { label: 'Taiwan', value: 'Taiwan' },
  { label: 'Afghanistan', value: 'Afghanistan' },
  { label: 'Algeria', value: 'Algeria' },
  { label: 'Antigua and Barbuda', value: 'Antigua and Barbuda' },
  { label: 'Armenia', value: 'Armenia' },
  { label: 'Bahamas', value: 'Bahamas' },
  { label: 'Bangladesh', value: 'Bangladesh' },
  { label: 'Barbados', value: 'Barbados' },
  { label: 'Bermuda', value: 'Bermuda' },
  { label: 'Bhutan', value: 'Bhutan' },
  { label: 'Cambodia', value: 'Cambodia' },
  { label: 'Cape Verde', value: 'Cape Verde' },
  { label: 'Dominican Republic', value: 'Dominican Republic' },
  { label: 'East Timor', value: 'East Timor' },
  { label: 'Egypt', value: 'Egypt' },
  { label: 'Equatorial Guinea', value: 'Equatorial Guinea' },
  { label: 'Fiji', value: 'Fiji' },
  {
    label: 'Greek Cypriot Administration of Southern Cyprus',
    value: 'Greek Cypriot Administration of Southern Cyprus',
  },
  { label: 'Grenada', value: 'Grenada' },
  { label: 'Hong Kong (BN(O))', value: 'Hong Kong (BN(O))' },
  { label: 'Jamaica', value: 'Jamaica' },
  { label: 'Libya', value: 'Libya' },
  { label: 'Maldives', value: 'Maldives' },
  { label: 'Mauritius', value: 'Mauritius' },
  { label: 'Namibia', value: 'Namibia' },
  { label: 'Nepal', value: 'Nepal' },
  { label: 'Palestine', value: 'Palestine' },
  { label: 'Philippines', value: 'Philippines' },
  { label: 'Saint Lucia', value: 'Saint Lucia' },
  {
    label: 'Saint Vincent and the Grenadines',
    value: 'Saint Vincent and the Grenadines',
  },
  { label: 'Senegal', value: 'Senegal' },
  { label: 'Solomon Islands', value: 'Solomon Islands' },
  { label: 'Sri Lanka', value: 'Sri Lanka' },
  { label: 'Suriname', value: 'Suriname' },
  { label: 'Vanuatu', value: 'Vanuatu' },
  { label: 'Vietnam', value: 'Vietnam' },
  { label: 'Yemen', value: 'Yemen' },
];

const TRAVEL_DOCUMENTS = [
  { label: 'Ordinary Passport', value: 'Ordinary Passport' },
];

const VISA_TYPES = [
  { label: 'Electronic Visa (e-Visa)', value: 'Electronic Visa' },
];

const DESTINATIONS = [{ label: 'Turkey', value: 'Turkey' }];

// Mock fee data - in real app, this would come from API
const FEE_DATA: Record<string, any> = {
  India: {
    visaFee: 51,
    serviceFee: 35,
    duration: '90 days',
    numberOfEntries: 'Multiple',
    currency: 'USD',
  },
  Pakistan: {
    visaFee: 51,
    serviceFee: 35,
    duration: '90 days',
    numberOfEntries: 'Multiple',
    currency: 'USD',
  },
  China: {
    visaFee: 51,
    serviceFee: 35,
    duration: '90 days',
    numberOfEntries: 'Multiple',
    currency: 'USD',
  },
  Australia: {
    visaFee: 51,
    serviceFee: 35,
    duration: '90 days',
    numberOfEntries: 'Multiple',
    currency: 'USD',
  },
  'Antigua and Barbuda': {
    visaFee: 66,
    serviceFee: 35,
    duration: '90 days',
    numberOfEntries: 'Multiple',
    currency: 'USD',
  },
  Vietnam: {
    visaFee: 51,
    serviceFee: 35,
    duration: '90 days',
    numberOfEntries: 'Multiple',
    currency: 'USD',
  },
};

export default function TurkeyStartScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const applicationId = id;

  // Zustand store
  const { setApplicationId, setApplicationData } = useApplicationStore();

  // Error state management
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Mutations and Queries
  const startApplicationMutation = useStartApplication();
  const updateApplicationMutation = useUpdateApplication();
  const { data: existingApplication, isLoading: isLoadingApplication } =
    useGetApplication(applicationId || '', undefined);

  const form = useForm<StartApplicationFormData>({
    resolver: zodResolver(startApplicationSchema),
    defaultValues: {
      passportCountry: '',
      travelDocument: 'Ordinary Passport',
      visaType: 'Electronic Visa',
      destination: 'Turkey',
      email: '',
    },
  });

  // Load existing data when component mounts or when data changes
  useEffect(() => {
    // Clear any existing errors and success messages
    setErrorMessage('');
    setSuccessMessage('');

    // If we have an existing application, populate the form with its data
    if (existingApplication?.success && existingApplication.data) {
      const appData = existingApplication.data;
      form.reset({
        passportCountry: appData.passportCountry || '',
        travelDocument: appData.travelDocument || 'Ordinary Passport',
        visaType: appData.visaType || 'Electronic Visa',
        destination: appData.destination || 'Turkey',
        email: appData.email || '',
      });

      // Update store with existing application data
      setApplicationId(appData.applicationId);
      setApplicationData({
        email: appData.email,
        passportCountry: appData.passportCountry,
        travelDocument: appData.travelDocument,
        visaType: appData.visaType,
        destination: appData.destination,
      });
    } else {
      // Reset form to default values for new application
      form.reset({
        passportCountry: '',
        travelDocument: 'Ordinary Passport',
        visaType: 'Electronic Visa',
        destination: 'Turkey',
        email: '',
      });

      // Additional cleanup: clear any stored application data that might interfere
      setApplicationId(null);
      setApplicationData({});
    }
  }, [form, existingApplication, setApplicationId, setApplicationData]);

  const selectedCountry = form.watch('passportCountry');
  const selectedCountryFee = selectedCountry ? FEE_DATA[selectedCountry] : null;

  const onSubmit = async (data: StartApplicationFormData) => {
    // Clear any previous errors
    setErrorMessage('');

    // Validate required fields
    if (!data.passportCountry || !data.travelDocument || !data.email) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      // If we already have an application, update it on the backend
      if (applicationId && existingApplication?.success) {
        // Clear any previous messages
        setErrorMessage('');
        setSuccessMessage('');

        try {
          // Update application on backend
          const updateResponse = await updateApplicationMutation.mutateAsync({
            applicationId,
            data,
          });

          if (updateResponse.success) {
            // Update store with the response data
            setApplicationData({
              email: updateResponse.data.email,
              passportCountry: updateResponse.data.passportCountry,
              travelDocument: updateResponse.data.travelDocument,
              visaType: updateResponse.data.visaType,
              destination: updateResponse.data.destination,
            });

            // Show success message briefly
            setSuccessMessage('Application details updated successfully!');

            // Navigate to next step after a brief delay
            setTimeout(() => {
              router.push(
                `/(country)/turkey/applicant-details?id=${applicationId}`
              );
            }, 1000);
          }
        } catch (error: any) {
          console.error('Error updating application:', error);
          setErrorMessage(
            error.message || 'Failed to update application. Please try again.'
          );
        }
        return;
      }

      // Create new application
      await startApplicationMutation.mutateAsync(data);
    } catch (error: any) {
      console.error('Error starting application:', error);
      setErrorMessage(
        error.message || 'Failed to start application. Please try again.'
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleFormChange = () => {
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 to-primary-100">
      <StatusBar style="dark" backgroundColor="#eff6ff" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white">
        <Button
          onPress={handleBack}
          variant="ghost"
          className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center"
        >
          <ArrowLeft size={20} color="#1e8ec2" />
        </Button>
        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold text-gray-900">
            Step 1: Start Application
          </Text>
          <Text className="text-sm text-gray-600">
            Begin your Turkey visa application
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 100, // Add bottom padding to prevent content from being hidden behind sticky button
        }}
      >
        {/* Progress Indicator */}
        <ProgressIndicator
          steps={[
            { id: 'start', label: 'Start', labelShort: 'Start' },
            { id: 'personal', label: 'Personal Info', labelShort: 'Info' },
            { id: 'documents', label: 'Documents', labelShort: 'Docs' },
            { id: 'review', label: 'Review', labelShort: 'Review' },
            { id: 'payment', label: 'Payment', labelShort: 'Payment' },
          ]}
          currentStep="start"
          completedSteps={[]}
          className="mb-6"
        />

        {/* Error Alert */}
        {errorMessage && (
          <AlertError className="mb-6">
            <Text className="text-red-800 font-semibold">
              Application Error
            </Text>
            <Text className="text-red-700">{errorMessage}</Text>
          </AlertError>
        )}

        {/* Success Alert */}
        {successMessage && (
          <AlertSuccess className="mb-6">
            <Text className="text-green-800 font-semibold">Success</Text>
            <Text className="text-green-700">{successMessage}</Text>
          </AlertSuccess>
        )}

        {/* Form Card */}
        <Card className="w-full shadow-lg border-0 mb-6">
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>
              Please provide the following information to start your Turkey visa
              application.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form>
              <FormField>
                <FormItem>
                  <FormLabel>Passport Country *</FormLabel>
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="passportCountry"
                      render={({ field: { onChange, value } }) => (
                        <PickerSelect
                          placeholder="Select your passport country"
                          value={value}
                          onValueChange={val => {
                            onChange(val);
                            handleFormChange();
                          }}
                          options={PASSPORT_COUNTRIES}
                          searchable={true}
                          searchPlaceholder="Search countries..."
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.passportCountry?.message}
                  </FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel>Travel Document *</FormLabel>
                  <FormControl>
                    <PickerSelect
                      placeholder="Select travel document type"
                      value={form.watch('travelDocument')}
                      onValueChange={value => {
                        form.setValue('travelDocument', value);
                        handleFormChange();
                      }}
                      options={TRAVEL_DOCUMENTS}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.travelDocument?.message}
                  </FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel>Visa Type *</FormLabel>
                  <FormControl>
                    <PickerSelect
                      placeholder="Select visa type"
                      value={form.watch('visaType')}
                      onValueChange={value => {
                        form.setValue('visaType', value);
                        handleFormChange();
                      }}
                      options={VISA_TYPES}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.visaType?.message}
                  </FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel>Destination *</FormLabel>
                  <FormControl>
                    <PickerSelect
                      placeholder="Select destination"
                      value={form.watch('destination')}
                      onValueChange={value => {
                        form.setValue('destination', value);
                        handleFormChange();
                      }}
                      options={DESTINATIONS}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.destination?.message}
                  </FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="email"
                      render={({ field: { onChange, value } }) => (
                        <Input
                          placeholder="your.email@example.com"
                          value={value}
                          onChangeText={text => {
                            onChange(text);
                            handleFormChange();
                          }}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.email?.message}
                  </FormMessage>
                  <Text className="text-sm text-gray-600">
                    We'll send your application confirmation and updates to this
                    email address.
                  </Text>
                </FormItem>
              </FormField>
            </Form>
          </CardContent>
        </Card>

        {/* Fee Information */}
        {selectedCountryFee && (
          <Card className="w-full shadow-lg border-0 mb-6">
            <CardContent>
              <FeeDisplay
                feeData={{
                  ...selectedCountryFee,
                  totalFee:
                    selectedCountryFee.visaFee + selectedCountryFee.serviceFee,
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200 mb-8">
          <CardContent>
            <View className="items-center">
              <Text className="font-semibold text-blue-900 mb-2">
                What happens next?
              </Text>
              <Text className="text-blue-700 text-sm text-center">
                After starting your application, you'll be taken directly to the
                next step to fill in your personal details and continue with
                your visa application process.
              </Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>

      {/* Sticky Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <View className="gap-3">
          <Button
            onPress={form.handleSubmit(onSubmit)}
            loading={startApplicationMutation.isPending}
            className="w-full"
            size="lg"
          >
            <View className="flex-row items-center justify-center gap-2">
              <Save size={20} color="#ffffff" />
              <Text className="text-white font-semibold">
                {startApplicationMutation.isPending
                  ? 'Starting...'
                  : 'Start Application'}
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
