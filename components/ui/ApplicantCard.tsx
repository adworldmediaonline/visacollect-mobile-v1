import { Edit, Trash2, Users } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ApplicantCardProps {
  applicant: any;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

export function ApplicantCard({
  applicant,
  index,
  onEdit,
  onDelete,
  isDeleting,
  isUpdating,
}: ApplicantCardProps) {
  return (
    <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mb-3">
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
          <Users size={20} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-gray-900 text-base">
            {applicant.givenNames} {applicant.surname}
          </Text>
          <Text className="text-sm text-gray-600">
            Passport: {applicant.passportNumber}
          </Text>
          <Text className="text-sm text-gray-600">
            DOB: {new Date(applicant.dateOfBirth).toLocaleDateString()}
          </Text>
          <Text className="text-sm text-gray-600">
            Arrival:{' '}
            {applicant.arrivalDate
              ? new Date(applicant.arrivalDate).toLocaleDateString()
              : 'Not set'}
          </Text>
          <Text className="text-sm text-gray-600">
            Documents: {applicant.documents?.supportingDocuments?.length || 0}{' '}
            supporting
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={onEdit}
          disabled={isUpdating}
          className={`w-8 h-8 rounded-full items-center justify-center ${
            isUpdating ? 'bg-gray-100' : 'bg-blue-100'
          }`}
        >
          {isUpdating ? (
            <View className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Edit size={16} color="#2563eb" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          disabled={isDeleting}
          className={`w-8 h-8 rounded-full items-center justify-center ${
            isDeleting ? 'bg-gray-100' : 'bg-red-100'
          }`}
        >
          {isDeleting ? (
            <View className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 size={16} color="#dc2626" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
