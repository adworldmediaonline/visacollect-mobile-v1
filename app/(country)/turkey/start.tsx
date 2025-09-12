import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';

export default function TurkeyStartScreen() {
  const router = useRouter();

  const handleContinue = () => {
    // Navigate to the actual application form
    // For now, just go back to welcome
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
              Start Your Application
            </CardTitle>
            <CardDescription className="text-text-secondary text-center">
              Begin your Turkey visa application process
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              title="Continue"
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
