import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api';
import { auth, type Role } from '../../lib/auth';
import { useToast } from '../../components/Toast';
import type { FavoriteShop } from './useFavorites';

interface Props {
  businessId: string;
  /** 'card'   → frosted-glass pill overlay (Explore grid)  */
  /** 'detail' → bordered button (ShopPage header)          */
  variant?: 'card' | 'detail';
  style?: React.CSSProperties;
}

export const FavoriteButton = React.memo(function FavoriteButton({
  businessId,
  variant = 'card',
  style,
}: Props) {
  const { data: session } = auth.useSession();
  const role = (session?.user as { role?: Role } | undefined)?.role;
  const isCustomer = !!session && (!role || role === 'customer');

  const qc = useQueryClient();
  const toast = useToast();

  // Subscribe only to this business's favorited boolean.
  // `select` means this component re-renders only when ITS value flips —
  // not when any other shop is added or removed.
  const { data: serverFav = false } = useQuery({
    queryKey: ['my-favorites'],
    queryFn: () => api<FavoriteShop[]>('/api/me/favorites'),
    enabled: isCustomer,
    staleTime: 30_000,
    select: (data) => data.some((f) => f.businessId === businessId),
  });

  const [localFav, setLocalFav] = useState(serverFav);
  const inflight = useRef(false);

  // Sync server state in when no request is in flight.
  useEffect(() => {
    if (!inflight.current) setLocalFav(serverFav);
  }, [serverFav]);

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (inflight.current) return;

      const next = !localFav;
      inflight.current = true;
      setLocalFav(next); // instant — only this component re-renders

      // For remove: also drop it from the cache so the Favorites page card
      // disappears immediately (optimistic list update).
      let cacheSnapshot: FavoriteShop[] | undefined;
      if (!next) {
        cacheSnapshot = qc.getQueryData<FavoriteShop[]>(['my-favorites']);
        qc.setQueryData<FavoriteShop[]>(['my-favorites'], (old) =>
          old?.filter((f) => f.businessId !== businessId),
        );
      }

      try {
        await api(`/api/me/favorites/${businessId}`, {
          method: next ? 'POST' : 'DELETE',
        });
      } catch (err) {
        setLocalFav(!next);
        if (cacheSnapshot) qc.setQueryData(['my-favorites'], cacheSnapshot);
        toast.error(err instanceof ApiError ? err.message : 'Could not update favorites');
      } finally {
        inflight.current = false;
        // Background refresh so Favorites page shows real server data.
        // This won't snap the Explore grid because only components whose
        // select() value changes will re-render — which is at most this one.
        qc.invalidateQueries({ queryKey: ['my-favorites'] });
      }
    },
    [businessId, localFav, qc, toast],
  );

  if (!isCustomer) return null;

  const filled = localFav;

  if (variant === 'detail') {
    return (
      <button
        onClick={toggle}
        aria-label={filled ? 'Remove from favorites' : 'Add to favorites'}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 10,
          padding: '8px 10px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: 0,
          ...style,
        }}
      >
        <Heart
          size={20}
          fill={filled ? 'var(--cyan-500)' : 'none'}
          color={filled ? 'var(--cyan-500)' : 'var(--fg-3)'}
          strokeWidth={2}
        />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={filled ? 'Remove from favorites' : 'Add to favorites'}
      style={{
        background: 'rgba(24,24,27,0.75)',
        border: 'none',
        borderRadius: 8,
        padding: 6,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        ...style,
      }}
    >
      <Heart
        size={18}
        fill={filled ? 'var(--cyan-500)' : 'none'}
        color={filled ? 'var(--cyan-500)' : 'var(--fg-3)'}
        strokeWidth={2}
      />
    </button>
  );
});
