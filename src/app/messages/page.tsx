'use client';

import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { contactMessages } from '@/lib/api';
import type { ContactMessage } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import {
  Mail,
  MailOpen,
  Trash2,
  ChevronDown,
  ChevronUp,
  Inbox,
} from 'lucide-react';

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const res = await contactMessages.list();
      return res.data.data as ContactMessage[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => contactMessages.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contactMessages.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      setDeleteConfirmId(null);
      if (expandedId === deleteConfirmId) {
        setExpandedId(null);
      }
    },
  });

  function handleRowClick(message: ContactMessage) {
    if (expandedId === message.id) {
      setExpandedId(null);
    } else {
      setExpandedId(message.id);
      if (!message.is_read) {
        markAsReadMutation.mutate(message.id);
      }
    }
  }

  const messages = data || [];
  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <DashboardLayout title="Messages">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Messages de contact</h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-primary px-3 py-0.5 text-sm font-semibold text-white">
                  {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-sm text-muted mt-1">
              Messages recus via le formulaire de contact
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && messages.length === 0 && (
          <div className="rounded-xl border border-border bg-card-bg shadow-sm p-12 text-center">
            <Inbox className="h-12 w-12 text-muted mx-auto mb-4" />
            <p className="text-muted">Aucun message pour le moment.</p>
          </div>
        )}

        {/* Messages Table */}
        {!isLoading && messages.length > 0 && (
          <div className="rounded-xl border border-border bg-card-bg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Statut
                  </th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Nom
                  </th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Sujet
                  </th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {messages.map((message) => (
                  <Fragment key={message.id}>
                    <tr
                      onClick={() => handleRowClick(message)}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        !message.is_read ? 'bg-primary/5 font-medium' : ''
                      } ${expandedId === message.id ? 'bg-gray-50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        {message.is_read ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            <MailOpen className="h-3 w-3" />
                            Lu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            <Mail className="h-3 w-3" />
                            Non lu
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{message.name}</td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {message.email}
                      </td>
                      <td className="px-4 py-3 text-sm">{message.subject}</td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formatDateTime(message.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(message);
                            }}
                            className="border border-border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-1"
                          >
                            {expandedId === message.id ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                            Voir
                          </button>
                          {!message.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsReadMutation.mutate(message.id);
                              }}
                              className="border border-border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-1"
                              title="Marquer comme lu"
                            >
                              <MailOpen className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {deleteConfirmId === message.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(message.id);
                                }}
                                disabled={deleteMutation.isPending}
                                className="bg-red-600 text-white rounded-lg px-3 py-1.5 text-sm hover:bg-red-700 disabled:opacity-50"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className="border border-border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50"
                              >
                                Non
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(message.id);
                              }}
                              className="border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-sm hover:bg-red-50 flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Expanded message content */}
                    {expandedId === message.id && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 bg-gray-50/50">
                          <div className="rounded-lg border border-border bg-white p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-muted">
                                  De:{' '}
                                </span>
                                <span>{message.name}</span>
                              </div>
                              <div>
                                <span className="font-medium text-muted">
                                  Email:{' '}
                                </span>
                                <a
                                  href={`mailto:${message.email}`}
                                  className="text-primary hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {message.email}
                                </a>
                              </div>
                              {message.phone && (
                                <div>
                                  <span className="font-medium text-muted">
                                    Tel:{' '}
                                  </span>
                                  <span>{message.phone}</span>
                                </div>
                              )}
                            </div>
                            <div className="border-t border-border pt-3">
                              <p className="font-medium text-sm mb-2">
                                {message.subject}
                              </p>
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {message.message}
                              </p>
                            </div>
                            <div className="text-xs text-muted pt-2">
                              Recu le {formatDateTime(message.created_at)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
