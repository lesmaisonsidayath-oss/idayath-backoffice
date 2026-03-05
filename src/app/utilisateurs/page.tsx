'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { users } from '@/lib/api';
import type { User, UserRole } from '@/lib/types';
import { formatDate, roleLabels } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  ShieldOff,
  UserX,
} from 'lucide-react';
import Link from 'next/link';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  is_active: boolean;
}

const emptyForm: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'editeur',
  is_active: true,
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await users.list();
      return res.data.data as User[];
    },
    enabled: isSuperAdmin,
  });

  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => users.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      resetForm();
    },
    onError: () => {
      setFormError('Une erreur est survenue lors de la creation.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormData> }) =>
      users.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      resetForm();
    },
    onError: () => {
      setFormError('Une erreur est survenue lors de la mise a jour.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteConfirmId(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => users.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  function resetForm() {
    setFormData(emptyForm);
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  }

  function handleEdit(user: User) {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      is_active: user.is_active,
    });
    setEditingId(user.id);
    setShowForm(true);
    setFormError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (editingId) {
      const updateData: Partial<UserFormData> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        is_active: formData.is_active,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      updateMutation.mutate({ id: editingId, data: updateData });
    } else {
      if (!formData.password) {
        setFormError('Le mot de passe est requis pour un nouvel utilisateur.');
        return;
      }
      createMutation.mutate(formData);
    }
  }

  function getRoleBadgeClass(role: string) {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-50 text-purple-700';
      case 'admin':
        return 'bg-blue-50 text-blue-700';
      case 'editeur':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  // Only super_admin can access this page
  if (!isSuperAdmin) {
    return (
      <DashboardLayout title="Utilisateurs">
        <div className="rounded-xl border border-border bg-card-bg shadow-sm p-12 text-center">
          <ShieldOff className="h-12 w-12 text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Acces refuse</h2>
          <p className="text-muted">
            Vous n&apos;avez pas les droits necessaires pour acceder a cette
            page. Seuls les super administrateurs peuvent gerer les utilisateurs.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const userList = data || [];

  return (
    <DashboardLayout title="Utilisateurs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Utilisateurs</h1>
            <p className="text-sm text-muted mt-1">
              Gerez les comptes administrateurs
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setFormData(emptyForm);
                setEditingId(null);
                setShowForm(true);
                setFormError('');
              }}
              className="flex items-center gap-2 bg-primary text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-primary-dark disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter un utilisateur
            </button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="rounded-xl border border-border bg-card-bg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {editingId
                  ? "Modifier l'utilisateur"
                  : 'Nouvel utilisateur'}
              </h2>
              <button
                onClick={resetForm}
                className="border border-border rounded-lg px-4 py-2 text-sm hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Nom et prenom"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Mot de passe
                    {editingId && (
                      <span className="text-muted font-normal ml-1">
                        (laisser vide pour conserver l&apos;actuel)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingId}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder={
                      editingId
                        ? 'Nouveau mot de passe (optionnel)'
                        : 'Mot de passe'
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="editeur">Editeur</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm font-medium">Compte actif</span>
                </label>
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
                    : "Creer l'utilisateur"}
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

        {/* Empty state */}
        {!isLoading && userList.length === 0 && (
          <div className="rounded-xl border border-border bg-card-bg shadow-sm p-12 text-center">
            <UserX className="h-12 w-12 text-muted mx-auto mb-4" />
            <p className="text-muted">Aucun utilisateur trouve.</p>
          </div>
        )}

        {/* Users Table */}
        {!isLoading && userList.length > 0 && (
          <div className="rounded-xl border border-border bg-card-bg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Nom
                  </th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Statut
                  </th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Date de creation
                  </th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {userList.map((user) => {
                  const isSelf = currentUser?.id === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {user.name}
                          </span>
                          {isSelf && (
                            <span className="text-xs text-muted">(vous)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/utilisateurs/${user.id}`}
                            className="border border-border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-1"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Modifier
                          </Link>
                          <button
                            onClick={() =>
                              toggleActiveMutation.mutate(user.id)
                            }
                            disabled={isSelf || toggleActiveMutation.isPending}
                            className={`border rounded-lg px-3 py-1.5 text-sm flex items-center gap-1 disabled:opacity-50 ${
                              user.is_active
                                ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                            title={
                              user.is_active
                                ? 'Desactiver le compte'
                                : 'Activer le compte'
                            }
                          >
                            {user.is_active ? (
                              <ShieldOff className="h-3.5 w-3.5" />
                            ) : (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {deleteConfirmId === user.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  deleteMutation.mutate(user.id)
                                }
                                disabled={deleteMutation.isPending}
                                className="bg-red-600 text-white rounded-lg px-3 py-1.5 text-sm hover:bg-red-700 disabled:opacity-50"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="border border-border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50"
                              >
                                Non
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(user.id)}
                              disabled={isSelf}
                              className="border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-sm hover:bg-red-50 flex items-center gap-1 disabled:opacity-50"
                              title={
                                isSelf
                                  ? 'Vous ne pouvez pas supprimer votre propre compte'
                                  : 'Supprimer'
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
