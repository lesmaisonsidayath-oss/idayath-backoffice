'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { dashboard } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import type { DashboardStats } from '@/lib/types';
import { Building2, GraduationCap, FileText, Mail, Users, Star } from 'lucide-react';

const statusColors: Record<string, string> = {
  disponible: 'bg-success/10 text-success',
  loué: 'bg-info/10 text-info',
  vendu: 'bg-danger/10 text-danger',
  en_cours: 'bg-warning/10 text-warning',
};

const statusLabels: Record<string, string> = {
  disponible: 'Disponible',
  loué: 'Loué',
  vendu: 'Vendu',
  en_cours: 'En cours',
};

const typeLabels: Record<string, string> = {
  location: 'Location',
  vente: 'Vente',
};

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboard.stats();
      return res.data;
    },
  });

  return (
    <DashboardLayout title="Dashboard">
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-danger">
          Erreur lors du chargement des statistiques.
        </div>
      )}

      {data && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* Total Properties */}
            <div className="rounded-xl border border-border bg-card-bg p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                  <Building2 className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.total_properties}</p>
                  <p className="text-xs text-muted">Biens total</p>
                </div>
              </div>
            </div>

            {/* Visible Properties */}
            <div className="rounded-xl border border-border bg-card-bg p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Building2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.visible_properties}</p>
                  <p className="text-xs text-muted">Biens visibles</p>
                </div>
              </div>
            </div>

            {/* Featured Properties */}
            <div className="rounded-xl border border-border bg-card-bg p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Star className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.featured_properties}</p>
                  <p className="text-xs text-muted">Biens en vedette</p>
                </div>
              </div>
            </div>

            {/* Total Formations */}
            <div className="rounded-xl border border-border bg-card-bg p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.total_formations}</p>
                  <p className="text-xs text-muted">Formations</p>
                </div>
              </div>
            </div>

            {/* Published Blog Posts */}
            <div className="rounded-xl border border-border bg-card-bg p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.published_blog_posts}</p>
                  <p className="text-xs text-muted">Articles publiés</p>
                </div>
              </div>
            </div>

            {/* Unread Messages */}
            <div className="rounded-xl border border-border bg-card-bg p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10">
                  <Mail className="h-5 w-5 text-danger" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.unread_messages}</p>
                  <p className="text-xs text-muted">Messages non lus</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Data */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Properties */}
            <div className="rounded-xl border border-border bg-card-bg shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-base font-semibold">Biens récents</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50">
                      <th className="px-6 py-3 text-left font-medium text-muted">Titre</th>
                      <th className="px-6 py-3 text-left font-medium text-muted">Type</th>
                      <th className="px-6 py-3 text-left font-medium text-muted">Statut</th>
                      <th className="px-6 py-3 text-left font-medium text-muted">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_properties.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted">
                          Aucun bien récent.
                        </td>
                      </tr>
                    )}
                    {data.recent_properties.map((property) => (
                      <tr key={property.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                        <td className="px-6 py-3 font-medium">{property.title}</td>
                        <td className="px-6 py-3">
                          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {typeLabels[property.type] || property.type}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[property.status] || 'bg-gray-100 text-gray-700'}`}>
                            {statusLabels[property.status] || property.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-muted">{formatDate(property.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Messages */}
            <div className="rounded-xl border border-border bg-card-bg shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-base font-semibold">Messages récents</h2>
              </div>
              <div className="divide-y divide-border">
                {data.recent_messages.length === 0 && (
                  <div className="px-6 py-8 text-center text-sm text-muted">
                    Aucun message récent.
                  </div>
                )}
                {data.recent_messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {message.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{message.name}</p>
                        {!message.is_read && (
                          <span className="inline-flex rounded-full bg-danger px-2 py-0.5 text-[10px] font-semibold text-white">
                            Non lu
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted truncate">{message.subject}</p>
                      <p className="mt-1 text-xs text-muted">{formatDate(message.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
