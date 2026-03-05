'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { testimonials } from '@/lib/api';
import type { Testimonial } from '@/lib/types';
import { Star, Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';

interface TestimonialFormData {
  name: string;
  role: string;
  content: string;
  rating: number;
  is_visible: boolean;
  sort_order: number;
}

const emptyForm: TestimonialFormData = {
  name: '',
  role: '',
  content: '',
  rating: 5,
  is_visible: true,
  sort_order: 0,
};

export default function TestimonialsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const res = await testimonials.list();
      return res.data.data as Testimonial[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TestimonialFormData) => testimonials.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TestimonialFormData }) =>
      testimonials.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => testimonials.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      setDeleteConfirmId(null);
    },
  });

  function resetForm() {
    setFormData(emptyForm);
    setShowForm(false);
    setEditingId(null);
  }

  function handleEdit(testimonial: Testimonial) {
    setFormData({
      name: testimonial.name,
      role: testimonial.role || '',
      content: testimonial.content,
      rating: testimonial.rating,
      is_visible: testimonial.is_visible,
      sort_order: testimonial.sort_order,
    });
    setEditingId(testimonial.id);
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

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function renderStars(rating: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <DashboardLayout title="Temoignages">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Temoignages</h1>
            <p className="text-sm text-muted mt-1">
              Gerez les temoignages affiches sur le site
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
              Ajouter un temoignage
            </button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="rounded-xl border border-border bg-card-bg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Modifier le temoignage' : 'Nouveau temoignage'}
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
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Nom du temoin"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Role / Fonction
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Ex: Client, Investisseur..."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Contenu du temoignage
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Le temoignage..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Note
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {[1, 2, 3, 4, 5].map((val) => (
                      <option key={val} value={val}>
                        {val} etoile{val > 1 ? 's' : ''}
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
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_visible: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm font-medium">Visible</span>
                  </label>
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

        {/* Testimonials Grid */}
        {data && data.length === 0 && !isLoading && (
          <div className="rounded-xl border border-border bg-card-bg shadow-sm p-12 text-center">
            <p className="text-muted">Aucun temoignage pour le moment.</p>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-xl border border-border bg-card-bg shadow-sm p-6 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {testimonial.name}
                    </h3>
                    {testimonial.role && (
                      <p className="text-sm text-muted">{testimonial.role}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      testimonial.is_visible
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {testimonial.is_visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    {testimonial.is_visible ? 'Visible' : 'Masque'}
                  </span>
                </div>

                <div className="mb-3">{renderStars(testimonial.rating)}</div>

                <p className="text-sm text-muted flex-1 mb-4 line-clamp-3">
                  {testimonial.content}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted">
                    Ordre: {testimonial.sort_order}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="border border-border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </button>
                    {deleteConfirmId === testimonial.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            deleteMutation.mutate(testimonial.id)
                          }
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
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(testimonial.id)}
                        className="border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm hover:bg-red-50 flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
