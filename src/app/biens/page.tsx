'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { properties } from '@/lib/api';
import { formatPrice, formatDate, propertyTypeLabels, propertyCategoryLabels, propertyStatusLabels } from '@/lib/utils';
import type { Property, PaginatedResponse } from '@/lib/types';
import { Plus, Eye, EyeOff, Star, StarOff, Pencil, Trash2, ImageIcon } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  disponible: 'bg-success/10 text-success',
  loué: 'bg-info/10 text-info',
  vendu: 'bg-danger/10 text-danger',
  en_cours: 'bg-warning/10 text-warning',
};

const typeColors: Record<string, string> = {
  location: 'bg-info/10 text-info',
  location_meublee: 'bg-teal-500/10 text-teal-600',
  vente: 'bg-primary/10 text-primary',
};

export default function BiensPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery<PaginatedResponse<Property>>({
    queryKey: ['properties', page, typeFilter, search],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;
      const res = await properties.list(params);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => properties.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: (id: number) => properties.toggleVisibility(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['properties'] });
      const previousData = queryClient.getQueryData<PaginatedResponse<Property>>(['properties', page, typeFilter, search]);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Property>>(['properties', page, typeFilter, search], {
          ...previousData,
          data: previousData.data.map((p) =>
            p.id === id ? { ...p, is_visible: !p.is_visible } : p
          ),
        });
      }
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['properties', page, typeFilter, search], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: (id: number) => properties.toggleFeatured(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['properties'] });
      const previousData = queryClient.getQueryData<PaginatedResponse<Property>>(['properties', page, typeFilter, search]);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Property>>(['properties', page, typeFilter, search], {
          ...previousData,
          data: previousData.data.map((p) =>
            p.id === id ? { ...p, is_featured: !p.is_featured } : p
          ),
        });
      }
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['properties', page, typeFilter, search], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout title="Biens Immobiliers">
      {/* Header with Add button */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Tous les types</option>
            <option value="location">Location</option>
            <option value="location_meublee">Location meublée</option>
            <option value="vente">Vente</option>
          </select>

          {/* Search Input */}
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher un bien..."
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
          />
        </div>

        <Link
          href="/biens/nouveau"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Ajouter un bien
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-danger">
          Erreur lors du chargement des biens.
        </div>
      )}

      {/* Table */}
      {data && (
        <div className="rounded-xl border border-border bg-card-bg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="px-4 py-3 text-left font-medium text-muted">Image</th>
                  <th className="px-4 py-3 text-center font-medium text-muted">Photos</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Titre</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Catégorie</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Ville</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Prix</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Statut</th>
                  <th className="px-4 py-3 text-center font-medium text-muted">Visible</th>
                  <th className="px-4 py-3 text-center font-medium text-muted">Vedette</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-muted">
                      Aucun bien trouvé.
                    </td>
                  </tr>
                )}
                {data.data.map((property) => (
                  <tr key={property.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                    {/* Image Thumbnail */}
                    <td className="px-4 py-3">
                      {property.main_image_url ? (
                        <img
                          src={property.main_image_url}
                          alt={property.title}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-muted">
                          No img
                        </div>
                      )}
                    </td>

                    {/* Photos count */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <ImageIcon className="h-3.5 w-3.5" />
                        {property.images_count ?? 0}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3 font-medium">
                      <span className="line-clamp-2 max-w-[200px]">{property.title}</span>
                    </td>

                    {/* Type Badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[property.type] || 'bg-gray-100 text-gray-700'}`}>
                        {propertyTypeLabels[property.type] || property.type}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-muted">
                      {propertyCategoryLabels[property.category] || property.category}
                    </td>

                    {/* City */}
                    <td className="px-4 py-3 text-muted">{property.city}</td>

                    {/* Price */}
                    <td className="px-4 py-3 font-medium">{formatPrice(property.price)}</td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[property.status] || 'bg-gray-100 text-gray-700'}`}>
                        {propertyStatusLabels[property.status] || property.status}
                      </span>
                    </td>

                    {/* Visibility Toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleVisibilityMutation.mutate(property.id)}
                        className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors ${
                          property.is_visible
                            ? 'text-success hover:bg-success/10'
                            : 'text-muted hover:bg-gray-100'
                        }`}
                        title={property.is_visible ? 'Masquer' : 'Rendre visible'}
                      >
                        {property.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFeaturedMutation.mutate(property.id)}
                        className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors ${
                          property.is_featured
                            ? 'text-warning hover:bg-warning/10'
                            : 'text-muted hover:bg-gray-100'
                        }`}
                        title={property.is_featured ? 'Retirer de la vedette' : 'Mettre en vedette'}
                      >
                        {property.is_featured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/biens/${property.id}`}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-muted transition-colors hover:bg-gray-100 hover:text-foreground"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(property.id)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="text-sm text-muted">
                Page {data.current_page} sur {data.last_page}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.current_page <= 1}
                  className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                  disabled={data.current_page >= data.last_page}
                  className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
