/**
 * Customer profile editor: display name, short bio (150 chars), profile photo.
 *
 * Architecture note for future Google SSO:
 *  - `avatarR2Key` is the user's uploaded photo (R2 prefix: `customer-photos/`).
 *  - `image` is Better Auth's OAuth-provider field (populated automatically
 *    when Google/GitHub sign-in is wired up later).
 *  - This page prefers the uploaded photo and falls back to `image`, so the
 *    same display logic works without changes once SSO lands.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, Save, Trash2, UserCircle } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { r2Url } from '../../lib/media';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useToast } from '../../components/Toast';

type Me = {
  userId: string;
  email: string;
  name: string;
  role: string;
  displayName: string;
  qrCodeId: string;
  avatarR2Key: string | null;
  bio: string | null;
  image: string | null;
};

const BIO_MAX = 150;

/**
 * CSS variable overrides scoped to the white cards on this page.
 * Cascades into all child components (Input, textarea, buttons) automatically
 * without touching the shared component code.
 */
const lightVars: React.CSSProperties = {
  '--fg-1': '#052698',
  '--fg-2': '#1E3880',
  '--fg-3': '#878EA0',
  '--bg-card': '#F0F4FA',
  '--bg-muted': '#E8EEF8',
  '--border-default': 'rgba(5,38,152,0.15)',
  '--border-subtle': 'rgba(5,38,152,0.08)',
} as React.CSSProperties;

/** Pick the best photo URL given the new (R2) and legacy (provider) sources. */
function avatarSrc(me: Me | undefined): string | null {
  if (!me) return null;
  return r2Url(me.avatarR2Key) ?? me.image ?? null;
}

async function presignAndUpload(file: File): Promise<string> {
  const presign = await api<{ url: string; key: string }>('/api/uploads/presign', {
    method: 'POST',
    body: { kind: 'avatar', filename: file.name, mimeType: file.type },
  });
  const res = await fetch(presign.url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  return presign.key;
}

export function ProfilePage() {
  const toast = useToast();
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ['me'], queryFn: () => api<Me>('/api/me') });

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarR2Key, setAvatarR2Key] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Hydrate form when the query resolves.
  useEffect(() => {
    const d = me.data;
    if (!d) return;
    setDisplayName(d.displayName);
    setBio(d.bio ?? '');
    setAvatarR2Key(d.avatarR2Key);
  }, [me.data]);

  const saveMut = useMutation({
    mutationFn: () =>
      api<Me>('/api/me', {
        method: 'PATCH',
        body: {
          displayName: displayName.trim(),
          bio: bio.trim() ? bio.trim() : null,
          avatarR2Key,
        },
      }),
    onSuccess: (next) => {
      toast.success('Profile saved');
      qc.setQueryData(['me'], next);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not save'),
  });

  const onPickPhoto = async (file: File) => {
    setUploading(true);
    try {
      const key = await presignAndUpload(file);
      setAvatarR2Key(key);
      toast.info('Photo ready - click Save to keep the change.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (me.isLoading) return <p className="body">Loading…</p>;
  if (me.error || !me.data) {
    return (
      <p className="body" style={{ color: 'var(--danger)' }}>
        Couldn't load your profile.
      </p>
    );
  }

  // Preview source: prefer the in-flight new upload, fall back to whatever
  // the server has on file.
  const previewSrc =
    r2Url(avatarR2Key) ?? avatarSrc({ ...me.data, avatarR2Key });
  const dirty =
    displayName.trim() !== me.data.displayName ||
    (bio.trim() || null) !== (me.data.bio ?? null) ||
    avatarR2Key !== me.data.avatarR2Key;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <span className="label">Profile</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>
          Your profile
        </h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          Tell other regulars a little about yourself. Shops see this when they look you up.
        </p>
      </header>

      <Card
        padding={32}
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(5,38,152,0.1)',
          boxShadow: '0 4px 24px rgba(5,38,152,0.06)',
        }}
      >
        <div style={{ ...lightVars, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Photo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'var(--bg-muted)', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border-default)',
              flexShrink: 0,
            }}
          >
            {previewSrc ? (
              <img src={previewSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserCircle size={56} color="var(--fg-3)" />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickPhoto(f);
                e.target.value = '';
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} loading={uploading}>
                <Upload size={14} /> {avatarR2Key ? 'Change photo' : 'Add photo'}
              </Button>
              {avatarR2Key && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setAvatarR2Key(null); toast.info('Photo cleared - click Save to keep the change.'); }}
                >
                  <Trash2 size={14} /> Remove
                </Button>
              )}
            </div>
            <p className="caption" style={{ color: 'var(--fg-3)' }}>JPG, PNG or WebP, up to a few MB.</p>
          </div>
        </div>

        {/* Name */}
        <Input
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={120}
        />

        {/* Bio */}
        <div>
          <p className="label" style={{ marginBottom: 6 }}>
            Short bio
          </p>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
            rows={3}
            placeholder="Coffee lover, runner, generally insufferable on Mondays."
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 4,
              border: '1px solid var(--border-default)', font: 'var(--t-body)',
              background: 'var(--bg-card)', color: 'var(--fg-1)', resize: 'vertical',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <p className="caption" style={{ color: 'var(--fg-3)' }}>
              Visible on your profile in shops you've visited.
            </p>
            <p
              className="caption"
              style={{
                color: bio.length >= BIO_MAX ? 'var(--danger)' : 'var(--fg-3)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {bio.length} / {BIO_MAX}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={() => saveMut.mutate()}
            loading={saveMut.isPending}
            disabled={!dirty || displayName.trim().length < 1}
          >
            <Save size={16} /> Save changes
          </Button>
        </div>
        </div>{/* end lightVars scope */}
      </Card>

      <Card
        padding={20}
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(5,38,152,0.1)',
          boxShadow: '0 4px 24px rgba(5,38,152,0.06)',
        }}
      >
        <div style={lightVars}>
          <p className="label" style={{ color: '#116BF8' }}>Account</p>
          <p style={{ font: 'var(--t-body)', marginTop: 4, color: '#052698' }}>
            {me.data.email}
          </p>
          <p className="caption" style={{ color: '#878EA0', marginTop: 4 }}>
            Sign-in details and password are managed separately — use the link on the sign-in page.
          </p>
        </div>
      </Card>
    </div>
  );
}
