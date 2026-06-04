import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { auth, type Role } from '../src/lib/auth';
import { tokens } from '../src/design-system/tokens';

/** Landing route — sends signed-in users to the right group, signed-out users to (auth). */
export default function Index() {
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

  return <Redirect href={isStaff ? '/(business)/dashboard' : '/(customer)/explore'} />;
}
