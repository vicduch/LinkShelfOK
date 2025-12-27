import React from 'react';
import { FilterType } from '../types';
import {
    Inbox,
    Layers,
    Globe,
    Archive,
    Plus,
    Settings,
    BookOpen,
    Compass
} from 'lucide-react';

interface SidebarProps {
    activeFilter: FilterType;
    switchFilter: (type: FilterType) => void;
    categories: string[];
    activeCategory: string | null;
    setActiveCategory: (cat: string | null) => void;
    sources: string[];
    activeSource: string | null;
    setActiveSource: (source: string | null) => void;
    onOpenSettings: () => void;
    onOpenAddModal: () => void;
    isLocalMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
    activeFilter,
    switchFilter,
    categories,
    activeCategory,
    setActiveCategory,
    sources,
    activeSource,
    setActiveSource,
    onOpenSettings,
    onOpenAddModal,
    isLocalMode
}) => {

    const NavButton = ({
        active,
        onClick,
        icon: Icon,
        label
    }: {
        active: boolean;
        onClick: () => void;
        icon: React.ElementType;
        label: string
    }) => (
        <button
            onClick={onClick}
            className={`nav-item w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-[var(--radius-md)] mb-1 ${active
                ? 'active'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                }`}
        >
            <Icon size={18} className={active ? 'text-[var(--accent-primary)]' : ''} />
            <span>{label}</span>
        </button>
    );

    return (
        <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--bg-secondary)]/50 backdrop-blur-xl pt-8 pb-6 px-4">

            {/* Header */}
            <div className="flex justify-between items-center mb-10 px-2 mt-2">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-sm">
                        <BookOpen size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">LinkShelf</h1>
                        {isLocalMode && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/80 animate-pulse" />
                                <span className="text-[9px] uppercase font-bold text-amber-500/80 tracking-widest">Local Session</span>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={onOpenSettings}
                    className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all p-2 rounded-full hover:bg-white/5"
                >
                    <Settings size={18} />
                </button>
            </div>

            {/* Main Nav */}
            <nav className="flex flex-col mb-8">
                <NavButton
                    active={activeFilter === FilterType.UNREAD}
                    onClick={() => switchFilter(FilterType.UNREAD)}
                    icon={Inbox}
                    label="À lire"
                />
                <NavButton
                    active={activeFilter === FilterType.SOURCE}
                    onClick={() => switchFilter(FilterType.SOURCE)}
                    icon={Globe}
                    label="Sources"
                />
                <NavButton
                    active={activeFilter === FilterType.CATEGORY}
                    onClick={() => switchFilter(FilterType.CATEGORY)}
                    icon={Layers}
                    label="Catégories"
                />
                <NavButton
                    active={activeFilter === FilterType.READ}
                    onClick={() => switchFilter(FilterType.READ)}
                    icon={Archive}
                    label="Archives"
                />
            </nav>

            {/* Collections Section */}
            <div className="mb-4 px-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    {activeFilter === FilterType.SOURCE ? 'Domaines' : 'Explorer'}
                </span>
            </div>

            <div className="flex flex-col gap-1 overflow-y-auto flex-1 no-scrollbar px-2 mask-linear-fade">
                {activeFilter === FilterType.SOURCE ? (
                    sources.map(source => (
                        <button
                            key={source}
                            onClick={() => setActiveSource(source)}
                            className={`text-left px-3 py-2 text-sm rounded-[var(--radius-sm)] truncate transition-all ${activeSource === source
                                ? 'bg-white/10 text-[var(--text-primary)] font-medium'
                                : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {source}
                        </button>
                    ))
                ) : (
                    categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => { switchFilter(FilterType.CATEGORY); setActiveCategory(cat); }}
                            className={`text-left px-3 py-2 text-sm rounded-[var(--radius-sm)] truncate transition-all ${activeCategory === cat
                                ? 'bg-white/10 text-[var(--text-primary)] font-medium'
                                : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))
                )}
            </div>

            {/* Add Button */}
            <div className="mt-auto pt-6 px-2">
                <button
                    onClick={onOpenAddModal}
                    className="btn-primary-luxe w-full flex items-center justify-center gap-2 group shadow-sm active:scale-95"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                    <span>Nouveau Lien</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
