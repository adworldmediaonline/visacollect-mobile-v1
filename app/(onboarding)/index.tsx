import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MapPin, Plane, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { SelectInput } from '../../components/ui/SelectInput';

import { getCountryOptions } from '../../lib/countries';
import { useOnboardingStore } from '../../stores/onboardingStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { setSelectedCountry: setStoreCountry, completeOnboarding } =
    useOnboardingStore();

  const countryOptions = getCountryOptions();

  const handleContinue = async () => {
    if (!selectedCountry) return;

    setIsLoading(true);

    try {
      // Store the selected country
      setStoreCountry(selectedCountry);
      completeOnboarding();

      // Navigate to the country-specific welcome screen
      if (selectedCountry === 'TR') {
        router.push('/(country)/turkey/welcome');
      }
    } catch (error) {
      console.error('Error during onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 via-white to-accent-50">
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
        {/* Hero Section */}
        <View className="items-center mb-12">
          {/* Animated Icon Container */}
          <View className="relative mb-8">
            <View className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl items-center justify-center shadow-xl">
              <Plane size={40} color="#ffffff" />
            </View>
            {/* Decorative elements */}
            <View className="absolute -top-2 -right-2 w-8 h-8 bg-accent-400 rounded-full items-center justify-center">
              <Sparkles size={16} color="#ffffff" />
            </View>
            <View className="absolute -bottom-1 -left-1 w-6 h-6 bg-success-400 rounded-full opacity-80" />
          </View>

          {/* Logo Section */}
          <View className="items-center mb-6">
            <Image
              source={require('../../assets/images/logo/logo.png')}
              className="w-64 h-20"
              resizeMode="contain"
              alt="VisaCollect Logo"
            />
          </View>

          {/* Subtitle */}
          <View className="items-center gap-2">
            <Text className="text-xl font-medium text-text-secondary text-center px-4">
              Your gateway to international travel
            </Text>
            <Text className="text-base text-text-muted text-center px-6">
              Apply for visas with confidence and ease
            </Text>
          </View>
        </View>

        {/* Main Card */}
        <Card className="w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-6">
            <View className="items-center gap-4">
              <View className="w-12 h-12 bg-primary-100 rounded-2xl items-center justify-center">
                <MapPin size={24} color="#2563eb" />
              </View>
              <View className="items-center gap-2">
                <CardTitle className="text-2xl font-bold text-text-primary text-center">
                  Choose Your Destination
                </CardTitle>
                <CardDescription className="text-base text-text-secondary text-center px-4">
                  Select the country where you'd like to apply for a visa
                </CardDescription>
              </View>
            </View>
          </CardHeader>

          <CardContent className="gap-6">
            {/* Country Selection */}
            <View className="gap-3">
              <Text className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Destination Country
              </Text>
              <SelectInput
                placeholder="Select your destination country"
                value={selectedCountry}
                onValueChange={setSelectedCountry}
                options={countryOptions}
                className="rounded-2xl border-2 border-gray-200 focus:border-primary-400"
              />
            </View>

            {/* Continue Button */}
            <View className="gap-4">
              <Button
                title={isLoading ? 'Preparing...' : 'Continue'}
                onPress={handleContinue}
                loading={isLoading}
                disabled={!selectedCountry || isLoading}
                className="w-full min-h-14 rounded-2xl shadow-lg"
                size="lg"
                textClassName="text-base font-semibold"
              />

              {/* Helper Text */}
              <View className="items-center gap-2">
                <Text className="text-sm text-text-muted text-center">
                  By continuing, you'll be taken to your country's visa
                  application portal
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Footer */}
        <View className="items-center mt-8 mb-6 gap-3">
          <View className="flex-row items-center gap-2 px-4 py-2 bg-primary-50 rounded-full">
            <Text className="text-sm font-medium text-primary-700">
              🌟 More countries coming soon
            </Text>
          </View>

          <Text className="text-xs text-text-muted text-center px-6">
            Secure • Fast • Reliable visa processing
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
