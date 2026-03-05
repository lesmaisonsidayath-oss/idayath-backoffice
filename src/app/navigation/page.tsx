'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { navigation } from '@/lib/api';
import type { NavigationItem } from '@/lib/types';
import { Plus, Pencil, Trash2, X, GripVertical, ChevronRight } from 'lucide-react';

interface NavigationFormData {
  label: string;
  href: string;
  parent_id: number | null;
  sort_order: number;
}

const emptyForm: NavigationFormData = {
  label: '',
  href: '',
  parent_id: null,
  sort_order: 0,
};

export default function NavigationPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<NavigationFormData>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['navigation'],
    queryFn: async () => {
      const res = await navigation.list();
      return res.data.data as NavigationItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: NavigationFormData) =>
      navigation.create({
        ...data,
        parent_id: data.parent_id || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: NavigationFormData }) =>
      navigation.update(id, {
        ...data,
        parent_id: data.parent_id || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => navigation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation'] });
      setDeleteConfirmId(null);
    },
  });

  function resetForm() {
    setFormData(emptyForm);
    setShowForm(false);
    setEditingId(null);
  }

  function handleEdit(item: NavigationItem) {
    setFormData({
      label: item.label,
      href: item.href,
      parent_id: item.parent_id,
      sort_order: item.sort_order,
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  // Get all parent items (items without parent_id) for the select
  const parentItems = data?.filter((item) => item.parent_id === null) || [];

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function renderDeleteButton(item: NavigationItem) {
    if (deleteConfirmId === item.id) {
      return (
        <div className="flex gap-1">
          <button
            onClick={() => deleteMutation.mutate(item.id)}
            disabled={deleteMutation.isPending}
            className="bg-red-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-red-700 disabled:opacity-50"
          >
            Confirmer
          </button>
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="border border-border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          >
            Non
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => setDeleteConfirmId(item.id)}
        className="border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm hover:bg-red-50 flex items-center gap-1"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    );
  }

  function renderNavigationItem(item: NavigationItem, isChild: boolean = false) {
    return (
      <div
        key={item.id}
        className={`flex items-center justify-between py-3 px-4 ${
          isChild ? 'ml-8 border-l-2 border-primary/20' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="h-4 w-4 text-muted" />
          {isChild && <ChevronRight className="h-4 w-4 text-muted" />}
          <div>
            <span className="font-medium text-foreground">{item.label}</span>
            <span className="ml-3 text-sm text-muted">{item.href}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted bg-gray-100 rounded-full px-2 py-0.5">
            Ordre: {item.sort_order}
          </span>
          <button
            onClick={() => handleEdit(item)}
            className="border border-border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-1"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </button>
          {renderDeleteButton(item)}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Navigation">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Navigation</h1>
            <p className="text-sm text-muted mt-1">
              Gerez les elements du menu de navigation
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setFormData(emptyForm);
                setEditingId(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-primary text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-primary-dark disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter un element
            </button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="rounded-xl border border-border bg-card-bg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {editingId
                  ? 'Modifier l&apos;element'
                  : 'Nouvel element de navigation'}
              </h2>
              <button
                onClick={resetForm}
                className="border border-border rounded-lg px-4 py-2 text-sm hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Libelle
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Ex: Accueil, A propos..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Lien (href)
                  </label>
                  <input
                    type="text"
                    value={formData.href}
                    onChange={(e) =>
                      setFormData({ ...formData, href: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Ex: /, /a-propos, /contact"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Element parent
                  </label>
                  <select
                    value={formData.parent_id ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parent_id: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Aucun (element principal)</option>
                    {parentItems
                      .filter((p) => p.id !== editingId)
                      .map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          {parent.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Ordre d&apos;affichage
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-primary-dark disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Enregistrement...'
                    : editingId
                    ? 'Mettre a jour'
                    : 'Creer'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-border rounded-lg px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {/* Navigation Items List */}
        {data && data.length === 0 && !isLoading && (
          <div className="rounded-xl border border-border bg-card-bg shadow-sm p-12 text-center">
            <p className="text-muted">
              Aucun element de navigation pour le moment.
            </p>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="rounded-xl border border-border bg-card-bg shadow-sm divide-y divide-border">
            {data.map((item) => (
              <div key={item.id}>
                {renderNavigationItem(item)}
                {item.children &&
                  item.children.length > 0 &&
                  item.children.map((child) =>
                    renderNavigationItem(child, true)
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
