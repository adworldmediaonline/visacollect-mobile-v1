import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  textClassName?: string;
}

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  textClassName = '',
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 active:bg-primary-700';
      case 'secondary':
        return 'bg-secondary-600 active:bg-secondary-700';
      case 'outline':
        return 'border border-primary-600 bg-transparent active:bg-primary-50';
      case 'ghost':
        return 'bg-transparent active:bg-gray-100';
      default:
        return 'bg-primary-600 active:bg-primary-700';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 min-h-10';
      case 'md':
        return 'px-4 py-3 min-h-12';
      case 'lg':
        return 'px-6 py-4 min-h-14';
      default:
        return 'px-4 py-3 min-h-12';
    }
  };

  const getTextStyles = () => {
    const baseStyles = 'text-center font-medium';
    switch (variant) {
      case 'primary':
        return `${baseStyles} text-white`;
      case 'secondary':
        return `${baseStyles} text-white`;
      case 'outline':
        return `${baseStyles} text-primary-600`;
      case 'ghost':
        return `${baseStyles} text-primary-600`;
      default:
        return `${baseStyles} text-white`;
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        rounded-lg items-center justify-center
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost' ? '#2563eb' : '#ffffff'
          }
        />
      ) : (
        <Text
          className={`
            ${getTextStyles()}
            ${getTextSizeStyles()}
            ${textClassName}
          `}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
