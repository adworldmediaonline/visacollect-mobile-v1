import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Icons
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  FileText,
  Plus,
  User,
  Users,
  X,
} from 'lucide-react-native';

// UI Components
import { ApplicantCard } from '../../../components/ui/ApplicantCard';
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
  Form,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/Form';
import { Input } from '../../../components/ui/Input';
import { PickerSelect } from '../../../components/ui/Picker';
import { ProgressIndicator } from '../../../components/ui/ProgressIndicator';

// Hooks and Services
import {
  useAddApplicant,
  useDeleteApplicant,
  useGetApplication,
  useUpdateApplicant,
} from '../../../hooks/useTurkeyVisa';
import {
  AdditionalApplicantFormData,
  additionalApplicantSchema,
} from '../../../lib/schemas/additionalApplicant';

// Constants
const DOCUMENT_TYPES = [
  { label: 'Visa', value: 'visa' },
  { label: 'Residence Permit', value: 'residence-permit' },
];

const VISA_COUNTRIES = [
  { label: 'Ireland', value: 'Ireland' },
  { label: 'Schengen', value: 'Schengen' },
  { label: 'USA / U.S.A', value: 'USA / U.S.A' },
  { label: 'United Kingdom', value: 'United Kingdom' },
];

const RESIDENCE_PERMIT_COUNTRIES = [
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
  { label: 'Ireland', value: 'Ireland' },
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
  { label: 'Schengen', value: 'Schengen' },
  { label: 'Slovakia', value: 'Slovakia' },
  { label: 'Slovenia', value: 'Slovenia' },
  { label: 'Spain', value: 'Spain' },
  { label: 'Sweden', value: 'Sweden' },
  { label: 'Switzerland', value: 'Switzerland' },
  { label: 'U.S.A', value: 'U.S.A' },
  { label: 'United Kingdom', value: 'United Kingdom' },
];

export default function AddApplicantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [passportExpiryEnabled, setPassportExpiryEnabled] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<any | null>(null);
  const [deletingApplicantIndex, setDeletingApplicantIndex] = useState<
    number | null
  >(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get existing application data
  const { data: existingApplication, isLoading: isLoadingApplication } =
    useGetApplication(id || '', undefined);

  // Mutations
  const addApplicantMutation = useAddApplicant();
  const updateApplicantMutation = useUpdateApplicant();
  const deleteApplicantMutation = useDeleteApplicant();

  // Form setup
  const form = useForm<AdditionalApplicantFormData>({
    resolver: zodResolver(additionalApplicantSchema),
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
      documents: {
        supportingDocuments: [
          {
            documentType: 'visa',
            issuingCountry: '',
            documentNumber: '',
            expiryDate: '',
            isUnlimited: false,
          },
        ],
        additionalDocuments: [],
      },
    },
  });

  const {
    fields: supportingDocuments,
    append: addSupportingDocument,
    remove: removeSupportingDocument,
  } = useFieldArray({
    control: form.control,
    name: 'documents.supportingDocuments',
  });

  // Calculate passport expiry minimum date (180 days after arrival)
  const getPassportExpiryMinDate = (arrivalDateStr: string) => {
    const arrivalDate = new Date(arrivalDateStr);
    const minDate = new Date(arrivalDate);
    minDate.setDate(minDate.getDate() + 180);
    return minDate;
  };

  // Calculate default passport expiry date (180 days after arrival)
  const getDefaultPassportExpiryDate = (arrivalDateStr: string) => {
    const arrivalDate = new Date(arrivalDateStr);
    const expiryDate = new Date(arrivalDate);
    expiryDate.setDate(expiryDate.getDate() + 180);
    return format(expiryDate, 'yyyy-MM-dd');
  };

  // Enable passport expiry when arrival date is set
  useEffect(() => {
    const arrivalDate = form.watch('arrivalDate');
    if (arrivalDate && !passportExpiryEnabled) {
      setPassportExpiryEnabled(true);
      // Auto-fill passport expiry if not already set
      const currentExpiry = form.getValues('passportExpiryDate');
      if (!currentExpiry) {
        const defaultExpiryDate = getDefaultPassportExpiryDate(arrivalDate);
        form.setValue('passportExpiryDate', defaultExpiryDate);
      }
    }
  }, [form.watch('arrivalDate'), passportExpiryEnabled]);

  // Handle form submission
  const onSubmit = async (data: AdditionalApplicantFormData) => {
    if (!id) {
      console.error('No application ID found');
      return;
    }

    // Clear any previous messages
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (editingApplicant) {
        // Update existing applicant
        await updateApplicantMutation.mutateAsync({
          applicationId: id,
          index: editingApplicant.index,
          applicant: data,
        });
        setSuccessMessage('Applicant updated successfully!');
      } else {
        // Add new applicant
        await addApplicantMutation.mutateAsync({
          applicationId: id,
          applicant: data,
        });
        setSuccessMessage('Additional applicant added successfully!');
      }

      // Reset form for adding another applicant or exit edit mode
      setTimeout(() => {
        setSuccessMessage('');
        setEditingApplicant(null);

        // Reset passport expiry enabled state
        setPassportExpiryEnabled(false);

        form.reset({
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
          documents: {
            supportingDocuments: [
              {
                documentType: 'visa',
                issuingCountry: '',
                documentNumber: '',
                expiryDate: '',
                isUnlimited: false,
              },
            ],
            additionalDocuments: [],
          },
        });
      }, 2000);
    } catch (error: any) {
      console.error('Error adding/updating applicant:', error);
      setErrorMessage('Failed to save applicant. Please try again.');
    }
  };

  // Handle editing an applicant
  const handleEditApplicant = (applicant: any, index: number) => {
    setEditingApplicant({ ...applicant, index });
    // Populate form with applicant data for editing
    form.reset({
      arrivalDate: applicant.arrivalDate
        ? format(new Date(applicant.arrivalDate), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      givenNames: applicant.givenNames,
      surname: applicant.surname,
      dateOfBirth: applicant.dateOfBirth,
      placeOfBirth: applicant.placeOfBirth,
      motherName: applicant.motherName,
      fatherName: applicant.fatherName,
      passportNumber: applicant.passportNumber,
      passportIssueDate: applicant.passportIssueDate,
      passportExpiryDate: applicant.passportExpiryDate,
      documents: {
        supportingDocuments: applicant.documents?.supportingDocuments || [
          {
            documentType: 'visa',
            issuingCountry: '',
            documentNumber: '',
            expiryDate: '',
            isUnlimited: false,
          },
        ],
        additionalDocuments: applicant.documents?.additionalDocuments || [],
      },
    });

    // Enable passport expiry if arrival date exists
    if (applicant.arrivalDate) {
      setPassportExpiryEnabled(true);
    }
  };

  // Handle deleting an applicant
  const handleDeleteApplicant = async (index: number) => {
    if (!id || !existingApplication?.data?.additionalApplicants) return;

    Alert.alert(
      'Delete Applicant',
      'Are you sure you want to delete this applicant? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingApplicantIndex(index);

            try {
              await deleteApplicantMutation.mutateAsync({
                applicationId: id,
                index,
              });

              setSuccessMessage('Applicant deleted successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error: any) {
              console.error('Error deleting applicant:', error);
              setErrorMessage('Failed to delete applicant. Please try again.');
            } finally {
              setDeletingApplicantIndex(null);
            }
          },
        },
      ]
    );
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingApplicant(null);
    form.reset({
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
      documents: {
        supportingDocuments: [
          {
            documentType: 'visa',
            issuingCountry: '',
            documentNumber: '',
            expiryDate: '',
            isUnlimited: false,
          },
        ],
        additionalDocuments: [],
      },
    });
    setPassportExpiryEnabled(false);
  };

  // Get country options based on document type
  const getCountryOptions = (documentType: string) => {
    if (documentType === 'visa') {
      return VISA_COUNTRIES;
    } else if (documentType === 'residence-permit') {
      return RESIDENCE_PERMIT_COUNTRIES;
    }
    return [];
  };

  // Handle file upload for additional documents
  const handleAdditionalFilesSelected = (files: any[]) => {
    form.setValue('documents.additionalDocuments', files);
  };

  if (isLoadingApplication) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 to-primary-100">
        <StatusBar style="dark" backgroundColor="#eff6ff" />
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading application...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!existingApplication?.success) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 to-primary-100">
        <StatusBar style="dark" backgroundColor="#eff6ff" />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            Application not found
          </Text>
          <Button
            onPress={() => router.push('/(country)/turkey/welcome')}
            title="Go to Welcome Screen"
            className="w-full"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 to-primary-100">
      <StatusBar style="dark" backgroundColor="#eff6ff" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white">
        <Button
          onPress={() => router.push(`/(country)/turkey/documents?id=${id}`)}
          variant="ghost"
          className="flex-row items-center"
        >
          <ArrowLeft size={20} color="#1e8ec2" />
          <Text className="text-primary-600 font-medium ml-2">Back</Text>
        </Button>
        <Text className="text-lg font-semibold text-gray-900">
          {editingApplicant ? 'Edit Applicant' : 'Add Applicants'}
        </Text>
        <View className="w-16" />
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
            { id: 'start', label: 'Start' },
            { id: 'applicant', label: 'Applicant' },
            { id: 'documents', label: 'Documents' },
            { id: 'add-applicant', label: 'Add Applicants' },
            { id: 'review', label: 'Review' },
          ]}
          currentStep="add-applicant"
          completedSteps={['start', 'applicant', 'documents']}
        />

        {/* Skip Option */}
        <Card className="mb-6">
          <CardContent className="items-center py-6">
            <Text className="text-center text-gray-600 mb-4">
              You can skip this step and add applicants later, or continue to
              payment
            </Text>
            <Button
              onPress={() => router.push(`/(country)/turkey/status?id=${id}`)}
              variant="outline"
              title="Skip & Continue to Payment"
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Existing Additional Applicants */}
        {existingApplication?.data?.additionalApplicants &&
          existingApplication.data.additionalApplicants.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex-row items-center">
                  <Users size={20} color="#1e8ec2" />
                  <Text className="text-lg font-semibold text-gray-900 ml-2">
                    Additional Applicants (
                    {existingApplication.data.additionalApplicants.length})
                  </Text>
                </CardTitle>
                <CardDescription>
                  Manage the applicants added to this visa application
                </CardDescription>
              </CardHeader>
              <CardContent>
                {existingApplication.data.additionalApplicants.map(
                  (applicant: any, index: number) => (
                    <ApplicantCard
                      key={applicant._id || index}
                      applicant={applicant}
                      index={index}
                      onEdit={() => handleEditApplicant(applicant, index)}
                      onDelete={() => handleDeleteApplicant(index)}
                      isDeleting={deletingApplicantIndex === index}
                      isUpdating={
                        editingApplicant?.index === index &&
                        updateApplicantMutation.isPending
                      }
                    />
                  )
                )}
              </CardContent>
            </Card>
          )}

        {/* Error/Success Messages */}
        {errorMessage && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <Text className="text-red-600 text-sm">{errorMessage}</Text>
          </View>
        )}

        {successMessage && (
          <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <View className="flex-row items-center">
              <CheckCircle size={16} color="#16a34a" />
              <Text className="text-green-600 text-sm ml-2">
                {successMessage}
              </Text>
            </View>
          </View>
        )}

        {/* Main Form */}
        <Form>
          {/* Personal Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex-row items-center">
                <User size={20} color="#1e8ec2" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  Personal Information
                </Text>
              </CardTitle>
              <CardDescription>
                Enter the applicant's personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              {/* Arrival Date Section */}
              <View className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-primary-100 rounded-full items-center justify-center mr-3">
                    <Calendar size={16} color="#1e8ec2" />
                  </View>
                  <Text className="text-lg font-semibold text-primary-900">
                    Arrival Information
                  </Text>
                </View>

                <FormItem>
                  <FormLabel>Arrival Date *</FormLabel>
                  <Controller
                    control={form.control}
                    name="arrivalDate"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onValueChange={date => {
                          field.onChange(date);
                          // Auto-fill passport expiry date (180 days after arrival)
                          const defaultExpiryDate =
                            getDefaultPassportExpiryDate(date);
                          form.setValue(
                            'passportExpiryDate',
                            defaultExpiryDate
                          );
                          // Enable passport expiry field
                          setPassportExpiryEnabled(true);
                        }}
                        placeholder="Select arrival date"
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
                  <FormMessage />
                </FormItem>

                {/* Visa Validity Message */}
                {form.watch('arrivalDate') && (
                  <View className="mt-4 p-4 bg-white rounded-xl border border-primary-200">
                    <Text className="text-sm text-primary-800 leading-relaxed">
                      Your e-visa is valid from{' '}
                      {format(
                        new Date(form.watch('arrivalDate')),
                        'd MMMM yyyy'
                      )}{' '}
                      to{' '}
                      {format(
                        new Date(
                          new Date(form.watch('arrivalDate')).getTime() +
                            180 * 24 * 60 * 60 * 1000
                        ),
                        'd MMMM yyyy'
                      )}{' '}
                      for a total period of 180 days. Your stay cannot exceed 30
                      days.
                    </Text>
                  </View>
                )}
              </View>

              <FormItem>
                <FormLabel>Given Names *</FormLabel>
                <Controller
                  control={form.control}
                  name="givenNames"
                  render={({ field }) => (
                    <Input
                      placeholder="Enter given names"
                      value={field.value}
                      onChangeText={text => field.onChange(text.toUpperCase())}
                      autoCapitalize="characters"
                    />
                  )}
                />
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Surname *</FormLabel>
                <Controller
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <Input
                      placeholder="Enter surname"
                      value={field.value}
                      onChangeText={text => field.onChange(text.toUpperCase())}
                      autoCapitalize="characters"
                    />
                  )}
                />
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Date of Birth *</FormLabel>
                <Controller
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select date of birth"
                      maximumDate={new Date()}
                      minimumDate={new Date('1900-01-01')}
                    />
                  )}
                />
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Place of Birth *</FormLabel>
                <Controller
                  control={form.control}
                  name="placeOfBirth"
                  render={({ field }) => (
                    <Input
                      placeholder="Enter place of birth"
                      value={field.value}
                      onChangeText={field.onChange}
                    />
                  )}
                />
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Mother's Name *</FormLabel>
                <Controller
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <Input
                      placeholder="Enter mother's name"
                      value={field.value}
                      onChangeText={text => field.onChange(text.toUpperCase())}
                      autoCapitalize="characters"
                    />
                  )}
                />
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Father's Name *</FormLabel>
                <Controller
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <Input
                      placeholder="Enter father's name"
                      value={field.value}
                      onChangeText={text => field.onChange(text.toUpperCase())}
                      autoCapitalize="characters"
                    />
                  )}
                />
                <FormMessage />
              </FormItem>
            </CardContent>
          </Card>

          {/* Passport Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex-row items-center">
                <FileText size={20} color="#1e8ec2" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  Passport Information
                </Text>
              </CardTitle>
              <CardDescription>
                Enter the applicant's passport details
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              <FormItem>
                <FormLabel>Passport Number *</FormLabel>
                <Controller
                  control={form.control}
                  name="passportNumber"
                  render={({ field }) => (
                    <Input
                      placeholder="Enter passport number"
                      value={field.value}
                      onChangeText={text => field.onChange(text.toUpperCase())}
                      autoCapitalize="characters"
                    />
                  )}
                />
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Passport Issue Date *</FormLabel>
                <Controller
                  control={form.control}
                  name="passportIssueDate"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select issue date"
                      maximumDate={new Date()}
                      minimumDate={new Date('1900-01-01')}
                    />
                  )}
                />
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Passport Expiry Date *</FormLabel>
                <Controller
                  control={form.control}
                  name="passportExpiryDate"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={
                        passportExpiryEnabled
                          ? 'Select expiry date'
                          : 'Select arrival date first'
                      }
                      disabled={!passportExpiryEnabled}
                      minimumDate={
                        form.watch('arrivalDate')
                          ? getPassportExpiryMinDate(form.watch('arrivalDate'))
                          : new Date()
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
                <FormMessage />
              </FormItem>
            </CardContent>
          </Card>

          {/* Supporting Documents */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <CardDescription>
                Upload supporting documents for this applicant (Visa or
                Residence Permit)
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              {supportingDocuments.map((field, index) => (
                <View
                  key={field.id}
                  className="gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="font-medium text-gray-900">
                      Document {index + 1}
                    </Text>
                    {supportingDocuments.length > 1 && (
                      <Button
                        onPress={() => removeSupportingDocument(index)}
                        variant="ghost"
                        className="w-8 h-8 p-0"
                      >
                        <X size={16} color="#6b7280" />
                      </Button>
                    )}
                  </View>

                  <FormItem>
                    <FormLabel>Document Type *</FormLabel>
                    <Controller
                      control={form.control}
                      name={`documents.supportingDocuments.${index}.documentType`}
                      render={({ field: docField }) => (
                        <PickerSelect
                          placeholder="Select document type"
                          value={docField.value}
                          onValueChange={docField.onChange}
                          options={DOCUMENT_TYPES}
                        />
                      )}
                    />
                    <FormMessage />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Issuing Country *</FormLabel>
                    <Controller
                      control={form.control}
                      name={`documents.supportingDocuments.${index}.issuingCountry`}
                      render={({ field: countryField }) => {
                        const documentType = form.watch(
                          `documents.supportingDocuments.${index}.documentType`
                        );
                        return (
                          <PickerSelect
                            placeholder={
                              documentType
                                ? 'Select issuing country'
                                : 'Select document type first'
                            }
                            value={countryField.value}
                            onValueChange={countryField.onChange}
                            options={getCountryOptions(documentType)}
                            disabled={!documentType}
                          />
                        );
                      }}
                    />
                    <FormMessage />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Document Number *</FormLabel>
                    <Controller
                      control={form.control}
                      name={`documents.supportingDocuments.${index}.documentNumber`}
                      render={({ field: numberField }) => (
                        <Input
                          placeholder="Enter document number"
                          value={numberField.value}
                          onChangeText={numberField.onChange}
                        />
                      )}
                    />
                    <FormMessage />
                  </FormItem>

                  <View className="flex-row items-center gap-3">
                    <Controller
                      control={form.control}
                      name={`documents.supportingDocuments.${index}.isUnlimited`}
                      render={({ field: unlimitedField }) => (
                        <TouchableOpacity
                          onPress={() =>
                            unlimitedField.onChange(!unlimitedField.value)
                          }
                          className="flex-row items-center"
                        >
                          <View
                            className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                              unlimitedField.value
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {unlimitedField.value && (
                              <CheckCircle size={12} color="#ffffff" />
                            )}
                          </View>
                          <Text className="text-sm text-gray-700">
                            Unlimited validity
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>

                  {!form.watch(
                    `documents.supportingDocuments.${index}.isUnlimited`
                  ) && (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <Controller
                        control={form.control}
                        name={`documents.supportingDocuments.${index}.expiryDate`}
                        render={({ field: expiryField }) => (
                          <DatePicker
                            value={expiryField.value}
                            onValueChange={expiryField.onChange}
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
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                </View>
              ))}

              <Button
                onPress={() =>
                  addSupportingDocument({
                    documentType: 'visa',
                    issuingCountry: '',
                    documentNumber: '',
                    expiryDate: '',
                    isUnlimited: false,
                  })
                }
                variant="outline"
                className="w-full"
              >
                <Plus size={16} color="#1e8ec2" />
                <Text className="text-primary-600 font-medium ml-2">
                  Add Another Document
                </Text>
              </Button>
            </CardContent>
          </Card>

          {/* Additional Documents */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Additional Documents</CardTitle>
              <CardDescription>
                Upload additional supporting documents for this applicant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesSelected={handleAdditionalFilesSelected}
                multiple={true}
                accept={['image/*', 'application/pdf']}
                maxFiles={10}
                applicationId={id}
              />
            </CardContent>
          </Card>
        </Form>
      </ScrollView>

      {/* Sticky Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row gap-3">
          <Button
            onPress={() => router.push(`/(country)/turkey/documents?id=${id}`)}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft size={16} color="#1e8ec2" />
            <Text className="text-primary-600 font-medium ml-2">Back</Text>
          </Button>

          {editingApplicant && (
            <Button
              onPress={handleCancelEdit}
              variant="outline"
              className="flex-1"
            >
              <Text className="text-gray-600 font-medium">Cancel Edit</Text>
            </Button>
          )}

          <Button
            onPress={form.handleSubmit(onSubmit)}
            disabled={
              addApplicantMutation.isPending ||
              updateApplicantMutation.isPending
            }
            className="flex-1"
          >
            <Plus size={16} color="#ffffff" />
            <Text className="text-white font-medium ml-2">
              {addApplicantMutation.isPending ||
              updateApplicantMutation.isPending
                ? 'Saving...'
                : editingApplicant
                  ? 'Update Applicant'
                  : 'Add Applicant'}
            </Text>
          </Button>

          <Button
            onPress={() => router.push(`/(country)/turkey/status?id=${id}`)}
            variant="secondary"
            disabled={
              addApplicantMutation.isPending ||
              updateApplicantMutation.isPending
            }
            className="flex-1"
          >
            <Text className="text-white font-medium">Continue</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
