import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface InputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  placeholder,
  value,
  onChangeText,
  className = '',
  error,
  disabled = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
}: InputProps) {
  return (
    <View className="w-full">
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        className={`
          w-full px-4 py-3
          bg-white border border-gray-300 rounded-lg
          text-gray-900 text-base
          ${disabled ? 'opacity-50 bg-gray-50' : ''}
          ${error ? 'border-error-500' : 'focus:border-primary-500'}
          ${className}
        `}
        placeholderTextColor="#9CA3AF"
      />
      {error && (
        <Text className="text-error-600 text-sm mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
