import React from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts as useFraunces, Fraunces_400Regular, Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { useFonts as useRoboto, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { useFonts as useMono, JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono';
import { View, ActivityIndicator } from 'react-native';
import { queryClient } from '../src/lib/queryClient';
import { tokens } from '../src/design-system/tokens';

export default function RootLayout() {
  const [fraunces] = useFraunces({ Fraunces: Fraunces_400Regular, Fraunces_600SemiBold, Fraunces_700Bold });
  const [roboto] = useRoboto({ Roboto: Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  const [mono] = useMono({ JetBrainsMono: JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_600SemiBold });

  if (!fraunces || !roboto || !mono) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.colors.bgCanvas }}>
        <ActivityIndicator color={tokens.colors.action} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerTintColor: '#052698',
            headerShadowVisible: true,
            headerTitleStyle: { fontFamily: tokens.fonts.body, fontSize: 18, fontWeight: '600', color: '#052698' },
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
