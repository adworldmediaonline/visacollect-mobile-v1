import { Check } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface Step {
  id: string;
  label: string;
  labelShort: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
  className?: string;
}

export function ProgressIndicator({
  steps,
  currentStep,
  completedSteps,
  className = '',
}: ProgressIndicatorProps) {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <View className={`bg-white rounded-lg p-4 ${className}`}>
      <View className="flex-row items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;

          return (
            <View key={step.id} className="flex-1 items-center">
              {/* Step Circle */}
              <View
                className={`
                  w-8 h-8 rounded-full items-center justify-center mb-2
                  ${
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                        ? 'bg-primary-600'
                        : isPast
                          ? 'bg-gray-300'
                          : 'bg-gray-200'
                  }
                `}
              >
                {isCompleted ? (
                  <Check size={16} color="#ffffff" />
                ) : (
                  <Text
                    className={`
                      text-sm font-bold
                      ${
                        isCompleted || isCurrent
                          ? 'text-white'
                          : 'text-gray-600'
                      }
                    `}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>

              {/* Step Label */}
              <Text
                className={`
                  text-xs text-center
                  ${isCurrent ? 'font-semibold text-primary-600' : 'text-gray-600'}
                `}
                numberOfLines={1}
              >
                {step.labelShort}
              </Text>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <View
                  className={`
                    absolute top-4 left-1/2 w-full h-px
                    ${isPast || isCompleted ? 'bg-primary-600' : 'bg-gray-300'}
                  `}
                  style={{ zIndex: -1 }}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
