import React, { useEffect, useState } from 'react';
import { ScrollView, View, Pressable, Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react-native';
import { api } from '../../src/lib/api';
import { getActiveBusinessId } from '../../src/lib/activeBusiness';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

type MenuItem = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
};
type MenuTree = {
  menu: {
    id: string;
    kind: 'public' | 'member';
    categories: Array<{ id: string; name: string; items: MenuItem[] }>;
  };
};
type LoyaltyProgram = {
  id: string;
  name: string;
  requiredVisits: number;
  rewardDescription: string;
  isActive: boolean;
};

export default function MenusScreen() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const id = await getActiveBusinessId();
      setBusinessId(id);
      if (id) {
        const list = await api<Array<{ id: string; slug: string }>>('/api/businesses');
        setSlug(list.find((b) => b.id === id)?.slug ?? null);
      }
    })();
  }, []);

  if (!businessId || !slug) {
    return (
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card>
          <Typo variant="h2">Pick a business first</Typo>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: tokens.colors.bgCanvas }} contentContainerStyle={{ padding: 20, gap: 20 }}>
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>Menus & rewards</Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>
          Curate
        </Typo>
      </View>

      <MenuEditor businessId={businessId} slug={slug} kind="public" title="Public menu" />
      <MenuEditor businessId={businessId} slug={slug} kind="member" title="Member menu" />
      <LoyaltyEditor businessId={businessId} />
    </ScrollView>
  );
}

function MenuEditor({
  businessId,
  slug,
  kind,
  title,
}: {
  businessId: string;
  slug: string;
  kind: 'public' | 'member';
  title: string;
}) {
  const qc = useQueryClient();
  const menu = useQuery({
    queryKey: ['menu', slug, kind],
    queryFn: async () => {
      try {
        return await api<MenuTree>(`/api/b/${slug}/menu${kind === 'member' ? '/member' : ''}`);
      } catch {
        return null;
      }
    },
  });

  const create = useMutation({
    mutationFn: () =>
      api(`/api/businesses/${businessId}/menus`, { method: 'POST', body: { kind, title } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', slug, kind] }),
  });

  const [newCat, setNewCat] = useState('');
  const addCat = useMutation({
    mutationFn: (menuId: string) =>
      api(`/api/menus/${menuId}/categories`, { method: 'POST', body: { name: newCat } }),
    onSuccess: () => {
      setNewCat('');
      qc.invalidateQueries({ queryKey: ['menu', slug, kind] });
    },
  });

  if (!menu.data) {
    return (
      <Card variant="muted">
        <Typo variant="h2">{title}</Typo>
        <Typo variant="body" color={tokens.colors.fg2} style={{ marginTop: 8, marginBottom: 12 }}>
          Not created yet.
        </Typo>
        <Button onPress={() => create.mutate()} loading={create.isPending}>
          Create {kind} menu
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <Typo variant="h2" style={{ marginBottom: 12 }}>{title}</Typo>
      <View style={{ gap: 12 }}>
        {menu.data.menu.categories.map((cat: MenuTree['menu']['categories'][number]) => (
          <CategoryEditor key={cat.id} slug={slug} kind={kind} category={cat} businessId={businessId} />
        ))}
      </View>

      <View style={{ marginTop: 16, gap: 8 }}>
        <Input label="New category" value={newCat} onChangeText={setNewCat} placeholder="Coffee, Pastries…" />
        <Button
          variant="subtle"
          onPress={() => addCat.mutate(menu.data!.menu.id)}
          disabled={!newCat.trim()}
          loading={addCat.isPending}
        >
          Add category
        </Button>
      </View>
    </Card>
  );
}

function CategoryEditor({
  slug,
  kind,
  category,
  businessId,
}: {
  slug: string;
  kind: 'public' | 'member';
  category: { id: string; name: string; items: MenuItem[] };
  businessId: string;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const add = useMutation({
    mutationFn: () =>
      api(`/api/categories/${category.id}/items`, {
        method: 'POST',
        body: {
          name,
          priceCents: Math.round((Number(price) || 0) * 100),
          currency: 'EUR',
        },
      }),
    onSuccess: () => {
      setName('');
      setPrice('');
      qc.invalidateQueries({ queryKey: ['menu', slug, kind] });
    },
  });

  const del = useMutation({
    mutationFn: (itemId: string) => api(`/api/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', slug, kind] }),
  });

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: tokens.colors.borderSubtle,
        borderRadius: tokens.radius.lg,
        padding: 12,
      }}
    >
      <Typo variant="h3" style={{ marginBottom: 8 }}>{category.name}</Typo>
      <View style={{ gap: 6 }}>
        {category.items.map((it) => (
          <View
            key={it.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
              borderRadius: tokens.radius.md,
              backgroundColor: tokens.colors.bgMuted,
              gap: 8,
            }}
          >
            <Typo variant="body" style={{ flex: 1, fontWeight: '600' }}>{it.name}</Typo>
            <Typo variant="num">€{(it.priceCents / 100).toFixed(2)}</Typo>
            <Pressable onPress={() => del.mutate(it.id)}>
              <Trash2 size={16} color={tokens.colors.danger} />
            </Pressable>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <View style={{ flex: 2 }}>
          <Input placeholder="Item name" value={name} onChangeText={setName} />
        </View>
        <View style={{ flex: 1 }}>
          <Input placeholder="€" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        </View>
      </View>
      <View style={{ marginTop: 8 }}>
        <Button
          variant="subtle"
          size="sm"
          onPress={() => add.mutate()}
          disabled={!name.trim()}
          loading={add.isPending}
          leftSlot={<Plus size={14} color={tokens.colors.actionSubtleFg} />}
        >
          Add item
        </Button>
      </View>
    </View>
  );
}

function LoyaltyEditor({ businessId }: { businessId: string }) {
  const qc = useQueryClient();
  const programs = useQuery({
    queryKey: ['loyalty-programs', businessId],
    queryFn: () => api<LoyaltyProgram[]>(`/api/businesses/${businessId}/loyalty-programs`),
  });
  const active = programs.data?.find((p: LoyaltyProgram) => p.isActive);

  const [name, setName] = useState('');
  const [required, setRequired] = useState('10');
  const [reward, setReward] = useState('');

  useEffect(() => {
    if (active) {
      setName(active.name);
      setRequired(String(active.requiredVisits));
      setReward(active.rewardDescription);
    }
  }, [active]);

  const save = useMutation({
    mutationFn: () => {
      const body = {
        name: name || 'Coffee Card',
        requiredVisits: Number(required) || 10,
        rewardDescription: reward || 'Your 11th coffee is on us',
        isActive: true,
      };
      return active
        ? api(`/api/loyalty-programs/${active.id}`, { method: 'PATCH', body })
        : api(`/api/businesses/${businessId}/loyalty-programs`, { method: 'POST', body });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loyalty-programs', businessId] });
      Alert.alert('Saved');
    },
  });

  return (
    <Card>
      <Typo variant="h2" style={{ marginBottom: 8 }}>Loyalty programme</Typo>
      <View style={{ gap: 12 }}>
        <Input label="Name" value={name} onChangeText={setName} placeholder="Coffee Card" />
        <Input
          label="Visits required"
          value={required}
          onChangeText={setRequired}
          keyboardType="number-pad"
        />
        <Input label="Reward" value={reward} onChangeText={setReward} placeholder="Your 11th coffee is on us" />
      </View>
      <View style={{ marginTop: 16 }}>
        <Button onPress={() => save.mutate()} loading={save.isPending}>
          {active ? 'Update programme' : 'Create programme'}
        </Button>
      </View>
    </Card>
  );
}
