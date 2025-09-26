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
  // Helper function to safely format dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start flex-1">
          <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-4">
            <Users size={20} color="#1e8ec2" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-gray-900 text-lg mb-1">
              {applicant.givenNames || 'N/A'} {applicant.surname || 'N/A'}
            </Text>
            <View className="gap-1">
              <Text className="text-sm text-gray-600">
                📄 Passport: {applicant.passportNumber || 'N/A'}
              </Text>
              <Text className="text-sm text-gray-600">
                📅 DOB: {formatDate(applicant.dateOfBirth)}
              </Text>
              <Text className="text-sm text-gray-600">
                ✈️ Arrival: {formatDate(applicant.arrivalDate)}
              </Text>
              <Text className="text-sm text-gray-600">
                📋 Documents:{' '}
                {applicant.documents?.supportingDocuments?.length || 0}{' '}
                supporting
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-2 ml-4">
          <TouchableOpacity
            onPress={onEdit}
            disabled={isUpdating}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isUpdating ? 'bg-gray-100' : 'bg-primary-100'
            }`}
          >
            {isUpdating ? (
              <View className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Edit size={18} color="#1e8ec2" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            disabled={isDeleting}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isDeleting ? 'bg-gray-100' : 'bg-red-100'
            }`}
          >
            {isDeleting ? (
              <View className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={18} color="#dc2626" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
