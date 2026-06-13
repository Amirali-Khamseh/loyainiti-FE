import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Compass, QrCode, History, UserCircle } from 'lucide-react-native';
import { auth } from '../../src/lib/auth';
import { tokens } from '../../src/design-system/tokens';
import { ActivityIndicator, Image, View } from 'react-native';

const Logo = () => (
  <Image
    source={require('../../src/design-system/assets/Logo_final.png')}
    style={{ height: 32, width: 140, backgroundColor: 'transparent' }}
    resizeMode="contain"
  />
);

export default function CustomerLayout() {
  const { data: session, isPending } = auth.useSession();

  if (isPending) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={tokens.colors.action} />
      </View>
    );
  }
  if (!session) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tokens.colors.action,
        tabBarInactiveTintColor: tokens.colors.fg3,
        tabBarStyle: { backgroundColor: tokens.colors.bgCard, borderTopColor: tokens.colors.borderSubtle },
        tabBarLabelStyle: { fontFamily: tokens.fonts.body, fontSize: 11 },
        headerStyle: { backgroundColor: tokens.colors.bgCanvas },
        headerTintColor: tokens.colors.fg1,
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: tokens.fonts.body, fontWeight: '600', color: tokens.colors.fg1 },
        headerTitle: () => <Logo />,
        sceneStyle: { backgroundColor: tokens.colors.bgCanvas },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{ title: 'Explore', tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="my-qr"
        options={{ title: 'My QR', tabBarIcon: ({ color, size }) => <QrCode color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="visits"
        options={{ title: 'Visits', tabBarIcon: ({ color, size }) => <History color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="shop/[slug]" options={{ href: null, title: 'Shop' }} />
      <Tabs.Screen name="categories/[mainSlug]" options={{ href: null, title: 'Category' }} />
    </Tabs>
  );
}
