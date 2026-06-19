import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Upload, Trash2, Check, ChevronDown } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { auth } from '../../lib/auth';
import { r2Url } from '../../lib/media';
import { getActiveBusinessId, setActiveBusinessId } from '../../lib/activeBusiness';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { CountrySelect } from '../../components/CountrySelect';
import { Card } from '../../components/Card';
import { useToast } from '../../components/Toast';
import { findUnsafeContent, UNSAFE_INPUT_MESSAGE } from '../../lib/contentGuard';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type DayHours = { open: string; close: string; closed: boolean };
type OpeningHours = Record<DayKey, DayHours>;
type Category = { id: string; name: string; slug: string };
type Photo = { id: string; r2Key: string; caption: string | null; sortOrder: number };

type BusinessDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  country: string | null;
  city: string | null;
  logoR2Key: string | null;
  coverR2Key: string | null;
  openingHours: OpeningHours | null;
  isPublished: boolean;
  contentVersion: number;
  categories: Category[];
  photos: Photo[];
};

const DAYS: [DayKey, string][] = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
];

function defaultHours(): OpeningHours {
  return Object.fromEntries(
    DAYS.map(([k]) => [k, { open: '09:00', close: '17:00', closed: false }]),
  ) as OpeningHours;
}

type UploadKind = 'business_logo' | 'business_cover' | 'business_photo';
async function presignAndUpload(kind: UploadKind, businessId: string, file: File): Promise<string> {
  const presign = await api<{ url: string; key: string }>('/api/uploads/presign', {
    method: 'POST',
    body: { kind, businessId, filename: file.name, mimeType: file.type },
  });
  await fetch(presign.url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  return presign.key;
}

export function BusinessProfilePage() {
  const location = useLocation();
  // Onboarding mode = the user reached this page from the /onboarding/* path.
  // Use path, not localStorage, so stale activeBusinessId never bypasses the wizard.
  const isOnboarding = location.pathname.startsWith('/onboarding');
  const businessId = getActiveBusinessId();

  if (isOnboarding) return <OnboardingWizard />;
  if (!businessId) return (
    <p className="body" style={{ color: 'var(--fg-2)' }}>
      No active business. Create one first via the onboarding flow.
    </p>
  );
  return <EditBusiness businessId={businessId} />;
}

/* ===================== Onboarding wizard ===================== */

type Step = 0 | 1 | 2 | 3 | 4;
const STEP_LABELS = ['Basics', 'Categories', 'Hours', 'Photos', 'Publish'];

function OnboardingWizard() {
  const toast = useToast();
  const qc = useQueryClient();
  const { data: session } = auth.useSession();
  const [step, setStep] = useState<Step>(0);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [draft, setDraft] = useState({ name: '', description: '', address: '', country: '', city: '' });
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [hours, setHours] = useState<OpeningHours>(defaultHours());
  const [photos, setPhotos] = useState<Photo[]>([]);

  // Prefill country/city from what the owner entered at sign-up (stored on the
  // user). They remain editable here in case a specific shop differs.
  useEffect(() => {
    const u = session?.user as { country?: string | null; city?: string | null } | undefined;
    if (!u) return;
    setDraft((d) => ({
      ...d,
      country: d.country || u.country || '',
      city: d.city || u.city || '',
    }));
  }, [session]);

  const createMut = useMutation({
    mutationFn: () =>
      api<{ id: string }>('/api/businesses', {
        method: 'POST',
        body: {
          name: draft.name,
          description: draft.description || undefined,
          address: draft.address || undefined,
          country: draft.country || undefined,
          city: draft.city || undefined,
        },
      }),
    onSuccess: (b) => {
      setCreatedId(b.id);
      setActiveBusinessId(b.id);
      qc.invalidateQueries({ queryKey: ['my-businesses'] });
      setStep(1);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not create business'),
  });

  const finishMut = useMutation({
    mutationFn: (publish: boolean) =>
      api(`/api/businesses/${createdId}`, {
        method: 'PATCH',
        body: { categoryIds, openingHours: hours, isPublished: publish },
      }),
    onSuccess: async () => {
      toast.success('Business saved');
      try {
        await auth.getSession({ query: { disableCookieCache: true } });
      } catch {
        /* non-fatal */
      }
      window.location.assign('/admin/business');
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not save'),
  });

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <span className="label">Onboarding · {STEP_LABELS[step]}</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>
          Set up your business
        </h1>
      </header>

      <Stepper step={step} />

      {step === 0 && (
        <Card padding={32} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            placeholder="Via Roma 12"
          />
          <CountrySelect
            value={draft.country}
            onChange={(v) => setDraft({ ...draft, country: v })}
          />
          <Input
            label="City"
            value={draft.city}
            onChange={(e) => setDraft({ ...draft, city: e.target.value })}
            placeholder="Milan"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => createMut.mutate()}
              loading={createMut.isPending}
              disabled={draft.name.trim().length < 2}
            >
              Create & continue
            </Button>
          </div>
        </Card>
      )}

      {step === 1 && createdId && (
        <Card padding={32} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CategoryPicker selected={categoryIds} onChange={setCategoryIds} />
          <WizardNav onBack={() => setStep(0)} onNext={() => setStep(2)} />
        </Card>
      )}

      {step === 2 && (
        <Card padding={32} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <HoursEditor value={hours} onChange={setHours} />
          <WizardNav onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </Card>
      )}

      {step === 3 && createdId && (
        <Card padding={32} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PhotoManager businessId={createdId} photos={photos} onChange={setPhotos} />
          <WizardNav onBack={() => setStep(2)} onNext={() => setStep(4)} />
        </Card>
      )}

      {step === 4 && (
        <Card padding={32} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 className="h3">Ready to go live?</h3>
          <p className="body" style={{ color: 'var(--fg-2)' }}>
            Publishing makes your business visible on the public explorer. You can change everything
            later from the Profile page.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <Button variant="ghost" onClick={() => setStep(3)}>
              Back
            </Button>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                variant="ghost"
                onClick={() => finishMut.mutate(false)}
                loading={finishMut.isPending}
              >
                Save as draft
              </Button>
              <Button onClick={() => finishMut.mutate(true)} loading={finishMut.isPending}>
                Publish
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {STEP_LABELS.map((label, i) => (
        <div key={label} style={{ flex: 1, textAlign: 'center' }}>
          <div
            style={{
              height: 4,
              borderRadius: 6,
              background: i <= step ? 'var(--action)' : 'var(--border-default)',
            }}
          />
          <span
            className="caption"
            style={{ color: i <= step ? 'var(--action)' : 'var(--fg-3)', marginTop: 6, display: 'block' }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function WizardNav({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Button variant="ghost" onClick={onBack}>
        Back
      </Button>
      <Button onClick={onNext}>Next</Button>
    </div>
  );
}

/* ===================== Edit mode ===================== */

function EditBusiness({ businessId }: { businessId: string }) {
  const toast = useToast();
  const qc = useQueryClient();

  const myBiz = useQuery({
    queryKey: ['my-businesses'],
    queryFn: () => api<{ id: string; staffRole: string }[]>('/api/me/businesses'),
    staleTime: Infinity,
  });
  const isOwner = (myBiz.data ?? []).some((b) => b.id === businessId && b.staffRole === 'owner');

  const detail = useQuery({
    queryKey: ['business-detail', businessId],
    queryFn: () => api<BusinessDetail>(`/api/businesses/${businessId}`),
    retry: false,
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [logoR2Key, setLogoR2Key] = useState<string | null>(null);
  const [coverR2Key, setCoverR2Key] = useState<string | null>(null);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [hours, setHours] = useState<OpeningHours>(defaultHours());
  const [isPublished, setIsPublished] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const d = detail.data;
    if (!d) return;
    setName(d.name);
    setDescription(d.description ?? '');
    setAddress(d.address ?? '');
    setCountry(d.country ?? '');
    setCity(d.city ?? '');
    setLogoR2Key(d.logoR2Key);
    setCoverR2Key(d.coverR2Key);
    setCategoryIds(d.categories.map((c) => c.id));
    setHours(d.openingHours ?? defaultHours());
    setIsPublished(d.isPublished);
    setPhotos(d.photos);
  }, [detail.data]);

  const saveMut = useMutation({
    mutationFn: () =>
      api(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        body: {
          name,
          description: description || null,
          address: address || null,
          country: country || null,
          city: city || null,
          logoR2Key,
          coverR2Key,
          categoryIds,
          openingHours: hours,
          isPublished,
        },
      }),
    onSuccess: () => {
      toast.success('Saved');
      qc.invalidateQueries({ queryKey: ['business-detail', businessId] });
      qc.invalidateQueries({ queryKey: ['my-businesses'] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not save'),
  });

  const nameUnsafe = findUnsafeContent(name) !== null;
  const descriptionUnsafe = findUnsafeContent(description) !== null;
  const addressUnsafe = findUnsafeContent(address) !== null;
  const cityUnsafe = findUnsafeContent(city) !== null;
  const basicsUnsafe = nameUnsafe || descriptionUnsafe || addressUnsafe || cityUnsafe;

  if (detail.isLoading) return <p className="body">Loading…</p>;
  if (detail.error) {
    return (
      <Card>
        <h2 className="h2">Couldn't load this business</h2>
        <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          {(detail.error as Error).message}
        </p>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <span className="label">Business profile</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>
          {detail.data?.name}
        </h1>
        <p className="caption" style={{ color: 'var(--fg-3)' }}>
          /{detail.data?.slug} (slug is read-only after creation)
        </p>
      </header>

      {detail.data && <SupportIdCard id={detail.data.id} />}

      <Card padding={32} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 className="h3">Basics</h3>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)}
          error={nameUnsafe ? UNSAFE_INPUT_MESSAGE : undefined} />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)}
          error={descriptionUnsafe ? UNSAFE_INPUT_MESSAGE : undefined} />
        <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)}
          error={addressUnsafe ? UNSAFE_INPUT_MESSAGE : undefined} />
        <CountrySelect value={country} onChange={setCountry} />
        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)}
          error={cityUnsafe ? UNSAFE_INPUT_MESSAGE : undefined} />
      </Card>

      {isOwner && (
        <Card padding={32} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 className="h3">Images</h3>
          <p className="body-sm" style={{ color: 'var(--fg-3)', marginTop: -8 }}>
            Upload your logo and cover photo, then click Save changes below.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <UploadField
              label="Logo"
              hint="Square - shown next to your name in cards"
              currentKey={logoR2Key}
              onPick={async (file) => setLogoR2Key(await presignAndUpload('business_logo', businessId, file))}
            />
            <UploadField
              label="Cover image"
              hint="Wide banner - shown at the top of your shop card"
              currentKey={coverR2Key}
              onPick={async (file) => setCoverR2Key(await presignAndUpload('business_cover', businessId, file))}
            />
          </div>
        </Card>
      )}

      <Card padding={32} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 className="h3">Categories</h3>
        <CategoryPicker selected={categoryIds} onChange={setCategoryIds} />
      </Card>

      <Card padding={32} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 className="h3">Opening hours</h3>
        <HoursEditor value={hours} onChange={setHours} />
      </Card>

      <Card padding={32} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 className="h3">Photos</h3>
        <PhotoManager businessId={businessId} photos={photos} onChange={setPhotos} />
      </Card>

      <Card padding={32} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', font: 'var(--t-body)' }}>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Published - visible on the public explorer
        </label>
        <Button onClick={() => saveMut.mutate()} loading={saveMut.isPending} disabled={basicsUnsafe}>
          <Save size={16} /> Save changes
        </Button>
      </Card>
    </div>
  );
}

/* ===================== Shared sections ===================== */

type PickerCategory = { id: string; name: string; slug: string; parentId: string | null };

/**
 * Hierarchical category picker matching the mobile app: each main (parent)
 * category is an accordion row; expanding it reveals its sub-categories as
 * checkboxes. Selection is on sub-categories only. Parents with selected
 * children auto-expand in edit mode and show a count badge.
 */
function CategoryPicker({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const cats = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<PickerCategory[]>('/api/categories'),
  });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const mains = useMemo(() => (cats.data ?? []).filter((c) => c.parentId === null), [cats.data]);
  const childrenByMain = useMemo(() => {
    const map = new Map<string, PickerCategory[]>();
    for (const c of cats.data ?? []) {
      if (c.parentId) {
        const arr = map.get(c.parentId) ?? [];
        arr.push(c);
        map.set(c.parentId, arr);
      }
    }
    return map;
  }, [cats.data]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // Auto-expand parents that already have selected sub-categories (edit mode).
  useEffect(() => {
    if (!cats.data?.length) return;
    const toExpand = new Set<string>();
    for (const [mid, children] of childrenByMain.entries()) {
      if (children.some((c) => selected.includes(c.id))) toExpand.add(mid);
    }
    if (toExpand.size > 0) setExpanded((prev) => new Set([...prev, ...toExpand]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cats.data]);

  if (cats.isLoading) return <p className="body">Loading categories…</p>;
  if (cats.error)
    return (
      <p className="body" style={{ color: 'var(--danger)' }}>
        Couldn't load categories: {(cats.error as Error).message}
      </p>
    );

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSub = (id: string) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {mains.map((m) => {
        const children = childrenByMain.get(m.id) ?? [];
        const isOpen = expanded.has(m.id);
        const selectedCount = children.filter((c) => selectedSet.has(c.id)).length;
        const hasSelection = selectedCount > 0;

        return (
          <div
            key={m.id}
            style={{
              borderRadius: 10,
              border: `1px solid ${hasSelection ? 'var(--action)' : 'var(--border-default)'}`,
              overflow: 'hidden',
            }}
          >
            {/* Accordion header */}
            <button
              type="button"
              onClick={() => toggleExpand(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                gap: 8,
                padding: 12,
                background: 'var(--bg-card)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  flex: 1,
                  font: 'var(--t-body)',
                  fontWeight: hasSelection ? 600 : 400,
                  color: hasSelection ? 'var(--fg-1)' : 'var(--fg-2)',
                }}
              >
                {m.name}
              </span>
              {hasSelection && (
                <span
                  style={{
                    background: 'var(--action-subtle-bg)',
                    color: 'var(--action-subtle-fg)',
                    borderRadius: 'var(--r-pill)',
                    padding: '2px 8px',
                    font: 'var(--t-caption)',
                  }}
                >
                  {selectedCount}
                </span>
              )}
              <ChevronDown
                size={16}
                color="var(--fg-3)"
                style={{
                  flexShrink: 0,
                  transition: 'transform var(--dur-1) var(--ease-out)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* Expanded sub-category checkboxes */}
            {isOpen && (
              <div style={{ background: 'var(--bg-canvas)', padding: '0 12px 4px' }}>
                {children.length === 0 ? (
                  <p className="caption" style={{ color: 'var(--fg-3)', padding: '10px 0' }}>
                    No sub-categories
                  </p>
                ) : (
                  children.map((c, ci) => {
                    const on = selectedSet.has(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleSub(c.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '11px 0',
                          background: 'transparent',
                          border: 'none',
                          borderBottom:
                            ci < children.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            flexShrink: 0,
                            border: `2px solid ${on ? 'var(--action)' : 'var(--border-default)'}`,
                            background: on ? 'var(--action)' : 'transparent',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {on && <Check size={12} color="#fff" />}
                        </span>
                        <span
                          style={{
                            font: 'var(--t-body)',
                            color: on ? 'var(--action-subtle-fg)' : 'var(--fg-2)',
                          }}
                        >
                          {c.name}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HoursEditor({ value, onChange }: { value: OpeningHours; onChange: (v: OpeningHours) => void }) {
  const setDay = (key: DayKey, patch: Partial<DayHours>) => {
    onChange({ ...value, [key]: { ...value[key], ...patch } });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {DAYS.map(([key, label]) => {
        const d = value[key];
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ width: 96, font: 'var(--t-body)' }}>{label}</span>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--t-body-sm)', color: 'var(--fg-2)' }}>
              <input
                type="checkbox"
                checked={d.closed}
                onChange={(e) => setDay(key, { closed: e.target.checked })}
              />
              Closed
            </label>
            {!d.closed && (
              <>
                <input
                  type="time"
                  value={d.open}
                  onChange={(e) => setDay(key, { open: e.target.value })}
                  style={timeStyle}
                />
                <span style={{ color: 'var(--fg-3)' }}>to</span>
                <input
                  type="time"
                  value={d.close}
                  onChange={(e) => setDay(key, { close: e.target.value })}
                  style={timeStyle}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PhotoManager({
  businessId,
  photos,
  onChange,
}: {
  businessId: string;
  photos: Photo[];
  onChange: (v: Photo[]) => void;
}) {
  const toast = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onPick = async (file: File) => {
    setBusy(true);
    try {
      const key = await presignAndUpload('business_photo', businessId, file);
      const photo = await api<Photo>(`/api/businesses/${businessId}/photos`, {
        method: 'POST',
        body: { r2Key: key, sortOrder: photos.length },
      });
      onChange([...photos, photo]);
      toast.success('Photo added');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (photoId: string) => {
    try {
      await api(`/api/businesses/${businessId}/photos/${photoId}`, { method: 'DELETE' });
      onChange(photos.filter((p) => p.id !== photoId));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not remove');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
        {photos.map((p) => {
          const url = r2Url(p.r2Key);
          return (
            <div
              key={p.id}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-muted)',
              }}
            >
              {url ? (
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className="caption" style={{ padding: 8, color: 'var(--fg-3)', wordBreak: 'break-all' }}>
                  {p.r2Key}
                </span>
              )}
              <button
                onClick={() => onDelete(p.id)}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  display: 'inline-flex',
                  padding: 6,
                  borderRadius: 10,
                  border: 'none',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  cursor: 'pointer',
                }}
                aria-label="Remove photo"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) await onPick(f);
          e.target.value = '';
        }}
      />
      <div>
        <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} loading={busy}>
          <Upload size={14} /> Add photo
        </Button>
      </div>
    </div>
  );
}

/* ===================== Small components ===================== */

function SupportIdCard({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card padding={20} variant="muted">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p className="label">Support ID</p>
          <p className="mono" style={{ font: 'var(--t-num)', marginTop: 4, wordBreak: 'break-all' }}>
            {id}
          </p>
          <p className="caption" style={{ marginTop: 4, color: 'var(--fg-3)' }}>
            Share this with support if you ever need help with your business account.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(id);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </Card>
  );
}

function UploadField({
  label,
  hint,
  currentKey,
  onPick,
}: {
  label: string;
  hint?: string;
  currentKey: string | null;
  onPick: (file: File) => void | Promise<void>;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const url = r2Url(currentKey);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <p className="label">{label}</p>
      {hint && <p className="caption" style={{ color: 'var(--fg-3)', marginTop: -2 }}>{hint}</p>}
      <div
        style={{
          border: '1px solid var(--border-default)',
          borderRadius: 10,
          overflow: 'hidden',
          background: 'var(--bg-muted)',
        }}
      >
        {url ? (
          <img
            src={url}
            alt=""
            style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              height: 140,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              color: 'var(--fg-3)',
            }}
          >
            <Upload size={24} strokeWidth={1.5} />
            <span className="caption">No image yet</span>
          </div>
        )}
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              try { await onPick(f); } finally { setBusy(false); }
              e.target.value = '';
            }}
          />
          <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} loading={busy}>
            <Upload size={14} /> {url ? 'Replace' : 'Upload'}
          </Button>
          {currentKey && (
            <span className="caption" style={{ color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentKey.split('/').pop()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const timeStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 10,
  padding: '8px 12px',
  font: 'var(--t-body)',
  color: 'var(--fg-1)',
};
