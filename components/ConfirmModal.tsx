
import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md glass-panel rounded-3xl shadow-2xl p-1 overflow-hidden animate-luxe-fade">
                <div className="bg-[var(--bg-secondary)]/90 p-8 rounded-[22px] flex flex-col items-center text-center">

                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                        <Trash2 size={32} className="text-red-400" strokeWidth={1.5} />
                    </div>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">{title}</h2>
                    <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed max-w-[280px]">
                        {message}
                    </p>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-[var(--text-primary)] glass-card hover:bg-white/5 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-red-500/80 hover:bg-red-500 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={16} />
                            <span>Supprimer</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
