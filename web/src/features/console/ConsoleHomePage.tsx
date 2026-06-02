import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Store, Tag, MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/Card';

type UserList = Array<{ id: string }>;
type BizList = Array<{ id: string; isPublished: boolean }>;
type CatList = Array<{ id: string }>;

export function ConsoleHomePage() {
  const users = useQuery({ queryKey: ['admin-users'], queryFn: () => api<UserList>('/api/admin/users') });
  const businesses = useQuery({ queryKey: ['admin-businesses'], queryFn: () => api<BizList>('/api/admin/businesses') });
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => api<CatList>('/api/categories') });

  const kpis = [
    {
      to: '/_console/users', icon: <Users size={22} color="var(--action)" />,
      label: 'Users', value: users.data?.length ?? '…',
    },
    {
      to: '/_console/businesses', icon: <Store size={22} color="var(--action)" />,
      label: 'Businesses', value: businesses.data?.length ?? '…',
      sub: `${businesses.data?.filter((b) => b.isPublished).length ?? 0} published`,
    },
    {
      to: '/_console/categories', icon: <Tag size={22} color="var(--action)" />,
      label: 'Categories', value: categories.data?.length ?? '…',
    },
    {
      to: '/_console/reviews', icon: <MessageSquare size={22} color="var(--action)" />,
      label: 'Reviews', value: '—', sub: 'Phase 3 pending',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <span className="label">Console</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>Overview</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {kpis.map((k) => (
          <Link key={k.label} to={k.to} style={{ textDecoration: 'none' }}>
            <Card padding={20} style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
              {k.icon}
              <p style={{ font: 'var(--t-num-xl)', margin: 0 }}>{k.value}</p>
              <p style={{ font: 'var(--t-body-sm)', fontWeight: 600, margin: 0 }}>{k.label}</p>
              {k.sub && <p className="caption" style={{ color: 'var(--fg-3)', margin: 0 }}>{k.sub}</p>}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
