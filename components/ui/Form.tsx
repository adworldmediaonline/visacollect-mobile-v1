import React from 'react';
import { Text, View } from 'react-native';

interface FormProps {
  children: React.ReactNode;
  className?: string;
}

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

interface FormLabelProps {
  children: React.ReactNode;
  className?: string;
}

interface FormControlProps {
  children: React.ReactNode;
  className?: string;
}

interface FormMessageProps {
  children?: React.ReactNode;
  className?: string;
}

export function Form({ children, className = '' }: FormProps) {
  return <View className={`gap-4 ${className}`}>{children}</View>;
}

export function FormField({ children, className = '' }: FormFieldProps) {
  return <View className={className}>{children}</View>;
}

export function FormItem({ children, className = '' }: FormItemProps) {
  return <View className={`gap-2 ${className}`}>{children}</View>;
}

export function FormLabel({ children, className = '' }: FormLabelProps) {
  return (
    <Text className={`text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </Text>
  );
}

export function FormControl({ children, className = '' }: FormControlProps) {
  return <View className={className}>{children}</View>;
}

export function FormMessage({ children, className = '' }: FormMessageProps) {
  if (!children) return null;

  return (
    <Text className={`text-sm text-red-600 ${className}`}>{children}</Text>
  );
}
