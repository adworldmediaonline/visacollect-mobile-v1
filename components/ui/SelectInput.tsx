import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Modal, Text, TouchableOpacity } from 'react-native';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  className?: string;
  error?: string;
  disabled?: boolean;
}

export function SelectInput({
  placeholder = 'Select an option',
  value,
  onValueChange,
  options,
  className = '',
  error,
  disabled = false,
}: SelectInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`
          w-full px-4 py-3
          bg-white border border-gray-300 rounded-lg
          flex-row items-center justify-between
          ${disabled ? 'opacity-50 bg-gray-50' : ''}
          ${error ? 'border-error-500' : 'focus:border-primary-500'}
          ${className}
        `}
        activeOpacity={0.8}
      >
        <Text
          className={`
            text-base
            ${selectedOption ? 'text-gray-900' : 'text-gray-500'}
          `}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>

      {error && (
        <Text className="text-error-600 text-sm mt-1 ml-1">{error}</Text>
      )}

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <TouchableOpacity
            className="bg-white rounded-lg w-11/12 max-h-96"
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping inside
          >
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  className={`
                    px-4 py-3 border-b border-gray-100
                    ${item.value === value ? 'bg-primary-50' : ''}
                  `}
                >
                  <Text
                    className={`
                      text-base
                      ${item.value === value ? 'text-primary-700 font-medium' : 'text-gray-900'}
                    `}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
