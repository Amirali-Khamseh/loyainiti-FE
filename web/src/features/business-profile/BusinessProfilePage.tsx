import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Upload } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { getActiveBusinessId, setActiveBusinessId } from '../../lib/activeBusiness';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';

type Business = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  logoR2Key: string | null;
  coverR2Key: string | null;
  isPublished: boolean;
};

async function presignAndUpload(
  kind: 'business_logo' | 'business_cover',
  businessId: string,
  file: File,
): Promise<string> {
  const presign = await api<{ url: string; key: string }>('/api/uploads/presign', {
    method: 'POST',
    body: { kind, businessId, filename: file.name, mimeType: file.type },
  });
  await fetch(presign.url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  return presign.key;
}

export function BusinessProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const businessId = getActiveBusinessId();
  const [params] = useSearchParams();
  const isOnboarding = params.get('onboarding') === '1' || !businessId;

  // ---- Create flow (onboarding) ----------------------------------------
  const [draft, setDraft] = useState({ name: '', description: '', address: '' });
  const [createErr, setCreateErr] = useState<string | null>(null);
  const createMut = useMutation({
    mutationFn: () => api<Business>('/api/businesses', { method: 'POST', body: draft }),
    onSuccess: (b) => {
      setActiveBusinessId(b.id);
      qc.invalidateQueries({ queryKey: ['my-businesses'] });
      navigate('/admin/business');
    },
    onError: (e) => setCreateErr(e instanceof ApiError ? e.message : 'Could not create'),
  });

  // ---- Edit flow -------------------------------------------------------
  const biz = useQuery({
    queryKey: ['business-self', businessId],
    queryFn: async () => {
      // We don't have a "get by id" endpoint exposed; fetch all + filter, or load via slug indirectly.
      // For v1 grab from the public list (works for published only) — refined when /api/me/businesses lands.
      const all = await api<Business[]>('/api/businesses');
      const found = all.find((b) => b.id === businessId);
      if (!found) throw new ApiError(404, 'not_found', 'business not found in the public list');
      return found;
    },
    enabled: !!businessId && !isOnboarding,
    retry: false,
  });

  const [edit, setEdit] = useState<Partial<Business>>({});
  useEffect(() => {
    if (biz.data) setEdit(biz.data);
  }, [biz.data]);

  const patchMut = useMutation({
    mutationFn: () =>
      api<Business>(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        body: edit,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business-self'] }),
  });

  const onUpload = async (kind: 'business_logo' | 'business_cover', file: File) => {
    if (!businessId) return;
    const key = await presignAndUpload(kind, businessId, file);
    setEdit((prev) => ({ ...prev, [kind === 'business_logo' ? 'logoR2Key' : 'coverR2Key']: key }));
  };

  // ---- Render ----------------------------------------------------------
  if (isOnboarding) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <span className="label">Onboarding</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>
          Create your business
        </h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          Tell customers who you are. You can fine-tune photos, hours and the member menu later.
        </p>
        <Card padding={32} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Business name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <Input
            label="Description"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Specialty coffee + pastries"
          />
          <Input
            label="Address"
            value={draft.address}
            onChange={(e) => setDraft({ ...draft, address: e.target.value })}
            placeholder="Via Roma 12, Milan"
          />
          {createErr && (
            <p style={{ font: 'var(--t-body-sm)', color: 'var(--danger)', margin: 0 }}>{createErr}</p>
          )}
          <Button
            onClick={() => createMut.mutate()}
            loading={createMut.isPending}
            size="lg"
            disabled={!draft.name.trim()}
          >
            Create business
          </Button>
        </Card>
      </div>
    );
  }

  if (biz.isLoading) return <p className="body">Loading…</p>;
  if (biz.error) {
    return (
      <Card>
        <h2 className="h2">Couldn't load this business</h2>
        <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          It may not be published yet. Once /api/me/businesses lands on the backend this page will
          fetch it directly.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <span className="label">Business profile</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>
          {biz.data?.name}
        </h1>
        <p className="caption" style={{ color: 'var(--fg-3)' }}>
          /{biz.data?.slug} — slug is read-only after creation
        </p>
      </header>

      <Card padding={32} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Name"
          value={edit.name ?? ''}
          onChange={(e) => setEdit({ ...edit, name: e.target.value })}
        />
        <Input
          label="Description"
          value={edit.description ?? ''}
          onChange={(e) => setEdit({ ...edit, description: e.target.value })}
        />
        <Input
          label="Address"
          value={edit.address ?? ''}
          onChange={(e) => setEdit({ ...edit, address: e.target.value })}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <UploadField
            label="Logo"
            currentKey={edit.logoR2Key ?? null}
            onPick={(file) => onUpload('business_logo', file)}
          />
          <UploadField
            label="Cover image"
            currentKey={edit.coverR2Key ?? null}
            onPick={(file) => onUpload('business_cover', file)}
          />
        </div>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center', font: 'var(--t-body)' }}>
          <input
            type="checkbox"
            checked={edit.isPublished ?? false}
            onChange={(e) => setEdit({ ...edit, isPublished: e.target.checked })}
          />
          Published — visible on the public explorer
        </label>

        <Button onClick={() => patchMut.mutate()} loading={patchMut.isPending}>
          <Save size={16} /> Save changes
        </Button>
        {patchMut.isError && (
          <p style={{ font: 'var(--t-body-sm)', color: 'var(--danger)', margin: 0 }}>
            {(patchMut.error as Error).message}
          </p>
        )}
        {patchMut.isSuccess && (
          <p style={{ font: 'var(--t-body-sm)', color: 'var(--success)', margin: 0 }}>Saved.</p>
        )}
      </Card>

      <Card variant="muted">
        <h3 className="h3">Opening hours</h3>
        <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          Hours aren't stored on the backend yet — flagged as a follow-up. Once
          `businesses.opening_hours` lands, this card becomes editable.
        </p>
      </Card>
    </div>
  );
}

function UploadField({
  label,
  currentKey,
  onPick,
}: {
  label: string;
  currentKey: string | null;
  onPick: (file: File) => void | Promise<void>;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <p className="label" style={{ marginBottom: 6 }}>
        {label}
      </p>
      <div
        style={{
          border: '1px dashed var(--border-default)',
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <input
          ref={inputRef}
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
        <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} loading={busy}>
          <Upload size={14} /> Choose
        </Button>
        <span className="caption" style={{ color: 'var(--fg-3)', wordBreak: 'break-all' }}>
          {currentKey ?? 'No image'}
        </span>
      </div>
    </div>
  );
}
