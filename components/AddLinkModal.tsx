import React, { useState, useEffect } from 'react';
import { X, Link2, Sparkles, ArrowRight, Check, Tag } from 'lucide-react';
import { analyzeLink } from '../services/geminiService';
import { GeminiAnalysis } from '../types';

interface AddLinkModalProps {
  onAdd: (linkData: any) => Promise<void>;
  onClose: () => void;
  categories: string[];
  initialUrl?: string | null;
}

const AddLinkModal: React.FC<AddLinkModalProps> = ({ onAdd, onClose, categories, initialUrl }) => {
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [url, setUrl] = useState(initialUrl || '');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);

  // Auto-analyze if initialUrl is provided
  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      // Auto-trigger analysis
      handleAnalyzeUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleAnalyzeUrl = async (urlToAnalyze: string) => {
    if (!urlToAnalyze) return;
    setLoading(true);

    const result = await analyzeLink(urlToAnalyze, categories);
    setAnalysis(result);

    // Pre-fill form
    setTitle(result.title);
    setSummary(result.summary);
    setCategory(result.category);
    setTags(result.tags);

    setLoading(false);
    setStep('review');
  };

  // Form states for review
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAnalyzeUrl(url);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    await onAdd({
      url,
      title,
      summary,
      category,
      tags,
      isRead: false,
      createdAt: Date.now(),
    });
    setLoading(false);
    onClose();
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!loading ? onClose : undefined}
      />

      <div className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl p-1 overflow-hidden animate-luxe-fade">
        <div className="bg-[var(--bg-secondary)]/95 p-8 rounded-[22px] max-h-[85vh] overflow-y-auto no-scrollbar">

          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
                <Sparkles size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                  {step === 'input' ? 'Nouveau Lien' : 'Vérification'}
                </h2>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium uppercase tracking-wider">
                  {step === 'input' ? 'Analyse intelligente via Gemini' : 'Validez les informations'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all p-2 rounded-full hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>

          {step === 'input' ? (
            <form onSubmit={handleAnalyze} className="space-y-8">
              <div className="space-y-3">
                <label htmlFor="url" className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] ml-1">
                  URL de la ressource
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--text-primary)] transition-colors">
                    <Link2 size={20} />
                  </div>
                  <input
                    id="url"
                    type="url"
                    autoFocus
                    required
                    className="w-full bg-white/5 text-[var(--text-primary)] border border-white/5 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all placeholder-[var(--text-tertiary)]"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-6 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="text-sm font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !url}
                  className="btn-primary-luxe flex items-center gap-2 min-w-[160px] justify-center shadow-lg active:scale-95 disabled:opacity-30"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[var(--bg-main)] border-t-transparent rounded-full animate-spin" />
                      <span>Analyse...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyser</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] ml-1">Titre</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 text-[var(--text-primary)] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white/10 focus:border-white/20"
                />
              </div>

              {/* Summary Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] ml-1">Résumé</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 text-[var(--text-primary)] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white/10 focus:border-white/20 resize-none"
                />
              </div>

              {/* Category Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] ml-1">Catégorie</label>
                <div className="relative">
                  <input
                    type="text"
                    list="categories-list"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 text-[var(--text-primary)] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white/10 focus:border-white/20"
                    placeholder="Sélectionner ou créer..."
                  />
                  <datalist id="categories-list">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Tags Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] ml-1">Tags</label>
                <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 min-h-[50px] flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="bg-white/10 text-[var(--text-primary)] px-2 py-1 rounded-md text-xs flex items-center gap-1">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-400 ml-1">×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={addTag}
                    className="bg-transparent text-sm focus:outline-none min-w-[60px] flex-1 text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                    placeholder="Ajouter un tag..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => setStep('input')}
                  className="text-sm font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading || !title}
                  className="btn-primary-luxe flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg active:scale-95 disabled:opacity-30"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[var(--bg-main)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Confirmer et Ajouter</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLinkModal;
