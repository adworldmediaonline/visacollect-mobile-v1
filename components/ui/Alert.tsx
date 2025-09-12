import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  className?: string;
}

interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function Alert({
  children,
  variant = 'default',
  className = '',
}: AlertProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-50 border-red-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <View
      className={`rounded-lg border p-4 ${getVariantStyles()} ${className}`}
    >
      {children}
    </View>
  );
}

export function AlertTitle({ children, className = '' }: AlertTitleProps) {
  return (
    <Text className={`text-sm font-semibold mb-1 ${className}`}>
      {children}
    </Text>
  );
}

export function AlertDescription({
  children,
  className = '',
}: AlertDescriptionProps) {
  return <Text className={`text-sm ${className}`}>{children}</Text>;
}

// Helper components for different alert types
export function AlertError({ children, className = '' }: AlertProps) {
  return (
    <Alert variant="destructive" className={className}>
      <View className="flex-row items-start gap-3">
        <XCircle size={20} color="#dc2626" />
        <View className="flex-1">{children}</View>
      </View>
    </Alert>
  );
}

export function AlertSuccess({ children, className = '' }: AlertProps) {
  return (
    <Alert variant="success" className={className}>
      <View className="flex-row items-start gap-3">
        <CheckCircle size={20} color="#16a34a" />
        <View className="flex-1">{children}</View>
      </View>
    </Alert>
  );
}

export function AlertWarning({ children, className = '' }: AlertProps) {
  return (
    <Alert variant="warning" className={className}>
      <View className="flex-row items-start gap-3">
        <AlertTriangle size={20} color="#ca8a04" />
        <View className="flex-1">{children}</View>
      </View>
    </Alert>
  );
}

export function AlertInfo({ children, className = '' }: AlertProps) {
  return (
    <Alert variant="default" className={className}>
      <View className="flex-row items-start gap-3">
        <Info size={20} color="#1e8ec2" />
        <View className="flex-1">{children}</View>
      </View>
    </Alert>
  );
}
