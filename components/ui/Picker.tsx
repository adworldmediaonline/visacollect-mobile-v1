import { ChevronDown, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface PickerOption {
  label: string;
  value: string;
}

interface PickerProps {
  options: PickerOption[];
  placeholder?: string;
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function PickerSelect({
  options,
  placeholder = 'Select an option',
  value,
  onValueChange,
  className = '',
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search...',
}: PickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery('');
    }
  };

  const filteredOptions =
    searchable && searchQuery
      ? options.filter(option =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

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
          ${className}
        `}
        style={{ minHeight: 52 }}
      >
        <Text
          className={`text-base flex-1 ${
            selectedOption ? 'text-gray-900' : 'text-gray-500'
          }`}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown
          size={20}
          color="#6b7280"
          style={{
            transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
            transition: 'transform 0.2s ease-in-out',
          }}
        />
      </TouchableOpacity>

      {/* Modal Picker */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center p-4"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <TouchableOpacity
            className="bg-white rounded-xl w-full max-w-md max-h-[80%]"
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping inside
          >
            {/* Header */}
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900 text-center mb-4">
                {placeholder}
              </Text>

              {searchable && (
                <View className="relative">
                  <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                    <Search size={20} color="#6b7280" />
                  </View>
                  <TextInput
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-gray-900 text-base"
                    placeholderTextColor="#9CA3AF"
                    autoFocus={true}
                  />
                </View>
              )}
            </View>

            {/* Options List */}
            <ScrollView
              className="max-h-96"
              showsVerticalScrollIndicator={true}
              bounces={false}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    className={`
                      px-4 py-4 border-b border-gray-100
                      flex-row items-center justify-between
                      ${value === option.value ? 'bg-primary-50' : ''}
                      ${index === 0 ? '' : ''}
                    `}
                  >
                    <Text
                      className={`text-base flex-1 ${
                        value === option.value
                          ? 'text-primary-600 font-medium'
                          : 'text-gray-900'
                      }`}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <View className="w-6 h-6 bg-primary-600 rounded-full items-center justify-center ml-3">
                        <Text className="text-white text-sm font-bold">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View className="px-4 py-8 items-center">
                  <Text className="text-gray-500 text-center">
                    No results found for "{searchQuery}"
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View className="p-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                className="w-full py-3 bg-gray-100 rounded-lg"
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
