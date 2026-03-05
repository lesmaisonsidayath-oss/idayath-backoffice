'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formations } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { formatDate, formatPrice } from '@/lib/utils';
import type { Formation, PaginatedResponse } from '@/lib/types';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

export default function FormationsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['formations', page],
    queryFn: () => formations.list({ page }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => formations.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, formation }: { id: number; formation: Formation }) => {
      const formData = new FormData();
      formData.append('title', formation.title);
      formData.append('description', formation.description);
      formData.append('instructor', formation.instructor);
      formData.append('duration', formation.duration);
      formData.append('format', formation.format);
      formData.append('level', formation.level);
      formData.append('price', String(formation.price));
      if (formation.date) formData.append('date', formation.date);
      formData.append('is_visible', formation.is_visible ? '0' : '1');
      formation.topics.forEach((topic) => formData.append('topics[]', topic));
      return formations.update(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette formation ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleVisibility = (formation: Formation) => {
    toggleVisibilityMutation.mutate({ id: formation.id, formation });
  };

  const paginatedData = data?.data as PaginatedResponse<Formation> | undefined;
  const formationsList = paginatedData?.data ?? [];

  return (
    <DashboardLayout title="Formations">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Formations</h2>
          <p className="mt-1 text-sm text-muted">
            Gestion des formations disponibles
          </p>
        </div>
        <Link
          href="/formations/nouveau"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Ajouter une formation
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card-bg shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-danger">
            Erreur lors du chargement des formations.
          </div>
        ) : formationsList.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">
            Aucune formation trouvee.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Titre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Formateur
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Format
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Niveau
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Prix
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Visibilite
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {formationsList.map((formation) => (
                    <tr key={formation.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {formation.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formation.instructor}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formation.format}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formation.level}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formatPrice(formation.price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formation.date ? formatDate(formation.date) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleVisibility(formation)}
                          disabled={toggleVisibilityMutation.isPending}
                          className="inline-flex items-center gap-1.5 text-sm disabled:opacity-50"
                          title={formation.is_visible ? 'Masquer' : 'Rendre visible'}
                        >
                          {formation.is_visible ? (
                            <>
                              <Eye className="h-4 w-4 text-green-600" />
                              <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Visible
                              </span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 text-gray-400" />
                              <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                Masque
                              </span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/formations/${formation.id}`}
                            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-gray-50"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(formation.id)}
                            disabled={deleteMutation.isPending}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-danger hover:bg-red-50 disabled:opacity-50"
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

            {paginatedData && paginatedData.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-sm text-muted">
                  Page {paginatedData.current_page} sur {paginatedData.last_page}{' '}
                  ({paginatedData.total} resultats)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={paginatedData.current_page <= 1}
                    className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Precedent
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(paginatedData.last_page, p + 1))
                    }
                    disabled={paginatedData.current_page >= paginatedData.last_page}
                    className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
