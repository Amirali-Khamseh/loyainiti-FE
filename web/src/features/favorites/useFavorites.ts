import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { auth } from '../../lib/auth';

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
