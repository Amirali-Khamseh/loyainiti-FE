import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { auth } from './auth';

export type FavoriteShop = {
  businessId: string;
  slug: string;
  name: string;
  description: string | null;
  country: string | null;
  city: string | null;
  logoR2Key: string | null;
  coverR2Key: string | null;
  ratingAvg: string | null;
  ratingCount: number;
  favoritedAt: string;
};

export function useFavorites() {
  const { data: session } = auth.useSession();
  return useQuery({
    queryKey: ['my-favorites'],
    queryFn: () => api<FavoriteShop[]>('/api/me/favorites'),
    enabled: !!session,
    staleTime: 30_000,
  });
}

export function useFavoriteIds(): Set<string> {
  const q = useFavorites();
  if (!q.data) return new Set();
  return new Set(q.data.map((f) => f.businessId));
}

export function useFavoriteToggle() {
  const qc = useQueryClient();

  const add = useMutation({
    mutationFn: (businessId: string) =>
      api(`/api/me/favorites/${businessId}`, { method: 'POST' }),
    onMutate: async (businessId) => {
      await qc.cancelQueries({ queryKey: ['my-favorites'] });
      const prev = qc.getQueryData<FavoriteShop[]>(['my-favorites']);
      qc.setQueryData<FavoriteShop[]>(['my-favorites'], (old) => {
        if (!old) return old;
        const stub: FavoriteShop = {
          businessId,
          slug: '',
          name: '',
          description: null,
          country: null,
          city: null,
          logoR2Key: null,
          coverR2Key: null,
          ratingAvg: null,
          ratingCount: 0,
          favoritedAt: new Date().toISOString(),
        };
        return [stub, ...old];
      });
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      qc.setQueryData(['my-favorites'], ctx?.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['my-favorites'] }),
  });

  const remove = useMutation({
    mutationFn: (businessId: string) =>
      api(`/api/me/favorites/${businessId}`, { method: 'DELETE' }),
    onMutate: async (businessId) => {
      await qc.cancelQueries({ queryKey: ['my-favorites'] });
      const prev = qc.getQueryData<FavoriteShop[]>(['my-favorites']);
      qc.setQueryData<FavoriteShop[]>(['my-favorites'], (old) =>
        old?.filter((f) => f.businessId !== businessId),
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      qc.setQueryData(['my-favorites'], ctx?.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['my-favorites'] }),
  });

  function toggle(businessId: string, isFavorited: boolean) {
    if (isFavorited) {
      remove.mutate(businessId);
    } else {
      add.mutate(businessId);
    }
  }

  return { toggle, isPending: add.isPending || remove.isPending };
}
