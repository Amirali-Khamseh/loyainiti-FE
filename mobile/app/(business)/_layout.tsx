import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { LayoutDashboard, ScanLine, UtensilsCrossed, Store } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { auth, type Role } from '../../src/lib/auth';
import { tokens } from '../../src/design-system/tokens';

export default function BusinessLayout() {
  const { data: session, isPending } = auth.useSession();

  if (isPending) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={tokens.colors.action} />
      </View>
    );
  }
  if (!session) return <Redirect href="/(auth)/sign-in" />;

  const role = (session.user as { role?: Role }).role;
  const isStaff = role === 'business_owner' || role === 'staff' || role === 'admin';
  // If a plain customer landed here (e.g. via onboarding flow), let them through the
  // profile page only — that's where they'll create their first business.
  // For other tabs, the BE 403s will surface; we don't redirect.

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tokens.colors.action,
        tabBarInactiveTintColor: tokens.colors.fg3,
        tabBarStyle: { backgroundColor: tokens.colors.bgCard, borderTopColor: tokens.colors.borderSubtle },
        tabBarLabelStyle: { fontFamily: tokens.fonts.body, fontSize: 11 },
        headerStyle: { backgroundColor: tokens.colors.bgCanvas },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: tokens.fonts.display, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
          href: isStaff ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} />,
          href: isStaff ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="menus"
        options={{
          title: 'Menus',
          tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size} />,
          href: isStaff ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: 'Business',
          tabBarIcon: ({ color, size }) => <Store color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
