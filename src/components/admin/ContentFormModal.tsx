import React, { useState, useEffect } from 'react';
import { Content, Category } from '../../types/database';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { generateSlug } from '../../services/importService';

interface ContentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: Partial<Content>) => Promise<void>;
  initialContent?: Content | null;
  categories: Category[];
}

export const ContentFormModal: React.FC<ContentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContent,
  categories,
}) => {
  const [formData, setFormData] = useState<Partial<Content>>({
    title: '',
    slug: '',
    description: '',
    category_id: categories[0]?.id || 'cat-1',
    cover_url: '',
    banner_url: '',
    bunny_video_id: '',
    year: 2024,
    rating: 9.5,
    duration: 60,
    classification: '14',
    country: 'Coreia do Sul',
    language: 'Legendado',
    is_featured: false,
    is_trending: false,
    is_published: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialContent) {
      setFormData(initialContent);
    } else {
      setFormData({
        title: '',
        slug: '',
        description: '',
        category_id: categories[0]?.id || 'cat-1',
        cover_url: '',
        banner_url: '',
        bunny_video_id: '',
        year: 2024,
        rating: 9.5,
        duration: 60,
        classification: '14',
        country: 'Coreia do Sul',
        language: 'Legendado',
        is_featured: false,
        is_trending: false,
        is_published: true,
      });
    }
  }, [initialContent, categories]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      // Auto-generate slug if not manually edited or new
      slug: !initialContent ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.cover_url) {
      alert('Preencha ao menos o título e a URL da capa!');
      return;
    }

    try {
      setSaving(true);
      await onSave({
        ...formData,
        slug: formData.slug || generateSlug(formData.title || 'sem-titulo'),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialContent ? 'Editar Conteúdo' : 'Novo Título'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-brand-subtext mb-1">Título *</label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={handleTitleChange}
              placeholder="Ex: Alquimia das Almas"
              className="w-full px-3.5 py-2 rounded-xl bg-brand-bg border border-brand-border text-sm text-white focus:border-crimson outline-none"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-brand-subtext mb-1">Slug (URL amigável) *</label>
            <input
              type="text"
              required
              value={formData.slug || ''}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              placeholder="Ex: alquimia-das-almas"
              className="w-full px-3.5 py-2 rounded-xl bg-brand-bg border border-brand-border text-sm text-white focus:border-crimson outline-none"
            />
          </div>
        </div>

        {/* Category & Bunny Video ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-subtext mb-1">Categoria *</label>
            <select
              value={formData.category_id}
              onChange={e => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-brand-bg border border-brand-border text-sm text-white focus:border-crimson outline-none"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-subtext mb-1">Bunny Video ID</label>
            <input
              type="text"
              value={formData.bunny_video_id || ''}
              onChange={e => setFormData({ ...formData, bunny_video_id: e.target.value })}
              placeholder="Ex: 8f4a-bc23-412e"
              className="w-full px-3.5 py-2 rounded-xl bg-brand-bg border border-brand-border text-sm text-white focus:border-crimson outline-none font-mono text-xs"
            />
          </div>
        </div>

        {/* Cover URL & Banner URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-subtext mb-1">URL da Capa (Vertical 2:3) *</label>
            <input
              type="url"
              required
              value={formData.cover_url || ''}
              onChange={e => setFormData({ ...formData, cover_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl bg-brand-bg border border-brand-border text-sm text-white focus:border-crimson outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-subtext mb-1">URL do Banner (Horizontal 16:9)</label>
            <input
              type="url"
              value={formData.banner_url || ''}
              onChange={e => setFormData({ ...formData, banner_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl bg-brand-bg border border-brand-border text-sm text-white focus:border-crimson outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-brand-subtext mb-1">Sinopse / Descrição</label>
          <textarea
            rows={3}
            value={formData.description || ''}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Breve resumo da obra..."
            className="w-full px-3.5 py-2 rounded-xl bg-brand-bg border border-brand-border text-sm text-white focus:border-crimson outline-none resize-none"
          />
        </div>

        {/* Year, Rating, Duration, Classification */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-brand-subtext mb-1">Ano</label>
            <input
              type="number"
              value={formData.year || 2024}
              onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-subtext mb-1">Nota (0 a 10)</label>
            <input
              type="number"
              step="0.1"
              value={formData.rating || 9.0}
              onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-subtext mb-1">Duração (min)</label>
            <input
              type="number"
              value={formData.duration || 60}
              onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-subtext mb-1">Classificação</label>
            <select
              value={formData.classification || '14'}
              onChange={e => setFormData({ ...formData, classification: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-white outline-none"
            >
              {['L', '10', '12', '14', '16', '18'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkbox Toggles: Published, Featured, Trending */}
        <div className="flex flex-wrap gap-6 pt-2 border-t border-brand-border/60">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
              className="rounded accent-crimson"
            />
            <span className="text-xs font-medium text-white">Publicado no catálogo</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
              className="rounded accent-crimson"
            />
            <span className="text-xs font-medium text-white">Destaque (Hero)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_trending}
              onChange={e => setFormData({ ...formData, is_trending: e.target.checked })}
              className="rounded accent-crimson"
            />
            <span className="text-xs font-medium text-white">Em Alta</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-brand-border/60">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Salvando...' : (initialContent ? 'Atualizar Título' : 'Cadastrar Título')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
