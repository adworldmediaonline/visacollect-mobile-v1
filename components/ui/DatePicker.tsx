import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Calendar, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';

interface DatePickerProps {
  value?: string;
  onValueChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  className?: string;
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = 'Select date',
  disabled = false,
  minimumDate,
  maximumDate,
  className = '',
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

  const handleOpen = () => {
    if (!disabled) {
      setTempDate(value ? new Date(value) : new Date());
      setShowPicker(true);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedDate) {
        setTempDate(selectedDate);
        onValueChange(format(selectedDate, 'yyyy-MM-dd'));
      }
    } else {
      // iOS - just update the temp date, don't close
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
    onValueChange(format(tempDate, 'yyyy-MM-dd'));
  };

  const handleCancel = () => {
    setShowPicker(false);
    // Reset to original value
    setTempDate(value ? new Date(value) : new Date());
  };

  const getDisplayText = () => {
    if (value) {
      try {
        return format(new Date(value), 'MMM dd, yyyy');
      } catch {
        return placeholder;
      }
    }
    return placeholder;
  };

  return (
    <View className={`w-full ${className}`}>
      {/* Clickable Field */}
      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        className={`
          w-full px-4 py-3
          bg-white border border-gray-300 rounded-lg
          flex-row items-center justify-between
          ${disabled ? 'opacity-50 bg-gray-50' : 'active:bg-gray-50'}
        `}
        style={{ minHeight: 52 }}
      >
        <Text
          className={`text-base flex-1 ${
            value ? 'text-gray-900' : 'text-gray-500'
          }`}
          numberOfLines={1}
        >
          {getDisplayText()}
        </Text>
        <Calendar size={20} color="#6b7280" />
      </TouchableOpacity>

      {/* Modern Date Picker Modal */}
      {showPicker && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl shadow-2xl">
              {/* Modern Header */}
              <View className="relative px-6 py-4 border-b border-gray-100">
                {/* Close Icon */}
                <TouchableOpacity
                  onPress={handleCancel}
                  className="absolute right-4 top-4 w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  style={{ zIndex: 1 }}
                >
                  <X size={16} color="#6b7280" />
                </TouchableOpacity>

                {/* Title */}
                <View className="items-center">
                  <Text className="text-xl font-bold text-gray-900">
                    Select Date
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    Choose your preferred date
                  </Text>
                </View>
              </View>

              {/* Date Picker Container */}
              <View className="px-6 py-6">
                {Platform.OS === 'ios' ? (
                  // iOS - Custom styled picker
                  <View className="bg-gray-50 rounded-2xl p-4">
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      minimumDate={minimumDate}
                      maximumDate={maximumDate}
                      style={{
                        height: 200,
                        backgroundColor: 'transparent',
                      }}
                      textColor="#1f2937"
                    />
                  </View>
                ) : (
                  // Android - Native picker with custom styling
                  <View className="items-center">
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      minimumDate={minimumDate}
                      maximumDate={maximumDate}
                    />
                  </View>
                )}

                {/* Selected Date Preview */}
                <View className="mt-4 bg-primary-50 rounded-xl p-4 border border-primary-200">
                  <Text className="text-sm font-medium text-primary-700 text-center mb-1">
                    Selected Date
                  </Text>
                  <Text className="text-lg font-semibold text-primary-900 text-center">
                    {format(tempDate, 'EEEE, MMMM dd, yyyy')}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mt-6">
                  <TouchableOpacity
                    onPress={handleCancel}
                    className="flex-1 py-3 bg-gray-100 rounded-xl"
                  >
                    <Text className="text-gray-700 font-semibold text-center">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirm}
                    className="flex-1 py-3 bg-primary-600 rounded-xl shadow-lg"
                  >
                    <Text className="text-white font-semibold text-center">
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom Safe Area */}
              <View className="h-6 bg-white rounded-b-3xl" />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
