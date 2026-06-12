import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/Select';
import { IconPicker, iconByName } from '../../components/IconPicker';
import { useToast } from '../../components/Toast';

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon: string | null;
  sortOrder: number;
};

const NONE = '__none__'; // Select can't bind to an empty-string value cleanly.

export function ConsoleCategoriesPage() {
  const toast = useToast();
  const qc = useQueryClient();

  const [newName, setNewName] = useState('');
  const [newParent, setNewParent] = useState<string>(NONE);
  const [newIcon, setNewIcon] = useState('');

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editParent, setEditParent] = useState<string>(NONE);
  const [editIcon, setEditIcon] = useState('');

  const cats = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/api/categories'),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['categories'] });
    qc.invalidateQueries({ queryKey: ['categories-main'] });
  };

  const mains = useMemo(
    () => (cats.data ?? []).filter((c) => c.parentId === null),
    [cats.data],
  );

  // Group children under their parent for the nested display.
  const tree = useMemo(() => {
    const byParent = new Map<string, Category[]>();
    for (const c of cats.data ?? []) {
      if (c.parentId) {
        const arr = byParent.get(c.parentId) ?? [];
        arr.push(c);
        byParent.set(c.parentId, arr);
      }
    }
    return { mains, byParent };
  }, [cats.data, mains]);

  const createMut = useMutation({
    mutationFn: () =>
      api('/api/admin/categories', {
        method: 'POST',
        body: {
          name: newName.trim(),
          parentId: newParent === NONE ? null : newParent,
          icon: newIcon.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success('Category created');
      setNewName('');
      setNewParent(NONE);
      setNewIcon('');
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not create'),
  });

  const updateMut = useMutation({
    mutationFn: (id: string) =>
      api(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        body: {
          name: editName.trim(),
          parentId: editParent === NONE ? null : editParent,
          icon: editIcon.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success('Category updated');
      setEditId(null);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not update'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api(`/api/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => { toast.success('Category deleted'); invalidate(); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not delete'),
  });

  const startEdit = (c: Category) => {
    setEditId(c.id);
    setEditName(c.name);
    setEditParent(c.parentId ?? NONE);
    setEditIcon(c.icon ?? '');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header>
        <span className="label">Console</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>Categories</h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          Two levels: <strong>main</strong> categories (shown as cards in the app, with an
          icon) and <strong>sub</strong>-categories nested under them. Businesses link to
          sub-categories.
        </p>
      </header>

      {/* Create */}
      <Card padding={20}>
        <p className="label" style={{ marginBottom: 10 }}>Add a category</p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          {/* Icon picker only matters for main categories (parent = None). */}
          {newParent === NONE && (
            <div>
              <p className="label" style={{ marginBottom: 6 }}>Icon</p>
              <IconPicker value={newIcon || null} onChange={(v) => setNewIcon(v ?? '')} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Input
              label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Bakery"
            />
          </div>
          <div>
            <p className="label" style={{ marginBottom: 6 }}>Parent</p>
            <Select value={newParent} onValueChange={setNewParent}>
              <SelectTrigger style={{ minWidth: 180 }}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>— None (main category) —</SelectItem>
                {mains.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => { if (newName.trim()) createMut.mutate(); }}
            loading={createMut.isPending}
            disabled={!newName.trim()}
          >
            <Plus size={16} /> Add
          </Button>
        </div>
        <p className="caption" style={{ color: 'var(--fg-3)', marginTop: 10 }}>
          Main categories show as cards with an icon on the Explore page. Pick a parent to make
          this a sub-category instead (sub-categories don't need an icon).
        </p>
      </Card>

      {/* Nested tree */}
      <Card padding={0}>
        {cats.isLoading ? (
          <p className="body" style={{ padding: 24 }}>Loading…</p>
        ) : tree.mains.length === 0 ? (
          <p className="body" style={{ padding: 24, color: 'var(--fg-3)' }}>No categories yet.</p>
        ) : (
          <div>
            {tree.mains.map((m, mi) => (
              <div key={m.id} style={{ borderTop: mi === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
                <CategoryRow
                  cat={m}
                  isMain
                  editing={editId === m.id}
                  editName={editName} setEditName={setEditName}
                  editParent={editParent} setEditParent={setEditParent}
                  editIcon={editIcon} setEditIcon={setEditIcon}
                  mains={mains}
                  onStartEdit={() => startEdit(m)}
                  onSave={() => updateMut.mutate(m.id)}
                  onCancel={() => setEditId(null)}
                  onDelete={() => { if (confirm(`Delete "${m.name}" and unparent its sub-categories?`)) deleteMut.mutate(m.id); }}
                  saving={updateMut.isPending}
                />
                {(tree.byParent.get(m.id) ?? []).map((sub) => (
                  <div key={sub.id} style={{ paddingLeft: 28, background: 'var(--bg-muted)' }}>
                    <CategoryRow
                      cat={sub}
                      isMain={false}
                      editing={editId === sub.id}
                      editName={editName} setEditName={setEditName}
                      editParent={editParent} setEditParent={setEditParent}
                      editIcon={editIcon} setEditIcon={setEditIcon}
                      mains={mains}
                      onStartEdit={() => startEdit(sub)}
                      onSave={() => updateMut.mutate(sub.id)}
                      onCancel={() => setEditId(null)}
                      onDelete={() => { if (confirm(`Delete "${sub.name}"?`)) deleteMut.mutate(sub.id); }}
                      saving={updateMut.isPending}
                    />
                  </div>
                ))}
              </div>
            ))}

            {/* Orphans: sub-categories whose parent is missing (shouldn't happen, but surfaced) */}
            {(cats.data ?? [])
              .filter((c) => c.parentId && !mains.some((m) => m.id === c.parentId))
              .map((orphan) => (
                <div key={orphan.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <CategoryRow
                    cat={orphan}
                    isMain={false}
                    editing={editId === orphan.id}
                    editName={editName} setEditName={setEditName}
                    editParent={editParent} setEditParent={setEditParent}
                    editIcon={editIcon} setEditIcon={setEditIcon}
                    mains={mains}
                    onStartEdit={() => startEdit(orphan)}
                    onSave={() => updateMut.mutate(orphan.id)}
                    onCancel={() => setEditId(null)}
                    onDelete={() => { if (confirm(`Delete "${orphan.name}"?`)) deleteMut.mutate(orphan.id); }}
                    saving={updateMut.isPending}
                  />
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function CategoryRow({
  cat, isMain, editing,
  editName, setEditName, editParent, setEditParent, editIcon, setEditIcon,
  mains, onStartEdit, onSave, onCancel, onDelete, saving,
}: {
  cat: Category;
  isMain: boolean;
  editing: boolean;
  editName: string; setEditName: (v: string) => void;
  editParent: string; setEditParent: (v: string) => void;
  editIcon: string; setEditIcon: (v: string) => void;
  mains: Category[];
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  saving: boolean;
}) {
  if (editing) {
    const willBeMain = editParent === NONE;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px' }}>
        {willBeMain && (
          <IconPicker value={editIcon || null} onChange={(v) => setEditIcon(v ?? '')} />
        )}
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          autoFocus
          style={{
            flex: 1, minWidth: 0, padding: '8px 12px', borderRadius: 10,
            border: '1px solid var(--action)', font: 'var(--t-body)',
            background: 'var(--bg-card)', color: 'var(--fg-1)', outline: 'none',
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
        />
        <Select value={editParent} onValueChange={setEditParent}>
          <SelectTrigger style={{ minWidth: 160 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>— None (main) —</SelectItem>
            {mains.filter((m) => m.id !== cat.id).map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button onClick={onSave} disabled={saving} style={iconBtnStyle}><Check size={16} color="var(--success)" /></button>
        <button onClick={onCancel} style={iconBtnStyle}><X size={16} color="var(--fg-3)" /></button>
      </div>
    );
  }

  const RowIcon = iconByName(cat.icon);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
      {isMain && (
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 10,
            background: cat.icon ? 'var(--action-subtle-bg)' : 'transparent',
            color: cat.icon ? 'var(--action)' : 'var(--fg-3)',
          }}
        >
          <RowIcon size={16} />
        </span>
      )}
      <p style={{ font: 'var(--t-body)', margin: 0, flex: 1, fontWeight: isMain ? 600 : 400 }}>
        {cat.name}
      </p>
      <span className="mono" style={{ font: 'var(--t-caption)', color: 'var(--fg-3)' }}>{cat.slug}</span>
      <button onClick={onStartEdit} style={iconBtnStyle}><Pencil size={15} color="var(--fg-2)" /></button>
      <button onClick={onDelete} style={iconBtnStyle}><Trash2 size={15} color="var(--danger)" /></button>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: 'none', padding: 6, borderRadius: 10,
  cursor: 'pointer',
};
