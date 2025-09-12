import React from 'react';
import { Text, View } from 'react-native';

interface FeeData {
  visaFee: number;
  serviceFee: number;
  totalFee: number;
  duration: string;
  numberOfEntries: string;
  currency: string;
}

interface FeeDisplayProps {
  feeData: FeeData;
  className?: string;
}

export function FeeDisplay({ feeData, className = '' }: FeeDisplayProps) {
  return (
    <View className={`bg-gray-50 rounded-lg p-4 gap-3 ${className}`}>
      <View className="mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          Fee Information
        </Text>
      </View>

      <View className="gap-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-600">Visa Fee:</Text>
          <Text className="font-medium">${feeData.visaFee}</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-gray-600">Service Fee:</Text>
          <Text className="font-medium">${feeData.serviceFee}</Text>
        </View>

        <View className="h-px bg-gray-300 my-2" />

        <View className="flex-row justify-between items-center">
          <Text className="font-semibold text-gray-900">
            Total Estimated Fee:
          </Text>
          <Text className="font-bold text-lg text-primary-600">
            ${feeData.totalFee}
          </Text>
        </View>
      </View>

      <View className="bg-white rounded-lg p-3 gap-1">
        <Text className="text-sm text-gray-500">
          Duration: {feeData.duration}
        </Text>
        <Text className="text-sm text-gray-500">
          Entries: {feeData.numberOfEntries}
        </Text>
        <Text className="text-sm text-gray-500">
          Currency: {feeData.currency}
        </Text>
      </View>

      <Text className="text-xs text-gray-500 mt-2">
        * Final fees may vary. Additional fees may apply for additional
        applicants.
      </Text>
    </View>
  );
}
