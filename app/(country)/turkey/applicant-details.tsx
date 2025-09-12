import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeft, Calendar, FileText, Save } from 'lucide-react-native';

import { AlertError, AlertSuccess } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { DatePicker } from '../../../components/ui/DatePicker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/Form';
import { Input } from '../../../components/ui/Input';
import { ProgressIndicator } from '../../../components/ui/ProgressIndicator';
import {
  useGetApplication,
  useSubmitApplicantDetails,
  useUpdateApplicantDetails,
} from '../../../hooks/useTurkeyVisa';
import {
  ApplicantDetailsFormData,
  applicantDetailsSchema,
} from '../../../lib/schemas/applicantDetails';
import { useApplicationStore } from '../../../stores/applicationStore';

export default function ApplicantDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [arrivalDate, setArrivalDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [passportExpiryEnabled, setPassportExpiryEnabled] = useState(false);

  const { applicationData, setApplicationData } = useApplicationStore();

  const submitApplicantDetailsMutation = useSubmitApplicantDetails();
  const updateApplicantDetailsMutation = useUpdateApplicantDetails();
  const { data: existingApplication, isLoading: isLoadingApplication } =
    useGetApplication(id || '', undefined);

  // Calculate visa validity message
  const getVisaValidityMessage = (arrivalDateStr: string) => {
    const arrival = new Date(arrivalDateStr);
    const expiry = new Date(arrival);
    expiry.setDate(expiry.getDate() + 180); // 180 days validity

    const fromDate = format(arrival, 'd MMMM yyyy');
    const toDate = format(expiry, 'd MMMM yyyy');

    return `Your e-visa is valid from ${fromDate} to ${toDate} for a total period of 180 days. Your stay cannot exceed 30 days.`;
  };

  // Calculate passport expiry minimum date (180 days after arrival)
  const getPassportExpiryMinDate = (arrivalDateStr: string) => {
    const arrival = new Date(arrivalDateStr);
    const minDate = new Date(arrival);
    minDate.setDate(minDate.getDate() + 180);
    return minDate;
  };

  // Calculate default passport expiry date (180 days after arrival)
  const getDefaultPassportExpiryDate = (arrivalDateStr: string) => {
    const arrival = new Date(arrivalDateStr);
    const expiry = new Date(arrival);
    expiry.setDate(expiry.getDate() + 180);
    return format(expiry, 'yyyy-MM-dd');
  };

  const form = useForm<ApplicantDetailsFormData>({
    resolver: zodResolver(applicantDetailsSchema),
    defaultValues: {
      arrivalDate: format(new Date(), 'yyyy-MM-dd'),
      givenNames: '',
      surname: '',
      dateOfBirth: '',
      placeOfBirth: '',
      motherName: '',
      fatherName: '',
      passportNumber: '',
      passportIssueDate: '',
      passportExpiryDate: '',
    },
  });

  // Load existing data when component mounts or when data changes
  useEffect(() => {
    // Clear any existing errors and success messages
    setErrorMessage('');
    setSuccessMessage('');

    // If we have existing application data with applicant details, populate the form
    if (
      existingApplication?.success &&
      existingApplication.data?.mainApplicant
    ) {
      const mainApplicant = existingApplication.data.mainApplicant;
      const existingArrivalDate = mainApplicant.arrivalDate
        ? format(new Date(mainApplicant.arrivalDate), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd');

      // Calculate passport expiry date - use existing if available, otherwise default to 180 days after arrival
      const existingPassportExpiry = mainApplicant.passportExpiryDate
        ? format(new Date(mainApplicant.passportExpiryDate), 'yyyy-MM-dd')
        : getDefaultPassportExpiryDate(existingArrivalDate);

      form.reset({
        arrivalDate: existingArrivalDate,
        givenNames: mainApplicant.givenNames || '',
        surname: mainApplicant.surname || '',
        dateOfBirth: mainApplicant.dateOfBirth
          ? format(new Date(mainApplicant.dateOfBirth), 'yyyy-MM-dd')
          : '',
        placeOfBirth: mainApplicant.placeOfBirth || '',
        motherName: mainApplicant.motherName || '',
        fatherName: mainApplicant.fatherName || '',
        passportNumber: mainApplicant.passportNumber || '',
        passportIssueDate: mainApplicant.passportIssueDate
          ? format(new Date(mainApplicant.passportIssueDate), 'yyyy-MM-dd')
          : '',
        passportExpiryDate: existingPassportExpiry,
      });

      // Update state with existing data
      setArrivalDate(existingArrivalDate);
      setPassportExpiryEnabled(true);

      // Update store with existing applicant data
      setApplicationData({
        arrivalDate: existingArrivalDate,
        givenNames: mainApplicant.givenNames,
        surname: mainApplicant.surname,
        dateOfBirth: mainApplicant.dateOfBirth
          ? format(new Date(mainApplicant.dateOfBirth), 'yyyy-MM-dd')
          : '',
        placeOfBirth: mainApplicant.placeOfBirth,
        motherName: mainApplicant.motherName,
        fatherName: mainApplicant.fatherName,
        passportNumber: mainApplicant.passportNumber,
        passportIssueDate: mainApplicant.passportIssueDate
          ? format(new Date(mainApplicant.passportIssueDate), 'yyyy-MM-dd')
          : '',
        passportExpiryDate: existingPassportExpiry,
      });
    } else {
      // Reset form to default values for new applicant details
      const defaultArrivalDate = format(new Date(), 'yyyy-MM-dd');
      const defaultPassportExpiry =
        getDefaultPassportExpiryDate(defaultArrivalDate);

      form.reset({
        arrivalDate: defaultArrivalDate,
        givenNames: '',
        surname: '',
        dateOfBirth: '',
        placeOfBirth: '',
        motherName: '',
        fatherName: '',
        passportNumber: '',
        passportIssueDate: '',
        passportExpiryDate: defaultPassportExpiry,
      });

      // Update state
      setArrivalDate(defaultArrivalDate);
      setPassportExpiryEnabled(true);
    }
  }, [existingApplication, form, setApplicationData]);

  const handleFormChange = () => {
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const onSubmit = async (data: ApplicantDetailsFormData) => {
    if (!id) {
      console.error('No application ID found');
      return;
    }

    // Clear any previous messages
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Check if we already have applicant details (update scenario)
      if (
        existingApplication?.success &&
        existingApplication.data?.mainApplicant
      ) {
        // Update existing applicant details
        const updateResponse = await updateApplicantDetailsMutation.mutateAsync(
          {
            applicationId: id,
            applicantDetails: data,
          }
        );

        if (updateResponse.success) {
          // Update local store with the updated data
          setApplicationData(data);

          // Show success message briefly
          setSuccessMessage('Applicant details updated successfully!');

          // Navigate to next step after a brief delay
          setTimeout(() => {
            router.push(`/(country)/turkey/status?id=${id}`);
          }, 1000);
        }
      } else {
        // Create new applicant details
        const response = await submitApplicantDetailsMutation.mutateAsync({
          applicationId: id,
          applicantDetails: data,
        });

        if (response.success) {
          // Update local store with the new data
          setApplicationData(data);

          // Navigate to next step (documents)
          router.push(`/(country)/turkey/status?id=${id}`);
        }
      }
    } catch (error: any) {
      console.error('Error with applicant details:', error);
      setErrorMessage(
        error.message || 'An unexpected error occurred. Please try again.'
      );
    }
  };

  const handleBack = () => {
    router.push(`/(country)/turkey/start?id=${id}`);
  };

  const handleArrivalDateChange = (date: string) => {
    setArrivalDate(date);
    setPassportExpiryEnabled(true);

    // Auto-fill passport expiry date (180 days after arrival)
    const defaultExpiryDate = getDefaultPassportExpiryDate(date);
    form.setValue('passportExpiryDate', defaultExpiryDate);
    handleFormChange();
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 to-primary-100">
      <StatusBar style="dark" backgroundColor="#eff6ff" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white">
        <Button
          onPress={handleBack}
          variant="ghost"
          className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center"
        >
          <ArrowLeft size={20} color="#1e8ec2" />
        </Button>
        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold text-gray-900">
            Step 2:{' '}
            {existingApplication?.data?.mainApplicant
              ? 'Update Personal Information'
              : 'Personal Information'}
          </Text>
          <Text className="text-sm text-gray-600">
            {existingApplication?.data?.mainApplicant
              ? 'Update your personal and passport details'
              : 'Please provide your personal and passport details'}
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
          paddingBottom: 120,
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
          currentStep="personal"
          completedSteps={['start']}
          className="mb-6"
        />

        {/* Error Alert */}
        {errorMessage && (
          <AlertError className="mb-6">
            <Text className="text-red-800 font-semibold">Error</Text>
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
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              All fields marked with * are required. Please provide accurate
              information as it appears on your passport.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form>
              {/* Arrival Date Section */}
              <View className="bg-primary-50 rounded-xl p-4 mb-6 border border-primary-200">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-primary-100 rounded-full items-center justify-center mr-3">
                    <Calendar size={16} color="#1e8ec2" />
                  </View>
                  <Text className="text-lg font-semibold text-primary-900">
                    Arrival Information
                  </Text>
                </View>

                <FormField>
                  <FormItem>
                    <FormLabel>Arrival Date *</FormLabel>
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="arrivalDate"
                        render={({ field: { onChange, value } }) => (
                          <DatePicker
                            value={value}
                            onValueChange={date => {
                              onChange(date);
                              handleArrivalDateChange(date);
                            }}
                            placeholder="Pick an arrival date"
                            minimumDate={new Date()}
                            maximumDate={
                              new Date(
                                new Date().getFullYear() + 1,
                                new Date().getMonth(),
                                new Date().getDate()
                              )
                            }
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.arrivalDate?.message}
                    </FormMessage>
                  </FormItem>
                </FormField>

                {/* Visa Validity Message */}
                {arrivalDate && (
                  <View className="mt-4 p-4 bg-white rounded-xl border border-primary-200">
                    <Text className="text-sm text-primary-800 leading-relaxed">
                      {getVisaValidityMessage(arrivalDate)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Personal Details */}
              <View className="gap-4 mb-6">
                <FormField>
                  <FormItem>
                    <FormLabel>Given Names *</FormLabel>
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="givenNames"
                        render={({ field: { onChange, value } }) => (
                          <Input
                            placeholder="e.g., John Michael"
                            value={value}
                            onChangeText={text => {
                              onChange(text.toUpperCase());
                              handleFormChange();
                            }}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.givenNames?.message}
                    </FormMessage>
                  </FormItem>
                </FormField>

                <FormField>
                  <FormItem>
                    <FormLabel>Surname *</FormLabel>
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="surname"
                        render={({ field: { onChange, value } }) => (
                          <Input
                            placeholder="e.g., Smith"
                            value={value}
                            onChangeText={text => {
                              onChange(text.toUpperCase());
                              handleFormChange();
                            }}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.surname?.message}
                    </FormMessage>
                  </FormItem>
                </FormField>

                <FormField>
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field: { onChange, value } }) => (
                          <DatePicker
                            value={value}
                            onValueChange={date => {
                              onChange(date);
                              handleFormChange();
                            }}
                            placeholder="Pick your date of birth"
                            maximumDate={new Date()}
                            minimumDate={new Date(1900, 0, 1)}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.dateOfBirth?.message}
                    </FormMessage>
                  </FormItem>
                </FormField>

                <FormField>
                  <FormItem>
                    <FormLabel>Place of Birth *</FormLabel>
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="placeOfBirth"
                        render={({ field: { onChange, value } }) => (
                          <Input
                            placeholder="e.g., New York, USA"
                            value={value}
                            onChangeText={text => {
                              onChange(text);
                              handleFormChange();
                            }}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.placeOfBirth?.message}
                    </FormMessage>
                  </FormItem>
                </FormField>

                <FormField>
                  <FormItem>
                    <FormLabel>Mother's Full Name *</FormLabel>
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="motherName"
                        render={({ field: { onChange, value } }) => (
                          <Input
                            placeholder="e.g., Mary Johnson"
                            value={value}
                            onChangeText={text => {
                              onChange(text.toUpperCase());
                              handleFormChange();
                            }}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.motherName?.message}
                    </FormMessage>
                  </FormItem>
                </FormField>

                <FormField>
                  <FormItem>
                    <FormLabel>Father's Full Name *</FormLabel>
                    <FormControl>
                      <Controller
                        control={form.control}
                        name="fatherName"
                        render={({ field: { onChange, value } }) => (
                          <Input
                            placeholder="e.g., Robert Johnson"
                            value={value}
                            onChangeText={text => {
                              onChange(text.toUpperCase());
                              handleFormChange();
                            }}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.fatherName?.message}
                    </FormMessage>
                  </FormItem>
                </FormField>
              </View>

              {/* Passport Details */}
              <View className="border-t border-gray-200 pt-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-primary-100 rounded-full items-center justify-center mr-3">
                    <FileText size={16} color="#1e8ec2" />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">
                    Passport Information
                  </Text>
                </View>

                <View className="gap-6">
                  <FormField>
                    <FormItem>
                      <FormLabel>Passport Number *</FormLabel>
                      <FormControl>
                        <Controller
                          control={form.control}
                          name="passportNumber"
                          render={({ field: { onChange, value } }) => (
                            <Input
                              placeholder="e.g., P1234567"
                              value={value}
                              onChangeText={text => {
                                onChange(text.toUpperCase());
                                handleFormChange();
                              }}
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.passportNumber?.message}
                      </FormMessage>
                    </FormItem>
                  </FormField>

                  <FormField>
                    <FormItem>
                      <FormLabel>Passport Issue Date *</FormLabel>
                      <FormControl>
                        <Controller
                          control={form.control}
                          name="passportIssueDate"
                          render={({ field: { onChange, value } }) => (
                            <DatePicker
                              value={value}
                              onValueChange={date => {
                                onChange(date);
                                handleFormChange();
                              }}
                              placeholder="Pick issue date"
                              maximumDate={new Date()}
                              minimumDate={new Date(1990, 0, 1)}
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.passportIssueDate?.message}
                      </FormMessage>
                    </FormItem>
                  </FormField>

                  <FormField>
                    <FormItem>
                      <FormLabel>Passport Expiry Date *</FormLabel>
                      <FormControl>
                        <Controller
                          control={form.control}
                          name="passportExpiryDate"
                          render={({ field: { onChange, value } }) => (
                            <DatePicker
                              value={value}
                              onValueChange={date => {
                                onChange(date);
                                handleFormChange();
                              }}
                              placeholder={
                                passportExpiryEnabled
                                  ? 'Pick expiry date'
                                  : 'Select arrival date first'
                              }
                              disabled={!passportExpiryEnabled}
                              minimumDate={
                                passportExpiryEnabled
                                  ? getPassportExpiryMinDate(arrivalDate)
                                  : undefined
                              }
                              maximumDate={
                                new Date(
                                  new Date().getFullYear() + 10,
                                  new Date().getMonth(),
                                  new Date().getDate()
                                )
                              }
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.passportExpiryDate?.message}
                      </FormMessage>
                    </FormItem>
                  </FormField>
                </View>
              </View>
            </Form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200 mb-8">
          <CardContent>
            <View className="items-center">
              <Text className="font-semibold text-blue-900 mb-2">
                What happens next?
              </Text>
              <Text className="text-blue-700 text-sm text-center">
                After completing your personal information, you'll proceed to
                upload your documents and continue with your visa application.
              </Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>

      {/* Sticky Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <View className="gap-3">
          <Button
            onPress={form.handleSubmit(onSubmit)}
            loading={
              submitApplicantDetailsMutation.isPending ||
              updateApplicantDetailsMutation.isPending
            }
            className="w-full"
            size="lg"
          >
            <View className="flex-row items-center justify-center gap-2">
              <Save size={20} color="#ffffff" />
              <Text className="text-white font-semibold">
                {submitApplicantDetailsMutation.isPending ||
                updateApplicantDetailsMutation.isPending
                  ? existingApplication?.data?.mainApplicant
                    ? 'Updating...'
                    : 'Saving...'
                  : existingApplication?.data?.mainApplicant
                    ? 'Update Details'
                    : 'Save & Continue'}
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
