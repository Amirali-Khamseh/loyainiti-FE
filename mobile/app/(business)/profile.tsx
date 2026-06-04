import React, { useEffect, useState } from 'react';
import { ScrollView, View, Switch, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../src/lib/api';
import { getActiveBusinessId, setActiveBusinessId } from '../../src/lib/activeBusiness';
import { auth } from '../../src/lib/auth';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Card } from '../../src/components/Card';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

type Business = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  isPublished: boolean;
};

export default function ProfileScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveBusinessId().then((id) => {
      setBusinessId(id);
      setLoading(false);
    });
  }, []);

  // ----- Onboarding path ----------------------------------------
  const [draft, setDraft] = useState({ name: '', description: '', address: '' });
  const create = useMutation({
    mutationFn: () => api<Business>('/api/businesses', { method: 'POST', body: draft }),
    onSuccess: async (b) => {
      await setActiveBusinessId(b.id);
      setBusinessId(b.id);
      // Force a session refresh so the role-promotion (customer → business_owner) is picked up.
      router.replace('/(business)/dashboard');
    },
    onError: (e) =>
      Alert.alert('Could not create', e instanceof ApiError ? e.message : String(e)),
  });

  // ----- Edit path ----------------------------------------------
  const biz = useQuery({
    queryKey: ['business-self', businessId],
    queryFn: async () => {
      const list = await api<Business[]>('/api/businesses');
      return list.find((b) => b.id === businessId) ?? null;
    },
    enabled: !!businessId,
  });

  const [edit, setEdit] = useState<Partial<Business>>({});
  useEffect(() => {
    if (biz.data) setEdit(biz.data);
  }, [biz.data]);

  const save = useMutation({
    mutationFn: () =>
      api(`/api/businesses/${businessId}`, { method: 'PATCH', body: edit }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business-self'] });
      Alert.alert('Saved');
    },
  });

  const signOut = async () => {
    await auth.signOut();
    router.replace('/(auth)/sign-in');
  };

  // Onboarding flow OR no business yet
  if (loading) return null;
  if (!businessId || onboarding === '1') {
    return (
      <ScrollView style={{ backgroundColor: tokens.colors.bgCanvas }} contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View>
          <Typo variant="label" color={tokens.colors.fg2}>Onboarding</Typo>
          <Typo variant="display2" style={{ marginTop: 8 }}>Create your business</Typo>
          <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
            We just need the basics. Photos and hours can wait.
          </Typo>
        </View>
        <Card style={{ gap: 12 }}>
          <Input label="Business name" value={draft.name} onChangeText={(t) => setDraft({ ...draft, name: t })} />
          <Input
            label="Description"
            value={draft.description}
            onChangeText={(t) => setDraft({ ...draft, description: t })}
          />
          <Input label="Address" value={draft.address} onChangeText={(t) => setDraft({ ...draft, address: t })} />
          <Button onPress={() => create.mutate()} loading={create.isPending} disabled={!draft.name.trim()} size="lg">
            Create business
          </Button>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: tokens.colors.bgCanvas }} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>Business profile</Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>{biz.data?.name ?? '—'}</Typo>
        <Typo variant="caption" color={tokens.colors.fg3} style={{ marginTop: 4 }}>
          /{biz.data?.slug}
        </Typo>
      </View>

      <Card style={{ gap: 12 }}>
        <Input
          label="Name"
          value={edit.name ?? ''}
          onChangeText={(t) => setEdit({ ...edit, name: t })}
        />
        <Input
          label="Description"
          value={edit.description ?? ''}
          onChangeText={(t) => setEdit({ ...edit, description: t })}
        />
        <Input
          label="Address"
          value={edit.address ?? ''}
          onChangeText={(t) => setEdit({ ...edit, address: t })}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
          }}
        >
          <Typo variant="body">Published</Typo>
          <Switch
            value={edit.isPublished ?? false}
            onValueChange={(v) => setEdit({ ...edit, isPublished: v })}
            trackColor={{ true: tokens.colors.action }}
          />
        </View>

        <Button onPress={() => save.mutate()} loading={save.isPending}>
          Save changes
        </Button>
      </Card>

      <Card variant="muted">
        <Typo variant="h3">Opening hours</Typo>
        <Typo variant="body" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
          Coming soon — backend column lands in a follow-up PR.
        </Typo>
      </Card>

      <Button variant="ghost" onPress={signOut}>
        Sign out
      </Button>
    </ScrollView>
  );
}
