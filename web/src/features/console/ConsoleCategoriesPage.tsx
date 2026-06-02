import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useToast } from '../../components/Toast';

type Category = { id: string; name: string; slug: string; sortOrder: number };

export function ConsoleCategoriesPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const cats = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/api/categories'),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['categories'] });

  const createMut = useMutation({
    mutationFn: () => api('/api/admin/categories', { method: 'POST', body: { name: newName.trim() } }),
    onSuccess: () => { toast.success('Category created'); setNewName(''); invalidate(); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not create'),
  });

  const updateMut = useMutation({
    mutationFn: (id: string) =>
      api(`/api/admin/categories/${id}`, { method: 'PATCH', body: { name: editName.trim() } }),
    onSuccess: () => { toast.success('Category updated'); setEditId(null); invalidate(); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not update'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api(`/api/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => { toast.success('Category deleted'); invalidate(); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not delete'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header>
        <span className="label">Console</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>Categories</h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          {cats.data?.length ?? '…'} categories. These appear in the onboarding wizard and as
          filter chips on the Explore page.
        </p>
      </header>

      <Card padding={20}>
        <p className="label" style={{ marginBottom: 10 }}>Add a category</p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1, maxWidth: 320 }}>
            <Input
              label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) createMut.mutate(); }}
              placeholder="e.g. Bakery"
            />
          </div>
          <Button onClick={() => { if (newName.trim()) createMut.mutate(); }} loading={createMut.isPending} disabled={!newName.trim()}>
            <Plus size={16} /> Add
          </Button>
        </div>
      </Card>

      <Card padding={0}>
        {cats.isLoading ? (
          <p className="body" style={{ padding: 24 }}>Loading…</p>
        ) : (
          <div>
            {(cats.data ?? []).map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
              }}>
                {editId === c.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 10,
                        border: '1px solid var(--action)', font: 'var(--t-body)',
                        background: 'var(--bg-card)', color: 'var(--fg-1)', outline: 'none',
                      }}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateMut.mutate(c.id);
                        if (e.key === 'Escape') setEditId(null);
                      }}
                    />
                    <button onClick={() => updateMut.mutate(c.id)} style={iconBtnStyle}><Check size={16} color="var(--success)" /></button>
                    <button onClick={() => setEditId(null)} style={iconBtnStyle}><X size={16} color="var(--fg-3)" /></button>
                  </>
                ) : (
                  <>
                    <p style={{ font: 'var(--t-body)', margin: 0, flex: 1 }}>{c.name}</p>
                    <span className="mono" style={{ font: 'var(--t-caption)', color: 'var(--fg-3)' }}>{c.slug}</span>
                    <button onClick={() => { setEditId(c.id); setEditName(c.name); }} style={iconBtnStyle}>
                      <Pencil size={15} color="var(--fg-2)" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteMut.mutate(c.id); }}
                      style={iconBtnStyle}
                    >
                      <Trash2 size={15} color="var(--danger)" />
                    </button>
                  </>
                )}
              </div>
            ))}
            {(cats.data ?? []).length === 0 && (
              <p className="body" style={{ padding: 24, color: 'var(--fg-3)' }}>No categories yet.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: 'none', padding: 6, borderRadius: 8,
  cursor: 'pointer',
};
