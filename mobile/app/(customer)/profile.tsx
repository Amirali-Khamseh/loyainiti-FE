/**
 * Customer profile editor: display name, short bio (150 chars), profile photo.
 * Mobile counterpart to web's ProfilePage.
 *
 * Avatar resolution mirrors web: prefer the uploaded photo (avatarR2Key)
 * and fall back to user.image (populated by Better Auth from OAuth
 * providers later). When Google SSO lands, the same screen renders the
 * Google photo with no further code changes.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View, TextInput, Pressable, Image, Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Upload, Trash2, UserCircle, LogOut } from 'lucide-react-native';
import { api, ApiError } from '../../src/lib/api';
import { auth } from '../../src/lib/auth';
import { r2Url } from '../../src/lib/media';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Card } from '../../src/components/Card';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

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

async function pickAndUploadAvatar(): Promise<string | null> {
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
  const filename = asset.fileName ?? `avatar-${Date.now()}.jpg`;
  const mimeType = asset.mimeType ?? 'image/jpeg';

  const presign = await api<{ url: string; key: string }>('/api/uploads/presign', {
    method: 'POST',
    body: { kind: 'avatar', filename, mimeType },
  });
  const blob = await (await fetch(asset.uri)).blob();
  const put = await fetch(presign.url, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body: blob,
  });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);
  return presign.key;
}

export default function CustomerProfileScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ['me'], queryFn: () => api<Me>('/api/me') });

  const signOut = async () => {
    await auth.signOut();
    qc.clear();
    router.replace('/(auth)/sign-in');
  };

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarR2Key, setAvatarR2Key] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      qc.setQueryData(['me'], next);
      Alert.alert('Saved', 'Your profile has been updated.');
    },
    onError: (e) =>
      Alert.alert('Could not save', e instanceof ApiError ? e.message : String(e)),
  });

  const onPickPhoto = async () => {
    setUploading(true);
    try {
      const key = await pickAndUploadAvatar();
      if (key) setAvatarR2Key(key);
    } catch (e) {
      Alert.alert('Upload failed', e instanceof ApiError ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  if (me.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Typo variant="body" color={tokens.colors.fg3}>Loading…</Typo>
      </View>
    );
  }
  if (me.error || !me.data) {
    return (
      <View style={{ padding: 20 }}>
        <Typo variant="body" color={tokens.colors.danger}>
          Couldn't load your profile.
        </Typo>
      </View>
    );
  }

  // Preview: prefer pending in-flight avatar, else fall back through r2 -> oauth.
  const previewSrc = r2Url(avatarR2Key) ?? me.data.image ?? null;
  const dirty =
    displayName.trim() !== me.data.displayName ||
    (bio.trim() || null) !== (me.data.bio ?? null) ||
    avatarR2Key !== me.data.avatarR2Key;

  return (
    <ScrollView
      style={{ backgroundColor: tokens.colors.bgCanvas }}
      contentContainerStyle={{ padding: 20, gap: 20 }}
    >
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>Profile</Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>
          Your profile
        </Typo>
        <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
          Tell other regulars a little about yourself. Shops see this when they look you up.
        </Typo>
      </View>

      <Card style={{ gap: 20 }}>
        {/* Photo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: tokens.colors.bgMuted,
              borderWidth: 1,
              borderColor: tokens.colors.borderDefault,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {previewSrc ? (
              <Image source={{ uri: previewSrc }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <UserCircle size={48} color={tokens.colors.fg3} />
            )}
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Button variant="ghost" size="sm" onPress={onPickPhoto} loading={uploading}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Upload size={14} color={tokens.colors.action} />
                  <Typo variant="bodySm" color={tokens.colors.action}>
                    {avatarR2Key ? 'Change' : 'Add photo'}
                  </Typo>
                </View>
              </Button>
              {avatarR2Key && (
                <Button variant="ghost" size="sm" onPress={() => setAvatarR2Key(null)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Trash2 size={14} color={tokens.colors.fg2} />
                    <Typo variant="bodySm" color={tokens.colors.fg2}>
                      Remove
                    </Typo>
                  </View>
                </Button>
              )}
            </View>
            <Typo variant="caption" color={tokens.colors.fg3}>
              JPG, PNG or WebP.
            </Typo>
          </View>
        </View>

        {/* Display name */}
        <Input
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          maxLength={120}
        />

        {/* Bio */}
        <View>
          <Typo variant="label" color={tokens.colors.fg2} style={{ marginBottom: 6 }}>
            Short bio
          </Typo>
          <TextInput
            value={bio}
            onChangeText={(t) => setBio(t.slice(0, BIO_MAX))}
            multiline
            numberOfLines={3}
            placeholder="Coffee lover, runner, generally insufferable on Mondays."
            placeholderTextColor={tokens.colors.fg3}
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: tokens.colors.borderDefault,
              backgroundColor: tokens.colors.bgCard,
              color: tokens.colors.fg1,
              fontFamily: tokens.fonts.body,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 4,
            }}
          >
            <Typo variant="caption" color={tokens.colors.fg3}>
              Visible on your profile in shops you've visited.
            </Typo>
            <Typo
              variant="caption"
              color={bio.length >= BIO_MAX ? tokens.colors.danger : tokens.colors.fg3}
            >
              {bio.length} / {BIO_MAX}
            </Typo>
          </View>
        </View>

        <Pressable
          disabled={!dirty || displayName.trim().length < 1 || saveMut.isPending}
          onPress={() => saveMut.mutate()}
        >
          <Button
            onPress={() => saveMut.mutate()}
            loading={saveMut.isPending}
            disabled={!dirty || displayName.trim().length < 1}
          >
            Save changes
          </Button>
        </Pressable>
      </Card>

      <Card variant="muted">
        <Typo variant="label" color={tokens.colors.fg2}>Account</Typo>
        <Typo variant="body" style={{ marginTop: 4 }}>
          {me.data.email}
        </Typo>
        <Typo variant="caption" color={tokens.colors.fg3} style={{ marginTop: 4 }}>
          Sign-in details and password are managed separately - use Forgot password from sign-in.
        </Typo>
      </Card>

      <Button
        variant="ghost"
        onPress={() =>
          Alert.alert('Sign out?', 'You can sign back in any time.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: signOut },
          ])
        }
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <LogOut size={16} color={tokens.colors.fg2} />
          <Typo variant="body" color={tokens.colors.fg2}>
            Sign out
          </Typo>
        </View>
      </Button>
    </ScrollView>
  );
}
