'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { blog } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ArrowLeft, Upload, X } from 'lucide-react';

export default function BlogPostCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => blog.create(formData),
    onSuccess: () => {
      router.push('/blog');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
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
    formData.append('excerpt', excerpt);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('is_published', isPublished ? '1' : '0');
    if (image) formData.append('image', image);

    createMutation.mutate(formData);
  };

  return (
    <DashboardLayout title="Nouvel article">
      <div className="mb-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux articles
        </Link>
        <h2 className="mt-3 text-2xl font-bold text-foreground">
          Ajouter un article
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-border bg-card-bg p-6 shadow-sm">
          {createMutation.isError && (
            <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-danger">
              Erreur lors de la creation de l&apos;article. Veuillez reessayer.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {/* Title */}
            <div>
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
                placeholder="Titre de l'article"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium">
                Extrait
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
                rows={3}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Court resume de l'article"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="mb-1.5 block text-sm font-medium">
                Contenu
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Contenu de l'article"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
                Categorie
              </label>
              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Categorie de l'article"
              />
            </div>

            {/* Image */}
            <div>
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

            {/* Published */}
            <div>
              <label className="inline-flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm font-medium">
                  Publier l&apos;article
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-6">
            <Link
              href="/blog"
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creation...' : 'Creer l\'article'}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
