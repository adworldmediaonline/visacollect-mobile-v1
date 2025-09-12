'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertCircle, Plane } from 'lucide-react-native';
import { Button } from '../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/Dialog';

import {
  useCheckApplicationStatus,
  useStartApplication,
} from '../../../hooks/useTurkeyVisa';
import { CheckStatusFormData, checkStatusSchema } from '../../../lib/schemas';
import { useApplicationStore } from '../../../stores/applicationStore';

export default function TurkeyWelcomeScreen() {
  const router = useRouter();
  const [isCheckStatusOpen, setIsCheckStatusOpen] = useState(false);
  const [applicationId, setApplicationIdInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = React.useRef<TextInput>(null);

  const {
    setApplicationId,
    setEmail,
    setCurrentStep,
    setStatus,
    resetApplication,
  } = useApplicationStore();

  const startApplicationMutation = useStartApplication();
  const checkStatusMutation = useCheckApplicationStatus();

  const checkStatusForm = useForm<CheckStatusFormData>({
    resolver: zodResolver(checkStatusSchema),
    defaultValues: {
      applicationId: '',
    },
  });

  const handleStartApplication = () => {
    resetApplication();
    router.push('/(country)/turkey/start');
  };

  const handleCheckStatus = async () => {
    if (!applicationId.trim()) {
      setErrorMessage('Please enter an application ID');
      return;
    }

    // Clear previous error message
    setErrorMessage('');

    // Trigger the mutation
    checkStatusMutation.mutate({ applicationId });
  };

  // Handle mutation success
  useEffect(() => {
    if (checkStatusMutation.isSuccess) {
      setIsCheckStatusOpen(false);
      setApplicationIdInput('');
      setErrorMessage('');
    }
  }, [checkStatusMutation.isSuccess]);

  // Handle mutation error
  useEffect(() => {
    if (checkStatusMutation.isError) {
      // Navigate to status screen with error state
      setIsCheckStatusOpen(false);
      setApplicationIdInput('');
      setErrorMessage('');
      // Navigate to status screen with the invalid ID to show "not found" state
      router.push(
        `/(country)/turkey/status?id=${encodeURIComponent(applicationId)}&error=not_found`
      );
    }
  }, [checkStatusMutation.isError, applicationId, router]);

  const handleModalOpenChange = (open: boolean) => {
    setIsCheckStatusOpen(open);
    // Clear any previous application data and error messages when modal opens
    if (open) {
      resetApplication();
      setErrorMessage('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Clear everything when modal closes
      setApplicationIdInput('');
      setErrorMessage('');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 to-primary-100">
      <StatusBar style="dark" backgroundColor="#eff6ff" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Card className="w-full shadow-xl border-0">
          <CardHeader className="items-center">
            <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-4">
              <Plane size={32} color="#1e8ec2" />
            </View>
            <CardTitle className="text-2xl font-bold text-text-primary text-center">
              Turkey Visa Application
            </CardTitle>
            <CardDescription className="text-text-secondary text-center text-base">
              Apply for your Turkey e-Visa quickly and securely
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-4">
            <Button
              title="Start Application"
              onPress={handleStartApplication}
              loading={startApplicationMutation.isPending}
              className="w-full"
              size="lg"
            />

            <Dialog
              open={isCheckStatusOpen}
              onOpenChange={handleModalOpenChange}
            >
              <DialogTrigger asChild>
                <Button
                  title="Check Status"
                  onPress={() => setIsCheckStatusOpen(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                />
              </DialogTrigger>

              <DialogContent className="sm:max-w-md bg-white rounded-3xl shadow-2xl border-0">
                <DialogHeader className="items-center pb-6">
                  <View className="w-12 h-12 bg-primary-100 rounded-2xl items-center justify-center mb-4">
                    <Plane size={24} color="#1e8ec2" />
                  </View>
                  <DialogTitle className="text-2xl font-bold text-text-primary text-center">
                    Check Application Status
                  </DialogTitle>
                  <DialogDescription className="text-base text-text-secondary text-center px-4 mt-2">
                    Enter your application ID to check the status and continue
                    your application.
                  </DialogDescription>
                </DialogHeader>

                <View className="gap-4">
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Application ID
                    </Text>
                    <TextInput
                      ref={inputRef}
                      placeholder="e.g., TUR-A1B2C3D4"
                      value={applicationId}
                      onChangeText={text => {
                        setApplicationIdInput(text.toUpperCase());
                        // Clear error message when user starts typing
                        if (errorMessage) {
                          setErrorMessage('');
                        }
                      }}
                      autoCapitalize="characters"
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 text-base ${
                        errorMessage ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {errorMessage && (
                    <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <View className="flex-row items-center">
                        <AlertCircle size={16} color="#dc2626" />
                        <Text className="text-red-600 text-sm ml-2 flex-1">
                          {errorMessage}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View className="flex-row gap-3 pt-6">
                    <Button
                      title="Cancel"
                      onPress={() => {
                        setIsCheckStatusOpen(false);
                        setApplicationIdInput('');
                        setErrorMessage('');
                      }}
                      variant="outline"
                      className="flex-1 rounded-2xl border-2 border-gray-200"
                      textClassName="text-gray-600 font-semibold"
                    />
                    <Button
                      title={
                        checkStatusMutation.isPending
                          ? 'Checking...'
                          : 'Check Status'
                      }
                      onPress={handleCheckStatus}
                      loading={checkStatusMutation.isPending}
                      className="flex-1 rounded-2xl shadow-lg"
                      textClassName="font-semibold"
                    />
                  </View>
                </View>
              </DialogContent>
            </Dialog>

            <View className="pt-6 border-t border-gray-200 gap-3">
              <View className="bg-primary-50 rounded-2xl p-4">
                <Text className="text-sm font-medium text-primary-700 text-center mb-1">
                  📞 Need help? Contact our support team
                </Text>
                <Text className="text-xs text-primary-600 text-center">
                  Processing time: 1-2 business days
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
