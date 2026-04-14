'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { properties } from '@/lib/api';
import type { Property } from '@/lib/types';
import { ArrowLeft, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';

export default function EditBienPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

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
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  const { data: property, isLoading, error: fetchError } = useQuery<Property>({
    queryKey: ['property', id],
    queryFn: async () => {
      const res = await properties.get(id);
      return res.data.data as Property;
    },
    enabled: !!id,
  });

  // Populate form when property data arrives
  useEffect(() => {
    if (property) {
      setTitle(property.title);
      setDescription(property.description);
      setType(property.type);
      setCategory(property.category);
      setStatus(property.status);
      setPrice(String(property.price));
      setSurface(String(property.surface));
      setRooms(property.rooms != null ? String(property.rooms) : '');
      setBedrooms(property.bedrooms != null ? String(property.bedrooms) : '');
      setBathrooms(property.bathrooms != null ? String(property.bathrooms) : '');
      setCity(property.city);
      setNeighborhood(property.neighborhood || '');
      setAddress(property.address || '');
      setFeatures(property.features || []);
      setIsVisible(property.is_visible);
      setIsFeatured(property.is_featured);
    }
  }, [property]);

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

    setNewImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    if (!window.confirm('Supprimer cette image ?')) return;
    setDeletingImageId(imageId);
    try {
      await properties.deleteImage(id, imageId);
      // Force re-fetch of property data to update images
      window.location.reload();
    } catch {
      setError('Erreur lors de la suppression de l\'image.');
    } finally {
      setDeletingImageId(null);
    }
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
      newImages.forEach((img) => formData.append('images[]', img));
      formData.append('is_visible', isVisible ? '1' : '0');
      formData.append('is_featured', isFeatured ? '1' : '0');

      await properties.update(id, formData);
      router.push('/biens');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Erreur lors de la mise à jour du bien.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Modifier le bien">
      <div className="mb-6">
        <Link
          href="/biens"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux biens
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Fetch Error */}
      {fetchError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-danger">
          Erreur lors du chargement du bien.
        </div>
      )}

      {/* Form Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {property && (
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

          {/* Images existantes */}
          <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">Images existantes</h2>
            {property.images && property.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {property.images.map((image) => (
                  <div key={image.id} className="group relative">
                    <img
                      src={image.url}
                      alt={`Image ${image.id}`}
                      className="h-24 w-full rounded-lg object-cover"
                    />
                    {image.is_main && (
                      <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        Principale
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(image.id)}
                      disabled={deletingImageId === image.id}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 disabled:opacity-50"
                    >
                      {deletingImageId === image.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">Aucune image existante.</p>
            )}
          </div>

          {/* Ajouter des images */}
          <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">Ajouter des images</h2>
            <div>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-8 transition-colors hover:border-primary/50 hover:bg-primary/5">
                <Upload className="mb-2 h-8 w-8 text-muted" />
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
            {newImagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {newImagePreviews.map((preview, index) => (
                  <div key={index} className="group relative">
                    <img
                      src={preview}
                      alt={`Nouvelle image ${index + 1}`}
                      className="h-24 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
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
              {submitting ? 'Mise à jour en cours...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
