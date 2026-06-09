import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Eye, EyeOff } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';

type AdminReview = {
  id: string;
  businessId: string;
  businessSlug?: string;
  customerName: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  createdAt: string;
};

type ReviewsData = {
  ratingAvg: number | null;
  ratingCount: number;
  reviews: Array<AdminReview & { isOwn: boolean }>;
};

type AdminBusiness = { id: string; slug: string; name: string; isPublished: boolean; ownerEmail: string | null; createdAt: string };

function StarDisplay({ value }: { value: number }) {
  return (
    <div style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          fill={s <= value ? 'var(--cyan-500)' : 'none'}
          color={s <= value ? 'var(--cyan-500)' : 'var(--border-default)'}
        />
      ))}
    </div>
  );
}

export function ConsoleReviewsPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [selectedBiz, setSelectedBiz] = useState<{ id: string; slug: string; name: string } | null>(null);

  const businesses = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: () => api<AdminBusiness[]>('/api/admin/businesses'),
  });

  const reviews = useQuery({
    queryKey: ['admin-reviews', selectedBiz?.slug],
    queryFn: () => api<ReviewsData>(`/api/b/${selectedBiz!.slug}/reviews`),
    enabled: !!selectedBiz,
  });

  const hideReview = useMutation({
    mutationFn: (id: string) => api(`/api/admin/reviews/${id}/hide`, { method: 'PATCH' }),
    onSuccess: () => { toast.success('Review hidden'); qc.invalidateQueries({ queryKey: ['admin-reviews'] }); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  const unhideReview = useMutation({
    mutationFn: (id: string) => api(`/api/admin/reviews/${id}/unhide`, { method: 'PATCH' }),
    onSuccess: () => { toast.success('Review restored'); qc.invalidateQueries({ queryKey: ['admin-reviews'] }); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header>
        <span className="label">Console</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>Reviews</h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          Select a business to moderate its reviews. Hidden reviews don't count toward the rating.
        </p>
      </header>

      {/* Business picker */}
      <Card padding={0}>
        {businesses.isLoading ? (
          <p className="body" style={{ padding: 24 }}>Loading…</p>
        ) : (
          <div>
            {(businesses.data ?? []).map((b, i) => (
              <div
                key={b.id}
                onClick={() => setSelectedBiz({ id: b.id, slug: b.slug, name: b.name })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  background: selectedBiz?.id === b.id ? 'var(--action-subtle-bg)' : 'transparent',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ font: 'var(--t-body)', fontWeight: 600, margin: 0 }}>{b.name}</p>
                  <p className="caption" style={{ color: 'var(--fg-3)' }}>/{b.slug}</p>
                </div>
                {selectedBiz?.id === b.id && (
                  <span className="label" style={{ color: 'var(--action)' }}>Selected</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Review list */}
      {selectedBiz && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 className="h2">{selectedBiz.name}</h2>
          {reviews.isLoading ? (
            <p className="body">Loading reviews…</p>
          ) : (reviews.data?.reviews ?? []).length === 0 ? (
            <p className="body" style={{ color: 'var(--fg-3)' }}>No reviews for this business.</p>
          ) : (
            (reviews.data?.reviews ?? []).map((r) => (
              <Card
                key={r.id}
                padding={20}
                style={{ opacity: r.isHidden ? 0.6 : 1, borderLeft: r.isHidden ? '3px solid var(--danger)' : undefined }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p style={{ font: 'var(--t-body)', fontWeight: 600, margin: 0 }}>{r.customerName}</p>
                    <p className="caption" style={{ color: 'var(--fg-3)', marginTop: 2 }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                      {r.isHidden && <span style={{ color: 'var(--danger)', marginLeft: 8 }}>Hidden</span>}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <StarDisplay value={r.rating} />
                    <Button
                      size="sm"
                      variant={r.isHidden ? 'subtle' : 'ghost'}
                      onClick={() => r.isHidden ? unhideReview.mutate(r.id) : hideReview.mutate(r.id)}
                      loading={hideReview.isPending || unhideReview.isPending}
                    >
                      {r.isHidden ? <><Eye size={14} /> Restore</> : <><EyeOff size={14} /> Hide</>}
                    </Button>
                  </div>
                </div>
                {r.comment && (
                  <p className="body" style={{ marginTop: 10, color: 'var(--fg-2)' }}>{r.comment}</p>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
