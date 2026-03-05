'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { users } from '@/lib/api';
import type { User, UserRole } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { ArrowLeft, Save, ShieldOff } from 'lucide-react';
import Link from 'next/link';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  is_active: boolean;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const userId = Number(params.id);

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'editeur',
    is_active: true,
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      const res = await users.get(userId);
      return res.data.data as User;
    },
    enabled: isSuperAdmin && !!userId,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        is_active: user.is_active,
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserFormData>) => users.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      setSuccessMessage('Utilisateur mis a jour avec succes.');
      setFormError('');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: () => {
      setFormError('Une erreur est survenue lors de la mise a jour.');
      setSuccessMessage('');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const updateData: Partial<UserFormData> = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      is_active: formData.is_active,
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    updateMutation.mutate(updateData);
  }

  // Access check (after all hooks)
  if (!isSuperAdmin) {
    return (
      <DashboardLayout title="Modifier l'utilisateur">
        <div className="rounded-xl border border-border bg-card-bg shadow-sm p-12 text-center">
          <ShieldOff className="h-12 w-12 text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Acces refuse</h2>
          <p className="text-muted">
            Vous n&apos;avez pas les droits necessaires pour acceder a cette
            page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Modifier l'utilisateur">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title="Utilisateur introuvable">
        <div className="rounded-xl border border-border bg-card-bg shadow-sm p-12 text-center">
          <h2 className="text-lg font-semibold mb-2">
            Utilisateur introuvable
          </h2>
          <p className="text-muted mb-4">
            L&apos;utilisateur demande n&apos;existe pas ou a ete supprime.
          </p>
          <Link
            href="/utilisateurs"
            className="inline-flex items-center gap-2 bg-primary text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-primary-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour a la liste
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Modifier - ${user.name}`}>
      <div className="space-y-6">
        {/* Header with back link */}
        <div className="flex items-center gap-4">
          <Link
            href="/utilisateurs"
            className="flex items-center gap-2 border border-border rounded-lg px-4 py-2 text-sm hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Modifier l&apos;utilisateur</h1>
            <p className="text-sm text-muted mt-1">
              Modification du compte de {user.name}
            </p>
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {formError}
          </div>
        )}

        {/* Edit Form */}
        <div className="rounded-xl border border-border bg-card-bg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">
            Informations du compte
          </h2>

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
                  <span className="text-muted font-normal ml-1">
                    (laisser vide pour conserver l&apos;actuel)
                  </span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Nouveau mot de passe (optionnel)"
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

            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 bg-primary text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-primary-dark disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending
                  ? 'Enregistrement...'
                  : 'Enregistrer les modifications'}
              </button>
              <Link
                href="/utilisateurs"
                className="border border-border rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
