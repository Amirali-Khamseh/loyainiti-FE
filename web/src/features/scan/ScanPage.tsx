import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CheckCircle2, Gift, Loader2 } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { getActiveBusinessId } from '../../lib/activeBusiness';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { LoyaltyStamp } from '../../components/LoyaltyStamp';

type ScanResult = {
  customer: { id: string; displayName: string };
  visit: { id: string; scannedAt: string };
  totals: { totalVisits: number; visitsSinceLastRedemption: number };
  loyalty: null | {
    programId: string;
    name: string;
    requiredVisits: number;
    rewardDescription: string;
    rewardEligible: boolean;
  };
};

/** Strip the `loyainiti:` prefix if present so staff can paste either form. */
function normalize(raw: string): string {
  return raw.trim().replace(/^loyainiti:/i, '');
}

export function ScanPage() {
  const businessId = getActiveBusinessId();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scan = useMutation({
    mutationFn: () =>
      api<ScanResult>('/api/scans', {
        method: 'POST',
        body: { qrCodeId: normalize(code), businessId },
      }),
    onSuccess: (data) => {
      setResult(data);
      setError(null);
      setCode('');
    },
    onError: (err) => {
      setResult(null);
      setError(err instanceof ApiError ? err.message : 'Scan failed');
    },
  });

  const redeem = useMutation({
    mutationFn: () =>
      api('/api/redemptions', {
        method: 'POST',
        body: { qrCodeId: result?.customer ? '' : '', businessId },
      }),
    // We need the customer's qrCodeId - store it from the scan request.
  });

  // Simpler: just persist the last-scanned QR code id (not the user's id) and reuse it.
  const [lastQr, setLastQr] = useState<string | null>(null);

  const onScan = () => {
    if (!code.trim() || !businessId) return;
    setLastQr(normalize(code));
    scan.mutate();
  };

  const onRedeem = async () => {
    if (!lastQr || !businessId) return;
    try {
      await api('/api/redemptions', {
        method: 'POST',
        body: { qrCodeId: lastQr, businessId },
      });
      // Re-scan to refresh counts after redemption
      scan.mutate();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Redemption failed');
    }
  };

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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'flex-start' }}>
      <Card padding={32}>
        <span className="label">Scan a customer</span>
        <h1 className="h1" style={{ marginTop: 8 }}>Record a visit</h1>
        <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          Type or paste the customer's QR code id. The mobile app uses the camera; on web, ask the
          customer to read the 12-character code from their My QR screen.
        </p>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="QR code id"
            placeholder="DMutRr1OH2TX or loyainiti:DMutRr1OH2TX"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onScan()}
          />
          <Button onClick={onScan} loading={scan.isPending} size="lg" disabled={!code.trim()}>
            Record visit
          </Button>
          {error && (
            <p style={{ font: 'var(--t-body-sm)', color: 'var(--danger)', margin: 0 }}>{error}</p>
          )}
        </div>
      </Card>

      <div>
        {!result && (
          <Card variant="muted" padding={32} style={{ textAlign: 'center' }}>
            <p className="body" style={{ color: 'var(--fg-2)' }}>
              Scan a code to see the customer's progress.
            </p>
          </Card>
        )}

        {result && (
          <Card padding={32}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle2 size={24} color="var(--success)" />
              <h2 className="h2">{result.customer.displayName}</h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginTop: 20,
              }}
            >
              <div>
                <p className="label">Total visits</p>
                <p className="num-xl">{result.totals.totalVisits}</p>
              </div>
              <div>
                <p className="label">Since last reward</p>
                <p className="num-xl">{result.totals.visitsSinceLastRedemption}</p>
              </div>
            </div>

            {result.loyalty ? (
              <div style={{ marginTop: 24 }}>
                <LoyaltyStamp
                  required={result.loyalty.requiredVisits}
                  earned={result.totals.visitsSinceLastRedemption}
                  rewardLabel={result.loyalty.rewardDescription}
                />
                {result.loyalty.rewardEligible && (
                  <Button
                    onClick={onRedeem}
                    size="lg"
                    variant="primary"
                    style={{ marginTop: 16, width: '100%' }}
                  >
                    <Gift size={18} /> Redeem reward
                  </Button>
                )}
              </div>
            ) : (
              <p className="caption" style={{ marginTop: 16, color: 'var(--fg-3)' }}>
                No active loyalty programme for this business.
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
