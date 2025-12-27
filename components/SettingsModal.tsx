import React from 'react';
import { Theme } from '../types';
import { useAuth } from '../context/AuthContext';
import { LogOut, X, User } from 'lucide-react';

interface SettingsModalProps {
  currentTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { user, logout } = useAuth();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm glass-panel rounded-[var(--radius-xl)] shadow-2xl p-8 animate-in zoom-in-95 duration-200 border-t border-white/10">

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Compte</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          {/* User Profile */}
          <div className="p-4 bg-white/5 rounded-[var(--radius-lg)] border border-white/5 flex items-center gap-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-12 h-12 rounded-full border border-white/10" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-cyan-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                {user?.email?.charAt(0).toUpperCase() || <User size={20} />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-[var(--text-primary)] truncate leading-tight">{user?.displayName || 'Utilisateur'}</p>
              <p className="text-xs text-[var(--text-secondary)] truncate font-mono mt-1 opacity-70">{user?.email}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)] mb-4 ml-1">
              Session
            </div>
            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full py-3 px-4 flex items-center gap-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-[var(--radius-md)] transition-all"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </div>

          <div className="text-center text-[10px] text-[var(--text-tertiary)] pt-2">
            LinkShelf v1.1.0 • Zenith Design
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
