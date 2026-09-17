import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Film, 
  ExternalLink 
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Button } from '../../components/common/Button';
import { ContentFormModal } from '../../components/admin/ContentFormModal';
import { 
  getContents, 
  getCategories, 
  createContent, 
  updateContent, 
  deleteContent 
} from '../../services/api';
import { Content, Category } from '../../types/database';
import { showToast } from '../../components/common/Toast';

export const AdminContentsPage: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);

  const loadData = async () => {
    const [cList, catList] = await Promise.all([getContents(), getCategories()]);
    setContents(cList);
    setCategories(catList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenNew = () => {
    setEditingContent(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Content) => {
    setEditingContent(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Content>) => {
    if (editingContent) {
      await updateContent(editingContent.id, data);
      showToast('Conteúdo atualizado com sucesso!');
    } else {
      await createContent(data);
      showToast('Novo conteúdo cadastrado com sucesso!');
    }
    loadData();
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${title}"?`)) {
      await deleteContent(id);
      showToast('Conteúdo excluído com sucesso.');
      loadData();
    }
  };

  const handleTogglePublish = async (item: Content) => {
    await updateContent(item.id, { is_published: !item.is_published });
    showToast(item.is_published ? 'Conteúdo despublicado' : 'Conteúdo publicado');
    loadData();
  };

  const filtered = contents.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()) ||
    (c.bunny_video_id && c.bunny_video_id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              Gerenciamento de Conteúdo
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-1">
              Cadastre, edite, publique ou configure IDs de vídeo do Bunny Stream.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenNew}
            icon={<Plus className="w-4 h-4" />}
            className="shadow-xl shadow-crimson/25"
          >
            Cadastrar Novo Título
          </Button>
        </div>

        {/* Search Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-md w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 flex items-center">
            <Search className="w-4 h-4 text-brand-muted mr-2.5" />
            <input
              type="text"
              placeholder="Buscar por título, slug ou Bunny ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-brand-muted outline-none w-full"
            />
          </div>

          <span className="text-xs font-semibold text-brand-muted shrink-0">
            {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        {/* Contents Table */}
        <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-subtext">
              <thead className="bg-brand-bg/90 text-brand-muted uppercase text-[10px] border-b border-brand-border/60">
                <tr>
                  <th className="px-4 py-3.5">Título & Capa</th>
                  <th className="px-4 py-3.5">Categoria</th>
                  <th className="px-4 py-3.5">Bunny Video ID</th>
                  <th className="px-4 py-3.5">Ano / Nota</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-brand-card/40 transition-colors">
                    {/* Title + Poster */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.cover_url}
                          alt={item.title}
                          className="w-10 h-14 object-cover rounded-lg shrink-0 border border-brand-border/60"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{item.title}</h4>
                          <p className="text-[11px] text-brand-muted font-mono">{item.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 font-semibold text-white">
                      {item.category?.name || 'Doramas'}
                    </td>

                    {/* Bunny Video ID */}
                    <td className="px-4 py-3">
                      {item.bunny_video_id ? (
                        <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {item.bunny_video_id}
                        </span>
                      ) : (
                        <span className="text-crimson text-[11px]">Sem Bunny ID</span>
                      )}
                    </td>

                    {/* Year / Rating */}
                    <td className="px-4 py-3">
                      <span>{item.year || 2024}</span>
                      <span className="text-brand-muted ml-1">({item.rating?.toFixed(1) || '0.0'})</span>
                    </td>

                    {/* Published toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          item.is_published
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-brand-card text-brand-muted border border-brand-border'
                        }`}
                      >
                        {item.is_published ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{item.is_published ? 'Publicado' : 'Rascunho'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-brand-subtext hover:text-white hover:bg-brand-card transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 rounded-lg text-crimson hover:bg-crimson/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Content Form Modal */}
        <ContentFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialContent={editingContent}
          categories={categories}
        />
      </main>
    </div>
  );
};
