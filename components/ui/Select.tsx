import { ChevronDown, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function Select({
  placeholder = 'Select an option',
  value,
  onValueChange,
  options,
  disabled = false,
  className = '',
  searchable = false,
  searchPlaceholder = 'Search...',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onValueChange?.(optionValue);
    setIsOpen(false);
    setSearchQuery(''); // Clear search when selecting
  };

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery(''); // Clear search when opening
    }
  };

  const filteredOptions =
    searchable && searchQuery
      ? options.filter(option =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

  return (
    <>
      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        className={`
          w-full px-4 py-3
          bg-white border border-gray-300 rounded-lg
          flex-row items-center justify-between
          ${disabled ? 'opacity-50 bg-gray-50' : ''}
          ${className}
        `}
      >
        <Text
          className={`text-base ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color="#6b7280" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="bg-white rounded-t-3xl max-h-96">
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
            <View className="max-h-80">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    className={`
                    px-4 py-4 border-b border-gray-100
                    flex-row items-center justify-between
                    ${selectedValue === option.value ? 'bg-primary-50' : ''}
                  `}
                  >
                    <Text
                      className={`text-base ${selectedValue === option.value ? 'text-primary-600 font-medium' : 'text-gray-900'}`}
                    >
                      {option.label}
                    </Text>
                    {selectedValue === option.value && (
                      <View className="w-6 h-6 bg-primary-600 rounded-full items-center justify-center">
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
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
