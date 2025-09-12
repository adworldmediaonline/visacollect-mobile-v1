'use client';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Globe,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Shield,
} from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';

import { useGetApplication } from '../../../hooks/useTurkeyVisa';
import { useApplicationStore } from '../../../stores/applicationStore';

// Real application data type based on MongoDB structure
interface TurkeyApplication {
  _id: string;
  applicationId: string;
  passportCountry: string;
  travelDocument: string;
  visaType: string;
  destination: string;
  email: string;
  status: string;
  currentStep: number;
  visaFee: number;
  serviceFee: number;
  additionalApplicants: any[];
  createdAt: string;
  updatedAt: string;
  lastUpdated: string;
}

export default function TurkeyStatusScreen() {
  const router = useRouter();
  const { id, error } = useLocalSearchParams();
  const [application, setApplication] = useState<TurkeyApplication | null>(
    null
  );

  const { setApplicationId, setEmail, setCurrentStep, setStatus } =
    useApplicationStore();

  const getApplicationMutation = useGetApplication(id as string);

  useEffect(() => {
    if (id) {
      // Clear previous application data when checking new ID
      setApplication(null);
      getApplicationMutation.mutate();
    }
  }, [id]);

  useEffect(() => {
    if (
      getApplicationMutation.data?.success &&
      getApplicationMutation.data?.data
    ) {
      const appData = getApplicationMutation.data.data;
      setApplication(appData);

      // Update Zustand store
      setApplicationId(appData.applicationId);
      setEmail(appData.email);
      setCurrentStep(appData.currentStep);
      setStatus(appData.status);
    }
  }, [
    getApplicationMutation.data,
    setApplicationId,
    setEmail,
    setCurrentStep,
    setStatus,
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'started':
        return <Clock size={20} color="#1e8ec2" />;
      case 'in_progress':
        return <Clock size={20} color="#1e8ec2" />;
      case 'submitted':
        return <CheckCircle size={20} color="#10b981" />;
      case 'approved':
        return <CheckCircle size={20} color="#10b981" />;
      case 'rejected':
        return <AlertCircle size={20} color="#ef4444" />;
      case 'paid':
        return <CreditCard size={20} color="#10b981" />;
      default:
        return <Clock size={20} color="#1e8ec2" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'started':
        return 'bg-primary-100 text-primary-800';
      case 'in_progress':
        return 'bg-primary-100 text-primary-800';
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-primary-100 text-primary-800';
    }
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'started':
        return 'Application Started';
      case 'in_progress':
        return 'In Progress';
      case 'submitted':
        return 'Submitted';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'paid':
        return 'Payment Completed';
      default:
        return status.replace('_', ' ').toUpperCase();
    }
  };

  const getNextStepAction = (status: string, currentStep: number) => {
    switch (status) {
      case 'started':
        return {
          label: 'Continue Application',
          description: 'Complete your visa application process',
          icon: <ArrowRight size={20} color="#ffffff" />,
          action: () => router.push('/(country)/turkey/start'),
        };
      case 'in_progress':
        return {
          label: 'Continue Application',
          description: 'Complete your visa application process',
          icon: <ArrowRight size={20} color="#ffffff" />,
          action: () => router.push('/(country)/turkey/start'),
        };
      case 'submitted':
        return {
          label: 'Make Payment',
          description: 'Complete payment to process your application',
          icon: <CreditCard size={20} color="#ffffff" />,
          action: () => router.push('/(country)/turkey/start'),
        };
      case 'paid':
        return {
          label: 'View Payment Details',
          description: 'View your payment information and receipt',
          icon: <CreditCard size={20} color="#ffffff" />,
          action: () =>
            router.push(
              `/(country)/turkey/payment-details?id=${application?.applicationId}`
            ),
        };
      case 'approved':
        return {
          label: 'Download Visa',
          description: 'Your visa is ready for download',
          icon: <CheckCircle size={20} color="#ffffff" />,
          action: () =>
            Alert.alert('Success', 'Visa download functionality coming soon!'),
        };
      case 'rejected':
        return {
          label: 'Contact Support',
          description: 'Application was rejected. Please contact support.',
          icon: <AlertCircle size={20} color="#ffffff" />,
          action: () =>
            Alert.alert(
              'Contact Support',
              'Please email support@visacollect.com'
            ),
        };
      default:
        return {
          label: 'Continue Application',
          description: 'Complete your visa application process',
          icon: <ArrowRight size={20} color="#ffffff" />,
          action: () => router.push('/(country)/turkey/start'),
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleBack = () => {
    router.back();
  };

  if (getApplicationMutation.isPending) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <StatusBar style="dark" backgroundColor="#f8fafc" />

        <View className="flex-1 justify-center items-center p-6">
          <View className="items-center gap-6">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center">
              <Loader2 size={32} color="#1e8ec2" />
            </View>
            <View className="items-center gap-2">
              <Text className="text-lg font-semibold text-gray-900">
                Loading Application
              </Text>
              <Text className="text-base text-gray-600 text-center">
                Fetching your visa application details...
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Handle "not found" error state with enhanced UI
  if (error === 'not_found' || getApplicationMutation.isError || !application) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-red-50 via-white to-red-50">
        <StatusBar style="dark" backgroundColor="#fef2f2" />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
        >
          <View className="items-center gap-8">
            {/* Header with back button */}
            <View className="w-full flex-row items-center justify-between mb-4">
              <Button
                title=""
                onPress={() => router.push('/(country)/turkey/welcome')}
                variant="outline"
                className="w-12 h-12 rounded-full border-2 border-red-200"
              >
                <ArrowLeft size={20} color="#ef4444" />
              </Button>
              <Text className="text-lg font-semibold text-red-900">
                Application Status
              </Text>
              <View className="w-12" />
            </View>

            {/* Error Icon */}
            <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center shadow-lg">
              <Search size={40} color="#ef4444" />
            </View>

            {/* Error Message */}
            <View className="items-center gap-4">
              <Text className="text-2xl font-bold text-red-900 text-center">
                Application Not Found
              </Text>
              <Text className="text-base text-red-700 text-center leading-6">
                We couldn't find an application with ID{' '}
                <Text className="font-mono font-semibold bg-red-100 px-2 py-1 rounded">
                  {id}
                </Text>
                . Please check your application ID and try again.
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="w-full gap-4">
              <Button
                title="Check Another Application"
                onPress={() => router.push('/(country)/turkey/welcome')}
                className="w-full rounded-2xl shadow-lg"
                size="lg"
              >
                <View className="flex-row items-center gap-2">
                  <RefreshCw size={20} color="#ffffff" />
                  <Text className="text-white font-semibold text-base">
                    Check Another Application
                  </Text>
                </View>
              </Button>

              <Button
                title="Start New Application"
                onPress={() => router.push('/(country)/turkey/start')}
                variant="outline"
                className="w-full rounded-2xl border-2 border-red-200"
                size="lg"
              >
                <View className="flex-row items-center gap-2">
                  <FileText size={20} color="#ef4444" />
                  <Text className="text-red-600 font-semibold text-base">
                    Start New Application
                  </Text>
                </View>
              </Button>
            </View>

            {/* Help Section */}
            <Card className="w-full bg-red-50 border-red-200">
              <CardContent className="p-4">
                <View className="flex-row items-start gap-3">
                  <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center">
                    <AlertCircle size={16} color="#ef4444" />
                  </View>
                  <View className="flex-1 gap-2">
                    <Text className="font-semibold text-red-900">
                      Need Help?
                    </Text>
                    <Text className="text-sm text-red-700 leading-5">
                      If you believe this is an error, please contact our
                      support team with your application ID.
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const nextStepAction = getNextStepAction(
    application.status,
    application.currentStep
  );

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <StatusBar style="dark" backgroundColor="#f8fafc" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        {/* Header */}
        <View className="gap-6 mb-8">
          <Button
            title="Back"
            onPress={handleBack}
            variant="ghost"
            className="self-start -ml-2"
            textClassName="text-gray-600"
          >
            <ArrowLeft size={20} color="#6b7280" />
          </Button>

          <View className="items-center gap-3">
            <Text className="text-3xl font-bold text-gray-900">
              Application Status
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              Track your Turkey visa application progress
            </Text>
          </View>
        </View>

        {/* Application Overview */}
        <Card className="w-full mb-6 shadow-lg border-0">
          <CardHeader className="pb-4">
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {application.applicationId}
                </CardTitle>
                <CardDescription className="text-base text-gray-600 mt-1">
                  Created on {formatDate(application.createdAt)}
                </CardDescription>
              </View>
              <View
                className={`${getStatusColor(application.status)} px-4 py-3 rounded-2xl`}
              >
                <View className="flex-row items-center gap-2">
                  {getStatusIcon(application.status)}
                  <Text className="text-sm font-semibold">
                    {getStatusDisplayText(application.status)}
                  </Text>
                </View>
              </View>
            </View>
          </CardHeader>

          <CardContent className="gap-8">
            {/* Application Details */}
            <View className="gap-6">
              <View className="gap-5">
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-primary-100 rounded-xl items-center justify-center">
                    <MapPin size={20} color="#1e8ec2" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-base text-gray-900">
                      Destination
                    </Text>
                    <Text className="text-base text-gray-600 mt-1">
                      {application.destination}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-primary-100 rounded-xl items-center justify-center">
                    <Globe size={20} color="#1e8ec2" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-base text-gray-900">
                      Passport Country
                    </Text>
                    <Text className="text-base text-gray-600 mt-1">
                      {application.passportCountry}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-primary-100 rounded-xl items-center justify-center">
                    <Shield size={20} color="#1e8ec2" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-base text-gray-900">
                      Visa Type
                    </Text>
                    <Text className="text-base text-gray-600 mt-1">
                      {application.visaType}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-primary-100 rounded-xl items-center justify-center">
                    <FileText size={20} color="#1e8ec2" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-base text-gray-900">
                      Travel Document
                    </Text>
                    <Text className="text-base text-gray-600 mt-1">
                      {application.travelDocument}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="h-px bg-gray-200" />

              <View className="gap-5">
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  Fee Breakdown
                </Text>

                <View className="bg-gray-50 rounded-2xl p-4 gap-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base text-gray-700">Visa Fee</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      ${application.visaFee} USD
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-base text-gray-700">Service Fee</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      ${application.serviceFee} USD
                    </Text>
                  </View>

                  <View className="h-px bg-gray-300" />

                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-gray-900">
                      Total
                    </Text>
                    <Text className="text-lg font-bold text-primary-600">
                      ${application.visaFee + application.serviceFee} USD
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="h-px bg-gray-200" />

            {/* Progress Indicator */}
            <View className="gap-5">
              <Text className="text-lg font-bold text-gray-900">
                Application Progress
              </Text>

              <View className="bg-primary-50 rounded-2xl p-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 bg-primary-100 rounded-xl items-center justify-center">
                    <Clock size={24} color="#1e8ec2" />
                  </View>
                  <View className="flex-1">
                    {application.status !== 'paid' && (
                      <Text className="text-lg font-semibold text-primary-800">
                        Step {application.currentStep} of 5
                      </Text>
                    )}
                    <Text className="text-base text-primary-600">
                      {getStatusDisplayText(application.status)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="h-px bg-gray-200" />

            {/* Actions */}
            <View className="gap-6">
              <Text className="text-lg font-bold text-gray-900">
                Next Steps
              </Text>

              <View className="gap-4">
                {nextStepAction && (
                  <Button
                    onPress={nextStepAction.action}
                    className="w-full h-auto p-6 rounded-2xl shadow-lg"
                    size="lg"
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                        {nextStepAction.icon}
                      </View>
                      <View className="flex-1 items-start">
                        <Text className="text-lg font-bold text-white">
                          {nextStepAction.label}
                        </Text>
                        <Text className="text-base text-white/90 mt-1">
                          {nextStepAction.description}
                        </Text>
                      </View>
                      <ArrowRight size={20} color="#ffffff" />
                    </View>
                  </Button>
                )}

                <Button
                  onPress={() => router.push('/(country)/turkey/welcome')}
                  variant="outline"
                  className="w-full h-auto p-6 rounded-2xl border-2 border-gray-200"
                  size="lg"
                >
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
                      <FileText size={20} color="#6b7280" />
                    </View>
                    <View className="flex-1 items-start">
                      <Text className="text-lg font-bold text-gray-700">
                        Start New Application
                      </Text>
                      <Text className="text-base text-gray-500 mt-1">
                        Create a new visa application
                      </Text>
                    </View>
                  </View>
                </Button>
              </View>

              {/* Additional Actions */}
              <View className="flex-row gap-4 pt-4">
                <Button
                  title="Need Help?"
                  onPress={() =>
                    Alert.alert(
                      'Contact Support',
                      'Please email support@visacollect.com'
                    )
                  }
                  variant="ghost"
                  className="flex-1 rounded-xl"
                  textClassName="text-base text-gray-600 font-medium"
                />
                <Button
                  title="Print Details"
                  onPress={() =>
                    Alert.alert('Print', 'Print functionality coming soon!')
                  }
                  variant="ghost"
                  className="flex-1 rounded-xl"
                  textClassName="text-base text-gray-600 font-medium"
                />
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
