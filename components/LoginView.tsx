
import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginView: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-main)]">
      <div className="w-full max-w-sm glass-panel p-10 text-center animate-luxe-fade rounded-3xl">
        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[28%] mx-auto flex items-center justify-center mb-10 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
          <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">LinkShelf</h1>
        <p className="text-[var(--text-secondary)] mb-12 text-sm leading-relaxed max-w-[240px] mx-auto">
          Your personal AI-powered knowledge base.
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-[var(--text-primary)] text-[var(--bg-main)] py-3 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" opacity="0.8" />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
};

export default LoginView;
