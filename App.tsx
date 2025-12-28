import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LinkItem, FilterType, Theme } from './types';
import { analyzeLink } from './services/geminiService';
import { subscribeToLinks, addLinkRemote, updateLinkRemote, deleteLinkRemote } from './services/storageService';
import LinkCard from './components/LinkCard';
import AddLinkModal from './components/AddLinkModal';
import CategoryPills from './components/CategoryPills';
import SettingsModal from './components/SettingsModal';
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import AppShell from './components/AppShell';
import { Search, Inbox, Layers, Globe, Archive, Plus, Menu } from 'lucide-react';

import ConfirmModal from './components/ConfirmModal';

const AppContent: React.FC = () => {
  const { user, loading: authLoading, isLocalMode } = useAuth();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.UNREAD);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);

  // Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Theme state kept for compatibility but defaulting to a single look
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentTheme] = useState<Theme>(Theme.MODERN);

  useEffect(() => {
    // Force basic theme attribute
    document.body.setAttribute('data-theme', 'zenith');

    // Handle PWA Share Target
    const params = new URLSearchParams(window.location.search);
    const urlFromShare = params.get('url') || params.get('text');
    if (urlFromShare) {
      // Extract URL if text contains it
      const urlMatch = urlFromShare.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        setSharedUrl(urlMatch[0]);
        setIsModalOpen(true);
      }
      // Clean URL
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  useEffect(() => {
    if (user) {
      setIsLoadingData(true);
      const unsubscribe = subscribeToLinks(user.id, (fetchedLinks) => {
        setLinks(fetchedLinks);
        setIsLoadingData(false);
      });
      return () => unsubscribe();
    } else {
      setLinks([]);
    }
  }, [user]);

  const handleAddLink = async (linkData: any) => {
    if (!user) {
      alert("Erreur: Vous devez être connecté pour sauvegarder un lien.");
      return;
    }

    try {
      // Ensure all required fields are present
      const newLink = {
        ...linkData,
        isRead: false,
        createdAt: Date.now(),
      };

      console.log("Saving link:", newLink);
      await addLinkRemote(user.id, newLink);
      console.log("Link saved successfully");

      if (isLocalMode) {
        subscribeToLinks(user.id, (updated) => setLinks(updated));
      }
    } catch (error) {
      console.error("Failed to save link:", error);
      alert(`Erreur lors de la sauvegarde: ${(error as any).message || error}`);
    }
  };

  const toggleRead = async (id: string) => {
    if (!user) return;
    const link = links.find(l => l.id === id);
    if (link) {
      await updateLinkRemote(user.id, id, { isRead: !link.isRead });
      if (isLocalMode) {
        subscribeToLinks(user.id, (updated) => setLinks(updated));
      }
    }
  };

  const requestDeleteLink = (id: string) => {
    setLinkToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteLink = async () => {
    if (!user || !linkToDelete) return;

    await deleteLinkRemote(user.id, linkToDelete);

    // For local mode updates
    if (isLocalMode) {
      subscribeToLinks(user.id, (updated) => setLinks(updated));
    }

    setLinkToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'inconnu';
    }
  };

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          link.title.toLowerCase().includes(query) ||
          link.summary.toLowerCase().includes(query) ||
          link.url.toLowerCase().includes(query) ||
          link.tags.some(t => t.toLowerCase().includes(query))
        );
      }

      // Tag filter (from Explorer)
      if (activeTag && !link.tags.some(t => t.toLowerCase() === activeTag.toLowerCase())) return false;

      if (activeFilter === FilterType.CATEGORY && activeCategory && link.category !== activeCategory) return false;
      if (activeFilter === FilterType.SOURCE && activeSource && getDomain(link.url) !== activeSource) return false;
      if (activeFilter === FilterType.UNREAD && link.isRead) return false;
      if (activeFilter === FilterType.READ && !link.isRead) return false;

      return true;
    });
  }, [links, activeFilter, activeCategory, activeSource, activeTag, searchQuery]);

  const categories = useMemo(() => {
    return Array.from(new Set(links.map(l => l.category))).sort();
  }, [links]);

  const sources = useMemo(() => {
    return Array.from(new Set(links.map(l => getDomain(l.url)))).sort();
  }, [links]);

  const switchFilter = (type: FilterType) => {
    setActiveFilter(type);
    if (type !== FilterType.CATEGORY) setActiveCategory(null);
    if (type !== FilterType.SOURCE) setActiveSource(null);
    setActiveTag(null); // Clear tag filter on nav change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Explorer handlers
  const handleExplorerFilterCategory = (category: string) => {
    setActiveCategory(category);
    setActiveSource(null);
    setActiveTag(null);
    setActiveFilter(FilterType.CATEGORY);
  };

  const handleExplorerFilterSource = (source: string) => {
    setActiveSource(source);
    setActiveCategory(null);
    setActiveTag(null);
    setActiveFilter(FilterType.SOURCE);
  };

  const handleExplorerFilterTag = (tag: string) => {
    setActiveTag(tag);
    setActiveCategory(null);
    setActiveSource(null);
    setActiveFilter(FilterType.ALL);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  // --- UI COMPONENTS ---

  const sidebar = (
    <Sidebar
      activeFilter={activeFilter}
      switchFilter={switchFilter}
      categories={categories}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      sources={sources}
      activeSource={activeSource}
      setActiveSource={setActiveSource}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onOpenAddModal={() => setIsModalOpen(true)}
      isLocalMode={isLocalMode}
    />
  );

  const mobileNav = (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-main)]/95 backdrop-blur-xl border-t border-[var(--border)] pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
      <div className="grid grid-cols-5 h-20 items-center">
        <button onClick={() => switchFilter(FilterType.UNREAD)} className={`nav-touch flex flex-col items-center justify-center gap-1 h-full ${activeFilter === FilterType.UNREAD ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`}>
          <Inbox size={22} strokeWidth={activeFilter === FilterType.UNREAD ? 2.5 : 1.5} />
          <span className="text-[10px] font-medium">À lire</span>
        </button>
        <button onClick={() => switchFilter(FilterType.SOURCE)} className={`nav-touch flex flex-col items-center justify-center gap-1 h-full ${activeFilter === FilterType.SOURCE ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`}>
          <Globe size={22} strokeWidth={activeFilter === FilterType.SOURCE ? 2.5 : 1.5} />
          <span className="text-[10px] font-medium">Sources</span>
        </button>
        <div className="flex items-center justify-center -mt-6">
          <button onClick={() => setIsModalOpen(true)} className="w-14 h-14 rounded-full bg-[var(--text-primary)] text-[var(--bg-main)] flex items-center justify-center transition-transform active:scale-95 shadow-xl shadow-white/10">
            <Plus size={26} strokeWidth={2.5} />
          </button>
        </div>
        <button onClick={() => switchFilter(FilterType.CATEGORY)} className={`nav-touch flex flex-col items-center justify-center gap-1 h-full ${activeFilter === FilterType.CATEGORY ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`}>
          <Layers size={22} strokeWidth={activeFilter === FilterType.CATEGORY ? 2.5 : 1.5} />
          <span className="text-[10px] font-medium">Catégories</span>
        </button>
        <button onClick={() => switchFilter(FilterType.READ)} className={`nav-touch flex flex-col items-center justify-center gap-1 h-full ${activeFilter === FilterType.READ ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`}>
          <Archive size={22} strokeWidth={activeFilter === FilterType.READ ? 2.5 : 1.5} />
          <span className="text-[10px] font-medium">Archives</span>
        </button>
      </div>
    </nav>
  );

  const header = (
    <header className="md:hidden sticky top-0 bg-[var(--bg-main)]/80 backdrop-blur-lg border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
      <h1 className="font-bold text-lg tracking-tight">LinkShelf</h1>
      <button onClick={() => setIsSettingsOpen(true)} className="p-2 -mr-2 text-[var(--text-secondary)]">
        <Menu size={20} />
      </button>
    </header>
  );

  return (
    <>
      <AppShell sidebar={sidebar} mobileNav={mobileNav} header={header}>
        {/* Top Bar (Search + Stats) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="search-container relative w-full md:max-w-md group flex items-center">
            <div className="text-[var(--text-tertiary)] group-focus-within:text-[var(--text-primary)] transition-colors mr-3">
              <Search size={16} />
            </div>
            <input
              type="text"
              className="w-full bg-transparent border-none text-sm focus:outline-none placeholder-[var(--text-tertiary)]"
              placeholder="Rechercher dans votre collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] bg-white/5 px-4 py-2 rounded-full border border-white/5">
            {filteredLinks.length} items
          </div>
        </div>

        {/* Active Tag Filter Indicator */}
        {activeTag && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-[var(--text-tertiary)]">Filtré par tag:</span>
            <button
              onClick={() => setActiveTag(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-full text-xs font-medium hover:bg-[var(--accent-primary)]/30 transition-all"
            >
              #{activeTag}
              <span className="text-[var(--accent-primary)]/60 hover:text-[var(--accent-primary)]">×</span>
            </button>
          </div>
        )}

        {/* Categories on Mobile */}
        <div className="md:hidden">
          {activeFilter === FilterType.SOURCE ? (
            <CategoryPills categories={sources} activeCategory={activeSource} onSelectCategory={setActiveSource} />
          ) : (
            <CategoryPills categories={categories} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
          )}
        </div>

        {/* Content Grid */}
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
            <p className="text-sm text-[var(--text-secondary)] animate-pulse">Chargement de votre bibliothèque...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-white/5 rounded-[var(--radius-xl)] flex items-center justify-center mb-4 text-[var(--text-secondary)]">
              <Inbox size={32} strokeWidth={1} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">C'est vide ici</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Commencez par ajouter des liens intéressants à votre collection.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-[var(--text-primary)] text-[var(--bg-main)] text-sm font-bold rounded-[var(--radius-full)] hover:opacity-90 transition-opacity"
            >
              Ajouter un premier lien
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24 md:pb-10">
            {filteredLinks.map((link) => (
              <div key={link.id} className="animate-fade-in">
                <LinkCard
                  link={link}
                  onToggleRead={toggleRead}
                  onDelete={requestDeleteLink}
                />
              </div>
            ))}
          </div>
        )}
      </AppShell>

      {isModalOpen && <AddLinkModal onAdd={handleAddLink} onClose={() => { setIsModalOpen(false); setSharedUrl(null); }} categories={categories} initialUrl={sharedUrl} />}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteLink}
        title="Supprimer ce lien ?"
        message="Cette action est irréversible. Le lien sera définitivement retiré de votre bibliothèque."
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
