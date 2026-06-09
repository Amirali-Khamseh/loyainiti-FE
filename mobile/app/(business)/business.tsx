/**
 * Business profile screen.
 *
 * Two distinct modes share this file (mirroring the web BusinessProfilePage):
 *
 * 1. Onboarding wizard (?onboarding=1 OR no active business yet)
 *    5 steps: Basics -> Categories -> Hours -> Photos -> Publish
 *    Step 0 creates the business; the resulting id flows through the
 *    remaining steps; final step PATCHes everything in one go and
 *    navigates to /(business)/dashboard.
 *
 * 2. Edit (default once a business exists)
 *    All sections rendered as a single scrollable form. Loads via
 *    GET /api/businesses/:id which returns the full detail incl.
 *    categories, hours and photos.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Pressable, Image, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Check, Upload, Trash2, LogOut } from 'lucide-react-native';
import { api, ApiError } from '../../src/lib/api';
import { auth } from '../../src/lib/auth';
import { r2Url } from '../../src/lib/media';
import { getActiveBusinessId, setActiveBusinessId } from '../../src/lib/activeBusiness';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Card } from '../../src/components/Card';
import { ConfirmDialog } from '../../src/components/Modal';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

/* ── Types ─────────────────────────────────────────────────────────── */

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

async function pickAndUpload(kind: UploadKind, businessId: string): Promise<string | null> {
  // Request gallery permission. On web this is a no-op.
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Permission needed', 'We need access to your photos to upload an image.');
    return null;
  }

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.85,
  });
  if (res.canceled || !res.assets?.[0]) return null;
  const asset = res.assets[0];

  // Derive filename + mime; the picker exposes them on web, native sometimes
  // gives us just a uri without extension. Fall back to .jpg.
  const filename = asset.fileName ?? `upload-${Date.now()}.jpg`;
  const mimeType = asset.mimeType ?? 'image/jpeg';

  const presign = await api<{ url: string; key: string }>('/api/uploads/presign', {
    method: 'POST',
    body: { kind, businessId, filename, mimeType },
  });

  // Fetch the local file as a blob and PUT to the presigned URL.
  const blob = await (await fetch(asset.uri)).blob();
  const put = await fetch(presign.url, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body: blob,
  });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);
  return presign.key;
}

/* ── Screen ────────────────────────────────────────────────────────── */

export default function ProfileScreen() {
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    getActiveBusinessId().then((id) => {
      setBusinessId(id);
      setResolving(false);
    });
  }, []);

  if (resolving) return null;

  const isOnboarding = onboarding === '1' || !businessId;
  if (isOnboarding) {
    return <OnboardingWizard initialBusinessId={businessId} onCreated={setBusinessId} />;
  }
  return <EditBusiness businessId={businessId!} />;
}

/* ── Onboarding wizard ─────────────────────────────────────────────── */

type Step = 0 | 1 | 2 | 3 | 4;
const STEP_LABELS = ['Basics', 'Categories', 'Hours', 'Photos', 'Publish'];

function OnboardingWizard({
  initialBusinessId,
  onCreated,
}: {
  initialBusinessId: string | null;
  onCreated: (id: string) => void;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>(0);
  const [createdId, setCreatedId] = useState<string | null>(initialBusinessId);
  const [draft, setDraft] = useState({ name: '', description: '', address: '' });
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [hours, setHours] = useState<OpeningHours>(defaultHours());
  const [photos, setPhotos] = useState<Photo[]>([]);

  const createMut = useMutation({
    mutationFn: () => api<{ id: string }>('/api/businesses', { method: 'POST', body: draft }),
    onSuccess: async (b) => {
      await setActiveBusinessId(b.id);
      setCreatedId(b.id);
      qc.invalidateQueries({ queryKey: ['my-businesses'] });
      setStep(1);
    },
    onError: (e) => Alert.alert('Could not create', e instanceof ApiError ? e.message : String(e)),
  });

  const finishMut = useMutation({
    mutationFn: (publish: boolean) =>
      api(`/api/businesses/${createdId}`, {
        method: 'PATCH',
        body: { categoryIds, openingHours: hours, isPublished: publish },
      }),
    onSuccess: async () => {
      // Force session refresh so the role-promotion is picked up.
      try {
        await auth.getSession();
      } catch {
        /* non-fatal */
      }
      router.replace('/(business)/dashboard');
    },
    onError: (e) => Alert.alert('Could not save', e instanceof ApiError ? e.message : String(e)),
  });

  return (
    <ScrollView
      style={{ backgroundColor: tokens.colors.bgCanvas }}
      contentContainerStyle={{ padding: 20, gap: 20 }}
    >
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>
          Onboarding · {STEP_LABELS[step]}
        </Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>
          Set up your business
        </Typo>
      </View>

      <Stepper step={step} />

      {step === 0 && (
        <Card style={{ gap: 12 }}>
          <Input
            label="Business name"
            value={draft.name}
            onChangeText={(t) => setDraft({ ...draft, name: t })}
          />
          <Input
            label="Description"
            value={draft.description}
            onChangeText={(t) => setDraft({ ...draft, description: t })}
            placeholder="Specialty coffee + pastries"
          />
          <Input
            label="Address"
            value={draft.address}
            onChangeText={(t) => setDraft({ ...draft, address: t })}
            placeholder="Via Roma 12, Milan"
          />
          <Button
            onPress={() => createMut.mutate()}
            loading={createMut.isPending}
            disabled={draft.name.trim().length < 2}
            size="lg"
          >
            Create &amp; continue
          </Button>
        </Card>
      )}

      {step === 1 && createdId && (
        <Card style={{ gap: 12 }}>
          <CategoryPicker selected={categoryIds} onChange={setCategoryIds} />
          <WizardNav onBack={() => setStep(0)} onNext={() => setStep(2)} />
        </Card>
      )}

      {step === 2 && (
        <Card style={{ gap: 12 }}>
          <HoursEditor value={hours} onChange={setHours} />
          <WizardNav onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </Card>
      )}

      {step === 3 && createdId && (
        <Card style={{ gap: 12 }}>
          <PhotoManager businessId={createdId} photos={photos} onChange={setPhotos} />
          <WizardNav onBack={() => setStep(2)} onNext={() => setStep(4)} />
        </Card>
      )}

      {step === 4 && (
        <Card style={{ gap: 12 }}>
          <Typo variant="h3">Ready to go live?</Typo>
          <Typo variant="body" color={tokens.colors.fg2}>
            Publishing makes your business visible on the public explorer. You can change everything
            later from the Profile page.
          </Typo>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
            <Button variant="ghost" onPress={() => setStep(3)}>
              Back
            </Button>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                variant="ghost"
                onPress={() => finishMut.mutate(false)}
                loading={finishMut.isPending}
              >
                Save as draft
              </Button>
              <Button onPress={() => finishMut.mutate(true)} loading={finishMut.isPending}>
                Publish
              </Button>
            </View>
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {STEP_LABELS.map((label, i) => (
        <View key={label} style={{ flex: 1, alignItems: 'center' }}>
          <View
            style={{
              height: 4,
              borderRadius: 2,
              width: '100%',
              backgroundColor: i <= step ? tokens.colors.action : tokens.colors.borderDefault,
            }}
          />
          <Typo
            variant="caption"
            color={i <= step ? tokens.colors.action : tokens.colors.fg3}
            style={{ marginTop: 6, textAlign: 'center' }}
          >
            {label}
          </Typo>
        </View>
      ))}
    </View>
  );
}

function WizardNav({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
      <Button variant="ghost" onPress={onBack}>
        Back
      </Button>
      <Button onPress={onNext}>Next</Button>
    </View>
  );
}

/* ── Edit mode ─────────────────────────────────────────────────────── */

function EditBusiness({ businessId }: { businessId: string }) {
  const qc = useQueryClient();
  const detail = useQuery({
    queryKey: ['business-detail', businessId],
    queryFn: () => api<BusinessDetail>(`/api/businesses/${businessId}`),
    retry: false,
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [logoR2Key, setLogoR2Key] = useState<string | null>(null);
  const [coverR2Key, setCoverR2Key] = useState<string | null>(null);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [hours, setHours] = useState<OpeningHours>(defaultHours());
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    const d = detail.data;
    if (!d) return;
    setName(d.name);
    setDescription(d.description ?? '');
    setAddress(d.address ?? '');
    setLogoR2Key(d.logoR2Key);
    setCoverR2Key(d.coverR2Key);
    setCategoryIds(d.categories.map((c: Category) => c.id));
    setHours(d.openingHours ?? defaultHours());
    setPhotos(d.photos);
    setIsPublished(d.isPublished);
  }, [detail.data]);

  const saveMut = useMutation({
    mutationFn: () =>
      api(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        body: {
          name,
          description: description || null,
          address: address || null,
          logoR2Key,
          coverR2Key,
          categoryIds,
          openingHours: hours,
          isPublished,
        },
      }),
    onSuccess: () => {
      Alert.alert('Saved');
      qc.invalidateQueries({ queryKey: ['business-detail', businessId] });
    },
    onError: (e) => Alert.alert('Could not save', e instanceof ApiError ? e.message : String(e)),
  });

  if (detail.isLoading) return <Loading />;
  if (detail.error) {
    return (
      <View style={{ padding: 20 }}>
        <Typo variant="h2">Couldn't load this business</Typo>
        <Typo variant="body" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
          {(detail.error as Error).message}
        </Typo>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: tokens.colors.bgCanvas }}
      contentContainerStyle={{ padding: 20, gap: 20 }}
    >
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>Business profile</Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>
          {detail.data?.name}
        </Typo>
        <Typo variant="caption" color={tokens.colors.fg3} style={{ marginTop: 4 }}>
          /{detail.data?.slug} (slug is read-only after creation)
        </Typo>
      </View>

      <Card style={{ gap: 12 }}>
        <Typo variant="h3">Basics</Typo>
        <Input label="Name" value={name} onChangeText={setName} />
        <Input label="Description" value={description} onChangeText={setDescription} />
        <Input label="Address" value={address} onChangeText={setAddress} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <SingleImageField
              label="Logo"
              currentKey={logoR2Key}
              onPicked={(key) => setLogoR2Key(key)}
              onClear={() => setLogoR2Key(null)}
              kind="business_logo"
              businessId={businessId}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SingleImageField
              label="Cover"
              currentKey={coverR2Key}
              onPicked={(key) => setCoverR2Key(key)}
              onClear={() => setCoverR2Key(null)}
              kind="business_cover"
              businessId={businessId}
            />
          </View>
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <Typo variant="h3">Categories</Typo>
        <CategoryPicker selected={categoryIds} onChange={setCategoryIds} />
      </Card>

      <Card style={{ gap: 12 }}>
        <Typo variant="h3">Opening hours</Typo>
        <HoursEditor value={hours} onChange={setHours} />
      </Card>

      <Card style={{ gap: 12 }}>
        <Typo variant="h3">Gallery</Typo>
        <PhotoManager businessId={businessId} photos={photos} onChange={setPhotos} />
      </Card>

      <Card style={{ gap: 12 }}>
        <Pressable
          onPress={() => setIsPublished((p) => !p)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
        >
          <View
            style={{
              width: 22, height: 22, borderRadius: 4,
              borderWidth: 2,
              borderColor: isPublished ? tokens.colors.action : tokens.colors.borderDefault,
              backgroundColor: isPublished ? tokens.colors.action : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isPublished && <Check size={14} color="#fff" />}
          </View>
          <Typo variant="body">Published - visible on the public explorer</Typo>
        </Pressable>
        <Button onPress={() => saveMut.mutate()} loading={saveMut.isPending}>
          Save changes
        </Button>
      </Card>

      <SignOutButton />
    </ScrollView>
  );
}

function SignOutButton() {
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const doSignOut = async () => {
    setBusy(true);
    try {
      await auth.signOut();
      qc.clear();
      router.replace('/(auth)/sign-in');
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button variant="ghost" onPress={() => setOpen(true)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <LogOut size={16} color={tokens.colors.fg2} />
          <Typo variant="body" color={tokens.colors.fg2}>
            Sign out
          </Typo>
        </View>
      </Button>
      <ConfirmDialog
        visible={open}
        title="Sign out?"
        message="You can sign back in any time."
        confirmLabel="Sign out"
        destructive
        loading={busy}
        onConfirm={doSignOut}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

/* ── Shared section components ─────────────────────────────────────── */

function CategoryPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const cats = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/api/categories'),
  });
  if (cats.isLoading) return <Typo variant="body">Loading categories…</Typo>;
  if (cats.error)
    return (
      <Typo variant="body" color={tokens.colors.danger}>
        Couldn't load categories: {(cats.error as Error).message}
      </Typo>
    );

  const selectedSet = new Set(selected);
  const toggle = (id: string) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {(cats.data ?? []).map((c: Category) => {
        const on = selectedSet.has(c.id);
        return (
          <Pressable
            key={c.id}
            onPress={() => toggle(c.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: on ? tokens.colors.action : tokens.colors.borderDefault,
              backgroundColor: on ? tokens.colors.actionSubtleBg : tokens.colors.bgCard,
            }}
          >
            {on && <Check size={14} color={tokens.colors.action} />}
            <Typo
              variant="bodySm"
              color={on ? tokens.colors.actionSubtleFg : tokens.colors.fg2}
              style={{ fontWeight: '500' }}
            >
              {c.name}
            </Typo>
          </Pressable>
        );
      })}
    </View>
  );
}

function HoursEditor({
  value,
  onChange,
}: {
  value: OpeningHours;
  onChange: (v: OpeningHours) => void;
}) {
  const setDay = (key: DayKey, patch: Partial<DayHours>) => {
    onChange({ ...value, [key]: { ...value[key], ...patch } });
  };

  return (
    <View style={{ gap: 10 }}>
      {DAYS.map(([key, label]) => {
        const d = value[key];
        return (
          <View
            key={key}
            style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}
          >
            <Typo variant="body" style={{ width: 90 }}>
              {label}
            </Typo>
            <Pressable
              onPress={() => setDay(key, { closed: !d.closed })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <View
                style={{
                  width: 18, height: 18, borderRadius: 4, borderWidth: 2,
                  borderColor: d.closed ? tokens.colors.action : tokens.colors.borderDefault,
                  backgroundColor: d.closed ? tokens.colors.action : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {d.closed && <Check size={12} color="#fff" />}
              </View>
              <Typo variant="bodySm" color={tokens.colors.fg2}>
                Closed
              </Typo>
            </Pressable>
            {!d.closed && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TextInput
                  value={d.open}
                  onChangeText={(t) => setDay(key, { open: t })}
                  placeholder="09:00"
                  maxLength={5}
                  style={timeStyle}
                />
                <Typo variant="bodySm" color={tokens.colors.fg3}>
                  to
                </Typo>
                <TextInput
                  value={d.close}
                  onChangeText={(t) => setDay(key, { close: t })}
                  placeholder="17:00"
                  maxLength={5}
                  style={timeStyle}
                />
              </View>
            )}
          </View>
        );
      })}
    </View>
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
  const [busy, setBusy] = useState(false);

  const add = async () => {
    setBusy(true);
    try {
      const key = await pickAndUpload('business_photo', businessId);
      if (!key) return;
      const photo = await api<Photo>(`/api/businesses/${businessId}/photos`, {
        method: 'POST',
        body: { r2Key: key, sortOrder: photos.length },
      });
      onChange([...photos, photo]);
    } catch (e) {
      Alert.alert('Upload failed', e instanceof ApiError ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (photoId: string) => {
    try {
      await api(`/api/businesses/${businessId}/photos/${photoId}`, { method: 'DELETE' });
      onChange(photos.filter((p) => p.id !== photoId));
    } catch (e) {
      Alert.alert('Remove failed', e instanceof ApiError ? e.message : String(e));
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {photos.map((p: Photo) => {
          const url = r2Url(p.r2Key);
          return (
            <View
              key={p.id}
              style={{
                width: 100, height: 100, borderRadius: 4,
                borderWidth: 1, borderColor: tokens.colors.borderSubtle,
                backgroundColor: tokens.colors.bgMuted, overflow: 'hidden',
              }}
            >
              {url ? (
                <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 6 }}>
                  <Typo variant="caption" color={tokens.colors.fg3}>
                    {p.r2Key.split('/').pop()}
                  </Typo>
                </View>
              )}
              <Pressable
                onPress={() => remove(p.id)}
                style={{
                  position: 'absolute', top: 4, right: 4,
                  backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: 4,
                }}
              >
                <Trash2 size={14} color="#fff" />
              </Pressable>
            </View>
          );
        })}
      </View>
      <Button variant="ghost" size="sm" onPress={add} loading={busy}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Upload size={14} color={tokens.colors.action} />
          <Typo variant="bodySm" color={tokens.colors.action}>
            Add photo
          </Typo>
        </View>
      </Button>
    </View>
  );
}

function SingleImageField({
  label,
  currentKey,
  onPicked,
  onClear,
  kind,
  businessId,
}: {
  label: string;
  currentKey: string | null;
  onPicked: (key: string) => void;
  onClear: () => void;
  kind: 'business_logo' | 'business_cover';
  businessId: string;
}) {
  const [busy, setBusy] = useState(false);
  const url = r2Url(currentKey);

  const pick = async () => {
    setBusy(true);
    try {
      const key = await pickAndUpload(kind, businessId);
      if (key) onPicked(key);
    } catch (e) {
      Alert.alert('Upload failed', e instanceof ApiError ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 6 }}>
      <Typo variant="label" color={tokens.colors.fg2}>
        {label}
      </Typo>
      <View
        style={{
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: tokens.colors.borderDefault,
          borderRadius: 4,
          padding: 12,
          alignItems: 'center',
          gap: 8,
          minHeight: 110,
          justifyContent: 'center',
        }}
      >
        {url ? (
          <Image source={{ uri: url }} style={{ width: 64, height: 64, borderRadius: 4 }} />
        ) : (
          <Typo variant="caption" color={tokens.colors.fg3}>
            No image
          </Typo>
        )}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Button variant="ghost" size="sm" onPress={pick} loading={busy}>
            Choose
          </Button>
          {currentKey && (
            <Button variant="ghost" size="sm" onPress={onClear}>
              Remove
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

/* ── Misc ──────────────────────────────────────────────────────────── */

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Typo variant="body" color={tokens.colors.fg3}>
        Loading…
      </Typo>
    </View>
  );
}

const timeStyle = {
  backgroundColor: tokens.colors.bgCard,
  borderWidth: 1,
  borderColor: tokens.colors.borderDefault,
  borderRadius: 4,
  paddingHorizontal: 10,
  paddingVertical: 6,
  fontFamily: tokens.fonts.body,
  color: tokens.colors.fg1,
  minWidth: 64,
};
