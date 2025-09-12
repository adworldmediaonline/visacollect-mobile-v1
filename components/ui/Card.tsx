import React from 'react';
import { Text, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function Card({ children, className = '', style }: CardProps) {
  return (
    <View
      className={`bg-white rounded-xl shadow-md border border-gray-200 ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <View className={`p-6 pb-4 ${className}`}>{children}</View>;
}

export function CardContent({ children, className = '' }: CardProps) {
  return <View className={`p-6 pt-0 ${className}`}>{children}</View>;
}

export function CardTitle({ children, className = '' }: CardProps) {
  return (
    <Text className={`text-2xl font-bold text-gray-900 mb-2 ${className}`}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, className = '' }: CardProps) {
  return (
    <Text className={`text-gray-600 text-base ${className}`}>{children}</Text>
  );
}
