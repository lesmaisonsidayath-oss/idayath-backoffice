'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blog } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { formatDate } from '@/lib/utils';
import type { BlogPost, PaginatedResponse } from '@/lib/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['blog', page],
    queryFn: () => blog.list({ page }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => blog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet article ?')) {
      deleteMutation.mutate(id);
    }
  };

  const paginatedData = data?.data as PaginatedResponse<BlogPost> | undefined;
  const posts = paginatedData?.data ?? [];

  return (
    <DashboardLayout title="Blog">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Blog</h2>
          <p className="mt-1 text-sm text-muted">
            Gestion des articles de blog
          </p>
        </div>
        <Link
          href="/blog/nouveau"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Ajouter un article
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card-bg shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-danger">
            Erreur lors du chargement des articles.
          </div>
        ) : posts.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">
            Aucun article trouve.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Titre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Categorie
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Auteur
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Date de publication
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        {post.image_url ? (
                          <div className="h-10 w-14 overflow-hidden rounded-md border border-border">
                            <img
                              src={post.image_url}
                              alt={post.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-14 items-center justify-center rounded-md border border-border bg-gray-100 text-xs text-muted">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {post.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {post.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {post.creator?.name ?? '-'}
                      </td>
                      <td className="px-4 py-3">
                        {post.is_published ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Publie
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            Brouillon
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {post.published_at ? formatDate(post.published_at) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/blog/${post.id}`}
                            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-gray-50"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
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
