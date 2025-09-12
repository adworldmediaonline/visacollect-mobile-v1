import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  ExternalLink,
  Mail,
  Receipt,
  Shield,
  X,
} from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { useGetPaymentByApplicationId } from '../../../hooks/useTurkeyVisa';

interface PaymentData {
  paymentId: string;
  applicationId: string;
  transactionId: string;
  status: string;
  amount: number | { $numberDecimal: string };
  currency: string;
  provider: string;
  payerEmail: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export default function PaymentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentData | null>(null);

  const getPaymentMutation = useGetPaymentByApplicationId(id || '');

  useEffect(() => {
    if (id) {
      getPaymentMutation.mutate();
    }
  }, [id]);

  useEffect(() => {
    if (getPaymentMutation.isSuccess && getPaymentMutation.data) {
      setPayment(getPaymentMutation.data.data);
    }
  }, [getPaymentMutation.isSuccess, getPaymentMutation.data]);

  useEffect(() => {
    if (getPaymentMutation.isError) {
      Alert.alert(
        'Error',
        'Failed to load payment details. Please try again.',
        [
          {
            text: 'Go Back',
            onPress: () => router.push('/(country)/turkey/welcome'),
          },
        ]
      );
    }
  }, [getPaymentMutation.isError, router]);

  const formatCurrency = (amount: any, currency: string = 'USD') => {
    // Handle MongoDB Decimal128 format
    const numericAmount =
      typeof amount === 'object' && amount.$numberDecimal
        ? parseFloat(amount.$numberDecimal)
        : typeof amount === 'number'
          ? amount
          : parseFloat(amount);

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(numericAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'created':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return <CheckCircle size={20} color="#16a34a" />;
      case 'pending':
      case 'created':
        return <CreditCard size={20} color="#ca8a04" />;
      case 'failed':
      case 'cancelled':
        return <X size={20} color="#dc2626" />;
      default:
        return <CreditCard size={20} color="#6b7280" />;
    }
  };

  if (getPaymentMutation.isPending) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 to-primary-100">
        <StatusBar style="dark" backgroundColor="#eff6ff" />
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">
            Loading payment details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!payment) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 to-primary-100">
        <StatusBar style="dark" backgroundColor="#eff6ff" />
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
            <X size={32} color="#dc2626" />
          </View>
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            Payment Not Found
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            We couldn't find payment details for this application.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.push('/(country)/turkey/welcome')}
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
      <View className="flex-row items-center justify-between px-6 py-4 bg-white ">
        <TouchableOpacity
          onPress={() => router.push('/(country)/turkey/welcome')}
          className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center"
        >
          <ArrowLeft size={20} color="#1e8ec2" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Payment Details
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }}
      >
        {/* Payment Status Card */}
        <Card className="w-full shadow-lg border-0 mb-6">
          <CardHeader className="items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              {getStatusIcon(payment.status)}
            </View>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">
              Payment Successful
            </CardTitle>
            <View
              className={`px-3 py-1 rounded-full mt-2 ${getStatusColor(payment.status)}`}
            >
              <Text className="text-sm font-medium capitalize">
                {payment.status}
              </Text>
            </View>
          </CardHeader>
        </Card>

        {/* Payment Information */}
        <Card className="w-full shadow-lg border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex-row items-center">
              <Receipt size={20} color="#1e8ec2" className="mr-2" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600">Amount Paid</Text>
              <Text className="text-xl font-bold text-gray-900">
                {formatCurrency(payment.amount, payment.currency)}
              </Text>
            </View>
            <View className="h-px bg-gray-200" />
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600">Payment Method</Text>
              <View className="flex-row items-center">
                <CreditCard size={16} color="#6b7280" className="mr-1" />
                <Text className="text-gray-900 font-medium">
                  {payment.paymentMethod || 'PayPal'}
                </Text>
              </View>
            </View>
            <View className="h-px bg-gray-200" />
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600">Transaction ID</Text>
              <Text className="text-gray-900 font-mono text-sm">
                {payment.transactionId || payment.paymentId}
              </Text>
            </View>
            <View className="h-px bg-gray-200" />
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600">Application ID</Text>
              <Text className="text-gray-900 font-mono text-sm">
                {payment.applicationId}
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Payment Timeline */}
        <Card className="w-full shadow-lg border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex-row items-center">
              <Calendar size={20} color="#1e8ec2" className="mr-2" />
              Payment Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row items-start gap-4">
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mt-1">
                <CheckCircle size={16} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">
                  Payment Completed
                </Text>
                <Text className="text-gray-600 text-sm">
                  {formatDate(payment.updatedAt)}
                </Text>
              </View>
            </View>
            <View className="ml-4 w-px h-4 bg-gray-200" />
            <View className="flex-row items-start gap-4">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mt-1">
                <CreditCard size={16} color="#1e8ec2" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">
                  Payment Initiated
                </Text>
                <Text className="text-gray-600 text-sm">
                  {formatDate(payment.createdAt)}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card className="w-full shadow-lg border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex-row items-center">
              <Shield size={20} color="#1e8ec2" className="mr-2" />
              Security & Support
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="bg-green-50 rounded-lg p-4">
              <View className="flex-row items-center mb-2">
                <Shield size={16} color="#16a34a" />
                <Text className="text-green-800 font-medium ml-2">
                  Secure Payment
                </Text>
              </View>
              <Text className="text-green-700 text-sm">
                Your payment was processed securely through {payment.provider}.
                All transactions are encrypted and protected.
              </Text>
            </View>
            <View className="bg-blue-50 rounded-lg p-4">
              <View className="flex-row items-center mb-2">
                <Mail size={16} color="#1e8ec2" />
                <Text className="text-blue-800 font-medium ml-2">
                  Receipt Sent
                </Text>
              </View>
              <Text className="text-blue-700 text-sm">
                A payment receipt has been sent to {payment.payerEmail}
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <View className="gap-4 mb-8">
          <Button
            onPress={() =>
              Alert.alert('Receipt', 'Receipt download coming soon!')
            }
            variant="outline"
            className="w-full"
          >
            <View className="flex-row items-center justify-center gap-2">
              <Download size={20} color="#1e8ec2" />
              <Text className="text-primary-600 font-semibold">
                Download Receipt
              </Text>
            </View>
          </Button>
          <Button
            onPress={() =>
              router.push(
                `/(country)/turkey/status?id=${payment.applicationId}`
              )
            }
            className="w-full"
          >
            <View className="flex-row items-center justify-center gap-2">
              <ExternalLink size={20} color="#ffffff" />
              <Text className="text-white font-semibold">
                View Application Status
              </Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
