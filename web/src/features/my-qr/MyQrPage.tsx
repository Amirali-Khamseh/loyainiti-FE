import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import { Card } from '../../components/Card';
import { api } from '../../lib/api';

type Me = {
  userId: string;
  email: string;
  name: string;
  role: string;
  displayName: string;
  qrCodeId: string;
  avatarR2Key: string | null;
};

export function MyQrPage() {
  const me = useQuery({ queryKey: ['me'], queryFn: () => api<Me>('/api/me') });

  if (me.isLoading) return <p className="body">Loading…</p>;
  if (me.error || !me.data) return <p className="body" style={{ color: 'var(--danger)' }}>Couldn't load profile.</p>;

  const payload = `loyainiti:${me.data.qrCodeId}`;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header>
        <span className="label">Your loyalty card</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>
          Show this at the till
        </h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          Any shop in the network can scan this to record your visit and progress your rewards.
        </p>
      </header>

      <Card
        padding={32}
        style={{
          display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center',
          background: '#FFFFFF',
          border: '1px solid rgba(5,38,152,0.1)',
          boxShadow: '0 4px 24px rgba(5,38,152,0.06)',
        }}
      >
        <div
          style={{
            padding: 20,
            background: '#fff',
            borderRadius: 4,
            border: '1px solid rgba(5,38,152,0.1)',
            boxShadow: '0 2px 12px rgba(5,38,152,0.08)',
          }}
        >
          <QRCodeCanvas
            value={payload}
            size={280}
            bgColor="#FFFFFF"
            fgColor="#052698"
            level="M"
            includeMargin={false}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p className="label" style={{ color: '#116BF8' }}>Code</p>
          <p className="num-lg" style={{ marginTop: 4, color: '#052698' }}>{me.data.qrCodeId}</p>
          <p className="caption" style={{ marginTop: 4, color: '#878EA0' }}>
            If a shop can't scan, dictate the code above.
          </p>
        </div>

        <div style={{ width: '100%', borderTop: '1px solid rgba(5,38,152,0.1)', paddingTop: 16 }}>
          <p className="label" style={{ color: '#116BF8' }}>Account</p>
          <p style={{ font: 'var(--t-body)', marginTop: 4, color: '#052698' }}>
            {me.data.displayName}{' '}
            <span style={{ color: '#878EA0' }}>({me.data.email})</span>
          </p>
          <p className="mono" style={{ font: 'var(--t-num)', marginTop: 4, color: '#878EA0' }}>
            user_id: {me.data.userId}
          </p>
        </div>
      </Card>
    </div>
  );
}
