import React from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts as useInterTight, InterTight_400Regular, InterTight_500Medium, InterTight_600SemiBold, InterTight_700Bold } from '@expo-google-fonts/inter-tight';
import { useFonts as useMono, JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono';
import { View, ActivityIndicator } from 'react-native';
import { queryClient } from '../src/lib/queryClient';
import { tokens } from '../src/design-system/tokens';

export default function RootLayout() {
  const [interTight] = useInterTight({ InterTight: InterTight_400Regular, InterTight_500Medium, InterTight_600SemiBold, InterTight_700Bold });
  const [mono] = useMono({ JetBrainsMono: JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_600SemiBold });

  if (!interTight || !mono) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.colors.bgCanvas }}>
        <ActivityIndicator color={tokens.colors.action} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor={tokens.colors.bgCanvas} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: tokens.colors.bgCanvas },
            headerTintColor: tokens.colors.fg1,
            headerShadowVisible: false,
            headerTitleStyle: { fontFamily: tokens.fonts.body, fontSize: 18, fontWeight: '600', color: tokens.colors.fg1 },
            contentStyle: { backgroundColor: tokens.colors.bgCanvas },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(customer)" options={{ headerShown: false }} />
          <Stack.Screen name="(business)" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
