import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  onPress?: () => void;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  // Extract DialogTrigger and DialogContent from children
  const trigger = React.Children.toArray(children).find(
    (child: any) => child?.type?.name === 'DialogTrigger'
  );

  const content = React.Children.toArray(children).find(
    (child: any) => child?.type?.name === 'DialogContent'
  );

  return (
    <>
      {trigger}
      {open && content && (
        <Modal
          visible={open}
          transparent={true}
          animationType="fade"
          onRequestClose={() => onOpenChange(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-center items-center p-4"
            activeOpacity={1}
            onPress={() => onOpenChange(false)}
          >
            <TouchableOpacity
              className="bg-white rounded-xl w-full max-w-md"
              activeOpacity={1}
              onPress={() => {}} // Prevent closing when tapping inside
            >
              {content}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}

export function DialogTrigger({
  children,
  asChild,
  onPress,
}: DialogTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    const existingOnPress = (children.props as any)?.onPress;
    return React.cloneElement(children, {
      ...(children.props as any),
      onPress: existingOnPress || onPress,
    });
  }
  return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>;
}

export function DialogContent({
  children,
  className = '',
}: DialogContentProps) {
  return <View className={`p-6 ${className}`}>{children}</View>;
}

export function DialogHeader({ children, className = '' }: DialogHeaderProps) {
  return <View className={`mb-4 ${className}`}>{children}</View>;
}

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
  return (
    <Text className={`text-xl font-bold text-gray-900 mb-2 ${className}`}>
      {children}
    </Text>
  );
}

export function DialogDescription({
  children,
  className = '',
}: DialogDescriptionProps) {
  return (
    <Text className={`text-gray-600 text-base ${className}`}>{children}</Text>
  );
}
