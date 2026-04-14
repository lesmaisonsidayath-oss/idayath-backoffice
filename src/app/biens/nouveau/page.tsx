'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { properties } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NouveauBienPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('location');
  const [category, setCategory] = useState('appartement');
  const [status, setStatus] = useState('disponible');
  const [price, setPrice] = useState('');
  const [surface, setSurface] = useState('');
  const [rooms, setRooms] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', type);
      formData.append('category', category);
      formData.append('status', status);
      formData.append('price', price);
      formData.append('surface', surface || '0');
      if (rooms) formData.append('rooms', rooms);
      if (bedrooms) formData.append('bedrooms', bedrooms);
      if (bathrooms) formData.append('bathrooms', bathrooms);
      formData.append('city', city);
      if (neighborhood) formData.append('neighborhood', neighborhood);
      if (address) formData.append('address', address);
      features.forEach((f) => formData.append('features[]', f));
      images.forEach((img) => formData.append('images[]', img));
      formData.append('is_visible', isVisible ? '1' : '0');
      formData.append('is_featured', isFeatured ? '1' : '0');

      await properties.create(formData);
      router.push('/biens');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Erreur lors de la création du bien.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Nouveau bien">
      <div className="mb-6">
        <Link
          href="/biens"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux biens
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Informations générales</h2>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
                Titre *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Ex: Appartement 3 pièces à Cocody"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Décrivez le bien en détail..."
              />
            </div>

            {/* Type, Category, Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="type" className="mb-1.5 block text-sm font-medium">
                  Type *
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="location">Location</option>
                  <option value="location_meublee">Location meublée</option>
                  <option value="vente">Vente</option>
                </select>
              </div>

              <div>
                <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
                  Catégorie *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="appartement">Appartement</option>
                  <option value="terrain">Terrain</option>
                  <option value="studio">Studio</option>
                  <option value="F2">F2</option>
                  <option value="F3">F3</option>
                  <option value="F4">F4</option>
                  <option value="villa">Villa</option>
                  <option value="bureau">Bureau</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="mb-1.5 block text-sm font-medium">
                  Statut *
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="disponible">Disponible</option>
                  <option value="loué">Loué</option>
                  <option value="vendu">Vendu</option>
                  <option value="en_cours">En cours</option>
                  <option value="vefa">VEFA</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Caractéristiques */}
        <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Caractéristiques</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label htmlFor="price" className="mb-1.5 block text-sm font-medium">
                Prix (FCFA) *
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="surface" className="mb-1.5 block text-sm font-medium">
                Surface (m²)
              </label>
              <input
                id="surface"
                type="number"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                min="0"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="rooms" className="mb-1.5 block text-sm font-medium">
                Pièces
              </label>
              <input
                id="rooms"
                type="number"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                min="0"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="bedrooms" className="mb-1.5 block text-sm font-medium">
                Chambres
              </label>
              <input
                id="bedrooms"
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                min="0"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="mb-1.5 block text-sm font-medium">
                Salles de bain
              </label>
              <input
                id="bathrooms"
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                min="0"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Localisation</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="mb-1.5 block text-sm font-medium">
                Ville *
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Ex: Abidjan"
              />
            </div>

            <div>
              <label htmlFor="neighborhood" className="mb-1.5 block text-sm font-medium">
                Quartier
              </label>
              <input
                id="neighborhood"
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Ex: Cocody"
              />
            </div>

            <div>
              <label htmlFor="address" className="mb-1.5 block text-sm font-medium">
                Adresse
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Ex: Rue des Jardins"
              />
            </div>
          </div>
        </div>

        {/* Équipements */}
        <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Équipements</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={handleFeatureKeyDown}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Ex: Climatisation, Parking, Piscine..."
            />
            <button
              type="button"
              onClick={addFeature}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
            >
              Ajouter
            </button>
          </div>
          {features.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Images</h2>
          <div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-8 transition-colors hover:border-primary/50 hover:bg-primary/5">
              <svg className="mb-2 h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5" />
              </svg>
              <span className="text-sm text-muted">Cliquez pour sélectionner des images</span>
              <span className="mt-1 text-xs text-muted">PNG, JPG, WEBP (max 5 Mo)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="group relative">
                  <img
                    src={preview}
                    alt={`Aperçu ${index + 1}`}
                    className="h-24 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Options</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm font-medium">Visible sur le site</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm font-medium">Mettre en vedette</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/biens"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? 'Création en cours...' : 'Créer le bien'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
