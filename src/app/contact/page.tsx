'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { contactSettings } from '@/lib/api';
import type { ContactSettings } from '@/lib/types';
import { Save, Phone, Mail, MapPin, Globe, Clock } from 'lucide-react';

interface ContactFormData {
  phone: string;
  phone_secondary: string;
  email: string;
  email_secondary: string;
  address: string;
  city: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
  opening_hours: string;
  map_url: string;
}

const emptyForm: ContactFormData = {
  phone: '',
  phone_secondary: '',
  email: '',
  email_secondary: '',
  address: '',
  city: '',
  whatsapp: '',
  facebook: '',
  instagram: '',
  linkedin: '',
  tiktok: '',
  opening_hours: '',
  map_url: '',
};

export default function ContactSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ContactFormData>(emptyForm);
  const [successMessage, setSuccessMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['contact-settings'],
    queryFn: async () => {
      const res = await contactSettings.get();
      return res.data.data as ContactSettings;
    },
  });

  useEffect(() => {
    if (data) {
      setFormData({
        phone: data.phone || '',
        phone_secondary: data.phone_secondary || '',
        email: data.email || '',
        email_secondary: data.email_secondary || '',
        address: data.address || '',
        city: data.city || '',
        whatsapp: data.whatsapp || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        linkedin: data.linkedin || '',
        tiktok: data.tiktok || '',
        opening_hours: data.opening_hours || '',
        map_url: data.map_url || '',
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (data: ContactFormData) => contactSettings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-settings'] });
      setSuccessMessage('Parametres de contact mis a jour avec succes.');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate(formData);
  }

  function updateField(field: keyof ContactFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Parametres de contact">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Parametres de contact">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Parametres de contact</h1>
          <p className="text-sm text-muted mt-1">
            Gerez les informations de contact affichees sur le site
          </p>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {updateMutation.isError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            Une erreur est survenue lors de la mise a jour.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Coordonnees */}
          <div className="rounded-xl border border-border bg-card-bg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Phone className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Coordonnees</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Telephone principal
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Telephone secondaire
                </label>
                <input
                  type="text"
                  value={formData.phone_secondary}
                  onChange={(e) =>
                    updateField('phone_secondary', e.target.value)
                  }
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email principal
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email secondaire
                </label>
                <input
                  type="email"
                  value={formData.email_secondary}
                  onChange={(e) =>
                    updateField('email_secondary', e.target.value)
                  }
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="info@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Adresse complete"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Abidjan"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>
            </div>
          </div>

          {/* Section: Reseaux sociaux */}
          <div className="rounded-xl border border-border bg-card-bg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Reseaux sociaux</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Facebook
                </label>
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => updateField('facebook', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  TikTok
                </label>
                <input
                  type="url"
                  value={formData.tiktok}
                  onChange={(e) => updateField('tiktok', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="https://tiktok.com/..."
                />
              </div>
            </div>
          </div>

          {/* Section: Autres */}
          <div className="rounded-xl border border-border bg-card-bg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Autres</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Horaires d&apos;ouverture
                </label>
                <textarea
                  value={formData.opening_hours}
                  onChange={(e) =>
                    updateField('opening_hours', e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Lundi - Vendredi: 8h - 18h&#10;Samedi: 9h - 13h"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  URL Google Maps
                </label>
                <input
                  type="url"
                  value={formData.map_url}
                  onChange={(e) => updateField('map_url', e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
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
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
