import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Upload } from 'lucide-react';
import { api } from '../../lib/api';
import { getActiveBusinessId } from '../../lib/activeBusiness';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  isAvailable: boolean;
  photoR2Key: string | null;
};

type MenuTree = {
  menu: {
    id: string;
    kind: 'public' | 'member';
    title: string;
    categories: Array<{ id: string; name: string; sortOrder: number; items: MenuItem[] }>;
  };
};

type LoyaltyProgram = {
  id: string;
  name: string;
  requiredVisits: number;
  rewardDescription: string;
  isActive: boolean;
  expiresAt: string | null;
};

/**
 * Both menus live under the same business - fetched by slug. We need the slug.
 *
 * Resolve it from the owner-accessible detail endpoint, NOT the public
 * /api/businesses list: that list only returns *published* businesses, so a
 * draft business would never be found and the page would hang on "Loading…"
 * forever (the request 200s, it just returns null). The detail endpoint works
 * for the owner regardless of publish state.
 */
function useBusinessSlug(businessId: string | null) {
  return useQuery({
    queryKey: ['business-slug', businessId],
    queryFn: async () => {
      const b = await api<{ slug: string }>(`/api/businesses/${businessId}`);
      return b.slug;
    },
    enabled: !!businessId,
  });
}

export function MenuAdminPage() {
  const businessId = getActiveBusinessId();
  const slug = useBusinessSlug(businessId);

  if (!businessId) {
    return (
      <Card>
        <h2 className="h2">Pick a business first</h2>
        <p className="body" style={{ color: 'var(--fg-2)', marginTop: 12 }}>
          Open <Link to="/admin/business">the business profile page</Link> to create one.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <header>
        <span className="label">Menus & rewards</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>
          Curate what your customers see
        </h1>
      </header>

      {slug.isLoading && <p className="body">Loading…</p>}
      {slug.error && (
        <Card>
          <h2 className="h2">Couldn't load this business</h2>
          <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
            {(slug.error as Error).message}
          </p>
        </Card>
      )}
      {slug.data && (
        <>
          <MenuEditor businessId={businessId} slug={slug.data} kind="public" title="Public menu" />
          <MenuEditor businessId={businessId} slug={slug.data} kind="member" title="Member menu" />
          <LoyaltyEditor businessId={businessId} />
        </>
      )}
    </div>
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
        return null; // 404 = no menu yet
      }
    },
  });

  const createMenu = useMutation({
    mutationFn: () =>
      api(`/api/businesses/${businessId}/menus`, {
        method: 'POST',
        body: { kind, title },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', slug, kind] }),
  });

  const [newCategory, setNewCategory] = useState('');
  const addCategory = useMutation({
    mutationFn: (menuId: string) =>
      api(`/api/menus/${menuId}/categories`, {
        method: 'POST',
        body: { name: newCategory },
      }),
    onSuccess: () => {
      setNewCategory('');
      qc.invalidateQueries({ queryKey: ['menu', slug, kind] });
    },
  });

  if (menu.isLoading) return <p className="body">Loading {kind} menu…</p>;

  if (!menu.data) {
    return (
      <Card variant="muted">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="h2">{title}</h2>
            <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
              No {kind} menu yet.
            </p>
          </div>
          <Button onClick={() => createMenu.mutate()} loading={createMenu.isPending}>
            <Plus size={16} /> Create
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="h2" style={{ marginBottom: 16 }}>
        {title}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {menu.data.menu.categories.map((cat) => (
          <CategoryEditor
            key={cat.id}
            slug={slug}
            kind={kind}
            businessId={businessId}
            category={cat}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <Input
            label="New category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Coffee, Pastries, Drinks…"
          />
        </div>
        <Button
          variant="subtle"
          onClick={() => addCategory.mutate(menu.data!.menu.id)}
          loading={addCategory.isPending}
          disabled={!newCategory.trim()}
        >
          <Plus size={16} /> Add
        </Button>
      </div>
    </Card>
  );
}

function CategoryEditor({
  slug,
  kind,
  businessId,
  category,
}: {
  slug: string;
  kind: 'public' | 'member';
  businessId: string;
  category: { id: string; name: string; items: MenuItem[] };
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState({ name: '', priceMajor: '', description: '' });

  const addItem = useMutation({
    mutationFn: () =>
      api(`/api/categories/${category.id}/items`, {
        method: 'POST',
        body: {
          name: draft.name,
          description: draft.description || undefined,
          priceCents: Math.round((Number(draft.priceMajor) || 0) * 100),
          currency: 'EUR',
        },
      }),
    onSuccess: () => {
      setDraft({ name: '', priceMajor: '', description: '' });
      qc.invalidateQueries({ queryKey: ['menu', slug, kind] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: (itemId: string) =>
      api(`/api/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu', slug, kind] }),
  });

  const uploadPhoto = async (itemId: string, file: File) => {
    const presign = await api<{ url: string; key: string }>('/api/uploads/presign', {
      method: 'POST',
      body: { kind: 'menu_item', businessId, filename: file.name, mimeType: file.type },
    });
    await fetch(presign.url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    await api(`/api/items/${itemId}`, { method: 'PATCH', body: { photoR2Key: presign.key } });
    qc.invalidateQueries({ queryKey: ['menu', slug, kind] });
  };

  return (
    <div
      style={{
        borderRadius: 10,
        border: '1px solid var(--border-subtle)',
        padding: 16,
      }}
    >
      <h3 className="h3" style={{ marginBottom: 12 }}>{category.name}</h3>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
        {category.items.map((it) => (
          <li
            key={it.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              background: 'var(--bg-muted)',
              borderRadius: 10,
            }}
          >
            <div style={{ flex: 1 }}>
              <span style={{ font: 'var(--t-body)', fontWeight: 600 }}>{it.name}</span>
              {it.description && (
                <p className="caption" style={{ color: 'var(--fg-3)', margin: 0 }}>
                  {it.description}
                </p>
              )}
            </div>
            <span className="num" style={{ marginInline: 16 }}>
              €{(it.priceCents / 100).toFixed(2)}
            </span>
            <UploadButton onPick={(f) => uploadPhoto(it.id, f)} hasPhoto={!!it.photoR2Key} />
            <button
              aria-label="Delete"
              onClick={() => deleteItem.mutate(it.id)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 6,
                color: 'var(--danger)',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, marginTop: 12 }}>
        <Input
          placeholder="Item name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <Input
          placeholder="Price (€)"
          value={draft.priceMajor}
          onChange={(e) => setDraft({ ...draft, priceMajor: e.target.value })}
        />
        <Button
          variant="subtle"
          onClick={() => addItem.mutate()}
          loading={addItem.isPending}
          disabled={!draft.name.trim()}
        >
          <Plus size={14} /> Add
        </Button>
      </div>
    </div>
  );
}

function UploadButton({
  onPick,
  hasPhoto,
}: {
  onPick: (file: File) => void | Promise<void>;
  hasPhoto: boolean;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          try {
            await onPick(f);
          } finally {
            setBusy(false);
          }
        }}
      />
      <button
        onClick={() => ref.current?.click()}
        disabled={busy}
        title={hasPhoto ? 'Replace photo' : 'Upload photo'}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 6,
          color: hasPhoto ? 'var(--success)' : 'var(--fg-3)',
          cursor: 'pointer',
        }}
      >
        <Upload size={16} />
      </button>
    </>
  );
}

function LoyaltyEditor({ businessId }: { businessId: string }) {
  const qc = useQueryClient();
  const programs = useQuery({
    queryKey: ['loyalty-programs', businessId],
    queryFn: () => api<LoyaltyProgram[]>(`/api/businesses/${businessId}/loyalty-programs`),
  });
  const active = programs.data?.find((p) => p.isActive);

  const [draft, setDraft] = useState({
    name: 'Coffee Card',
    requiredVisits: 10,
    rewardDescription: 'Your 11th visit is on us',
    expiresAt: '', // YYYY-MM-DD; empty = no deadline
  });

  React.useEffect(() => {
    if (active) {
      setDraft({
        name: active.name,
        requiredVisits: active.requiredVisits,
        rewardDescription: active.rewardDescription,
        expiresAt: active.expiresAt ? active.expiresAt.slice(0, 10) : '',
      });
    }
  }, [active]);

  const save = useMutation({
    mutationFn: () => {
      const body = {
        name: draft.name,
        requiredVisits: draft.requiredVisits,
        rewardDescription: draft.rewardDescription,
        // Send end-of-day so the deadline includes the chosen date; null clears it.
        expiresAt: draft.expiresAt ? `${draft.expiresAt}T23:59:59` : null,
      };
      return active
        ? api(`/api/loyalty-programs/${active.id}`, { method: 'PATCH', body })
        : api(`/api/businesses/${businessId}/loyalty-programs`, {
            method: 'POST',
            body: { ...body, isActive: true },
          });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loyalty-programs', businessId] }),
  });

  return (
    <Card>
      <h2 className="h2" style={{ marginBottom: 8 }}>
        Loyalty programme
      </h2>
      <p className="body" style={{ color: 'var(--fg-2)', marginBottom: 16 }}>
        Only one programme can be active at a time. Saving deactivates older programmes.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16 }}>
        <Input
          label="Programme name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <Input
          label="Visits required"
          type="number"
          min={1}
          value={String(draft.requiredVisits)}
          onChange={(e) => setDraft({ ...draft, requiredVisits: Number(e.target.value) || 1 })}
        />
      </div>
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16 }}>
        <Input
          label="Reward"
          value={draft.rewardDescription}
          onChange={(e) => setDraft({ ...draft, rewardDescription: e.target.value })}
          placeholder="Your 11th coffee is on us"
        />
        <Input
          label="Deadline (optional)"
          type="date"
          value={draft.expiresAt}
          onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })}
        />
      </div>
      <Button onClick={() => save.mutate()} loading={save.isPending} style={{ marginTop: 16 }}>
        {active ? 'Update programme' : 'Create programme'}
      </Button>
      {save.isSuccess && (
        <p style={{ font: 'var(--t-body-sm)', color: 'var(--success)', marginTop: 8 }}>Saved.</p>
      )}
    </Card>
  );
}
