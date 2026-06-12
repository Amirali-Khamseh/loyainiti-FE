import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Gift } from 'lucide-react-native';
import { api, ApiError } from '../../src/lib/api';
import { resolveActiveBusinessId } from '../../src/lib/activeBusiness';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Card } from '../../src/components/Card';
import { Typo } from '../../src/components/Heading';
import { LoyaltyStamp } from '../../src/components/LoyaltyStamp';
import { tokens } from '../../src/design-system/tokens';

type ScanResult = {
  customer: { id: string; displayName: string };
  totals: { totalVisits: number; visitsSinceLastRedemption: number };
  loyalty: null | {
    requiredVisits: number;
    rewardDescription: string;
    rewardEligible: boolean;
  };
};

function normalize(raw: string): string {
  return raw.trim().replace(/^loyainiti:/i, '');
}

export default function Scan() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [lastQr, setLastQr] = useState<string | null>(null);
  const lastScannedAt = useRef(0);

  useEffect(() => {
    resolveActiveBusinessId().then((id) => {
      setBusinessId(id);
      setResolving(false);
    });
  }, []);

  const recordVisit = async (qrCodeId: string) => {
    if (!businessId) return;
    try {
      const r = await api<ScanResult>('/api/scans', {
        method: 'POST',
        body: { qrCodeId: normalize(qrCodeId), businessId },
      });
      setResult(r);
      setLastQr(normalize(qrCodeId));
      setScanning(false);
    } catch (e) {
      Alert.alert('Scan failed', e instanceof ApiError ? e.message : String(e));
    }
  };

  const redeem = async () => {
    if (!businessId || !lastQr) return;
    try {
      await api('/api/redemptions', {
        method: 'POST',
        body: { qrCodeId: lastQr, businessId },
      });
      Alert.alert('Reward redeemed', 'Counter reset.');
      await recordVisit(lastQr); // refresh
    } catch (e) {
      Alert.alert('Redeem failed', e instanceof ApiError ? e.message : String(e));
    }
  };

  if (resolving) return null;

  if (!businessId) {
    return (
      <ScrollView style={{ backgroundColor: tokens.colors.bgCanvas }} contentContainerStyle={{ padding: 20 }}>
        <Card>
          <Typo variant="h2">No business found</Typo>
          <Typo variant="body" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
            Go to the Business tab to create your business.
          </Typo>
        </Card>
      </ScrollView>
    );
  }

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <ScrollView style={{ backgroundColor: tokens.colors.bgCanvas }} contentContainerStyle={{ padding: 20, gap: 12 }}>
        <Card>
          <Typo variant="h2">Camera permission</Typo>
          <Typo variant="body" color={tokens.colors.fg2} style={{ marginTop: 8, marginBottom: 16 }}>
            To scan customer QR codes we need access to the camera.
          </Typo>
          <Button onPress={requestPermission}>Allow camera</Button>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: tokens.colors.bgCanvas }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>Scan a customer</Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>
          Record a visit
        </Typo>
      </View>

      {scanning ? (
        <View
          style={{
            aspectRatio: 1,
            borderRadius: tokens.radius.xl,
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        >
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => {
              const now = Date.now();
              if (now - lastScannedAt.current < 2000) return;
              lastScannedAt.current = now;
              recordVisit(data);
            }}
          />
        </View>
      ) : (
        <Button variant="ghost" onPress={() => { setScanning(true); setResult(null); }}>
          Scan another
        </Button>
      )}

      <Card variant="muted">
        <Typo variant="label" color={tokens.colors.fg2}>Or enter manually</Typo>
        <View style={{ height: 8 }} />
        <Input
          placeholder="12-character code"
          value={manualCode}
          onChangeText={setManualCode}
        />
        <View style={{ height: 12 }} />
        <Button
          variant="subtle"
          onPress={() => recordVisit(manualCode)}
          disabled={!manualCode.trim()}
        >
          Record visit
        </Button>
      </Card>

      {result && (
        <Card>
          <Typo variant="h2">{result.customer.displayName}</Typo>
          <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
            <View>
              <Typo variant="label" color={tokens.colors.fg2}>Total</Typo>
              <Typo variant="numXL">{result.totals.totalVisits}</Typo>
            </View>
            <View>
              <Typo variant="label" color={tokens.colors.fg2}>Since reward</Typo>
              <Typo variant="numXL">{result.totals.visitsSinceLastRedemption}</Typo>
            </View>
          </View>

          {result.loyalty && (
            <View style={{ marginTop: 20 }}>
              <LoyaltyStamp
                required={result.loyalty.requiredVisits}
                earned={result.totals.visitsSinceLastRedemption}
                rewardLabel={result.loyalty.rewardDescription}
              />
              {result.loyalty.rewardEligible && (
                <View style={{ marginTop: 16 }}>
                  <Button onPress={redeem} size="lg" leftSlot={<Gift size={16} color="#fff" />}>
                    Redeem reward
                  </Button>
                </View>
              )}
            </View>
          )}
        </Card>
      )}
    </ScrollView>
  );
}
