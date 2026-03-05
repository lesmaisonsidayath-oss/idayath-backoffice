'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { formations } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import type { Formation } from '@/lib/types';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';

export default function FormationEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('');
  const [duration, setDuration] = useState('');
  const [format, setFormat] = useState('');
  const [level, setLevel] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryKey: ['formation', id],
    queryFn: () => formations.get(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.data) {
      const formation: Formation = data.data.data ?? data.data;
      setTitle(formation.title);
      setDescription(formation.description);
      setInstructor(formation.instructor);
      setDuration(formation.duration);
      setFormat(formation.format);
      setLevel(formation.level);
      setPrice(String(formation.price));
      setDate(formation.date ?? '');
      setTopics(formation.topics ?? []);
      setIsVisible(formation.is_visible);
      if (formation.image_url) {
        setExistingImage(formation.image_url);
      }
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => formations.update(id, formData),
    onSuccess: () => {
      router.push('/formations');
    },
  });

  const handleAddTopic = () => {
    const trimmed = topicInput.trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setExistingImage(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('instructor', instructor);
    formData.append('duration', duration);
    formData.append('format', format);
    formData.append('level', level);
    formData.append('price', price);
    if (date) formData.append('date', date);
    formData.append('is_visible', isVisible ? '1' : '0');
    topics.forEach((topic) => formData.append('topics[]', topic));
    if (image) formData.append('image', image);

    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Modifier la formation">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Modifier la formation">
        <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
          <p className="text-sm text-danger">
            Erreur lors du chargement de la formation.
          </p>
          <Link
            href="/formations"
            className="mt-4 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux formations
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Modifier la formation">
      <div className="mb-6">
        <Link
          href="/formations"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux formations
        </Link>
        <h2 className="mt-3 text-2xl font-bold text-foreground">
          Modifier la formation
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
          {updateMutation.isError && (
            <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-danger">
              Erreur lors de la mise a jour de la formation. Veuillez reessayer.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
                Titre
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Titre de la formation"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Description de la formation"
              />
            </div>

            {/* Instructor */}
            <div>
              <label htmlFor="instructor" className="mb-1.5 block text-sm font-medium">
                Formateur
              </label>
              <input
                id="instructor"
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Nom du formateur"
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="mb-1.5 block text-sm font-medium">
                Duree
              </label>
              <input
                id="duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Ex: 3 jours, 2 semaines"
              />
            </div>

            {/* Format */}
            <div>
              <label htmlFor="format" className="mb-1.5 block text-sm font-medium">
                Format
              </label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selectionnez un format</option>
                <option value="présentiel">Presentiel</option>
                <option value="en ligne">En ligne</option>
                <option value="hybride">Hybride</option>
              </select>
            </div>

            {/* Level */}
            <div>
              <label htmlFor="level" className="mb-1.5 block text-sm font-medium">
                Niveau
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selectionnez un niveau</option>
                <option value="débutant">Debutant</option>
                <option value="intermédiaire">Intermediaire</option>
                <option value="avancé">Avance</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="mb-1.5 block text-sm font-medium">
                Prix (FCFA)
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="0"
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="mb-1.5 block text-sm font-medium">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Topics */}
            <div className="md:col-span-2">
              <label htmlFor="topicInput" className="mb-1.5 block text-sm font-medium">
                Sujets
              </label>
              <div className="flex gap-2">
                <input
                  id="topicInput"
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={handleTopicKeyDown}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Ajouter un sujet"
                />
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </button>
              </div>
              {topics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {topics.map((topic, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(index)}
                        className="ml-0.5 hover:text-primary-dark"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Image */}
            <div className="md:col-span-2">
              <label htmlFor="image" className="mb-1.5 block text-sm font-medium">
                Image
              </label>
              <div className="flex items-start gap-4">
                <label
                  htmlFor="image"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted hover:border-primary hover:text-primary"
                >
                  <Upload className="h-5 w-5" />
                  <span>Choisir une image</span>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {existingImage && !imagePreview && (
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
                    <img
                      src={existingImage}
                      alt="Image actuelle"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                {imagePreview && (
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
                    <img
                      src={imagePreview}
                      alt="Apercu"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Visibility */}
            <div className="md:col-span-2">
              <label className="inline-flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm font-medium">
                  Formation visible sur le site
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-6">
            <Link
              href="/formations"
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {updateMutation.isPending
                ? 'Mise a jour...'
                : 'Mettre a jour la formation'}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
