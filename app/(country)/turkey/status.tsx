import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';

export default function TurkeyStatusScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const handleContinue = () => {
    // Navigate to continue the application
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <StatusBar style="dark" backgroundColor="#ffffff" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Card className="w-full">
          <CardHeader className="items-center">
            <CardTitle className="text-2xl font-bold text-text-primary text-center">
              Application Status
            </CardTitle>
            <CardDescription className="text-text-secondary text-center">
              Application ID: {id}
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-4">
            <View className="bg-success-50 border border-success-200 rounded-lg p-4">
              <Text className="text-success-800 font-medium text-center">
                Application Found!
              </Text>
              <Text className="text-success-700 text-center text-sm mt-1">
                You can continue your application from where you left off.
              </Text>
            </View>

            <Button
              title="Continue Application"
              onPress={handleContinue}
              className="w-full"
              size="lg"
            />
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
