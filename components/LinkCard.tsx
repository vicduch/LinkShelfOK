import React from 'react';
import { LinkItem } from '../types';
import { ExternalLink, Trash2, Check, RotateCcw, Tag } from 'lucide-react';

interface LinkCardProps {
  link: LinkItem;
  onToggleRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, onToggleRead, onDelete }) => {
  const domain = new URL(link.url).hostname.replace('www.', '');

  return (
    <div className={`group glass-card relative p-6 rounded-[var(--radius-lg)] flex flex-col h-full transition-all duration-300 ${link.isRead ? 'opacity-60 grayscale' : ''}`}>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[var(--accent-primary)]">
            {link.title.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold">{link.category}</span>
            <span className="text-xs text-[var(--text-secondary)]">{domain}</span>
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.preventDefault(); onToggleRead(link.id); }}
            className={`p-2 rounded-full hover:bg-white/10 transition-all ${link.isRead ? 'text-amber-500/80' : 'text-blue-400/80'}`}
            title={link.isRead ? "Mark as unread" : "Mark as read"}
          >
            {link.isRead ? <RotateCcw size={16} /> : <Check size={16} />}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(link.id); }}
            className="p-2 rounded-full text-[var(--text-tertiary)] hover:bg-white/10 hover:text-red-400/80 transition-all"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="block flex-1 group/link">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 leading-snug group-hover/link:text-[var(--accent-primary)] transition-colors">
          {link.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-6 font-light">
          {link.summary}
        </p>
      </a>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          {link.tags.slice(0, 3).map(tag => (
            <div key={tag} className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] opacity-80">
              <Tag size={10} />
              <span>{tag}</span>
            </div>
          ))}
        </div>
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

export default LinkCard;
